import { 
  Controller, 
  Get, 
  Res, 
  NotFoundException, 
  Logger,
  Param,
  Req,
  All,
  UseGuards
} from '@nestjs/common';
import { Response, Request } from 'express';
import { FrontendService } from './frontend.service';
import { SpaRoutingGuard } from '../guards/spa-routing.guard';

@Controller()
@UseGuards(SpaRoutingGuard)
export class FrontendController {
  private readonly logger = new Logger(FrontendController.name);

  constructor(private readonly frontendService: FrontendService) {}

  /**
   * Health check endpoint for frontend service
   */
  @Get('/health/frontend')
  async healthCheck() {
    const isHealthy = await this.frontendService.healthCheck();
    
    if (isHealthy) {
      return {
        status: 'ok',
        service: 'frontend',
        message: 'Frontend service is healthy',
        timestamp: new Date().toISOString(),
      };
    } else {
      throw new NotFoundException('Frontend service is not healthy');
    }
  }

  /**
   * Test endpoint to verify controller is working
   */
  @Get('/test-frontend')
  async testEndpoint() {
    this.logger.log('[TEST] Frontend controller test endpoint called');
    return {
      message: 'Frontend controller is working!',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Serve the root path - serves index.html for SPA routing
   */
  @Get('/')
  async serveRoot(@Res() res: Response) {
    try {
      const { stream, contentType, contentLength } = await this.frontendService.getIndexHtml();
      
      res.setHeader('Content-Type', contentType);
      if (contentLength) {
        res.setHeader('Content-Length', contentLength.toString());
      }
      
      // Set cache headers for HTML
      res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour
      res.setHeader('ETag', `"index-${Date.now()}"`);

      stream.pipe(res);
    } catch (error) {
      this.logger.error('Error serving index.html:', error);
      throw new NotFoundException('Frontend not available');
    }
  }

  /**
   * Serve static assets from S3
   */
  @Get('assets/*')
  async serveStaticAssets(@Req() req: Request, @Res() res: Response) {
    const path = req.path;
    
    this.logger.log(`[ASSETS] Serving static asset: ${path}`);
    
    try {
      const { stream, contentType, contentLength } = await this.frontendService.getFile(path);
      
      res.setHeader('Content-Type', contentType);
      if (contentLength) {
        res.setHeader('Content-Length', contentLength.toString());
      }
      
      // Set appropriate cache headers for static assets
      if (path.includes('.js') || path.includes('.css')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year for JS/CSS
      } else if (path.includes('.png') || path.includes('.jpg') || path.includes('.svg') || path.includes('.ico')) {
        res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day for images
      } else {
        res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour for other assets
      }
      
      this.logger.log(`[ASSETS] Piping static asset to response: ${path}`);
      stream.pipe(res);
    } catch (error) {
      this.logger.error(`[ASSETS] Error serving ${path}:`, error);
      throw new NotFoundException(`Asset not found: ${path}`);
    }
  }

  /**
   * Serve other static files (CSS, JS, images, etc.)
   */
  @Get('static/*path')
  @Get('css/*path')
  @Get('js/*path')
  @Get('images/*path')
  @Get('fonts/*path')
  async serveOtherStaticAssets(@Req() req: Request, @Res() res: Response) {
    const path = req.path;
    
    this.logger.log(`[STATIC] Serving static file: ${path}`);
    
    try {
      const { stream, contentType, contentLength } = await this.frontendService.getFile(path);
      
      res.setHeader('Content-Type', contentType);
      if (contentLength) {
        res.setHeader('Content-Length', contentLength.toString());
      }
      
      // Set appropriate cache headers
      if (path.includes('.js') || path.includes('.css')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
      } else if (path.includes('.png') || path.includes('.jpg') || path.includes('.svg') || path.includes('.ico')) {
        res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day
      } else {
        res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour
      }
      
      this.logger.log(`[STATIC] Piping static file to response: ${path}`);
      stream.pipe(res);
    } catch (error) {
      this.logger.error(`[STATIC] Error serving ${path}:`, error);
      throw new NotFoundException(`File not found: ${path}`);
    }
  }

  /**
   * Serve robots.txt specifically
   */
  @Get('robots.txt')
  async serveRobotsTxt(@Req() req: Request, @Res() res: Response) {
    this.logger.log(`[ROBOTS] Serving robots.txt - Request URL: ${req.url}`);
    
    try {
      const { stream, contentType, contentLength } = await this.frontendService.getFile('robots.txt');
      
      res.setHeader('Content-Type', contentType);
      if (contentLength) {
        res.setHeader('Content-Length', contentLength.toString());
      }
      
      res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour
      
      this.logger.log(`[ROBOTS] Piping robots.txt to response`);
      stream.pipe(res);
    } catch (error) {
      this.logger.error(`[ROBOTS] Error serving robots.txt from S3:`, error);
      
      // Fallback to local static file
      try {
        const fs = require('fs');
        const path = require('path');
        const staticPath = path.join(process.cwd(), 'static', 'robots.txt');
        
        if (fs.existsSync(staticPath)) {
          this.logger.log(`[ROBOTS] Serving local robots.txt from: ${staticPath}`);
          res.setHeader('Content-Type', 'text/plain');
          res.setHeader('Cache-Control', 'public, max-age=3600');
          fs.createReadStream(staticPath).pipe(res);
        } else {
          throw new Error('Local robots.txt not found');
        }
      } catch (fallbackError) {
        this.logger.error(`[ROBOTS] Fallback also failed:`, fallbackError);
        throw new NotFoundException('robots.txt not found');
      }
    }
  }

  /**
   * Serve common static files
   */
  @Get('favicon.ico')
  @Get('manifest.json')
  @Get('sitemap.xml')
  async serveCommonStaticFiles(@Req() req: Request, @Res() res: Response) {
    const path = req.path;
    
    this.logger.log(`[COMMON] Serving common static file: ${path}`);
    this.logger.log(`[COMMON] Request URL: ${req.url}`);
    this.logger.log(`[COMMON] Request method: ${req.method}`);
    
    try {
      const { stream, contentType, contentLength } = await this.frontendService.getFile(path);
      
      res.setHeader('Content-Type', contentType);
      if (contentLength) {
        res.setHeader('Content-Length', contentLength.toString());
      }
      
      res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour
      
      this.logger.log(`[COMMON] Piping common static file to response: ${path}`);
      stream.pipe(res);
    } catch (error) {
      this.logger.error(`[COMMON] Error serving ${path}:`, error);
      throw new NotFoundException(`File not found: ${path}`);
    }
  }

  /**
   * Catch-all route for SPA routing - serves index.html for any unmatched routes
   * This should be the last route to handle client-side routing
   */
  // @All('*')
  // async serveSpaRoute(@Req() req: Request, @Res() res: Response) {
  //   const path = req.path;
    
  //   // Skip if this is a static asset request (should be handled by middleware)
  //   if (this.frontendService.isStaticAsset(path)) {
  //     throw new NotFoundException(`Asset not found: ${path}`);
  //   }
    
  //   this.logger.log(`[SPA] Serving SPA route: ${path}`);
    
  //   try {
  //     const { stream, contentType, contentLength } = await this.frontendService.getIndexHtml();
      
  //     res.setHeader('Content-Type', contentType);
  //     if (contentLength) {
  //       res.setHeader('Content-Length', contentLength.toString());
  //     }
      
  //     // Set cache headers for HTML
  //     res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour
  //     res.setHeader('ETag', `"index-${Date.now()}"`);

  //     this.logger.log(`[SPA] Piping index.html for SPA route: ${path}`);
  //     stream.pipe(res);
  //   } catch (error) {
  //     this.logger.error(`[SPA] Error serving SPA route ${path}:`, error);
  //     throw new NotFoundException('Frontend not available');
  //   }
  // }
} 