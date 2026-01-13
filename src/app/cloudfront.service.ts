import { Injectable } from '@nestjs/common';
import { getSignedUrl } from '@aws-sdk/cloudfront-signer';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl as getS3SignedUrl } from '@aws-sdk/s3-request-presigner';
import * as fs from 'fs';
import * as path from 'path';
require('dotenv').config()
@Injectable()
export class CloudFrontService {
  private keyPairId: string;
  private privateKey: string;
  private cloudFrontUrl: string;

  constructor() {
    this.keyPairId = process.env['CLOUDFRONT_KEY_PAIR_ID'];
    this.cloudFrontUrl = process.env['AWS_CLOUDFRONT_S3_DOMAIN'];
    //const AWS_CLOUDFRONT_S3_DOMAIN = process.env['AWS_CLOUDFRONT_S3_DOMAIN'];

    // Load private key from file
    const privateKeyPath = process.env['CLOUDFRONT_PRIVATE_KEY_PATH'];
    this.privateKey = process.env['CLOUDFRONT_PRIVATE_KEY'] || "";
  }

  generateSignedUrl(filePath: string): string {
    const fullUrl = `${this.cloudFrontUrl}/${filePath}`;
    const expiresInMinutes = 24 * 60;

    // Expiration time for the signed URL
    const expiration = Math.floor((Date.now() + expiresInMinutes * 60 * 1000) / 1000);

    // Generate the signed URL
    const signedUrl = getSignedUrl({
      url: fullUrl,
      keyPairId: this.keyPairId,
      dateLessThan: new Date(expiration * 1000).toISOString(),
      privateKey: this.privateKey,
    });

    return signedUrl;
  }
}
