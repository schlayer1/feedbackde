import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const CANDIDATE_FLASH_MODELS = [
  'gemini-flash-lite-latest',
  'gemini-3-flash-preview',
  'gemini-flash-latest',
  'gemini-3.6-flash',
  'gemini-3.7-flash',
  'gemini-3.8-flash',
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite-preview',
];

function geminiLocalProxyPlugin(): Plugin {
  const handler = async (req: any, res: any) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

    if (req.method === 'OPTIONS') {
      res.statusCode = 200;
      res.end();
      return;
    }

    if (req.method === 'GET') {
      const serverKey = (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '').trim();
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        status: 'ok',
        hasServerKey: Boolean(serverKey),
        activeModel: 'gemini-flash-lite-latest',
        message: serverKey
          ? 'Lokaler Vite Proxy aktiv mit GEMINI_API_KEY'
          : 'Lokaler Vite Proxy aktiv, aber kein GEMINI_API_KEY in der Umgebung hinterlegt'
      }));
      return;
    }

    if (req.method !== 'POST') {
      res.statusCode = 405;
      res.end(JSON.stringify({ error: 'Nur GET- und POST-Anfragen zulässig.' }));
      return;
    }

    let rawBody = '';
    req.on('data', (chunk: any) => { rawBody += chunk; });
    req.on('end', async () => {
      try {
        let body: any = {};
        if (rawBody) {
          try { body = JSON.parse(rawBody); } catch {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Ungültiges JSON im Request Body' }));
            return;
          }
        }

        const { systemPrompt, userPrompt, image, model, temperature = 0.2 } = body;
        const clientKey = (typeof body.apiKey === 'string' && body.apiKey.trim() !== 'serverless-proxy')
          ? body.apiKey.trim()
          : '';
        const serverKey = (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '').trim();
        const activeKey = clientKey || serverKey;

        if (!activeKey) {
          res.statusCode = 401;
          res.end(JSON.stringify({
            error: 'Kein Gemini API-Schlüssel konfiguriert. Bitte hinterlege GEMINI_API_KEY in deiner Umgebung (.env) oder in den App-Einstellungen.'
          }));
          return;
        }

        const candidateModels = [];
        if (model && model !== 'auto') candidateModels.push(model);
        for (const m of CANDIDATE_FLASH_MODELS) {
          if (!candidateModels.includes(m)) candidateModels.push(m);
        }

        const parts: any[] = [];
        if (image && image.data && image.mimeType) {
          parts.push({
            inlineData: {
              mimeType: image.mimeType,
              data: image.data
            }
          });
        }
        const fullText = systemPrompt ? `${systemPrompt}\n\n${userPrompt || ''}` : (userPrompt || '');
        if (fullText) {
          parts.push({ text: fullText });
        }

        let lastErrorMessage = '';
        for (const currentModel of candidateModels) {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${activeKey}`;
          try {
            const apiRes = await fetch(endpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ role: 'user', parts }],
                generationConfig: { temperature, maxOutputTokens: 6000 }
              })
            });

            if (apiRes.ok) {
              const data: any = await apiRes.json();
              const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ text, model: currentModel }));
                return;
              }
            }

            const errJson: any = await apiRes.json().catch(() => ({}));
            lastErrorMessage = errJson.error?.message || `HTTP ${apiRes.status}`;
          } catch (err: any) {
            lastErrorMessage = err?.message || String(err);
          }
        }

        res.statusCode = 502;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: `Kein Gemini-Modell erreichbar: ${lastErrorMessage}` }));
      } catch (err: any) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: err?.message || 'Serverfehler im Gemini-Proxy' }));
      }
    });
  };

  return {
    name: 'gemini-local-proxy',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.split('?')[0] === '/api/gemini') {
          handler(req, res);
        } else {
          next();
        }
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.split('?')[0] === '/api/gemini') {
          handler(req, res);
        } else {
          next();
        }
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), geminiLocalProxyPlugin()],
  optimizeDeps: {
    include: ['pdfjs-dist']
  }
});
