import { DeleteObjectCommand, DeleteObjectsCommand, GetObjectCommand, PutObjectCommand, CopyObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getSignedUrl as getS3SignedUrl } from '@aws-sdk/s3-request-presigner';
import * as https from 'https';
import { LoggerService } from 'src/logger/logger.service';

@Injectable()
export class AwsS3ConfigService {
    private s3Client: S3Client;
    constructor(
        private configService: ConfigService,
        private readonly logger: LoggerService
    ) {
        this.initS3();
    }

    initS3() {
        if (!this.s3Client) {
            const useLocalstack = this.configService.get<string>('USE_LOCALSTACK', 'false') === 'true';
            const region = this.configService.get<string>('AWS_S3_REGION') || this.configService.get<string>('AWS_REGION') || 'us-east-1';
            const endpoint = this.configService.get<string>('AWS_S3_ENDPOINT') || (useLocalstack ? this.configService.get<string>('LOCALSTACK_ENDPOINT', 'http://localhost:4566') : undefined);
            const credentials = (useLocalstack || endpoint) ? {
                accessKeyId: this.configService.get<string>('AWS_S3_ACCESS_KEY_ID') || this.configService.get<string>('AWS_ACCESS_KEY_ID') || 'test',
                secretAccessKey: this.configService.get<string>('AWS_S3_SECRET_ACCESS_KEY') || this.configService.get<string>('AWS_SECRET_ACCESS_KEY') || 'test',
            } : undefined;

            this.s3Client = new S3Client({
                region,
                forcePathStyle: true,
                endpoint,
                credentials,
                // When running locally without AWS, we point to LocalStack and use test credentials
            });
        }

    }

    getS3(): S3Client {
        if (!this.s3Client)
            this.initS3();
        return this.s3Client;
    }

    getS3Bucket(): string {
        return this.configService.get<string>('S3_FILES_BUCKET');
    }

    getFileNamePrefix(orgId: number, type: string): string {

        return `${orgId}/${type}/`;
        switch (type) {
            case 'profile_picture':

            case 'template_document':
                return this.configService.get<string>('S3_TEMPLATES_BUCKET');
            case 'assessment_document':
                return this.configService.get<string>('S3_ASSESSMENTS_BUCKET');
            default:
                throw new BadRequestException(`Unknown file type: ${type}`);
        }
    }

    putObjectCommand(key, file) {
        const command = new PutObjectCommand({
            Bucket: this.getS3Bucket(),
            Key: key,
            Body: file.buffer,
        });

        return command;
    }

    getObjectCommand(key) {
        const command = new GetObjectCommand({
            Bucket: this.getS3Bucket(),
            Key: key,
        });

        return command;
    }

    deleteObjectCommand(key) {
        const command = new DeleteObjectCommand({
            Bucket: this.getS3Bucket(),
            Key: key,
        });
        return command;
    }

    deleteMultipleObjectsCommand(keys: string[]) {
        const validKeys = keys.filter(key => key);
        const objects = validKeys.map(key => ({ Key: key }));
      
        return new DeleteObjectsCommand({
          Bucket: this.getS3Bucket(),
          Delete: {
            Objects: objects,
          },
        });
    }

    copyObjectCommand(sourceKey: string, destinationKey: string) {
        return new CopyObjectCommand({
            Bucket: this.getS3Bucket(),
            CopySource: `${this.getS3Bucket()}/${sourceKey}`,
            Key: destinationKey,
        });
    }

    async generateDownloadSignedUrl(filePath: string, expirationTimeInMinute: number = 5): Promise<string> {
        const command = new GetObjectCommand({
            Bucket: this.getS3Bucket(),
            Key: filePath,
        });

        this.getS3();

        const expiresInMinutes = expirationTimeInMinute;
        const signedUrl = await getS3SignedUrl(this.s3Client, command, {
            expiresIn: expiresInMinutes * 60, // Expiration time in seconds
        });

        return signedUrl;
    }

