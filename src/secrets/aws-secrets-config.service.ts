import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SecretsManagerClient, GetSecretValueCommand, GetSecretValueCommandOutput } from '@aws-sdk/client-secrets-manager';

@Injectable()
export class AwsSecretsConfigService {
    private secretsClient: SecretsManagerClient;
    
    constructor(private configService: ConfigService) {
        this.initSecretsManager();
    }

    initSecretsManager() {
        if (!this.secretsClient) {
            const clientConfig: any = {
                region: this.configService.get<string>('AWS_REGION') || 'us-east-1',
            };

            // Only add explicit credentials if they are provided
            // Otherwise, use the default credential provider chain (IAM roles, instance profiles, etc.)
            const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
            const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');
            
            if (accessKeyId && secretAccessKey) {
                clientConfig.credentials = {
                    accessKeyId,
                    secretAccessKey,
                    sessionToken: this.configService.get<string>('AWS_SESSION_TOKEN')
                };
            }
            // If no credentials are provided, the AWS SDK will use the default credential provider chain:
            // 1. IAM Instance Profile (EC2)
            // 2. IAM Task Role (ECS/Fargate) 
            // 3. IAM Execution Role (Lambda)
            // 4. Environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
            // 5. AWS SSO/CLI profiles (local development)

            this.secretsClient = new SecretsManagerClient(clientConfig);
        }
    }

    getSecretsClient(): SecretsManagerClient {
        if (!this.secretsClient) {
            this.initSecretsManager();
        }
        return this.secretsClient;
    }

    /**
     * Get a secret value from AWS Secrets Manager
     * @param secretName - Name of the secret
     * @param versionId - Optional version ID
     * @returns Promise<string> - The secret value
     */
    async getSecretValue(secretName: string, versionId?: string): Promise<string> {
        const client = this.getSecretsClient();
        
        const command = new GetSecretValueCommand({
            SecretId: secretName,
            VersionId: versionId,
        });

        const response: GetSecretValueCommandOutput = await client.send(command);
        
        if (response.SecretString) {
            return response.SecretString;
        } else if (response.SecretBinary) {
            return Buffer.from(response.SecretBinary).toString();
        } else {
            throw new Error(`Secret ${secretName} not found or empty`);
        }
    }

    /**
     * Get secret as parsed JSON object
     * @param secretName - Name of the secret
     * @param versionId - Optional version ID  
     * @returns Promise<Record<string, any>> - Parsed JSON object
     */
    async getSecretAsJson(secretName: string, versionId?: string): Promise<Record<string, any>> {
        const secretValue = await this.getSecretValue(secretName, versionId);
        
        try {
            return JSON.parse(secretValue);
        } catch (error) {
            throw new Error(`Failed to parse secret ${secretName} as JSON: ${error.message}`);
        }
    }

    /**
     * Check if AWS Secrets Manager is accessible (health check)
     * @returns Promise<boolean>
     */
    async isHealthy(): Promise<boolean> {
        try {
            const client = this.getSecretsClient();
            // Try to list secrets as a health check (this doesn't require reading actual secrets)
            await client.send(new GetSecretValueCommand({ SecretId: 'health-check-dummy-secret' }));
            return true;
        } catch (error) {
            // If the error is ResourceNotFoundException, the service is healthy but secret doesn't exist
            if (error.name === 'ResourceNotFoundException') {
                return true;
            }
            // Other errors indicate service issues
            return false;
        }
    }
} 