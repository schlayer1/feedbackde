// src/components/common/ApiKeyModal.tsx - Transparente Gemini KI-Status- & API-Key-Verwaltung
import React, { useState, useEffect } from 'react';
import { getStoredGeminiApiKey, setStoredGeminiApiKey, callGeminiApi } from '../../services/geminiEngine';
import { 
  X, 
  Key, 
  CheckCircle, 
  AlertCircle, 
  Sparkles, 
  Lock, 
  Eye, 
  EyeOff, 
  ExternalLink,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

interface ApiKeyModalProps {
  onClose: () => void;
  onKeyChanged?: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onClose, onKeyChanged }) => {
  const [apiKeyInput, setApiKeyInput] = useState<string>(() => getStoredGeminiApiKey());
  const [showKey, setShowKey] = useState<boolean>(false);
  const [testingStatus, setTestingStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');

  const hasKey = Boolean(apiKeyInput.trim());

  const handleSave = () => {
    setStoredGeminiApiKey(apiKeyInput);
    if (onKeyChanged) onKeyChanged();
    setTestingStatus('idle');
    setStatusMessage('Schlüssel gespeichert!');
    setTimeout(() => setStatusMessage(''), 2500);
  };

  const handleClear = () => {
    setStoredGeminiApiKey('');
    setApiKeyInput('');
    if (onKeyChanged) onKeyChanged();
    setTestingStatus('idle');
    setStatusMessage('Schlüssel entfernt – App läuft im Offline-Modus.');
    setTimeout(() => setStatusMessage(''), 2500);
  };

  const handleTestConnection = async () => {
    const keyToTest = apiKeyInput.trim();
    setTestingStatus('testing');
    setStatusMessage('Prüfe Verbindung zu Google Gemini (Flash)...');

    try {
      const response = await callGeminiApi({
        apiKey: keyToTest || undefined,
        systemPrompt: 'Du bist ein Testsystem.',
        userPrompt: 'Antworte nur mit dem Wort "OK".',
        temperature: 0.0
      });

      if (response && response.includes('OK')) {
        setTestingStatus('success');
        setStatusMessage('Verbindung zu Google Gemini erfolgreich hergestellt! Die Live-KI ist aktiv.');
      } else {
        setTestingStatus('success');
        setStatusMessage('Verbindung steht! Antwort erhalten: ' + response.slice(0, 30));
      }
      setStoredGeminiApiKey(keyToTest);
      if (onKeyChanged) onKeyChanged();
    } catch (err: any) {
      setTestingStatus('error');
      setStatusMessage(err.message || 'Verbindung fehlgeschlagen.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#FFFBF5] border border-school-border rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-school-border flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-school-blue/10 text-school-blue flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Google Gemini KI-Status & API-Schlüssel
              </h2>
              <p className="text-xs text-slate-500">
                Transparente Kontrolle über Live-KI und Offline-Modus
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Status-Banner */}
          <div className={`p-4 rounded-xl border text-xs sm:text-sm flex items-start gap-3 ${
            hasKey
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : 'bg-amber-50 border-amber-200 text-amber-950'
          }`}>
            <span className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${
              hasKey ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
            }`} />
            <div>
              <strong className="block font-bold">
                {hasKey ? 'Gemini Live-KI aktiviert' : 'Aktueller Modus: Didaktischer Offline-Demonstrator'}
              </strong>
              <p className="text-xs opacity-90 mt-0.5">
                {hasKey
                  ? 'Alle Abgaben werden live von Google Gemini Flash nach Thüringer Kriterien analysiert.'
                  : 'Ohne hinterlegten Schlüssel nutzt die App deterministisches Delta-Scoring im Offline-Modus.'}
              </p>
            </div>
          </div>

          {/* Eingabefeld für den Schlüssel */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              Gemini API-Schlüssel für diesen Browser hinterlegen
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full h-11 pl-3.5 pr-10 rounded-xl border border-slate-300 bg-white font-mono text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-school-blue"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                title={showKey ? 'Schlüssel verbergen' : 'Schlüssel anzeigen'}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 flex items-center justify-between">
              <span>Wird verschlüsselt nur lokal auf diesem Gerät gespeichert.</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-school-blue font-bold hover:underline inline-flex items-center gap-0.5"
              >
                <span>Kostenlosen Key holen</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>

          {/* Rückmeldungen zum Verbindungstest */}
          {statusMessage && (
            <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              testingStatus === 'success' ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold' :
              testingStatus === 'error' ? 'bg-rose-50 border-rose-300 text-rose-900' :
              'bg-blue-50 border-blue-200 text-blue-900'
            }`}>
              {testingStatus === 'success' && <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />}
              {testingStatus === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
              {testingStatus === 'testing' && <RefreshCw className="w-4 h-4 text-school-blue animate-spin shrink-0" />}
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Vercel-Schul-Tipp */}
          <div className="p-3.5 bg-slate-100/70 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
            <span className="font-bold text-slate-800 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-school-blue" />
              <span>Dauerbetrieb in der Schule (Vercel Secret):</span>
            </span>
            <p>
              Hinterlege in deinem Vercel-Dashboard einmalig das Secret <code className="bg-white px-1.5 py-0.5 rounded border border-slate-300 font-mono text-school-blue font-bold">GEMINI_API_KEY</code>. Dann greifen automatisch alle Schüler-Tablets und Lehrkräfte auf die Live-KI zu, ohne dass jemand einen Schlüssel eintippen muss.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-school-border bg-white flex flex-wrap items-center justify-between gap-2.5">
          {hasKey && (
            <button
              type="button"
              onClick={handleClear}
              className="text-xs font-bold text-slate-500 hover:text-rose-600 transition"
            >
              Schlüssel entfernen
            </button>
          )}

          <div className="flex items-center gap-2.5 ml-auto">
            <button
              type="button"
              disabled={testingStatus === 'testing'}
              onClick={handleTestConnection}
              className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 transition flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testingStatus === 'testing' ? 'animate-spin' : ''}`} />
              <span>Verbindung testen</span>
            </button>

            <button
              type="button"
              onClick={() => { handleSave(); onClose(); }}
              className="px-5 py-2 rounded-xl bg-school-blue hover:bg-school-blueDark text-white text-xs font-extrabold shadow-soft transition active:scale-[0.98]"
            >
              Speichern & Schließen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
