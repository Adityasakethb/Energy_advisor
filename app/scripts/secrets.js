import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

// Default secret name as specified by architecture: 'usecase-echowatt'
const DEFAULT_SECRET_NAME = "usecase-echowatt";
const DEFAULT_REGION = "us-east-1";

let cachedSecrets = null;

/**
 * Retrieves secrets from AWS Secrets Manager using the secret name 'usecase-echowatt'.
 * Results are cached in memory to avoid repeated AWS API calls.
 */
export async function getSecrets(secretName = null, region = null) {
  if (cachedSecrets) {
    return cachedSecrets;
  }

  const targetSecretName = secretName || process.env.AWS_SECRET_NAME || DEFAULT_SECRET_NAME;
  const targetRegion = region || process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || DEFAULT_REGION;

  console.log(`[SecretsManager] Fetching secret "${targetSecretName}" from AWS region "${targetRegion}"...`);

  try {
    const client = new SecretsManagerClient({ region: targetRegion });
    const command = new GetSecretValueCommand({ SecretId: targetSecretName });
    const response = await client.send(command);

    if (response.SecretString) {
      try {
        cachedSecrets = JSON.parse(response.SecretString);
        console.log(`[SecretsManager] Successfully loaded secrets from "${targetSecretName}".`);
      } catch (parseErr) {
        console.warn(`[SecretsManager] Secret "${targetSecretName}" is not JSON formatted:`, parseErr.message);
        cachedSecrets = { RAW_SECRET: response.SecretString };
      }
      return cachedSecrets;
    } else if (response.SecretBinary) {
      console.log(`[SecretsManager] SecretBinary received for "${targetSecretName}".`);
      cachedSecrets = { BINARY_SECRET: response.SecretBinary };
      return cachedSecrets;
    }
  } catch (error) {
    console.warn(`[SecretsManager] Could not retrieve secret "${targetSecretName}" from AWS Secrets Manager:`, error.message);
  }

  return {};
}

/**
 * Convenience helper to clear secret cache if rotation occurs.
 */
export function clearSecretsCache() {
  cachedSecrets = null;
}
