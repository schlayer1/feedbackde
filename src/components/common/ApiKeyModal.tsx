// src/components/common/ApiKeyModal.tsx - Transparente Gemini KI-Status- & API-Key-Verwaltung
import React, { useState, useEffect } from 'react';
import { 
  getStoredGeminiApiKey, 
  setStoredGeminiApiKey, 
  callGeminiApi, 
  checkGeminiStatus, 
  GeminiEngineStatus 
} from '../../services/geminiEngine';
import { 
  X, 
  Key, 
  CheckCircle, 
  AlertCircle, 
  Sparkles, 
  Eye, 
  EyeOff, 
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Server,
  Smartphone
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
  const [engineStatus, setEngineStatus] = useState<GeminiEngineStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState<boolean>(true);

  // Status beim Laden ermitteln
  useEffect(() => {
    let isMounted = true;
    checkGeminiStatus(true).then((status) => {
      if (isMounted) {
        setEngineStatus(status);
        setIsLoadingStatus(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const hasLocalKey = Boolean(apiKeyInput.trim());
  const isServerlessActive = engineStatus?.mode === 'serverless';
  const isOverallOnline = hasLocalKey || isServerlessActive || (engineStatus?.isOnline ?? false);

  const handleSave = async () => {
    setStoredGeminiApiKey(apiKeyInput);
    const newStatus = await checkGeminiStatus(true);
    setEngineStatus(newStatus);
    if (onKeyChanged) onKeyChanged();
    setTestingStatus('idle');
    setStatusMessage(apiKeyInput.trim() ? 'Eigener Schlüssel gespeichert!' : 'Browser-Schlüssel entfernt.');
    setTimeout(() => setStatusMessage(''), 2500);
  };

  const handleClear = async () => {
    setStoredGeminiApiKey('');
    setApiKeyInput('');
    const newStatus = await checkGeminiStatus(true);
    setEngineStatus(newStatus);
    if (onKeyChanged) onKeyChanged();
    setTestingStatus('idle');
    setStatusMessage(newStatus.isOnline 
      ? 'Lokaler Schlüssel entfernt – App nutzt nun den zentralen Schul-Server-Key.' 
      : 'Schlüssel entfernt – App läuft im Offline-Modus.');
    setTimeout(() => setStatusMessage(''), 3000);
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

      const updatedStatus = await checkGeminiStatus(true);
      setEngineStatus(updatedStatus);

      if (response && response.includes('OK')) {
        setTestingStatus('success');
        if (keyToTest) {
          setStatusMessage('Verbindung mit deinem Browser-Schlüssel erfolgreich hergestellt! Live-KI aktiv.');
        } else if (updatedStatus.mode === 'serverless') {
          setStatusMessage('Zentraler Vercel Schul-Proxy aktiv & verbunden! Live-KI für alle Geräte einsatzbereit.');
        } else {
          setStatusMessage('Verbindung erfolgreich hergestellt! Die Live-KI ist aktiv.');
        }
      } else {
        setTestingStatus('success');
        setStatusMessage('Verbindung steht! Antwort erhalten: ' + response.slice(0, 35));
      }

      if (keyToTest) {
        setStoredGeminiApiKey(keyToTest);
      }
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
          {/* Status-Banner - Widerspruchsfrei synchronisiert */}
          <div className={`p-4 rounded-xl border text-xs sm:text-sm flex items-start gap-3 transition-colors ${
            isOverallOnline
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : 'bg-amber-50 border-amber-200 text-amber-950'
          }`}>
            <span className={`w-3 h-3 rounded-full mt-0.5 shrink-0 ${
              isOverallOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
            }`} />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <strong className="block font-bold">
                  {hasLocalKey
                    ? 'Gemini Live-KI aktiv (Lokaler Browser-Schlüssel)'
                    : isServerlessActive
                    ? 'Gemini Live-KI aktiv (Zentraler Schul-Serverless-Proxy)'
                    : isLoadingStatus
                    ? 'Prüfe KI-Verbindung...'
                    : 'Aktueller Modus: Didaktischer Offline-Demonstrator'}
                </strong>
                {isServerlessActive && !hasLocalKey && (
                  <span className="inline-flex items-center gap-1 bg-emerald-200/60 text-emerald-900 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                    <Server className="w-3 h-3" />
                    <span>Vercel Cloud</span>
                  </span>
                )}
                {hasLocalKey && (
                  <span className="inline-flex items-center gap-1 bg-blue-100 text-school-blue text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                    <Smartphone className="w-3 h-3" />
                    <span>Dieses Gerät</span>
                  </span>
                )}
              </div>
              <p className="text-xs opacity-90 leading-relaxed">
                {hasLocalKey
                  ? 'Alle Abgaben in diesem Browser werden mit deinem persönlichen Gemini-Schlüssel nach Thüringer Kriterien analysiert.'
                  : isServerlessActive
                  ? 'Der zentrale Schul-Schlüssel (GEMINI_API_KEY) in Vercel ist aktiv. Alle Schüler- und Lehrergeräte nutzen automatisch Google Gemini Flash in Echtzeit – es ist kein lokaler Schlüssel nötig!'
                  : 'Ohne hinterlegten Schlüssel nutzt die App deterministisches Delta-Scoring im didaktischen Offline-Modus.'}
              </p>
            </div>
          </div>

          {/* Eingabefeld für den Schlüssel */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                {isServerlessActive 
                  ? 'Optional: Eigenen Schlüssel für diesen Browser hinterlegen' 
                  : 'Gemini API-Schlüssel für diesen Browser hinterlegen'}
              </label>
              {isServerlessActive && (
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Nicht zwingend nötig
                </span>
              )}
            </div>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder={isServerlessActive ? "Zentraler Schlüssel aktiv (Optional hier überschreiben)" : "AIzaSy..."}
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

            <div className="text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-1 pt-0.5">
              <span>
                {isServerlessActive && !hasLocalKey
                  ? '💡 Schul-Key ist aktiv. Schüler und Lehrer müssen hier nichts eingeben.'
                  : 'Wird verschlüsselt nur lokal auf diesem Gerät gespeichert.'}
              </span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-school-blue font-bold hover:underline inline-flex items-center gap-0.5 ml-auto"
              >
                <span>Eigenen Google Key holen</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
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

          {/* Vercel-Schul-Status */}
          <div className="p-3.5 bg-slate-100/70 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
            <span className="font-bold text-slate-800 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-school-blue" />
              <span>Dauerbetrieb in der Schule (Vercel Serverless):</span>
            </span>
            <p className="leading-relaxed">
              {isServerlessActive ? (
                <span className="text-emerald-800 font-medium">
                  ✅ Das Secret <code className="bg-white px-1.5 py-0.5 rounded border border-emerald-300 font-mono text-emerald-700 font-bold">GEMINI_API_KEY</code> ist in Vercel aktiv hinterlegt. Alle Abgaben laufen bereits servergeschützt über Google Gemini 2.5 Flash!
                </span>
              ) : (
                <span>
                  Hinterlege in deinem Vercel-Dashboard einmalig das Secret <code className="bg-white px-1.5 py-0.5 rounded border border-slate-300 font-mono text-school-blue font-bold">GEMINI_API_KEY</code>. Dann greifen automatisch alle Schüler-Tablets und Lehrkräfte auf die Live-KI zu.
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-school-border bg-white flex flex-wrap items-center justify-between gap-2.5">
          {hasLocalKey ? (
            <button
              type="button"
              onClick={handleClear}
              className="text-xs font-bold text-slate-500 hover:text-rose-600 transition"
            >
              Lokalen Schlüssel entfernen
            </button>
          ) : <div />}

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
