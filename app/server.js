import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { getSecrets } from "./scripts/secrets.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8104;

app.use(express.json());

// Redirect root to /echowatt/
app.get("/", (req, res) => {
  res.redirect(301, "/echowatt/");
});

// Redirect exact /echowatt without trailing slash to /echowatt/
app.use((req, res, next) => {
  if (req.originalUrl === "/echowatt") {
    return res.redirect(301, "/echowatt/");
  }
  next();
});

// Endpoint to retrieve secrets from AWS Secrets Manager ('usecase-echowatt')
app.get(["/echowatt/api/secrets", "/api/secrets"], async (req, res) => {
  try {
    const secrets = await getSecrets();
    res.json({
      success: true,
      secrets: {
        apiUrl: secrets.LANGFLOW_API_URL || secrets.VITE_LANGFLOW_API_URL || secrets.apiUrl || "",
        apiKey: secrets.LANGFLOW_API_KEY || secrets.VITE_LANGFLOW_API_KEY || secrets.apiKey || ""
      }
    });
  } catch (error) {
    console.error("[Server] Error retrieving secrets:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Secure server-side execution proxy (keeps API keys completely protected on server)
app.post(["/echowatt/api/run", "/api/run"], async (req, res) => {
  try {
    const { prompt, rawText } = req.body;
    const secrets = await getSecrets();
    const apiUrl = secrets.LANGFLOW_API_URL || secrets.VITE_LANGFLOW_API_URL || secrets.apiUrl;
    const apiKey = secrets.LANGFLOW_API_KEY || secrets.VITE_LANGFLOW_API_KEY || secrets.apiKey;

    if (!apiUrl || !apiKey) {
      return res.status(503).json({
        success: false,
        fallbackRequired: true,
        message: "Langflow credentials not available in AWS Secrets Manager (usecase-echowatt)."
      });
    }

    const upstreamResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey
      },
      body: JSON.stringify({
        input_value: prompt,
        output_type: "chat",
        input_type: "chat"
      })
    });

    if (!upstreamResponse.ok) {
      return res.status(upstreamResponse.status).json({
        success: false,
        status: upstreamResponse.status,
        statusText: upstreamResponse.statusText
      });
    }

    const data = await upstreamResponse.json();
    const textResult =
      data?.outputs?.[0]?.outputs?.[0]?.results?.message?.text ||
      (typeof data?.outputs?.[0]?.outputs?.[0]?.results?.message === "string"
        ? data?.outputs?.[0]?.outputs?.[0]?.results?.message
        : null) ||
      data?.outputs?.[0]?.outputs?.[0]?.artifacts?.text ||
      data?.outputs?.[0]?.outputs?.[0]?.messages?.[0]?.message ||
      data?.outputs?.[0]?.outputs?.[0]?.messages?.[0]?.text;

    return res.json({ success: true, result: textResult });
  } catch (error) {
    console.error("[Server] Upstream execution error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Serve static assets for the SPA
const distPath = path.join(__dirname, "dist");
app.use("/echowatt", express.static(distPath));

// SPA catch-all fallback for /echowatt
app.use("/echowatt", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`[EchoWatt] Server listening on http://0.0.0.0:${PORT}/echowatt/`);
  console.log(`[EchoWatt] Secrets source: AWS Secrets Manager (secret name: 'usecase-echowatt')`);
});
