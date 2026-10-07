import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { getSecrets } from './scripts/secrets.js'

function secretsDevPlugin() {
  return {
    name: 'secrets-dev-plugin',
    configureServer(server) {
      server.middlewares.use('/echowatt/api/secrets', async (req, res) => {
        try {
          const secrets = await getSecrets();
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: true,
            secrets: {
              apiUrl: secrets.LANGFLOW_API_URL || secrets.VITE_LANGFLOW_API_URL || secrets.apiUrl || '',
              apiKey: secrets.LANGFLOW_API_KEY || secrets.VITE_LANGFLOW_API_KEY || secrets.apiKey || ''
            }
          }));
        } catch (err) {
          res.statusCode = 500;
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  base: '/echowatt/',
  plugins: [react(), secretsDevPlugin()],
})
