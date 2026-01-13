import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { BaseSecretsProvider } from './base.provider';
import { 
  SecretsProviderConfig, 
  SecretValue, 
  GetSecretOptions, 
  GetSecretsOptions,
  PutSecretOptions, 
  DeleteSecretOptions, 
  SecretFilter, 
  HealthStatus,
  ProviderInfo,
  SecretsProviderType 
} from '../interfaces/secrets.interface';

export class GCPSecretsProvider extends BaseSecretsProvider {
  private client: SecretManagerServiceClient;
  private projectId: string;

  async initialize(config: SecretsProviderConfig): Promise<void> {
    this.config = config;
    
    this.projectId = config.projectId;
    
    // Initialize GCP Secret Manager client
    const clientConfig: any = {
      projectId: this.projectId,
    };

    // Use service account credentials if provided
    if (config.credentials?.clientEmail && config.credentials?.privateKey) {
      clientConfig.credentials = {
        client_email: config.credentials.clientEmail,
        private_key: config.credentials.privateKey,
      };
    }

    this.client = new SecretManagerServiceClient(clientConfig);
  }

  async getSecret(secretKey: string, options?: GetSecretOptions): Promise<SecretValue> {
    try {
      const name = `projects/${this.projectId}/secrets/${secretKey}/versions/${options?.version || 'latest'}`;
      const [response] = await this.client.accessSecretVersion({ name });
      
      const secretValue = response.payload?.data?.toString();
      if (!secretValue) {
        throw new Error(`Secret ${secretKey} not found or empty`);
      }

      return {
        value: secretValue,
        version: response.name?.split('/').pop(),
        // Note: GCP SDK doesn't expose creation time in this response
        createdAt: undefined,
      };
    } catch (error) {
      if (options?.throwOnNotFound !== false) {
        throw error;
      }
      return { value: '' };
    }
  }

  async getSecrets(secretKeys: string[], options?: GetSecretsOptions): Promise<Record<string, SecretValue>> {
    const results: Record<string, SecretValue> = {};
    
    if (options?.parallel !== false) {
      // Execute in parallel
      const promises = secretKeys.map(async (key) => {
        try {
          const secret = await this.getSecret(key, options);
          return { key, secret };
        } catch (error) {
          if (options?.throwOnNotFound !== false) {
            throw error;
          }
          return { key, secret: { value: '' } };
        }
      });
      
      const resolvedSecrets = await Promise.all(promises);
      
      for (const { key, secret } of resolvedSecrets) {
        results[key] = secret;
      }
    } else {
      // Execute sequentially
      for (const key of secretKeys) {
        try {
          results[key] = await this.getSecret(key, options);
        } catch (error) {
          if (options?.throwOnNotFound !== false) {
            throw error;
          }
          results[key] = { value: '' };
        }
      }
    }
    
    return results;
  }

  async putSecret(secretKey: string, secretValue: SecretValue, options?: PutSecretOptions): Promise<void> {
    try {
      const parent = `projects/${this.projectId}`;
      const secretId = secretKey;
      
      // Check if secret exists
      const secretName = `projects/${this.projectId}/secrets/${secretKey}`;
      try {
        await this.client.getSecret({ name: secretName });
      } catch (error) {
        // Secret doesn't exist, create it
        await this.client.createSecret({
          parent,
          secretId,
          secret: {
            replication: {
              automatic: {},
            },
          },
        });
      }
      
      // Add secret version
      await this.client.addSecretVersion({
        parent: secretName,
        payload: {
          data: Buffer.from(secretValue.value),
        },
      });
    } catch (error) {
      throw new Error(`Failed to put secret ${secretKey}: ${error.message}`);
    }
  }

  async deleteSecret(secretKey: string, options?: DeleteSecretOptions): Promise<void> {
    try {
      const name = `projects/${this.projectId}/secrets/${secretKey}`;
      await this.client.deleteSecret({ name });
    } catch (error) {
      throw new Error(`Failed to delete secret ${secretKey}: ${error.message}`);
    }
  }

  async listSecrets(filter?: SecretFilter): Promise<string[]> {
    try {
      const parent = `projects/${this.projectId}`;
      const [secrets] = await this.client.listSecrets({ parent });
      
      let secretNames = secrets.map(secret => {
        const parts = secret.name?.split('/');
        return parts ? parts[parts.length - 1] : '';
      }).filter(name => name);
      
      // Apply filters
      if (filter?.prefix) {
        secretNames = secretNames.filter(name => name.startsWith(filter.prefix!));
      }
      
      if (filter?.regex) {
        const regex = new RegExp(filter.regex);
        secretNames = secretNames.filter(name => regex.test(name));
      }
      
      return secretNames;
    } catch (error) {
      throw new Error(`Failed to list secrets: ${error.message}`);
    }
  }

  async healthCheck(): Promise<HealthStatus> {
    const startTime = Date.now();
    
    try {
      // Try to list secrets as a health check
      const parent = `projects/${this.projectId}`;
      await this.client.listSecrets({ parent, pageSize: 1 });
      
      return {
        healthy: true,
        provider: 'GCP Secret Manager',
        timestamp: new Date(),
        latencyMs: Date.now() - startTime,
      };
    } catch (error) {
      return {
        healthy: false,
        provider: 'GCP Secret Manager',
        timestamp: new Date(),
        latencyMs: Date.now() - startTime,
        error: error.message,
      };
    }
  }

  getProviderInfo(): ProviderInfo {
    return {
      type: SecretsProviderType.GCP_SECRET_MANAGER,
      name: 'Google Cloud Secret Manager',
      version: '1.0.0',
      features: ['get', 'put', 'delete', 'list', 'versioning'],
    };
  }
} 