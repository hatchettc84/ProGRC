import { Controller, Get } from '@nestjs/common';

@Controller()
export class RootController {
  @Get()
  getRoot() {
    return {
      message: 'Welcome to ProGRC API',
      version: '1.0.0',
      status: 'running',
      endpoints: {
        health: '/api/v1/health',
        welcome: '/api/v1/app',
        apiDocs: '/api_docs',
        metadata: '/api/v1/app/metadata',
      },
      documentation: 'Visit /api_docs for Swagger API documentation',
    };
  }
}

