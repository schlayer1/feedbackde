// src/components/layout/Header.tsx - Responsiver Header nach Heimbürgeschule-Standard
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, LogOut, User, Key, Sliders, Settings, School, Sparkles, Server } from 'lucide-react';
import { DEFAULT_CLASSES } from '../../services/schoolStudentAuth';
import { checkGeminiStatus, GeminiEngineStatus } from '../../services/geminiEngine';
import { ApiKeyModal } from '../common/ApiKeyModal';

interface HeaderProps {
  onOpenSettings?: () => void;
  onOpenClassSettings?: () => void;
  onOpenPromptManager?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSettings,
  onOpenClassSettings,
  onOpenPromptManager
}) => {
  const { role, studentCode, studentName, schoolClass, logout, updateStudentClass } = useAuth();
  const [onlineStatus, setOnlineStatus] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [engineStatus, setEngineStatus] = useState<GeminiEngineStatus | null>(null);

  const refreshKeyStatus = async () => {
    const s = await checkGeminiStatus(true);
    setEngineStatus(s);
  };

  useEffect(() => {
    refreshKeyStatus();
    const handleOnline = () => {
      setOnlineStatus(true);
      refreshKeyStatus();
    };
    const handleOffline = () => {
      setOnlineStatus(false);
      refreshKeyStatus();
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const isKiLive = engineStatus?.isOnline ?? false;

  return (
    <>
      <header className="sticky top-0 z-40 w-full pt-safe bg-[#FFFBF5]/95 backdrop-blur-md border-b border-school-border shadow-soft">
        <div className="w-full max-w-[2100px] mx-auto px-3 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 h-16 sm:h-18 flex items-center justify-between gap-3">
          {/* Schulsiegel & App-Titel */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <div className="relative shrink-0 flex items-center justify-center">
              <img 
                src="/siegel_bunt.png" 
                alt="Heimbürgeschule Siegel" 
                className="w-10 h-10 sm:w-11 sm:h-11 object-contain rounded-full shadow-xs border border-school-border bg-white"
              />
            </div>
            <div className="flex flex-col min-w-0 text-left">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold text-sm sm:text-base text-school-blue tracking-tight truncate">
                  Heimbürgeschule Kahla
                </span>
                {/* Klickbarer KI-Status Pill */}
                <button
                  type="button"
                  onClick={() => setIsApiKeyModalOpen(true)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-tight transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                    isKiLive
                      ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-700 border border-amber-500/30'
                  }`}
                  title={
                    isKiLive
                      ? `Google Gemini Live-KI aktiv (${engineStatus?.mode === 'serverless' ? 'Schul-Cloud' : 'Browser-Key'})`
                      : 'Didaktischer Offline-Demonstrator (Klicken für Status)'
                  }
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isKiLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                  <span>{isKiLive ? 'Gemini Live' : 'Offline-Modus'}</span>
                </button>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs">
                <span className="font-bold text-school-orange tracking-wide">Feedbackstudio Deutsch</span>
                <span className="text-slate-400 hidden sm:inline">•</span>
                <span className="text-slate-500 font-medium hidden sm:inline">Prüfungstraining Regelschule</span>
              </div>
            </div>
          </div>

          {/* Rechte Navigation & Benutzerstatus */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {role === 'student' && (
              <div className="flex items-center gap-2">
                {/* Klassen-Badge mit Schnellauswahl */}
                <div className="hidden sm:flex items-center bg-white border border-school-border rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-xs">
                  <span className="text-slate-400 mr-1.5">Klasse:</span>
                  <select
                    value={schoolClass}
                    onChange={(e) => updateStudentClass(e.target.value)}
                    className="bg-transparent font-bold text-school-blue outline-none cursor-pointer"
                  >
                    {DEFAULT_CLASSES.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>

                {/* Schülerkürzel Badge */}
                <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-900 px-2.5 py-1 rounded-lg text-xs font-mono font-bold shadow-xs">
                  <Key className="w-3.5 h-3.5 text-amber-600" />
                  <span>{studentCode}</span>
                  <span className="text-amber-600/70 font-sans font-medium text-[11px] hidden md:inline">({studentName})</span>
                </div>

                {/* Logout Button */}
                <button
                  type="button"
                  onClick={logout}
                  title="Abmelden"
                  className="inline-flex items-center gap-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Abmelden</span>
                </button>
              </div>
            )}

            {role === 'teacher' && (
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-school-blue px-2.5 py-1 rounded-lg text-xs font-bold shadow-xs">
                  <GraduationCap className="w-4 h-4 text-school-blue" />
                  <span>Fachlehrkraft Deutsch</span>
                </div>

                {/* KI-Status & Key Button für Lehrer */}
                <button
                  type="button"
                  onClick={() => setIsApiKeyModalOpen(true)}
                  className="hidden sm:inline-flex items-center gap-1.5 bg-white border border-school-border hover:border-emerald-500 text-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition"
                  title="KI-Schlüssel & Verbindungsstatus verwalten"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>KI-Key</span>
                </button>

                {onOpenPromptManager && (
                  <button
                    type="button"
                    onClick={onOpenPromptManager}
                    className="hidden md:inline-flex items-center gap-1.5 bg-white border border-school-border hover:border-school-orange text-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition"
                    title="Stark-Prompts und Kriterien anpassen"
                  >
                    <Sliders className="w-3.5 h-3.5 text-school-orange" />
                    <span>Prompts & Raster</span>
                  </button>
                )}

                {onOpenClassSettings && (
                  <button
                    type="button"
                    onClick={onOpenClassSettings}
                    className="hidden md:inline-flex items-center gap-1.5 bg-white border border-school-border hover:border-school-blue text-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition"
                    title="Klasseneinstellungen & Hybrid-Modus"
                  >
                    <Settings className="w-3.5 h-3.5 text-school-blue" />
                    <span>Klassen & Modi</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={logout}
                  title="Lehrerbereich verlassen"
                  className="inline-flex items-center gap-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Beenden</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* API Key Modal */}
      {isApiKeyModalOpen && (
        <ApiKeyModal
          onClose={() => setIsApiKeyModalOpen(false)}
          onKeyChanged={refreshKeyStatus}
        />
      )}
    </>
  );
};
