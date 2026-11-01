// api/gemini.ts - Vercel Serverless Function Proxy gemäß gemini-school-api
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

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Nur POST-Anfragen zulässig.' });
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
