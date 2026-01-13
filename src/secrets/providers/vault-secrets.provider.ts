import Vault from 'node-vault';
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

interface VaultResponse {
  data: {
    data: {
      value: string;
    };
    metadata: {
      version: number;
      created_time: string;
      updated_time: string;
      [key: string]: any;
    };
  };
}

interface VaultListResponse {
  data: {
    keys: string[];
  };
}

export class VaultSecretsProvider extends BaseSecretsProvider {
  private client: Vault.client;
  private mountPath: string = 'secret';

  async initialize(config: SecretsProviderConfig): Promise<void> {
    this.config = config;
    this.mountPath = config.mountPath || 'secret';

    const vaultConfig: Vault.VaultOptions = {
      endpoint: config.endpoint,
      token: config.token,
    };

    this.client = Vault(vaultConfig);

    if (config.authMethod) {
      await this.authenticate(config);
    }
  }

  private async authenticate(config: SecretsProviderConfig): Promise<void> {
    const authMethod = config.authMethod as string;

    switch (authMethod) {
      case 'approle':
        if (!config.roleId || !config.secretId) {
          throw new Error('AppRole authentication requires roleId and secretId');
        }
        await this.client.approleLogin({
          role_id: config.roleId,
          secret_id: config.secretId,
        });
        break;

      case 'kubernetes':
        if (!config.kubernetesRole || !config.kubernetesJwt) {
          throw new Error('Kubernetes authentication requires role and JWT');
        }
        await this.client.kubernetesLogin({
          role: config.kubernetesRole,
          jwt: config.kubernetesJwt,
        });
        break;

      case 'token':
        if (!config.token) {
          throw new Error('Token authentication requires a token');
        }
        // Token is already set in the client config
        break;

      default:
        throw new Error(`Unsupported authentication method: ${authMethod}`);
    }
  }

  async getSecret(secretKey: string, options?: GetSecretOptions): Promise<SecretValue> {
    if (options?.useCache !== false) {
      const cached = this.getCachedSecret(secretKey);
      if (cached) return cached;
    }

    try {
      const response = await this.retry(() => 
        this.client.read(`${this.mountPath}/data/${secretKey}`)
      ) as VaultResponse;

      const secretValue: SecretValue = {
        value: response.data.data.value,
        version: response.data.metadata.version.toString(),
        createdAt: new Date(response.data.metadata.created_time),
        updatedAt: new Date(response.data.metadata.updated_time),
        metadata: response.data.metadata
      };

      this.setCachedSecret(secretKey, secretValue);
      return secretValue;
    } catch (error) {
      if (error.statusCode === 404 && !options?.throwOnNotFound) {
        return null;
      }
      throw error;
    }
  }

  async putSecret(secretKey: string, secretValue: SecretValue, options?: PutSecretOptions): Promise<void> {
    await this.retry(() => 
      this.client.write(`${this.mountPath}/data/${secretKey}`, {
        data: { value: secretValue.value },
        options: {
          cas: options?.overwrite ? undefined : 0
        }
      })
    );

    this.clearCache();
  }

  async deleteSecret(secretKey: string, options?: DeleteSecretOptions): Promise<void> {
    if (options?.recursive) {
      // List all secrets under the path
      const secrets = await this.listSecrets({ prefix: secretKey });
      await Promise.all(secrets.map(secret => this.deleteSecret(secret, { force: options.force })));
    } else {
      await this.retry(() => 
        this.client.delete(`${this.mountPath}/data/${secretKey}`)
      );
    }

    this.clearCache();
  }

  async listSecrets(filter?: SecretFilter): Promise<string[]> {
    try {
      const response = await this.retry(() => 
        this.client.list(`${this.mountPath}/metadata`)
      ) as VaultListResponse;

      let secrets = response.data.keys || [];

      if (filter?.prefix) {
        secrets = secrets.filter(key => key.startsWith(filter.prefix));
      }

      if (filter?.regex) {
        const regex = new RegExp(filter.regex);
        secrets = secrets.filter(key => regex.test(key));
      }

      return secrets;
    } catch (error) {
      if (error.statusCode === 404) {
        return [];
      }
      throw error;
    }
  }

  async healthCheck(): Promise<HealthStatus> {
    try {
      const startTime = Date.now();
      await this.client.health();
      const latencyMs = Date.now() - startTime;

      return this.createHealthStatus(true, undefined);
    } catch (error) {
      return this.createHealthStatus(false, error.message);
    }
  }

  getProviderInfo(): ProviderInfo {
    return {
      type: SecretsProviderType.HASHICORP_VAULT,
      name: 'HashiCorp Vault',
      version: '1.0.0',
      features: [
        'versioning',
        'dynamic secrets',
        'encryption as a service',
        'seal/unseal',
        'audit logging'
      ]
    };
  }
} 