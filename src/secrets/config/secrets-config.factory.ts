import { SecretsProviderType } from '../interfaces/secrets.interface';

export interface SecretsManagerConfiguration {
  // Primary provider
  primaryProvider: SecretsProviderType;
  
  // Fallback configuration
  enableFallback: boolean;
  fallbackProvider?: SecretsProviderType;
  
  // Cache configuration
  cacheEnabled: boolean;
  cacheTTL: number;
  
  // Retry configuration
  retryAttempts: number;
  retryDelay: number;
  
  // Provider-specific configurations
  providers: {
    [SecretsProviderType.AWS_SECRETS_MANAGER]: AWSSecretsConfig;
    [SecretsProviderType.HASHICORP_VAULT]: VaultConfig;
    [SecretsProviderType.GCP_SECRET_MANAGER]: GCPSecretsConfig;
    [SecretsProviderType.AZURE_KEY_VAULT]: AzureKeyVaultConfig;
  };
}

interface AWSSecretsConfig {
  region: string;
  credentials?: {
    accessKeyId?: string;
    secretAccessKey?: string;
  };
}

interface VaultConfig {
  endpoint: string;
  token?: string;
  authMethod?: 'approle' | 'kubernetes' | 'token';
  roleId?: string;
  secretId?: string;
  kubernetesRole?: string;
  kubernetesJwt?: string;
}

interface GCPSecretsConfig {
  projectId: string;
  credentials?: {
    clientEmail: string;
    privateKey: string;
  };
}

interface AzureKeyVaultConfig {
  vaultName: string;
  tenantId: string;
  clientId: string;
  clientSecret: string;
}

export class SecretsConfigurationFactory {
  static createFromEnvironment(): SecretsManagerConfiguration {
    return {
      primaryProvider: (process.env.SECRET_PROVIDER || process.env.SECRETS_BACKEND) as SecretsProviderType || SecretsProviderType.AWS_SECRETS_MANAGER,
      enableFallback: process.env.SECRETS_ENABLE_FALLBACK === 'true',
      fallbackProvider: process.env.SECRETS_FALLBACK_BACKEND as SecretsProviderType,
      cacheEnabled: process.env.SECRETS_CACHE_ENABLED !== 'false',
      cacheTTL: parseInt(process.env.SECRETS_CACHE_TTL || '300'),
      retryAttempts: parseInt(process.env.SECRETS_RETRY_ATTEMPTS || '3'),
      retryDelay: parseInt(process.env.SECRETS_RETRY_DELAY || '1000'),
      providers: {
        [SecretsProviderType.AWS_SECRETS_MANAGER]: this.createAWSConfig(),
        [SecretsProviderType.HASHICORP_VAULT]: this.createVaultConfig(),
        [SecretsProviderType.GCP_SECRET_MANAGER]: this.createGCPConfig(),
        [SecretsProviderType.AZURE_KEY_VAULT]: this.createAzureConfig(),
      }
    };
  }

  private static createAWSConfig(): AWSSecretsConfig {
    return {
      region: process.env.AWS_REGION || 'us-east-1',
      // Only include credentials if explicitly provided
      // Otherwise, allow AWS SDK to use default credential provider chain (IAM roles)
      credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      } : undefined
    };
  }

  private static createVaultConfig(): VaultConfig {
    return {
      endpoint: process.env.VAULT_ADDR || 'http://localhost:8200',
      token: process.env.VAULT_TOKEN,
      authMethod: process.env.VAULT_AUTH_METHOD as VaultConfig['authMethod'],
      roleId: process.env.VAULT_ROLE_ID,
      secretId: process.env.VAULT_SECRET_ID,
      kubernetesRole: process.env.VAULT_KUBERNETES_ROLE,
      kubernetesJwt: process.env.VAULT_KUBERNETES_JWT
    };
  }

  private static createGCPConfig(): GCPSecretsConfig {
    return {
      projectId: process.env.GCP_PROJECT_ID || '',
      credentials: process.env.GCP_CLIENT_EMAIL && process.env.GCP_PRIVATE_KEY ? {
        clientEmail: process.env.GCP_CLIENT_EMAIL,
        privateKey: process.env.GCP_PRIVATE_KEY.replace(/\\n/g, '\n'),
      } : undefined
    };
  }

  private static createAzureConfig(): AzureKeyVaultConfig {
    return {
      vaultName: process.env.AZURE_KEY_VAULT_NAME || '',
      tenantId: process.env.AZURE_TENANT_ID || '',
      clientId: process.env.AZURE_CLIENT_ID || '',
      clientSecret: process.env.AZURE_CLIENT_SECRET || ''
    };
  }
} 