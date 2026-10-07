/**
 * Client service to fetch application secrets dynamically from the server.
 * The server retrieves these values directly from AWS Secrets Manager ('usecase-echowatt').
 */

let cachedSecrets = null;

export async function fetchAppSecrets() {
  if (cachedSecrets) {
    return cachedSecrets;
  }

  try {
    const res = await fetch("/echowatt/api/secrets");
    if (res.ok) {
      const data = await res.json();
      if (data && data.secrets) {
        cachedSecrets = data.secrets;
        return cachedSecrets;
      }
    }
  } catch (err) {
    console.warn("[SecretsService] Could not retrieve secrets from /echowatt/api/secrets:", err);
  }

  return { apiUrl: "", apiKey: "" };
}
