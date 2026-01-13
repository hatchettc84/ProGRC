import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RequestContextService } from 'src/request-context/request-context.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RequestMiddleware implements NestMiddleware {
  constructor(private readonly requestContextService: RequestContextService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const requestId: string = uuidv4();
    const ipAddress: string = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].toString() : req.socket.remoteAddress;
    this.requestContextService.setRequestId(requestId);
    this.requestContextService.setIpAddress(ipAddress);
    
    next();
  }
}