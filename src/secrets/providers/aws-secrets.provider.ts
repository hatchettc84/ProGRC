import { 
  SecretsManagerClient, 
  GetSecretValueCommand,
  GetSecretValueCommandOutput,
  CreateSecretCommand,
  UpdateSecretCommand,
  DeleteSecretCommand,
  ListSecretsCommand,
  ListSecretsCommandOutput,
  DescribeSecretCommand,
  Filter,
  FilterNameStringType
} from '@aws-sdk/client-secrets-manager';
import { BaseSecretsProvider } from './base.provider';
import { 
  SecretsProviderConfig, 
  SecretValue, 
  GetSecretOptions,
  PutSecretOptions,
  DeleteSecretOptions,
  SecretFilter,
  HealthStatus,
  ProviderInfo,
  SecretsProviderType
} from '../interfaces/secrets.interface';

export class AWSSecretsProvider extends BaseSecretsProvider {
  private client: SecretsManagerClient;

  async initialize(config: SecretsProviderConfig): Promise<void> {
    this.config = config;
    
    const clientConfig: any = {
      region: config.region || process.env.AWS_REGION || 'us-east-1',
    };

    // Only add explicit credentials if they are provided
    // Otherwise, use the default credential provider chain (IAM roles, instance profiles, etc.)
    if (config.credentials?.accessKeyId && config.credentials?.secretAccessKey) {
      clientConfig.credentials = {
        accessKeyId: config.credentials.accessKeyId,
        secretAccessKey: config.credentials.secretAccessKey,
        sessionToken: config.credentials.token
      };
    }
    // If no credentials are provided, the AWS SDK will use the default credential provider chain:
    // 1. IAM Instance Profile (EC2)
    // 2. IAM Task Role (ECS/Fargate) 
    // 3. IAM Execution Role (Lambda)
    // 4. Environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
    // 5. AWS SSO/CLI profiles (local development)

    this.client = new SecretsManagerClient(clientConfig);
  }

  async getSecret(secretKey: string, options?: GetSecretOptions): Promise<SecretValue> {
    if (options?.useCache !== false) {
      const cached = this.getCachedSecret(secretKey);
      if (cached) return cached;
    }

    try {
      const command = new GetSecretValueCommand({
        SecretId: secretKey,
        VersionId: options?.version,
      });

      const response: GetSecretValueCommandOutput = await this.retry(() => this.client.send(command));
      
      const secretValue: SecretValue = {
        value: response.SecretString || Buffer.from(response.SecretBinary || new Uint8Array()).toString(),
        version: response.VersionId,
        createdAt: response.CreatedDate,
        metadata: {
          arn: response.ARN,
          name: response.Name,
        }
      };

      this.setCachedSecret(secretKey, secretValue);
      return secretValue;
    } catch (error) {
      if (error.name === 'ResourceNotFoundException' && options?.throwOnNotFound === false) {
        return { value: '' };
      }
      throw error;
    }
  }

  async putSecret(secretKey: string, secretValue: SecretValue, options?: PutSecretOptions): Promise<void> {
    try {
      const describeCommand = new DescribeSecretCommand({ SecretId: secretKey });
      await this.client.send(describeCommand);

      // Secret exists, update it
      const updateCommand = new UpdateSecretCommand({
        SecretId: secretKey,
        SecretString: secretValue.value,
        Description: secretValue.metadata?.description,
      });
      await this.retry(() => this.client.send(updateCommand));
    } catch (error) {
      if (error.name === 'ResourceNotFoundException') {
        // Secret doesn't exist, create it
        const createCommand = new CreateSecretCommand({
          Name: secretKey,
          SecretString: secretValue.value,
          Description: secretValue.metadata?.description,
        });
        await this.retry(() => this.client.send(createCommand));
      } else {
        throw error;
      }
    }

    this.clearCache();
  }

  async deleteSecret(secretKey: string, options?: DeleteSecretOptions): Promise<void> {
    const command = new DeleteSecretCommand({
      SecretId: secretKey,
      ForceDeleteWithoutRecovery: options?.force,
    });

    await this.retry(() => this.client.send(command));
    this.clearCache();
  }

  async listSecrets(filter?: SecretFilter): Promise<string[]> {
    const filters: Filter[] = [];

    if (filter?.prefix) {
      filters.push({
        Key: 'name' as FilterNameStringType,
        Values: [filter.prefix]
      });
    }

    if (filter?.tags) {
      Object.entries(filter.tags).forEach(([key, value]) => {
        filters.push({
          Key: 'tag-key' as FilterNameStringType,
          Values: [key]
        });
      });
    }

    const command = new ListSecretsCommand({
      Filters: filters
    });

    const response: ListSecretsCommandOutput = await this.retry(() => this.client.send(command));
    return response.SecretList?.map(secret => secret.Name || '') || [];
  }

  async healthCheck(): Promise<HealthStatus> {
    try {
      const startTime = Date.now();
      await this.client.send(new ListSecretsCommand({ MaxResults: 1 }));
      const latencyMs = Date.now() - startTime;

      return this.createHealthStatus(true, undefined);
    } catch (error) {
      return this.createHealthStatus(false, error.message);
    }
  }

  getProviderInfo(): ProviderInfo {
    return {
      type: SecretsProviderType.AWS_SECRETS_MANAGER,
      name: 'AWS Secrets Manager',
      version: '1.0.0',
      features: [
        'versioning',
        'rotation',
        'encryption',
        'tagging',
        'cross-region replication'
      ]
    };
  }
} 