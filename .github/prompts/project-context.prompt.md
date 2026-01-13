# ProGRC BFF (Backend For Frontend) Service

This document provides information about the project structure, technology stack, and guidelines for maintaining and extending the codebase.

## Technology Stack

- **Framework**: NestJS (Node.js framework)
- **Language**: TypeScript
- **Database**: TypeORM for database interactions
- **Authentication**: AWS Cognito integration
- **File Storage**: AWS S3
- **Messaging**: SQS for asynchronous tasks
- **Logging**: Custom logger service
- **API Documentation**: Swagger/OpenAPI
- **Config**: Environment-based configuration
- **Monitoring**: NewRelic integration

## Project Structure

The application follows a modular architecture based on NestJS modules:

```
/src
    /app                     - Core application setup
    /app-private             - Private API modules (internal/webhook endpoints)
    /entities                - Database entity definitions
    /common                  - Shared utilities and DTOs
    /config                  - Application configuration
    /guards                  - Authentication guards
    /interceptors            - Request/response interceptors
    /decorators              - Custom decorators
    /filters                 - Exception filters
    /middlewares             - HTTP middlewares
    /<feature-modules>       - Various feature modules
```

## Module Organization

The application separates functionality into:

1. **Public modules** - Endpoints accessible to authenticated users
2. **Private modules** - Internal endpoints, webhooks, and admin functionality

Each module typically follows this structure:
- `*.module.ts` - Module definition
- `*.controller.ts` - HTTP endpoint controllers
- `*.service.ts` - Business logic services
- `*.dto.ts` - Data Transfer Objects
- `*.entity.ts` - Database entities (typically in `/entities` folder)
- `/service/` - Additional services (for larger modules)

## Rules for Creating New Modules

### 1. Module Naming
- Use kebab-case for module folders (e.g., 'feature-flag')
- Use camelCase for file names
- Class names should be PascalCase and descriptive (e.g., `FeatureFlagController`)

### 2. Structure
- Always create a dedicated module file (*.module.ts)
- Keep controllers focused on request/response handling
- Move business logic to services
- Place DTOs in dedicated files

### 3. Public vs Private
- Public endpoints should be protected with appropriate guards
- Private endpoints (webhooks, internal APIs) should be placed in app-private or use a dedicated guard like ApiGuard

### 4. Dependencies
- Inject dependencies via constructor
- Use forwardRef() for circular dependencies
- Import only what's necessary

### 5. Entity Handling
- Define entities in the `/entities` folder with proper table naming
- Register them in the module's TypeORM imports

### 6. Testing
- Create `*.spec.ts` files for unit tests

## Module Reference

### Public Modules
- **customer**: Customer management and operations
- **onboarding**: User and organization onboarding flows
- **application**: Application management features
- **assessment**: Assessment-related functionality
- **sources**: Source code management
- **templates**: Template management
- **trust-center**: Trust center functionality
- **feature-flag**: Feature flag management
- **quick-start**: Quick start guide features
- **user-comment**: User comment functionality
- **audit**: Audit feedback and management
- **connections**: Connection management
- **compliance**: Compliance management
- **ask-ai**: AI-assisted features
- **assets**: Asset management
- **helpdesk**: Support and help center

### Private Modules
- **app-private**: Internal and webhook APIs
    - recommendation: Recommendation management
    - assessmentWebhook: Assessment webhook handling

### Core Modules
- **async_tasks**: Asynchronous task management
- **auth**: Authentication and authorization
- **notifications**: Notification system
- **logger**: Logging functionality
- **health**: Health check endpoints

## Controllers Reference

### Public API Controllers
- **CustomerController**: Customer management (`/customers`)
- **EventController**: Customer events (`/customers/:id/events`)
- **ImpersonationController**: User impersonation (`/impersonations`)
- **OnboardingController**: Onboarding flows (`/onboarding/`)
- **ApplicationController**: Application management (`/applications`)
- **AsyncTasksController**: Async tasks (`/async_task`)
- **SourcesController**: Source management (`/app/`)
- **TemplateController**: Template management (`/template`)
- **CustomerTemplateController**: Customer templates (`/customer-templates`)
- **TrustCenterController**: Trust centers (`/trust-centers`)
- **FeatureFlagController**: Feature flags (`/feature-flags`)
- **QuickStartController**: Quick start guides (`/quickStart`)
- **AskAiController**: AI features (`/ask-ai`)
- **AssetsController**: Asset management (`/assets`)
- **HelpdeskController**: Support (`/helpdesk`)
- **NotificationsController**: Notifications (`/notifications`)
- **AuditController**: Audit management (`/audit`)

### Private API Controllers
- **AssessmentWebhookController**: Assessment webhooks (`/webhook/assessments`)
- **RecommendationController**: Recommendations (`/recommendations`)
- **HealthController**: Health checks
- **AssetsWebhookController**: Asset webhooks (`/webhook/assets`)

## Services and Utilities

### Core Services
- **CognitoService**: AWS Cognito integration for authentication
- **LoggerService**: Centralized logging
- **UploadService**: File upload handling
- **EmailService**: Email notifications
- **RequestContextService**: Request context management

### Utilities
- **CloudFrontService**: AWS CloudFront integration
- **AwsS3ConfigService**: S3 configuration
- **cloudfrontTransformer**: Entity transformation for CloudFront URLs

## Misc Rules

### Auth Guard
- **AuthGuard**: Example Usage: @UseGuards(JwtAuthGuard)

### Roles Decorator
- **Roles**: Example Usage: @Roles(UserRole.OrgAdmin, UserRole.OrgAdmin, UserRole.CSM, UserRole.SuperAdmin)


### Interceptor
- **TransformInterceptor**: Example Usage: @UseInterceptors(TransformInterceptor) - (import { TransformInterceptor } from 'src/interceptors/transform.interceptor';
)

### Standard Response
- **StandardResponse**: Example Usage: StandardResponse.success('POAM created successfully', poam); - (import { StandardResponse } from 'src/common/dto/standardResponse.dto';
)

## Database Entities

Entity directories:
- `/entities` - Core entities
- `/entities/source` - Source-related entities
- `/entities/compliance` - Compliance entities
- `/entities/assessments` - Assessment entities
- `/entities/connection` - Connection entities
- `/entities/recommendation` - Recommendation entities
- `/masterData` - Master data entities (e.g., UserRoles)

## Architectural Patterns

### 1. Module Patterns
- Each domain has its own module
- Controllers handle HTTP requests and delegate to services
- Services contain business logic
- DTOs define data contracts

### 2. Dependency Injection
- NestJS's DI container manages dependencies
- Services are injected into controllers and other services

### 3. Repository Pattern
- TypeORM repositories handle database operations
- Injected into services that need data access

### 4. DTO Pattern
- Data Transfer Objects define API contracts
- Input validation using class-validator

## Conventions

### 1. Route Naming
- Use kebab-case for route paths
- Resource names should be plural (e.g., `/customers`)

### 2. Response Format
- Use StandardResponse for consistent API responses
- Proper HTTP status codes

### 3. Error Handling
- Use NestJS exceptions (BadRequestException, etc.)
- Centralized exception filters
- Consistent error responses

## Best Practices

### 1. Security
- Always use guards for protected routes
- Validate all input data
- Use proper error handling

### 2. Performance
- Use async/await for asynchronous operations
- Optimize database queries
- Use logging judiciously

### 3. Maintainability
- Follow single responsibility principle
- Write tests for critical functionality
- Use meaningful variable and function names
- Document complex logic
