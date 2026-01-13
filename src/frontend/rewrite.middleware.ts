import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class FrontendRewriteMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const uri = req.url;

    // Allow assets and API calls, rewrite everything else to "/"
    if (
      !uri.startsWith('/assets/') &&
      !uri.startsWith('/static/') &&
      !uri.startsWith('/css/') &&
      !uri.startsWith('/js/') &&
      !uri.startsWith('/images/') &&
      !uri.startsWith('/fonts/') &&
      !uri.startsWith('/api/v1/') &&
      !uri.startsWith('/api/') &&
      !uri.startsWith('/health/') &&
      !uri.startsWith('/favicon.ico') &&
      !uri.startsWith('/manifest.json') &&
      !uri.startsWith('/robots.txt') &&
      !uri.startsWith('/sitemap.xml')
      //!uri.includes('.') // skip files like /main.js or /styles.css
    ) {
      req.url = '/';
    }

    next();
  }
} 