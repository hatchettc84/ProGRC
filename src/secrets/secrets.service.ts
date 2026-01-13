import { Injectable, OnModuleInit } from '@nestjs/common';
import { ISecretsProvider, SecretsProviderType, SecretValue, GetSecretOptions, PutSecretOptions, DeleteSecretOptions, SecretFilter, HealthStatus } from './interfaces/secrets.interface';
import { SecretsManagerConfiguration } from './config/secrets-config.factory';
import { SecretsConfigurationFactory } from './config/secrets-config.factory';
import { AWSSecretsProvider } from './providers/aws-secrets.provider';
import { VaultSecretsProvider } from './providers/vault-secrets.provider';
import { GCPSecretsProvider } from './providers/gcp-secrets.provider';
import { AzureSecretsProvider } from './providers/azure-secrets.provider';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class SecretsService implements OnModuleInit {
  private config: SecretsManagerConfiguration;
  private primaryProvider: ISecretsProvider;
  private fallbackProvider: ISecretsProvider | null = null;
  private providers: Map<SecretsProviderType, ISecretsProvider> = new Map();

  constructor(private readonly logger: LoggerService) {}

  async onModuleInit() {
    this.config = SecretsConfigurationFactory.createFromEnvironment();
    await this.initializeProviders();
  }

  private async initializeProviders() {
    // Initialize primary provider
    this.primaryProvider = await this.createProvider(this.config.primaryProvider);
    this.providers.set(this.config.primaryProvider, this.primaryProvider);

    // Initialize fallback provider if enabled
    if (this.config.enableFallback && this.config.fallbackProvider) {
      this.fallbackProvider = await this.createProvider(this.config.fallbackProvider);
      this.providers.set(this.config.fallbackProvider, this.fallbackProvider);
    }

    // Perform health checks
    await this.checkProvidersHealth();
  }

  private async createProvider(type: SecretsProviderType): Promise<ISecretsProvider> {
    let provider: ISecretsProvider;

    switch (type) {
      case SecretsProviderType.AWS_SECRETS_MANAGER:
        provider = new AWSSecretsProvider();
        break;
      case SecretsProviderType.HASHICORP_VAULT:
        provider = new VaultSecretsProvider();
        break;
      case SecretsProviderType.GCP_SECRET_MANAGER:
        provider = new GCPSecretsProvider();
        break;
      case SecretsProviderType.AZURE_KEY_VAULT:
        provider = new AzureSecretsProvider();
        break;
      default:
        throw new Error(`Unsupported secrets provider type: ${type}`);
    }

    await provider.initialize({
      provider: type,
      ...this.config.providers[type],
    });

    return provider;
  }

  private async checkProvidersHealth() {
    const healthChecks = await Promise.all(
      Array.from(this.providers.values()).map(async provider => {
        const health = await provider.healthCheck();
        return { provider: provider.getProviderInfo().type, health };
      })
    );

    healthChecks.forEach(({ provider, health }) => {
      if (!health.healthy) {
        this.logger.warn(`Secrets provider ${provider} is unhealthy`, { health });
      }
    });
  }

  async getSecret(secretKey: string, options?: GetSecretOptions): Promise<SecretValue> {
    try {
      return await this.primaryProvider.getSecret(secretKey, options);
    } catch (error) {
      if (this.fallbackProvider) {
        this.logger.warn(`Primary provider failed, falling back to ${this.fallbackProvider.getProviderInfo().type}`, {
          error,
          secretKey
        });
        return this.fallbackProvider.getSecret(secretKey, options);
      }
      throw error;
    }
  }

  async getSecrets(secretKeys: string[], options?: GetSecretOptions): Promise<Record<string, SecretValue>> {
    try {
      return await this.primaryProvider.getSecrets(secretKeys, options);
    } catch (error) {
      if (this.fallbackProvider) {
        this.logger.warn(`Primary provider failed, falling back to ${this.fallbackProvider.getProviderInfo().type}`, {
          error,
          secretKeys
        });
        return this.fallbackProvider.getSecrets(secretKeys, options);
      }
      throw error;
    }
  }

  async putSecret(secretKey: string, secretValue: SecretValue, options?: PutSecretOptions): Promise<void> {
    // Update all configured providers
    const promises = Array.from(this.providers.values()).map(provider =>
      provider.putSecret(secretKey, secretValue, options)
    );

    await Promise.all(promises);
  }

  async deleteSecret(secretKey: string, options?: DeleteSecretOptions): Promise<void> {
    // Delete from all configured providers
    const promises = Array.from(this.providers.values()).map(provider =>
      provider.deleteSecret(secretKey, options)
    );

    await Promise.all(promises);
  }

  async listSecrets(filter?: SecretFilter): Promise<string[]> {
    try {
      return await this.primaryProvider.listSecrets(filter);
    } catch (error) {
      if (this.fallbackProvider) {
        this.logger.warn(`Primary provider failed, falling back to ${this.fallbackProvider.getProviderInfo().type}`, {
          error,
          filter
        });
        return this.fallbackProvider.listSecrets(filter);
      }
      throw error;
    }
  }

  async healthCheck(): Promise<HealthStatus[]> {
    const healthChecks = await Promise.all(
      Array.from(this.providers.values()).map(provider => provider.healthCheck())
    );

    return healthChecks;
  }

  getProviderInfo(): Record<SecretsProviderType, any> {
    const info: Record<SecretsProviderType, any> = {} as Record<SecretsProviderType, any>;
    
    for (const [type, provider] of this.providers.entries()) {
      info[type] = provider.getProviderInfo();
    }

    return info;
  }

  /**
   * Load and overwrite environment variables from secrets
   * Excludes provider-related and credential-related environment variables from being overwritten
   */
  async loadSecretsIntoEnvironment(secretName: string = 'APPLICATION_SECRETS'): Promise<void> {
    try {
      // List of environment variables that should NOT be overwritten
      const excludedKeys = new Set([
        'SECRETS_BACKEND',
        'SECRET_PROVIDER',
        'SECRETS_ENABLE_FALLBACK',
        'SECRETS_FALLBACK_BACKEND',
        'SECRETS_CACHE_ENABLED',
        'SECRETS_CACHE_TTL',
        'SECRETS_RETRY_ATTEMPTS',
        'SECRETS_RETRY_DELAY',
        // AWS credentials
        'AWS_ACCESS_KEY_ID',
        'AWS_SECRET_ACCESS_KEY',
        'AWS_REGION',
        // Azure credentials
        'AZURE_KEY_VAULT_NAME',
        'AZURE_TENANT_ID',
        'AZURE_CLIENT_ID',
        'AZURE_CLIENT_SECRET',
        // GCP credentials
        'GCP_PROJECT_ID',
        'GCP_CLIENT_EMAIL',
        'GCP_PRIVATE_KEY',
        // Vault credentials
        'VAULT_ADDR',
        'VAULT_TOKEN',
        'VAULT_AUTH_METHOD',
        'VAULT_ROLE_ID',
        'VAULT_SECRET_ID',
        'VAULT_KUBERNETES_ROLE',
        'VAULT_KUBERNETES_JWT',
      ]);

      // List of keys that need base64 decoding (cryptographic keys)
      const base64Keys = new Set([
        'CLOUDFRONT_PRIVATE_KEY',
        'ACCESS_TOKEN_SIGNATURE_PRIVATE', 
        'ACCESS_TOKEN_SIGNATURE_PUBLIC'
      ]);


      // Get the secret containing all environment variables
      const secretValue = await this.getSecret(secretName, { throwOnNotFound: false });
      
      if (!secretValue.value) {
        this.logger.warn(`No secret found with name ${secretName}, skipping environment variable loading`);
        return;
      }

      // Parse the secret value as JSON
      let secretObject: Record<string, string>;
      try {
        secretObject = JSON.parse(secretValue.value);
      } catch (error) {
        this.logger.error('Failed to parse secret as JSON', { error, secretName });
        return;
      }

      // Load secrets into environment variables, excluding provider-related keys
      let loadedCount = 0;
      let skippedCount = 0;

      for (const [key, value] of Object.entries(secretObject)) {
        if (excludedKeys.has(key)) {
          skippedCount++;
          this.logger.debug(`Skipping protected environment variable: ${key}`);
          continue;
        }

        // Only overwrite if the value is different or not set
        if (base64Keys.has(key)) {
          process.env[key] = Buffer.from(String(value), 'base64').toString('utf-8');
        } else {
          process.env[key] = value;
        }
        loadedCount++;
      }

      this.logger.info(`Loaded secrets into environment variables`, {
        secretName,
        loadedCount,
        skippedCount,
        provider: this.primaryProvider.getProviderInfo().type
      });

    } catch (error) {
      this.logger.error('Failed to load secrets into environment variables', {
        error: error.message,
        secretName,
        provider: this.primaryProvider?.getProviderInfo()?.type
      });
      throw error;
    }
  }
} 