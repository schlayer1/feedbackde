// src/services/geminiEngine.ts - Anbindung an Google Gemini gemäß gemini-school-api

export interface GeminiCallParams {
  apiKey?: string;
  systemPrompt?: string;
  userPrompt?: string;
  image?: {
    mimeType: string;
    data: string; // Base64
  };
  model?: string;
  temperature?: number;
}

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

export function getStoredGeminiApiKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('fbs_gemini_api_key')?.trim() || '';
}

export function setStoredGeminiApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  const clean = key.trim();
  if (clean) {
    localStorage.setItem('fbs_gemini_api_key', clean);
  } else {
    localStorage.removeItem('fbs_gemini_api_key');
  }
  cachedStatus = null;
  lastCheckTime = 0;
}

export interface GeminiEngineStatus {
  isOnline: boolean;
  mode: 'serverless' | 'custom' | 'offline';
  label: string;
  details: string;
  model?: string;
}

let cachedStatus: GeminiEngineStatus | null = null;
let lastCheckTime = 0;

export async function checkGeminiStatus(forceRefresh = false): Promise<GeminiEngineStatus> {
  const now = Date.now();
  if (!forceRefresh && cachedStatus && (now - lastCheckTime < 15000)) {
    return cachedStatus;
  }

  const storedKey = getStoredGeminiApiKey();
  if (storedKey) {
    cachedStatus = {
      isOnline: true,
      mode: 'custom',
      label: 'Eigener Schlüssel aktiv',
      details: 'Du nutzt einen individuellen Schlüssel für diesen Browser.',
      model: 'gemini-flash-lite-latest'
    };
    lastCheckTime = now;
    return cachedStatus;
  }

  // Check serverless proxy
  try {
    const res = await fetch('/api/gemini', {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.hasServerKey) {
        cachedStatus = {
          isOnline: true,
          mode: 'serverless',
          label: 'Gemini Live (Schule)',
          details: 'Zentraler Vercel-Schlüssel (GEMINI_API_KEY) ist aktiv. Alle Analysen laufen live über Google Gemini.',
          model: data.activeModel || 'gemini-flash-lite-latest'
        };
        lastCheckTime = now;
        return cachedStatus;
      }
    }
  } catch (e) {
    // Proxy not available (e.g. running vite local without proxy)
  }

  cachedStatus = {
    isOnline: false,
    mode: 'offline',
    label: 'Offline-Demonstrator',
    details: 'Weder in Vercel noch im Browser ist ein Schlüssel hinterlegt. Die App nutzt den didaktischen Offline-Modus.'
  };
  lastCheckTime = now;
  return cachedStatus;
}

export function hasActiveGeminiApiKey(): boolean {
  return !!getStoredGeminiApiKey() || (cachedStatus?.isOnline ?? false);
}

export async function callGeminiApi({
  apiKey,
  systemPrompt,
  userPrompt,
  image,
  model = 'auto',
  temperature = 0.0
}: GeminiCallParams): Promise<string> {
  const storedKey = getStoredGeminiApiKey();
  const cleanKey = apiKey?.trim() || storedKey;
  const effectiveClientKey = (cleanKey && cleanKey !== 'serverless-proxy') ? cleanKey : '';

  // 1. Primärer Pfad: Sicherer Serverless / Lokaler Vite Proxy
  try {
    const proxyResponse = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: effectiveClientKey || undefined,
        systemPrompt,
        userPrompt,
        image,
        model,
        temperature
      })
    });

    if (proxyResponse.ok) {
      const data = await proxyResponse.json();
      if (data?.text) {
        return data.text;
      }
    }

    if (proxyResponse.status !== 404) {
      const errJson = await proxyResponse.json().catch(() => ({}));
      throw new Error(errJson?.error || `Serverless Proxy Fehler (HTTP ${proxyResponse.status})`);
    }
  } catch (proxyErr: any) {
    if (proxyErr.message && !proxyErr.message.includes('404')) {
      throw proxyErr;
    }
  }

  // 2. Sekundärer Fallback: Direkter Aufruf aus dem Browser (nur bei vorhandenem API-Schlüssel)
  if (!effectiveClientKey) {
    throw new Error('Keine Verbindung zum KI-Dienst. Bitte stelle sicher, dass der Vercel Serverless Proxy aktiv ist oder hinterlege einen API-Schlüssel.');
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

  let lastError = '';
  for (const currentModel of candidateModels) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${effectiveClientKey}`;
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts }],
          generationConfig: { temperature, maxOutputTokens: 6000 }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      }

      const errJson = await response.json().catch(() => ({}));
      lastError = errJson.error?.message || `HTTP ${response.status}`;
    } catch (err: any) {
      lastError = err?.message || String(err);
    }
  }

  throw new Error(`Alle KI-Modelle schlugen fehl: ${lastError}`);
}
