# Migration Quick Reference

## 🚀 **Complete Migration Command Sequence**

Copy and paste these commands on your VPS in order:

---

## **Phase 1-2: Preparation (Already Complete)**
✅ VPS prepared
✅ Codebase cloned

---

## **Phase 3: Configuration**

```bash
cd /opt/progrc/bff-service-backend-dev
git pull origin main
chmod +x configure-vps-env.sh
./configure-vps-env.sh
```

---

## **Phase 4: Build & Deploy**

```bash
chmod +x deploy-vps-services.sh
./deploy-vps-services.sh
```

**Wait for completion** (10-20 minutes)

---

## **Phase 5: Pull Ollama Models**

```bash
chmod +x pull-ollama-models.sh
./pull-ollama-models.sh
```

**Wait for completion** (5-15 minutes)

---

## **Phase 6: Run Migrations**

```bash
chmod +x run-migrations.sh
./run-migrations.sh
```

---

## **Phase 7: Configure Nginx**

```bash
chmod +x configure-nginx.sh
sudo ./configure-nginx.sh
```

---

## **Phase 8: Final Verification**

```bash
chmod +x verify-deployment.sh final-verification.sh
./verify-deployment.sh
./final-verification.sh
```

---

## **All-in-One (After Phase 3)**

```bash
cd /opt/progrc/bff-service-backend-dev && \
git pull origin main && \
chmod +x deploy-vps-services.sh pull-ollama-models.sh run-migrations.sh configure-nginx.sh verify-deployment.sh final-verification.sh && \
./deploy-vps-services.sh && \
./pull-ollama-models.sh && \
./run-migrations.sh && \
sudo ./configure-nginx.sh && \
./verify-deployment.sh && \
./final-verification.sh
```

---

## **Quick Status Check**

```bash
# Service status
docker-compose ps

# Health check
curl http://localhost:3001/api/v1/health
curl http://168.231.70.205/api/v1/health

# Logs
docker-compose logs -f app
```

---

## **Troubleshooting**

```bash
# Restart services
docker-compose restart

# View logs
docker-compose logs -f

# Rebuild and restart
docker-compose build --no-cache
docker-compose up -d
```

---

**All scripts are in**: `/opt/progrc/bff-service-backend-dev/`
