
# syntax=docker/dockerfile:1

########################
# Stage 1: Build App
########################
FROM node:24-alpine AS builder

USER root
WORKDIR /home/node/bff-service-backend

COPY package*.json .npmrc ./
# Clear npm cache and node_modules to avoid vulnerable cached versions
RUN npm cache clean --force && \
    rm -rf node_modules && \
    npm ci && rm -rf ~/.npm

COPY . .
RUN npm run build

# Compress dist folder
RUN tar -czf /tmp/dist.tar.gz -C dist . && \
    cp newrelic.js package.json /tmp/ && \
    rm -rf node_modules dist .next

########################
# Stage 2: Production dependencies
########################
FROM node:24-alpine AS dependencies

USER root
WORKDIR /home/node/bff-service-backend

COPY package*.json .npmrc ./
# Clear cache for production dependencies too
RUN npm cache clean --force && \
    rm -rf node_modules && \
    npm ci --omit=dev --ignore-scripts && \
    rm -rf ~/.npm && \
    tar -czf /tmp/node_modules.tar.gz -C node_modules . && \
    rm -rf node_modules

########################
# Stage 3: Install Chromium and trace dependencies
########################
FROM cgr.dev/chainguard/wolfi-base:latest AS chromium

USER root

RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    fontconfig \
    harfbuzz \
    ca-certificates \
    ttf-dejavu \
    udev \
    mesa \
    alsa-lib \
    libjpeg-turbo \
    bash \
    strace

# Ensure binary is properly linked
RUN if [ -f /usr/lib/chromium/chrome ]; then \
      ln -sf /usr/lib/chromium/chrome /usr/lib/chromium/chromium && \
      chmod +x /usr/lib/chromium/chrome; \
    elif [ -f /usr/lib/chromium/chromium ]; then \
      chmod +x /usr/lib/chromium/chromium; \
    else \
      echo "No chromium binary found!" && exit 1; \
    fi

RUN mkdir -p /chromium/rootfs /tmp/chromium_trace

# Copy Chromium config/binaries into rootfs
RUN mkdir -p /chromium/rootfs/usr/bin \
             /chromium/rootfs/usr/lib/chromium \
             /chromium/rootfs/etc/chromium \
             /chromium/rootfs/etc/fonts \
             /chromium/rootfs/usr/share/fonts && \
    cp -a /usr/bin/chromium /usr/bin/chromium-browser /chromium/rootfs/usr/bin/ && \
    cp -a /usr/lib/chromium /chromium/rootfs/usr/lib/ && \
    cp -a /etc/chromium /chromium/rootfs/etc/ && \
    cp -a /etc/fonts /chromium/rootfs/etc/ && \
    cp -a /usr/share/fonts /chromium/rootfs/usr/share/

# Trace and collect shared libraries
# Trace runtime dependencies and collect .so paths
RUN strace -f -e file -o /tmp/strace.log \
    chromium-browser --headless --no-sandbox --disable-gpu \
    --print-to-pdf=/tmp/test.pdf \
    'data:text/html,<html><body><h1>Hello PDF</h1></body></html>' || true && \
    grep -oE '(/[^ ]+\.(so|so\.[0-9]+|so\.[0-9]+\.{0,1}[0-9]*))' /tmp/strace.log | sort -u > /tmp/strace_libs.txt

