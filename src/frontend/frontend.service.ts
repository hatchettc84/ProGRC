import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

@Injectable()
export class FrontendService {
  private readonly logger = new Logger(FrontendService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly basePath: string;

  constructor(private readonly configService: ConfigService) {
    const useLocalstack = this.configService.get<string>('USE_LOCALSTACK', 'false') === 'true';
    const endpoint = this.configService.get<string>('AWS_S3_ENDPOINT') || (useLocalstack
      ? this.configService.get<string>('LOCALSTACK_ENDPOINT', 'http://localhost:4566')
      : undefined);
    const credentials = endpoint ? {
      accessKeyId: this.configService.get<string>('AWS_S3_ACCESS_KEY_ID') || this.configService.get<string>('AWS_ACCESS_KEY_ID') || 'test',
      secretAccessKey: this.configService.get<string>('AWS_S3_SECRET_ACCESS_KEY') || this.configService.get<string>('AWS_SECRET_ACCESS_KEY') || 'test',
    } : undefined;

    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_S3_REGION') || this.configService.get<string>('AWS_REGION') || 'us-west-2',
      endpoint,
      forcePathStyle: true,
      credentials,
    });
    
    this.bucketName = this.configService.get<string>('FRONTEND_S3_BUCKET') || 'progrc-app-frontend-dev';
    this.basePath = this.configService.get<string>('FRONTEND_S3_BASE_PATH') || 'build_assets';
  }

  /**
   * Get a file from S3 as a readable stream
   */
  async getFile(path: string): Promise<{ stream: Readable; contentType: string; contentLength?: number }> {
    try {
      // Clean the path and ensure it starts with the base path
      const cleanPath = path.startsWith('/') ? path.slice(1) : path;
      const key = cleanPath.startsWith(this.basePath) ? cleanPath : `${this.basePath}/${cleanPath}`;
      
      this.logger.log(`Requesting file from S3 - Path: ${path}, Clean Path: ${cleanPath}, S3 Key: ${key}, Bucket: ${this.bucketName}`);
      
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const response = await this.s3Client.send(command);
      
      if (!response.Body) {
        throw new NotFoundException(`File not found: ${path}`);
      }

      this.logger.log(`Successfully retrieved file from S3: ${key}`);

      return {
        stream: response.Body as Readable,
        contentType: response.ContentType || this.getContentType(path),
        contentLength: response.ContentLength,
      };
    } catch (error) {
      this.logger.error(`Error fetching file ${path} from S3:`, error);
      
      if (error.name === 'NoSuchKey' || error.$metadata?.httpStatusCode === 404) {
        throw new NotFoundException(`File not found: ${path}`);
      }
      
      throw error;
    }
  }

  /**
   * Check if a file exists in S3
   */
  async fileExists(path: string): Promise<boolean> {
    try {
      const cleanPath = path.startsWith('/') ? path.slice(1) : path;
      const key = cleanPath.startsWith(this.basePath) ? cleanPath : `${this.basePath}/${cleanPath}`;
      
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Get index.html from S3 as a readable stream
   */
  async getIndexHtml(): Promise<{ stream: Readable; contentType: string; contentLength?: number }> {
    return this.getFile('index.html');
  }

  /**
   * Determine content type based on file extension
   */
  private getContentType(path: string): string {
    const ext = path.split('.').pop()?.toLowerCase();
    
    const contentTypes: { [key: string]: string } = {
      'html': 'text/html',
      'htm': 'text/html',
      'css': 'text/css',
      'js': 'application/javascript',
      'json': 'application/json',
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'svg': 'image/svg+xml',
      'ico': 'image/x-icon',
      'woff': 'font/woff',
      'woff2': 'font/woff2',
      'ttf': 'font/ttf',
      'eot': 'application/vnd.ms-fontobject',
      'pdf': 'application/pdf',
      'txt': 'text/plain',
      'xml': 'application/xml',
      'webp': 'image/webp',
      'avif': 'image/avif',
    };
    
    return contentTypes[ext] || 'application/octet-stream';
  }

  /**
   * Check if the path is a static asset (has a file extension)
   */
  isStaticAsset(path: string): boolean {
    const staticExtensions = [
      '.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', 
      '.woff', '.woff2', '.ttf', '.eot', '.pdf', '.txt', '.xml', '.webp', '.avif', '.gz',
    ];
    
    return staticExtensions.some(ext => path.toLowerCase().endsWith(ext));
  }

  /**
   * Health check - verify S3 connectivity
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.getIndexHtml();
      return true;
    } catch (error) {
      this.logger.error('Frontend health check failed:', error);
      return false;
    }
  }
} 
