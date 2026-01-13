import { 
  ISecretsProvider, 
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

export abstract class BaseSecretsProvider implements ISecretsProvider {
  protected config: SecretsProviderConfig;
  protected cache: Map<string, { value: SecretValue; expires: number }> = new Map();

  abstract initialize(config: SecretsProviderConfig): Promise<void>;
  abstract getSecret(secretKey: string, options?: GetSecretOptions): Promise<SecretValue>;
  abstract putSecret(secretKey: string, secretValue: SecretValue, options?: PutSecretOptions): Promise<void>;
  abstract deleteSecret(secretKey: string, options?: DeleteSecretOptions): Promise<void>;
  abstract listSecrets(filter?: SecretFilter): Promise<string[]>;
  abstract healthCheck(): Promise<HealthStatus>;
  abstract getProviderInfo(): ProviderInfo;

  async getSecrets(secretKeys: string[], options?: GetSecretsOptions): Promise<Record<string, SecretValue>> {
    const results: Record<string, SecretValue> = {};
    
    if (options?.parallel) {
      const promises = secretKeys.map(key => 
        this.getSecret(key, options)
          .then(value => ({ key, value }))
          .catch(error => ({ key, error }))
      );
      
      const resolved = await Promise.all(promises);
      
      for (const result of resolved) {
        if ('error' in result) {
          if (options.throwOnNotFound) {
            throw result.error;
          }
          continue;
        }
        results[result.key] = result.value;
      }
    } else {
      for (const key of secretKeys) {
        try {
          results[key] = await this.getSecret(key, options);
        } catch (error) {
          if (options?.throwOnNotFound) {
            throw error;
          }
        }
      }
    }
    
    return results;
  }

  protected getCachedSecret(key: string): SecretValue | null {
    if (!this.config.cacheTTL) return null;
    
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() > cached.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.value;
  }

  protected setCachedSecret(key: string, value: SecretValue): void {
    if (!this.config.cacheTTL) return;
    
    this.cache.set(key, {
      value,
      expires: Date.now() + (this.config.cacheTTL * 1000)
    });
  }

  protected clearCache(): void {
    this.cache.clear();
  }

  protected async retry<T>(operation: () => Promise<T>): Promise<T> {
    const attempts = this.config.retryAttempts || 3;
    const delay = this.config.retryDelay || 1000;
    
    let lastError: Error | null = null;
    
    for (let i = 0; i < attempts; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        if (i < attempts - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        }
      }
    }
    
    throw lastError;
  }

  protected createHealthStatus(healthy: boolean, error?: string): HealthStatus {
    return {
      healthy,
      provider: this.getProviderInfo().type,
      timestamp: new Date(),
      error
    };
  }
} 