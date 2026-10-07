/**
 * Client service to fetch application secrets dynamically from Nginx.
 * Secrets are loaded at container startup directly from AWS Secrets Manager ('usecase-echowatt').
 */

let cachedSecrets = null;

export async function fetchAppSecrets() {
  if (cachedSecrets) {
    return cachedSecrets;
  }

  try {
    const res = await fetch('/echowatt/secrets.json');
    if (res.ok) {
      const data = await res.json();
      if (data) {
        cachedSecrets = {
          apiUrl: data.LANGFLOW_API_URL || data.VITE_LANGFLOW_API_URL || data.apiUrl || "",
          apiKey: data.LANGFLOW_API_KEY || data.VITE_LANGFLOW_API_KEY || data.apiKey || ""
        };
        return cachedSecrets;
      }
    }
  } catch (err) {
    console.warn("[SecretsService] Could not retrieve secrets from /echowatt/secrets.json:", err);
  }

  return { apiUrl: "", apiKey: "" };
}
