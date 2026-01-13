import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl as getS3SignedUrl } from '@aws-sdk/s3-request-presigner';
require('dotenv').config()

const AWS_S3_REGION = process.env['AWS_S3_REGION'] || process.env['AWS_REGION'] || 'us-east-1';
const USE_LOCALSTACK = (process.env['USE_LOCALSTACK'] || 'false') === 'true';
const AWS_S3_ENDPOINT = process.env['AWS_S3_ENDPOINT'] || (USE_LOCALSTACK ? process.env['LOCALSTACK_ENDPOINT'] || 'http://localhost:4566' : undefined);
const AWS_ACCESS_KEY_ID = process.env['AWS_S3_ACCESS_KEY_ID'] || process.env['AWS_ACCESS_KEY_ID'] || 'test';
const AWS_SECRET_ACCESS_KEY = process.env['AWS_S3_SECRET_ACCESS_KEY'] || process.env['AWS_SECRET_ACCESS_KEY'] || 'test';
const S3_FILES_BUCKET = process.env['S3_FILES_BUCKET'];

// Create a standalone S3 client for the transformer
const s3Client = new S3Client({
    region: AWS_S3_REGION,
    forcePathStyle: true,
    endpoint: AWS_S3_ENDPOINT,
    credentials: AWS_S3_ENDPOINT ? {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
    } : undefined,
});

export const s3Transformer = () => {
    return {
        from: (value) => {
            // Return the original value - we'll handle S3 signed URL generation in the service layer
            return value;
        },
        to: (value) => value
    }
}

// Export a separate function for generating S3 signed URLs
export const generateS3SignedUrl = async (filePath: string): Promise<string> => {
    if (!filePath) {
        return filePath;
    }

    try {
        const command = new GetObjectCommand({
            Bucket: S3_FILES_BUCKET,
            Key: filePath,
        });

        const signedUrl = await getS3SignedUrl(s3Client, command, {
            expiresIn: 4 * 60 * 60, // 4 hours
        });

        return signedUrl;
    } catch (error) {
        console.error('Error generating S3 signed URL:', error);
        return filePath; // Return original value if signing fails
    }
}
