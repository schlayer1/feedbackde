// api/gemini.ts - Vercel Serverless Function Proxy gemäß gemini-school-api
const CANDIDATE_FLASH_MODELS = [
  'gemini-4-hydrogen',
  'gemini-flash-lite-latest',
  'gemini-3.5-flash-lite',
  'gemini-3.8-flash',
  'gemini-3.6-flash',
  'gemini-flash-latest',
];

function isOriginAllowed(req: any): boolean {
  const origin = req.headers?.origin;
  if (!origin) return true;
  const host = req.headers?.host;
  if (!host) return true;
  try {
    const parsedOrigin = new URL(origin);
    if (parsedOrigin.host === host) return true;
    const allowedOrigin = (process.env.ALLOWED_ORIGIN || '').trim();
    if (allowedOrigin && origin === allowedOrigin) return true;
    return false;
  } catch {
    return false;
  }
}

export default async function handler(req: any, res: any) {
  const origin = req.headers?.origin;
  res.setHeader('Vary', 'Origin');
  if (origin && isOriginAllowed(req)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    if (!isOriginAllowed(req)) {
      return res.status(403).json({ error: 'Origin nicht erlaubt.' });
    }
    res.status(200).end();
    return;
  }

  if (!isOriginAllowed(req)) {
    return res.status(403).json({ error: 'Cross-Origin-Zugriff nicht erlaubt.' });
  }

  if (req.method === 'GET') {
    const serverKey = (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '').trim();
    return res.status(200).json({
      status: 'ok',
      hasServerKey: Boolean(serverKey),
      activeModel: 'gemini-4-hydrogen',
      message: serverKey
        ? 'Zentraler Schul-Serverless-Proxy ist aktiv und betriebsbereit.'
        : 'Serverless-Proxy ist erreichbar, aber kein GEMINI_API_KEY hinterlegt.'
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Nur GET- und POST-Anfragen zulässig.' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        return res.status(400).json({ error: 'Ungültiges JSON im Request Body' });
      }
    }
    body = body || {};

    const { systemPrompt, userPrompt, image, model, temperature = 0.2 } = body;
    const clientKey = (typeof body.apiKey === 'string' && body.apiKey.trim() !== 'serverless-proxy')
      ? body.apiKey.trim()
      : '';
    const serverKey = (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '').trim();
    const activeKey = clientKey || serverKey;

    if (!activeKey) {
      return res.status(401).json({
        error: 'Kein Gemini API-Schlüssel konfiguriert. Bitte hinterlege GEMINI_API_KEY in Vercel als Secret oder trage einen Schlüssel in den Einstellungen ein.'
      });
    }

    const candidateModels = [];
    if (model && model !== 'auto') candidateModels.push(model);
    for (const m of CANDIDATE_FLASH_MODELS) {
      if (!candidateModels.includes(m)) candidateModels.push(m);
    }

    // Baue Contents (Text und optionales Bild für OCR/Transkription)
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
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(45000),
          body: JSON.stringify({
            contents: [{ role: 'user', parts }],
            generationConfig: {
              temperature,
              maxOutputTokens: 6000
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            return res.status(200).json({ text, model: currentModel });
          }
        }

        const errJson = await response.json().catch(() => ({}));
        lastErrorMessage = errJson.error?.message || `HTTP ${response.status}`;
      } catch (err: any) {
        lastErrorMessage = err?.message || String(err);
      }
    }

    return res.status(502).json({ error: `Kein Gemini-Modell erreichbar: ${lastErrorMessage}` });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Serverfehler im Gemini-Proxy' });
  }
}
