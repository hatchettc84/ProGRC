# Sprint 10 Release Notes

**Release Date:** June 3, 2025  
**Version:** Sprint 10  
**Pull Request:** #1028 - Merge from new-qa branch  
**Commits Range:** 570b17c..0638457228 (135 commits)

## 🚀 Major Features & Enhancements

### 🔐 Authentication & Authorization Overhaul
- **JWT Authentication System**: Complete implementation of JWT-based authentication replacing Cognito
  - New JWT authentication controllers, services, and guards
  - JWT refresh token mechanism with secure cookie handling
  - Multi-factor authentication (MFA) support
  - Password history tracking and temporary password functionality
  - Extended session duration (4 hours instead of 15 minutes)
  - Enhanced security with proper token expiration handling

- **Enhanced Permission System**: 
  - Improved permission validation logic
  - Better handling of empty allowed_roles arrays
  - Role-based access control enhancements

### 🤖 AI & Machine Learning Features

#### 🧠 Ask AI - Beta
- **AI-Powered Query System**: Revolutionary AI assistant for compliance and security queries
  - Natural language processing for compliance questions
  - Context-aware responses based on organizational data
  - Integration with existing compliance frameworks
  - Real-time AI assistance for policy interpretation
  - Beta release with continuous learning capabilities
  - Support for complex regulatory queries
  - AI-driven recommendations for compliance gaps

#### 📝 Policy Editor - Beta
- **Intelligent Policy Management**: AI-enhanced policy creation and editing
  - Smart policy template suggestions
  - Automated policy compliance checking
  - Real-time policy validation against standards
  - AI-powered policy gap analysis
  - Collaborative policy editing with version control
  - Integration with compliance frameworks (SOC2, ISO27001, etc.)
  - Beta release with advanced editing features

#### 🔄 Multi Model - Phase 1
- **Universal Source Ingestion**: Advanced multi-modal data processing capabilities
  - **Image Processing**: OCR and image analysis for compliance documents
    - Support for scanned documents and screenshots
    - Automatic text extraction from images
    - Image-based evidence processing
  - **Document Processing**: Enhanced file type support
    - PDF, Word, Excel, PowerPoint processing
    - Code repository analysis (GitHub, GitLab integration)
    - Database schema analysis
    - Configuration file parsing
  - **Multi-Format Support**: 
    - Video and audio file metadata extraction
    - Structured and unstructured data processing
    - API documentation parsing
    - Infrastructure as Code (IaC) analysis
  - **Phase 1 Capabilities**:
    - Automated content categorization
    - Smart tagging and classification
    - Cross-reference detection between sources
    - Compliance mapping automation

### 🏢 Features Management System
- **New Features Module**: Complete feature flag management system
  - FeaturesController, FeaturesService, and DTOs
  - Features entity with database migrations
  - Customer-specific feature management
  - Integration with permission system
  - RESTful API for feature flag operations

### 📋 Application Management Improvements
- **Enhanced Application Cloning**: 
  - Comprehensive application duplication functionality
  - Control evidence cloning with improved error handling
  - Application control mapping cloning
  - CRM data handling during cloning
  - Source and chunk mapping cloning
  - Connection cloning capabilities
  - Timestamp updates for app standards

- **Application Policy Service**: New service for application-level policy management
- **Application Queue Handler**: Enhanced queue processing for application operations

### 📊 Assessment & Compliance Enhancements
- **Assessment Processing Improvements**:
  - Refactored SQL queries using application_control_mapping_view
  - Enhanced custom assessment template processor
  - Better error handling and logging in assessment creation
  - Excel upload support for templates and assessments
  - Implementation status checkbox variable support

- **Compliance Management**:
  - Improved compliance control creation methods
  - Enhanced standard control processing
  - Better CRM integration and data synchronization
  - Application control mapping view implementation

### 🔍 Search & Help Center Improvements
- **Enhanced Search Functionality**: 
  - Improved article search capabilities in help center
  - Better search algorithms and result relevance
  - Enhanced article retrieval and categorization

### 🛠️ Infrastructure & DevOps
- **Docker & Deployment Enhancements**:
  - Increased Node.js memory limit in Dockerfile
  - Chromium installation and dependencies for PDF generation
  - Enhanced font directory structure
  - Improved image efficiency with APK cache cleanup
  - Chainguard credentials integration for enhanced security
  - Updated base images to new Kovr.ai Node.js images

