// require("newrelic");
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app/app.module";

import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { LoggerService } from "./logger/logger.service";
import { PrivateModule } from "./app-private/app-private.module";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { RequestMethod } from "@nestjs/common";
import { SecretsService } from "./secrets/secrets.service";
import { AwsSecretsConfigService } from "./secrets/aws-secrets-config.service";
require("dotenv").config();

// Create a singleton logger instance
const logger = new LoggerService();

// Global uncaught exception handler
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception', {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    },
    type: 'uncaught_exception'
  });
  // Give the logger time to write the error before exiting
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

// Global unhandled rejection handler
process.on('unhandledRejection', (reason: any) => {
  logger.error('Unhandled Rejection', {
    error: {
      name: reason?.name || 'Unknown',
      message: reason?.message || String(reason),
      stack: reason?.stack
    },
    type: 'unhandled_rejection'
  });
  // Give the logger time to write the error before exiting
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

// Loads the config from configured SecretsProvider (AWS/Azure/GCP/HashiCorp Vault)
async function loadConfig() {

  // Environment variable logging disabled for performance
  // for(const [key, value] of Object.entries(process.env)) {
  //   logger.info(`${key}: ${value}`);
  // }

  // Only load secrets if a SECRET_PROVIDER is configured
  if (!process.env.SECRET_PROVIDER && !process.env.SECRETS_BACKEND) {
    logger.info('No SECRET_PROVIDER configured, skipping secrets loading');
    return;
  }

  const provider = process.env.SECRET_PROVIDER || process.env.SECRETS_BACKEND;
  const secretName = process.env.SECRET_NAME || 'APPLICATION_SECRETS';

  try {

    logger.info('Loading configuration from secrets provider: ', { provider });

    // For AWS provider, offer a simplified approach similar to AwsS3ConfigService
    if (provider === 'aws') {
      logger.info('Using AWS Secrets Manager with role-based access');
      await loadConfigFromAWS(secretName);
    } else {
      // Use the full multi-provider secrets service for other providers
      logger.info(`Using multi-provider secrets service with provider: ${provider}`);
      await loadConfigFromMultiProvider(secretName);
    }
    
    logger.info('Successfully loaded configuration from secrets provider', { provider });
  } catch (error) {
    logger.error('Failed to load configuration from secrets provider', {
      error: error.message,
      provider
    });
    
    // Don't fail the application startup if secrets loading fails
    // This allows the application to start with just environment variables
    logger.warn('Continuing application startup with environment variables only');
  }
}

// Simplified AWS-only approach using role-based access
async function loadConfigFromAWS(secretName: string) {
  const ConfigService = require('@nestjs/config').ConfigService;
  const configService = new ConfigService();
  
  const awsSecretsService = new AwsSecretsConfigService(configService);
  
  try {
    const secretsObject = await awsSecretsService.getSecretAsJson(secretName);
    
    // List of environment variables that should NOT be overwritten
    const excludedKeys = new Set([
      'SECRET_PROVIDER', 'SECRETS_BACKEND', 'SECRET_NAME',
      'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION', 'AWS_SESSION_TOKEN'
    ]);

    // List of keys that need base64 decoding (cryptographic keys)
    const base64Keys = new Set([
      'CLOUDFRONT_PRIVATE_KEY',
      'ACCESS_TOKEN_SIGNATURE_PRIVATE', 
      'ACCESS_TOKEN_SIGNATURE_PUBLIC'
    ]);

    let loadedCount = 0;
    let skippedCount = 0;

    for (const [key, value] of Object.entries(secretsObject)) {
      if (excludedKeys.has(key)) {
        skippedCount++;
        logger.debug(`Skipping protected environment variable: ${key}`);
        continue;
      }

      if (base64Keys.has(key)) {
        process.env[key] = Buffer.from(String(value), 'base64').toString('utf-8');
      } else {
        process.env[key] = String(value);
      }

      loadedCount++;
      
    }

    logger.info('Loaded secrets from AWS Secrets Manager', {
      secretName,
      loadedCount,
      skippedCount,
      useRoleBasedAccess: !process.env.AWS_ACCESS_KEY_ID
    });

  } catch (error) {
    if (error.name === 'ResourceNotFoundException') {
      logger.warn(`Secret ${secretName} not found in AWS Secrets Manager, skipping`);
    } else {
      throw error;
    }
  }
}

// Full multi-provider approach
async function loadConfigFromMultiProvider(secretName: string) {
  const secretsService = new SecretsService(logger);
  await secretsService.onModuleInit();
  await secretsService.loadSecretsIntoEnvironment(secretName);
}

async function bootstrap() {
  // Load configuration from secrets provider first
  await loadConfig();

  // Decode base64-encoded RSA keys if they exist
  const base64Keys = ['ACCESS_TOKEN_SIGNATURE_PRIVATE', 'ACCESS_TOKEN_SIGNATURE_PUBLIC'];
  for (const key of base64Keys) {
    if (process.env[key] && process.env[key].includes('LS0tLS')) {
      try {
        process.env[key] = Buffer.from(process.env[key], 'base64').toString('utf-8');
        logger.info(`Decoded base64 key: ${key}`);
      } catch (error) {
        logger.error(`Failed to decode ${key}`, { error: error.message });
      }
    }
  }

  const initModule = process.env.INIT_MODULE || 'App';

  logger.info(`Initializing module: ${initModule}`, { initModule });
  
  // if (initModule === 'App') {
    // const frontendPort = parseInt(process.env.FRONTEND_PORT || '80', 10);
    // const frontendApp = await NestFactory.create(FrontendModule, {
    //   logger: logger,
    // });
    // frontendApp.listen(frontendPort);
    const applicationPort = parseInt('3000', 10);
    const app = await NestFactory.create(AppModule, {
      logger: logger,
    });
    
    // Configure Socket.IO adapter for WebSocket support
    app.useWebSocketAdapter(new IoAdapter(app));
    
    // Enable CORS with comprehensive settings for Swagger and API access
    app.enableCors({
      credentials: true,
      origin: process.env.ENVIRONMENT === 'dev' || process.env.ENVIRONMENT === 'qa'
        ? [
            'http://localhost:3000', 
            'https://localhost:3000', 
            'https://dev.progrc.com',
            'https://qa.progrc.com',
            'http://localhost:3001', // For local frontend development
            'https://localhost:3001', // For local frontend development
            'http://127.0.0.1:3000',
            'http://127.0.0.1:3001',
            'https://127.0.0.1:3000',
            'https://127.0.0.1:3001',
            'http://168.231.70.205', // VPS IP
            'http://168.231.70.205:80', // VPS IP with port
            'http://168.231.70.205:3001' // VPS backend port
          ]
        : [
            'https://app.progrc.com',
            'https://progrc.com',
            'https://www.progrc.com',
            'http://168.231.70.205', // VPS IP
            'http://168.231.70.205:80', // VPS IP with port
            'http://168.231.70.205:3001' // VPS backend port
          ],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
      allowedHeaders: [
        'Content-Type', 
        'Authorization', 
        'Accept', 
        'Origin', 
        'X-Requested-With',
        'Access-Control-Allow-Origin',
        'Access-Control-Allow-Headers',
        'Access-Control-Allow-Methods'
      ],
      exposedHeaders: [
        'Content-Length',
        'Content-Type',
        'Authorization'
      ],
      maxAge: 86400, // 24 hours
    });
    
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
    }));
    
    // Set global prefix for API routes only, exclude frontend
    app.setGlobalPrefix('api/v1', {
      exclude: [
        { path: '', method: RequestMethod.GET }, // Root path
        { path: 'health/frontend', method: RequestMethod.GET },
        { path: 'test-frontend', method: RequestMethod.GET },
        { path: 'api_docs', method: RequestMethod.GET },
        { path: 'api_docs/(.*)', method: RequestMethod.GET },
        { path: 'favicon.ico', method: RequestMethod.GET },
        { path: 'static/(.*)', method: RequestMethod.GET },
        { path: 'assets/(.*)', method: RequestMethod.GET },
        { path: 'css/(.*)', method: RequestMethod.GET },
        { path: 'js/(.*)', method: RequestMethod.GET },
        { path: 'images/(.*)', method: RequestMethod.GET },
        { path: 'fonts/(.*)', method: RequestMethod.GET },
        { path: 'manifest.json', method: RequestMethod.GET },
        { path: 'robots.txt', method: RequestMethod.GET },
        { path: 'sitemap.xml', method: RequestMethod.GET },
      ],
    });
    
    // Increase the body size limit
    app.use(bodyParser.json({ limit: "100mb" }));
    app.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));
    app.use(cookieParser());
    
    // ===== SWAGGER API DOCUMENTATION CONFIGURATION =====
    // 
    // Swagger UI is available at: /api_docs
    // 
    // Features configured:
    // - JWT Bearer Authentication (use "Authorize" button in Swagger UI)
    // - Multiple server environments (dev, prod, local)
    // - CORS headers for cross-origin requests
    // - Persistent authorization (stays logged in across page refreshes)
    // - Organized API tags for better navigation
    // - Request/Response examples and schemas
    //
    // To add authentication to a new controller:
    // 1. Add @ApiBearerAuth('JWT-auth') decorator to the controller class
    // 2. Add @UseGuards(JwtAuthGuard) to protected endpoints
    // 3. Use appropriate @ApiTags() for organization
    //
    // Example:
    // @ApiTags('MyModule')
    // @Controller('my-module')
    // @ApiBearerAuth('JWT-auth')
    // export class MyController {
    //   @Get()
    //   @UseGuards(JwtAuthGuard)
    //   @ApiOperation({ summary: 'Get data' })
    //   getData() { ... }
    // }
    
    const config = new DocumentBuilder()
      .setTitle('ProGRC BFF Service API')
      .setDescription(`
        Backend For Frontend (BFF) Service API for ProGRC platform.
        
        ## Authentication
        Most endpoints require JWT authentication. Use the "Authorize" button below to set your Bearer token.
        
        ## Base URL
        - Development: https://dev.progrc.com/api/v1
        - QA: https://qa.progrc.com/api/v1
        - Production: https://app.progrc.com/api/v1
        
        ## MFA Endpoints
        Multi-Factor Authentication endpoints support TOTP, Email OTP, and PassKey authentication methods.
      `)
      .setVersion('1.0')
      .addTag('Auth', 'Authentication and authorization endpoints')
      .addTag('MFA', 'Multi-Factor Authentication management')
      .addTag('Customer', 'Customer and organization management')
      .addTag('Applications', 'Application lifecycle management')
      .addTag('Assessment', 'Security assessments and compliance')
      .addTag('Template Management', 'Document and assessment templates')
      .addTag('Assets', 'Asset management and tracking')
      .addTag('Compliance V2', 'Compliance frameworks and controls')
      .addTag('Notifications', 'Notification and messaging system')
      .addTag('Admin', 'Administrative functions')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth'
      )
      .addServer('https://dev.progrc.com', 'Development Server')
      .addServer('https://qa.progrc.com', 'QA Server')
      .addServer('https://app.progrc.com', 'Production Server')
      .addServer('http://localhost:3000', 'Local Development Server')
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    if(process.env.ENVIRONMENT === 'dev') {
      SwaggerModule.setup('api_docs', app, document, {
        swaggerOptions: {
          persistAuthorization: true,
          tagsSorter: 'alpha',
          operationsSorter: 'alpha',
          docExpansion: 'none',
          filter: true,
          showRequestHeaders: true,
        },
        customSiteTitle: 'ProGRC BFF API Documentation',
        customfavIcon: '/favicon.ico',
      });
    }
    
    // Add request logging middleware to debug routing
    app.use((req, res, next) => {
      console.log(`[REQUEST LOG] ${new Date().toISOString()} - ${req.method} ${req.url}`);
      console.log(`[REQUEST LOG] Headers:`, req.headers);
      next();
    });
    
    await app.listen(applicationPort);
    logger.info(`Application is running on port ${applicationPort}`);
  // }
  // else if (initModule === 'Private') {
    // TEMPORARILY DISABLED: Private module causing startup hang
    // TODO: Debug PrivateModule initialization issue
    // const privatePort = parseInt('9000', 10);
    // const appPrivate = await NestFactory.create(PrivateModule, {
    //   logger: logger,
    // });

    // appPrivate.useGlobalPipes(new ValidationPipe({
    //   whitelist: true,
    //   transform: true,
    // }));

    // appPrivate.setGlobalPrefix('api/private');

    // appPrivate.use(bodyParser.json({ limit: "100mb" }));
    // appPrivate.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));

    // await appPrivate.listen(privatePort);
    // logger.info(`Private application is running on port ${privatePort}`);
  // }
}
bootstrap();