    async generateUploadSignedUrl(filePath: string): Promise<string> {
        const startTime = Date.now();
        const bucket = this.getS3Bucket();
        
        this.logger.log(`[S3] Generating presigned URL for: ${filePath}, bucket: ${bucket}`);
        
        // Don't set ContentType in presigned URL - let the client set it during upload
        // This prevents signature mismatch errors when Content-Type differs
        const command = new PutObjectCommand({
            Bucket: bucket,
            Key: filePath,
            // ContentType is intentionally omitted - client will set it during upload
        });

        const useLocalstack = this.configService.get<string>('USE_LOCALSTACK', 'false') === 'true';
        const internalEndpoint = this.configService.get<string>('LOCALSTACK_ENDPOINT') || 'http://localstack-internal:4566';
        const publicEndpoint = useLocalstack 
            ? this.configService.get<string>('LOCALSTACK_PUBLIC_ENDPOINT') || 'http://143.244.221.38:4566'
            : undefined;

        let s3ClientForPresigning = this.s3Client;
        
        // ✅ FIX: Use internal K8s service name for SDK calls (fast, reliable)
        // Only use internal endpoint - bucket check removed (should be done at initialization)
        if (useLocalstack) {
            const region = this.configService.get<string>('AWS_S3_REGION') || this.configService.get<string>('AWS_REGION') || 'us-east-1';
            
            this.logger.log(`[S3] Using LocalStack - internal endpoint: ${internalEndpoint}, public endpoint: ${publicEndpoint}`);
            
            // ✅ FIX: Use internal endpoint for SDK calls (faster, more reliable from K8s pods)
            s3ClientForPresigning = new S3Client({
                region,
                forcePathStyle: true,
                endpoint: internalEndpoint, // ✅ Use internal K8s service name, not hardcoded IP
                credentials: {
                    accessKeyId: this.configService.get<string>('AWS_S3_ACCESS_KEY_ID') || this.configService.get<string>('AWS_ACCESS_KEY_ID') || 'test',
                    secretAccessKey: this.configService.get<string>('AWS_S3_SECRET_ACCESS_KEY') || this.configService.get<string>('AWS_SECRET_ACCESS_KEY') || 'test',
                },
                // ✅ FIX: Reduced timeout to 5 seconds for faster failures
                requestHandler: {
                    requestTimeout: 5000, // 5 second timeout for S3 operations (was 10s)
                    httpsAgent: new https.Agent({
                        timeout: 5000,
                        keepAlive: true,
                    }),
                },
            });
            
            // ✅ FIX: REMOVED blocking bucket check - this was causing timeouts!
            // Bucket should be created during LocalStack initialization, not on every request
            // If bucket doesn't exist, it will fail during actual upload, not during presign
        } else {
            this.getS3();
        }

        try {
            // ✅ FIX: Reduced timeout to 5 seconds for faster failures
            const expiresInMinutes = 5;
            const signedUrlPromise = getS3SignedUrl(s3ClientForPresigning, command, {
                expiresIn: expiresInMinutes * 60, // Expiration time in seconds
            });

            // Race against a timeout promise (reduced to 5 seconds)
            const timeoutPromise = new Promise<string>((_, reject) => 
                setTimeout(() => reject(new Error('S3 presigned URL generation timeout after 5 seconds')), 5000)
            );

            const signedUrl = await Promise.race([signedUrlPromise, timeoutPromise]);
            
            // ✅ FIX: Replace internal endpoint with public endpoint in the generated URL for browser access
            // Presigned URLs contain the endpoint hostname, so we need to replace it for browser access
            let finalUrl = signedUrl as string;
            if (useLocalstack && publicEndpoint && internalEndpoint) {
                // Replace internal endpoint hostname with public endpoint hostname
                // Handle both http://hostname:port and hostname:port formats
                const internalHost = internalEndpoint.replace(/^https?:\/\//, ''); // Remove protocol
                const publicHost = publicEndpoint.replace(/^https?:\/\//, ''); // Remove protocol
                
                if (signedUrl.includes(internalHost)) {
                    finalUrl = signedUrl.replace(new RegExp(internalHost.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), publicHost);
                    this.logger.log(`[S3] Replaced internal endpoint (${internalHost}) with public endpoint (${publicHost}) in presigned URL`);
                }
            }
            
            const duration = Date.now() - startTime;
            this.logger.log(`[S3] Presigned URL generated successfully in ${duration}ms for: ${filePath}`);
            
            return finalUrl;
        } catch (error) {
            const duration = Date.now() - startTime;
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`[S3] Failed to generate presigned URL after ${duration}ms for ${filePath}: ${errorMessage}`, { error: errorMessage, filePath, bucket });
            throw new InternalServerErrorException(
                `Failed to generate presigned URL for ${filePath}: ${errorMessage}`
            );
        }
    }

    async copyObject(sourceKey: string, destinationKey: string) {
        this.getS3();
        // const copyCommand  = new CopyObjectCommand({
        //     Bucket: this.getS3Bucket(),
        //     CopySource: sourceKey,
        //     Key: destinationKey
        // });
        const copyCommand = this.copyObjectCommand(sourceKey, destinationKey);
        return await this.s3Client.send(copyCommand);
    }
}