# Use readelf to find all direct and transitive ELF dependencies
RUN mkdir -p /chromium/rootfs /chromium/libs && \
    touch /tmp/all_libs.txt /tmp/new_libs.txt && \
    binaries="/usr/bin/chromium /usr/lib/chromium/chrome" && \
    for bin in $binaries; do \
        readelf -d "$bin" | grep NEEDED | awk -F'[][]' '{print $2}' >> /tmp/new_libs.txt; \
    done && \
    sort -u /tmp/new_libs.txt > /tmp/all_libs.txt && \
    rm /tmp/new_libs.txt && \
    while true; do \
        cp /tmp/all_libs.txt /tmp/prev_libs.txt; \
        > /tmp/new_libs.txt; \
        while read lib; do \
            libpath=$(find /lib /usr/lib -name "$lib" | head -n 1); \
            [ -n "$libpath" ] || continue; \
            readelf -d "$libpath" 2>/dev/null | grep NEEDED | awk -F'[][]' '{print $2}' >> /tmp/new_libs.txt; \
        done < /tmp/prev_libs.txt; \
        cat /tmp/new_libs.txt /tmp/all_libs.txt | sort -u > /tmp/combined_libs.txt; \
        cmp -s /tmp/combined_libs.txt /tmp/all_libs.txt && break; \
        mv /tmp/combined_libs.txt /tmp/all_libs.txt; \
    done && \
    # Copy ELF libs from readelf
    while read lib; do \
        find /lib /usr/lib -name "$lib" -exec cp --parents -v {} /chromium/libs/ \; || true; \
    done < /tmp/all_libs.txt && \
    # Copy runtime-only .so files from strace
    while read fullpath; do \
        if [ -f "$fullpath" ]; then \
            mkdir -p "/chromium/libs$(dirname "$fullpath")"; \
            cp -v "$fullpath" "/chromium/libs$fullpath"; \
        fi; \
    done < /tmp/strace_libs.txt && \
    # Copy into final rootfs
    cp -a /chromium/libs/* /chromium/rootfs/ || true && \
    rm -rf /tmp/*.txt /chromium/libs


# Create tarball from rootfs
RUN tar -czf /chromium/chromium.tar.gz -C /chromium/rootfs .

########################
# Stage 4: Final Image - GameWarden Hardened
########################
FROM node:24-alpine

ENV NODE_ENV=production \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser \
    LD_LIBRARY_PATH=/usr/lib:/usr/lib/chromium \
    PORT=3000

# Start as root for setup and hardening
USER 0

WORKDIR /home/node/bff-service-backend

# Use existing non-root user with UID 65532 (GameWarden requirement)
# The base image already provides a user with this UID, so we'll use it
RUN echo "Using existing user with UID 65532 for GameWarden compliance"

# Setup application and logs directories
RUN mkdir -p /logs_bff && \
    chown -R 65532:65532 /logs_bff && \
    chmod -R 755 /logs_bff && \
    chown -R 65532:65532 /home/node/bff-service-backend

# Extract Chromium runtime
COPY --from=chromium /chromium/chromium.tar.gz /tmp/
RUN tar -xzf /tmp/chromium.tar.gz -C / && \
    chmod +x /usr/bin/chromium-browser /usr/bin/chromium && \
    chown -R 65532:65532 /usr/bin/chromium-browser /usr/bin/chromium /usr/lib/chromium && \
    chmod -R 755 /usr/lib/chromium && \
    rm /tmp/chromium.tar.gz

# Extract app dist
COPY --from=builder /tmp/dist.tar.gz ./
RUN mkdir -p dist && tar -xzf dist.tar.gz -C dist && rm dist.tar.gz

# Extract production dependencies
COPY --from=dependencies /tmp/node_modules.tar.gz ./
RUN mkdir -p node_modules && tar -xzf node_modules.tar.gz -C node_modules && rm node_modules.tar.gz

# Copy static and config files
COPY --from=builder /home/node/bff-service-backend/static ./static
COPY --from=builder /tmp/newrelic.js ./
COPY --from=builder /tmp/package.json ./

# Create startup script
RUN echo 'const { spawn } = require("child_process");' > startup.js && \
    echo 'const path = require("path");' >> startup.js && \
    echo '' >> startup.js && \
    echo 'console.log("Running database migrations...");' >> startup.js && \
    echo '' >> startup.js && \
    echo 'const migration = spawn("node", [' >> startup.js && \
    echo '  "./node_modules/typeorm/cli.js",' >> startup.js && \
    echo '  "migration:run",' >> startup.js && \
    echo '  "-d",' >> startup.js && \
    echo '  "./dist/config/typeorm.config.js"' >> startup.js && \
    echo '], { stdio: "inherit" });' >> startup.js && \
    echo '' >> startup.js && \
    echo 'migration.on("close", (code) => {' >> startup.js && \
    echo '  if (code !== 0) {' >> startup.js && \
    echo '    console.warn("Migration failed or no new migrations to run (code:", code, "). Continuing...");' >> startup.js && \
    echo '  } else {' >> startup.js && \
    echo '    console.log("Migrations completed successfully!");' >> startup.js && \
    echo '  }' >> startup.js && \
    echo '  console.log("Starting NestJS application...");' >> startup.js && \
    echo '  ' >> startup.js && \
    echo '  const app = spawn("node", [' >> startup.js && \
    echo '    "--max-old-space-size=4096",' >> startup.js && \
    echo '    "dist/main"' >> startup.js && \
    echo '  ], { stdio: "inherit" });' >> startup.js && \
    echo '  ' >> startup.js && \
    echo '  app.on("close", (code) => {' >> startup.js && \
    echo '    process.exit(code);' >> startup.js && \
    echo '  });' >> startup.js && \
    echo '});' >> startup.js

# Set proper ownership for all application files
RUN chown -R 65532:65532 /home/node/bff-service-backend

# Copy and execute GameWarden hardening script
COPY hardening-script.sh /tmp/hardening-script.sh
RUN chmod +x /tmp/hardening-script.sh && \
    /tmp/hardening-script.sh 65532 nodejs && \
    rm -f /tmp/hardening-script.sh

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "const http = require('http'); http.get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }).on('error', () => { process.exit(1); });"

# Switch to non-root user (GameWarden requirement)
USER 65532

EXPOSE 3000
EXPOSE 9000

# Security labels for GameWarden compliance
LABEL maintainer="progrc.com" \
      org.opencontainers.image.title="ProGRC BFF Service" \
      org.opencontainers.image.description="Backend For Frontend service for ProGRC platform - GameWarden Hardened" \
      org.opencontainers.image.vendor="ProGRC" \
      security.scan.status="compliant" \
      security.hardened="true" \
      security.gamewarden.compliant="true"

ENTRYPOINT ["node", "startup.js"]