- **GitHub Workflows**: 
  - Enhanced deployment workflows for dev, QA, and production
  - Improved security with masked sensitive information
  - Better credential management using environment variables
  - Updated migration commands and entry points

### 📁 File Management & Storage
- **Enhanced File Upload Service**:
  - Improved file upload prefix generation
  - Better S3 integration and configuration
  - S3 garbage collector service for cleanup operations
  - Enhanced CloudFront service integration

## 🐛 Bug Fixes & Improvements

### 🔧 Performance & Memory Management
- **Memory Management**: 
  - Updated memory heap check limits (2000MB)
  - Commented out problematic memory heap checks in HealthController
  - Better memory monitoring and optimization

### 🔐 Security Enhancements
- **JWT Error Handling**: 
  - Improved token expiration handling
  - Better invalid token scenario management
  - Consistent UnauthorizedException responses
  - Enhanced ForbiddenException handling for security

### 🎯 User Experience Improvements
- **Impersonation System**: 
  - Enhanced user impersonation functionality
  - Better role management for auditors
  - Improved cookie handling for access and refresh tokens
  - Fixed userId references in impersonation methods

### 📝 Template & Policy Management
- **Template Service Enhancements**:
  - Improved template processing and management
  - Enhanced template policy service
  - Better Excel upload support
  - Template cloning improvements

## 🗄️ Database Changes

### New Tables & Entities
- **Features Table**: New entity for feature flag management
- **Password History**: Entity for tracking password changes
- **Refresh Token**: Entity for JWT refresh token management
- **Organization Entity**: Enhanced organization management
- **Application Control Mapping View**: Improved compliance mapping
- **AI Models Configuration**: Support for multi-model AI processing
- **Policy Templates**: Enhanced policy management entities

### Migrations
- `AddTemporaryPasswordColumn`: Support for temporary passwords
- `CreateAuthTables`: JWT authentication infrastructure
- `LockExistingUsers`: Security enhancement for existing users
- `AddResetPasswordColumns`: Password reset functionality
- `RemoveOrganizationIdFromUser`: User entity cleanup
- `ForcePasswordReset`: Security measure for all users
- `addFeaturesPermissions`: Feature management permissions
- `createFeaturesTable`: Features table creation
- `AlterTemplateAndAssessmentTablesForExcelUpload`: Excel support
- `AddImplementationStatusCheckboxVariable`: Assessment enhancements
- `updatePermissionForCloneApp`: Application cloning permissions
- `updateFeaturePermissions`: Enhanced feature permissions

## 🔄 API Changes

### New Endpoints
- **Features API**: Complete CRUD operations for feature management
- **JWT Authentication API**: New authentication endpoints
- **Enhanced Application API**: Cloning and policy management endpoints
- **Improved Assessment API**: Excel upload and enhanced processing
- **Ask AI API (Beta)**: AI-powered query and response endpoints
- **Policy Editor API (Beta)**: Intelligent policy management endpoints
- **Multi Model API (Phase 1)**: Universal source ingestion endpoints

### Modified Endpoints
- **Extended Session Duration**: All authentication endpoints now support 4-hour sessions
- **Enhanced Error Responses**: Better error handling across all endpoints
- **Improved Permission Validation**: Consistent permission checking

## 🤖 AI/ML Integration Details

### Ask AI - Beta Features
- **Natural Language Processing**: Advanced NLP for compliance queries
- **Context Understanding**: AI understands organizational context
- **Compliance Knowledge Base**: Pre-trained on compliance standards
- **Real-time Learning**: Continuous improvement from user interactions
- **Multi-language Support**: Support for various languages (Phase 1)

### Policy Editor - Beta Capabilities
- **Smart Templates**: AI-generated policy templates
- **Compliance Validation**: Real-time policy compliance checking
- **Gap Analysis**: Automated identification of policy gaps
- **Version Control**: Advanced versioning with change tracking
- **Collaborative Editing**: Multi-user policy editing capabilities

