export interface ISecretsProvider {
  /**
   * Initialize the secrets provider with configuration
   */
  initialize(config: SecretsProviderConfig): Promise<void>;

  /**
   * Retrieve a single secret by key
   */
  getSecret(secretKey: string, options?: GetSecretOptions): Promise<SecretValue>;

  /**
   * Retrieve multiple secrets by keys
   */
  getSecrets(secretKeys: string[], options?: GetSecretsOptions): Promise<Record<string, SecretValue>>;

  /**
   * Store or update a secret
   */
  putSecret(secretKey: string, secretValue: SecretValue, options?: PutSecretOptions): Promise<void>;

  /**
   * Delete a secret
   */
  deleteSecret(secretKey: string, options?: DeleteSecretOptions): Promise<void>;

  /**
   * List available secret keys with optional filtering
   */
  listSecrets(filter?: SecretFilter): Promise<string[]>;

  /**
   * Check if the provider is healthy and accessible
   */
  healthCheck(): Promise<HealthStatus>;

  /**
   * Get provider metadata
   */
  getProviderInfo(): ProviderInfo;
}

export interface SecretsProviderConfig {
  provider: SecretsProviderType;
  region?: string;
  endpoint?: string;
  credentials?: ProviderCredentials;
  cacheTTL?: number;
  retryAttempts?: number;
  timeout?: number;
  [key: string]: any; // Provider-specific config
}

export interface SecretValue {
  value: string;
  version?: string;
  createdAt?: Date;
  updatedAt?: Date;
  metadata?: Record<string, any>;
}

export interface GetSecretOptions {
  version?: string;
  throwOnNotFound?: boolean;
  useCache?: boolean;
}

export interface GetSecretsOptions extends GetSecretOptions {
  parallel?: boolean;
}

export interface PutSecretOptions {
  overwrite?: boolean;
  metadata?: Record<string, any>;
}

export interface DeleteSecretOptions {
  force?: boolean;
  recursive?: boolean;
}

export interface SecretFilter {
  prefix?: string;
  regex?: string;
  tags?: Record<string, string>;
}

export interface HealthStatus {
  healthy: boolean;
  provider: string;
  timestamp: Date;
  latencyMs?: number;
  error?: string;
}

export interface ProviderInfo {
  type: SecretsProviderType;
  name: string;
  version: string;
  features: string[];
}

export interface ProviderCredentials {
  accessKeyId?: string;
  secretAccessKey?: string;
  token?: string;
  [key: string]: any;
}

export enum SecretsProviderType {
  AWS_SECRETS_MANAGER = 'aws',
  HASHICORP_VAULT = 'vault',
  GCP_SECRET_MANAGER = 'gcp',
  AZURE_KEY_VAULT = 'azure'
} 