import { SecretClient } from '@azure/keyvault-secrets';
import { ClientSecretCredential } from '@azure/identity';
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

export class AzureSecretsProvider extends BaseSecretsProvider {
  private client: SecretClient;
  private vaultUrl: string;

  async initialize(config: SecretsProviderConfig): Promise<void> {
    this.config = config;
    
    const { vaultName, tenantId, clientId, clientSecret } = config;
    
    if (!vaultName || !tenantId || !clientId || !clientSecret) {
      throw new Error('Azure Key Vault requires vaultName, tenantId, clientId, and clientSecret');
    }
    
    this.vaultUrl = `https://${vaultName}.vault.azure.net/`;
    
    // Create credentials
    const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
    
    // Initialize Azure Key Vault client
    this.client = new SecretClient(this.vaultUrl, credential);
  }

  async getSecret(secretKey: string, options?: GetSecretOptions): Promise<SecretValue> {
    try {
      const secret = await this.client.getSecret(secretKey, { version: options?.version });
      
      if (!secret.value) {
        throw new Error(`Secret ${secretKey} not found or empty`);
      }

      return {
        value: secret.value,
        version: secret.properties.version,
        createdAt: secret.properties.createdOn,
        updatedAt: secret.properties.updatedOn,
        metadata: secret.properties.tags,
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
      const secretOptions: any = {
        tags: secretValue.metadata || options?.metadata,
      };
      
      await this.client.setSecret(secretKey, secretValue.value, secretOptions);
    } catch (error) {
      throw new Error(`Failed to put secret ${secretKey}: ${error.message}`);
    }
  }

  async deleteSecret(secretKey: string, options?: DeleteSecretOptions): Promise<void> {
    try {
      const poller = await this.client.beginDeleteSecret(secretKey);
      await poller.pollUntilDone();
      
      if (options?.force) {
        // Purge the deleted secret to remove it completely
        await this.client.purgeDeletedSecret(secretKey);
      }
    } catch (error) {
      throw new Error(`Failed to delete secret ${secretKey}: ${error.message}`);
    }
  }

  async listSecrets(filter?: SecretFilter): Promise<string[]> {
    try {
      const secretNames: string[] = [];
      
      for await (const secretProperties of this.client.listPropertiesOfSecrets()) {
        if (secretProperties.name) {
          secretNames.push(secretProperties.name);
        }
      }
      
      let filteredNames = secretNames;
      
      // Apply filters
      if (filter?.prefix) {
        filteredNames = filteredNames.filter(name => name.startsWith(filter.prefix!));
      }
      
      if (filter?.regex) {
        const regex = new RegExp(filter.regex);
        filteredNames = filteredNames.filter(name => regex.test(name));
      }
      
      if (filter?.tags) {
        // Filter by tags (would need to fetch each secret's properties)
        const tagFilteredNames: string[] = [];
        for (const name of filteredNames) {
          try {
            const secretProperties = await this.client.getSecret(name);
            const tags = secretProperties.properties.tags || {};
            
            const matchesTags = Object.entries(filter.tags).every(([key, value]) => {
              return tags[key] === value;
            });
            
            if (matchesTags) {
              tagFilteredNames.push(name);
            }
          } catch (error) {
            // Skip secrets that can't be accessed
            continue;
          }
        }
        filteredNames = tagFilteredNames;
      }
      
      return filteredNames;
    } catch (error) {
      throw new Error(`Failed to list secrets: ${error.message}`);
    }
  }

  async healthCheck(): Promise<HealthStatus> {
    const startTime = Date.now();
    
    try {
      // Try to list secrets as a health check
      const iterator = this.client.listPropertiesOfSecrets();
      await iterator.next();
      
      return {
        healthy: true,
        provider: 'Azure Key Vault',
        timestamp: new Date(),
        latencyMs: Date.now() - startTime,
      };
    } catch (error) {
      return {
        healthy: false,
        provider: 'Azure Key Vault',
        timestamp: new Date(),
        latencyMs: Date.now() - startTime,
        error: error.message,
      };
    }
  }

  getProviderInfo(): ProviderInfo {
    return {
      type: SecretsProviderType.AZURE_KEY_VAULT,
      name: 'Azure Key Vault',
      version: '1.0.0',
      features: ['get', 'put', 'delete', 'list', 'versioning', 'tags'],
    };
  }
} 