### Multi Model - Phase 1 Specifications
- **Supported File Types**:
  - Images: JPG, PNG, GIF, TIFF, BMP
  - Documents: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX
  - Code: All major programming languages
  - Configuration: JSON, YAML, XML, INI, TOML
  - Archives: ZIP, TAR, GZ
- **Processing Capabilities**:
  - OCR for image-to-text conversion
  - Metadata extraction
  - Content classification
  - Compliance mapping
  - Automated tagging

## 📦 Dependencies & Configuration

### Package Updates
- **Major package.json restructuring**: Significant dependency updates and optimizations
- **Enhanced TypeORM configuration**: Better database connection management
- **Improved environment configuration**: Better handling of development vs production settings
- **AI/ML Libraries**: Added support for machine learning processing
- **Image Processing**: OCR and image analysis dependencies

### Configuration Changes
- **JWT Configuration**: New JWT secret management and token configuration
- **Database Configuration**: Enhanced TypeORM settings
- **Docker Configuration**: Improved containerization with better resource management
- **AI Model Configuration**: Settings for AI model endpoints and processing
- **Multi-Model Processing**: Configuration for various file type processing

## 🧪 Testing & Quality Assurance

### Code Quality Improvements
- **Enhanced Error Handling**: Better error logging and management throughout the application
- **Improved Logging**: More comprehensive logging for debugging and monitoring
- **Code Refactoring**: Significant code cleanup and optimization
- **AI Feature Testing**: Beta testing framework for AI features

### Security Enhancements
- **JWT Security**: Comprehensive JWT implementation with proper security measures
- **Permission Validation**: Enhanced role-based access control
- **Password Security**: Password history and temporary password functionality
- **AI Security**: Secure handling of AI model interactions and data

## 📋 Migration Notes

### Breaking Changes
- **Authentication System**: Migration from Cognito to JWT requires user re-authentication
- **Session Duration**: Extended session duration may affect user experience expectations
- **Permission System**: Enhanced permission validation may affect existing role assignments

### Deployment Considerations
- **Database Migrations**: Multiple migrations need to be run in sequence
- **Environment Variables**: New JWT-related environment variables required
- **Docker Updates**: New base images and enhanced resource allocation
- **Memory Requirements**: Increased memory limits for better performance
- **AI Model Setup**: Configuration required for AI features (Ask AI, Policy Editor)
- **Multi-Model Processing**: Additional storage and processing requirements

### Beta Feature Considerations
- **Ask AI Beta**: Limited to specific user groups initially
- **Policy Editor Beta**: Requires additional training and documentation
- **Multi Model Phase 1**: Gradual rollout with monitoring

## 🎯 Next Steps

### Upcoming Features
- **Ask AI Phase 2**: Advanced AI capabilities and integrations
- **Policy Editor GA**: General availability with full feature set
- **Multi Model Phase 2**: Advanced processing and AI-driven insights
- **Enhanced Monitoring**: Better application performance monitoring
- **Advanced Analytics**: Improved reporting and analytics capabilities
- **Mobile Optimization**: Better mobile experience and responsive design

### Technical Debt
- **Code Optimization**: Continue refactoring legacy code
- **Performance Improvements**: Further optimization of database queries
- **Security Enhancements**: Ongoing security improvements and audits
- **AI Model Optimization**: Continuous improvement of AI model performance

## 🔮 Beta Program Information

### Ask AI - Beta
- **Access**: Limited beta access for select customers
- **Feedback**: Continuous feedback collection and improvement
- **Training**: User training materials and documentation
- **Support**: Dedicated support for beta users

### Policy Editor - Beta
- **Rollout**: Phased rollout to enterprise customers
- **Training**: Comprehensive training program
- **Integration**: Gradual integration with existing workflows
- **Feedback Loop**: Regular feedback sessions and improvements

### Multi Model - Phase 1
- **Testing**: Extensive testing with various file types
- **Performance**: Monitoring and optimization of processing times
- **Accuracy**: Continuous improvement of processing accuracy
- **Scalability**: Testing scalability with large file volumes

---

**Total Changes:**
- **140 files changed**
- **23,852 insertions**
- **49,499 deletions**
- **135 commits**

**Contributors:** Development Team, Data Science Team, AI/ML Team  
**Reviewed by:** QA Team, Security Team, Product Team  
**Approved by:** Product Team, Engineering Leadership 