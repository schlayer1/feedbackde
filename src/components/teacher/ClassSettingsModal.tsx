// src/components/teacher/ClassSettingsModal.tsx - Hybrid-Modus & Klassenverwaltung
import React, { useState } from 'react';
import { getAllClassSettings, saveClassSetting } from '../../services/feedbackStore';
import { ClassSettings } from '../../types/feedback';
import { X, Settings, Plus, CheckCircle, ShieldCheck, Zap } from 'lucide-react';

interface ClassSettingsModalProps {
  onClose: () => void;
  onUpdated: () => void;
}

export const ClassSettingsModal: React.FC<ClassSettingsModalProps> = ({ onClose, onUpdated }) => {
  const [settings, setSettings] = useState<Record<string, ClassSettings>>(() => getAllClassSettings());
  const [newClassName, setNewClassName] = useState<string>('');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleToggleInstant = (classId: string) => {
    const current = settings[classId];
    if (!current) return;
    const updated: ClassSettings = {
      ...current,
      instantFeedbackAllowed: !current.instantFeedbackAllowed
    };
    saveClassSetting(updated);
    setSettings({ ...settings, [classId]: updated });
    onUpdated();
    showNotice();
  };

  const handleToggleGraduation = (classId: string) => {
    const current = settings[classId];
    if (!current) return;
    const nextGrad = current.defaultGraduation === 'realschule_10' ? 'quali_9' : 'realschule_10';
    const updated: ClassSettings = {
      ...current,
      defaultGraduation: nextGrad
    };
    saveClassSetting(updated);
    setSettings({ ...settings, [classId]: updated });
    onUpdated();
    showNotice();
  };

  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newClassName.trim().toLowerCase();
    if (!clean) return;
    if (settings[clean]) {
      alert('Diese Klasse existiert bereits.');
      return;
    }
    const newSetting: ClassSettings = {
      classId: clean,
      instantFeedbackAllowed: true,
      defaultGraduation: clean.startsWith('10') ? 'realschule_10' : 'quali_9'
    };
    saveClassSetting(newSetting);
    setSettings({ ...settings, [clean]: newSetting });
    setNewClassName('');
    onUpdated();
    showNotice();
  };

  const showNotice = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const classList = Object.keys(settings).sort();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#FFFBF5] border border-school-border rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-school-border flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-school-blue/10 text-school-blue flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Klassenverwaltung & Feedback-Modus (Hybrid)
              </h2>
              <p className="text-xs text-slate-500">
                Steuere für jede Klasse, ob Schüler das Feedback sofort sehen oder ob deine Freigabe nötig ist.
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
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Einstellungen gespeichert!</span>
            </div>
          )}

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Klassen der Heimbürgeschule ({classList.length})
            </h3>

            {classList.map((clsId) => {
              const cfg = settings[clsId];
              const isInstant = cfg.instantFeedbackAllowed;

              return (
                <div 
                  key={clsId}
                  className="p-4 rounded-xl border border-school-border bg-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-11 h-11 rounded-xl bg-slate-100 text-school-blue font-mono font-extrabold text-base flex items-center justify-center border border-slate-200">
                      {clsId}
                    </span>
                    <div>
                      <span className="font-bold text-sm text-slate-800 block">Klasse {clsId}</span>
                      <span className="text-xs text-slate-500">
                        Standard: {cfg.defaultGraduation === 'realschule_10' ? 'Realschule (Kl. 10)' : 'Quali (Kl. 9)'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Toggle Button für Hybrid-Modus */}
                    <button
                      type="button"
                      onClick={() => handleToggleInstant(clsId)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
                        isInstant
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                          : 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
                      }`}
                      title="Klicken zum Umschalten"
                    >
                      {isInstant ? (
                        <>
                          <Zap className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Sofort-Feedback aktiv</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                          <span>Freigabe erforderlich</span>
                        </>
                      )}
                    </button>

                    {/* Abschlussart Umschalter */}
                    <button
                      type="button"
                      onClick={() => handleToggleGraduation(clsId)}
                      className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition"
                      title="Standard-Abschlussart wechseln"
                    >
                      {cfg.defaultGraduation === 'realschule_10' ? 'RS' : 'HSA'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Neue Klasse hinzufügen */}
          <form onSubmit={handleAddClass} className="pt-4 border-t border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Neue Klasse oder Kursgruppe hinzufügen
            </h4>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                placeholder="z. B. 9d oder Förderkurs"
                className="flex-1 h-10 px-3.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-school-blue"
              />
              <button
                type="submit"
                disabled={!newClassName.trim()}
                className="h-10 px-4 bg-school-blue hover:bg-school-blueDark disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Hinzufügen</span>
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-school-border bg-white flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition"
          >
            Fertig
          </button>
        </div>
      </div>
    </div>
  );
};
