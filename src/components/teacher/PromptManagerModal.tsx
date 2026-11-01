// src/components/teacher/PromptManagerModal.tsx - Zweigeteilter Kriterien- & Prompt-Editor
import React, { useState } from 'react';
import { getAllTextTypes, getPromptConfig, savePromptConfig, resetPromptConfig } from '../../services/promptRegistry';
import { PromptConfig, GraduationType, CriterionItem } from '../../types/feedback';
import { 
  X, 
  RotateCcw, 
  Save, 
  Plus, 
  Trash2, 
  Sliders, 
  Sparkles, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';

interface PromptManagerModalProps {
  onClose: () => void;
}

export const PromptManagerModal: React.FC<PromptManagerModalProps> = ({ onClose }) => {
  const textTypes = getAllTextTypes();

  const [selectedTextType, setSelectedTextType] = useState<string>(textTypes[0]?.id || 'eroerterung');
  const [selectedGraduation, setSelectedGraduation] = useState<GraduationType>('realschule_10');

  const [currentConfig, setCurrentConfig] = useState<PromptConfig>(() => 
    getPromptConfig(selectedTextType, selectedGraduation)
  );

  const [hasSavedNotice, setHasSavedNotice] = useState<boolean>(false);

  const handleSelectTextType = (ttId: string) => {
    setSelectedTextType(ttId);
    setCurrentConfig(getPromptConfig(ttId, selectedGraduation));
    setHasSavedNotice(false);
  };

  const handleSelectGraduation = (grad: GraduationType) => {
    setSelectedGraduation(grad);
    setCurrentConfig(getPromptConfig(selectedTextType, grad));
    setHasSavedNotice(false);
  };

  const handleCriterionChange = (index: number, field: keyof CriterionItem, value: any) => {
    const updated = [...currentConfig.criteria];
    updated[index] = { ...updated[index], [field]: value };
    setCurrentConfig({ ...currentConfig, criteria: updated });
    setHasSavedNotice(false);
  };

  const handleAddCriterion = () => {
    const newCrit: CriterionItem = {
      id: `crit_${Date.now()}`,
      title: 'Neues Bewertungskriterium',
      description: 'Leitfragen und Erwartungen an den Schülertext...',
      maxPoints: 20,
      weightPercentage: 20
    };
    setCurrentConfig({
      ...currentConfig,
      criteria: [...currentConfig.criteria, newCrit]
    });
    setHasSavedNotice(false);
  };

  const handleRemoveCriterion = (index: number) => {
    const updated = currentConfig.criteria.filter((_, i) => i !== index);
    setCurrentConfig({ ...currentConfig, criteria: updated });
    setHasSavedNotice(false);
  };

  const handleReset = () => {
    if (confirm('Möchtest du die Kriterien und den Systemprompt wirklich auf die originalen Stark-Prüfungsstandards zurücksetzen?')) {
      const standard = resetPromptConfig(selectedTextType, selectedGraduation);
      setCurrentConfig(standard);
      setHasSavedNotice(true);
      setTimeout(() => setHasSavedNotice(false), 3000);
    }
  };

  const handleSave = () => {
    savePromptConfig(currentConfig);
    setHasSavedNotice(true);
    setTimeout(() => setHasSavedNotice(false), 3000);
  };

  const totalPoints = currentConfig.criteria.reduce((acc, c) => acc + (Number(c.maxPoints) || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#FFFBF5] border border-school-border rounded-2xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-school-border flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-school-orange/10 text-school-orange flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Stark-Prompts & Bewertungsraster anpassen
              </h2>
              <p className="text-xs text-slate-500">
                Passe Kriterien, Gewichtungen und KI-Systemprompts flexibel im laufenden Betrieb an.
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

        {/* Auswahleiste: Textsorte & Abschlussart */}
        <div className="p-4 bg-slate-100/70 border-b border-school-border grid grid-cols-1 sm:grid-cols-2 gap-3 shrink-0">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Textsorte wählen
            </label>
            <select
              value={selectedTextType}
              onChange={(e) => handleSelectTextType(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-school-orange"
            >
              {textTypes.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Abschlussprüfung wählen
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSelectGraduation('quali_9')}
                className={`h-10 rounded-xl border text-xs font-bold transition ${
                  selectedGraduation === 'quali_9'
                    ? 'bg-school-blue text-white border-school-blue shadow-xs'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Quali (Klasse 9)
              </button>
              <button
                type="button"
                onClick={() => handleSelectGraduation('realschule_10')}
                className={`h-10 rounded-xl border text-xs font-bold transition ${
                  selectedGraduation === 'realschule_10'
                    ? 'bg-school-orange text-white border-school-orange shadow-xs'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Realschule (Klasse 10)
              </button>
            </div>
          </div>
        </div>

        {/* Scrollbarer Editor-Bereich */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TEIL 1: TABELLARISCHE KRITERIENMATRIX */}
          <div className="bg-white border border-school-border rounded-xl p-4 sm:p-5 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  1. Kriterienmatrix & Maximalpunkte
                </h3>
                <p className="text-xs text-slate-500">
                  Gesamte Maximalpunktzahl: <strong className="font-mono text-school-blue">{totalPoints} Punkte</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddCriterion}
                className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-lg transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Kriterium hinzufügen</span>
              </button>
            </div>

            <div className="space-y-3">
              {currentConfig.criteria.map((crit, idx) => (
                <div key={crit.id || idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={crit.title}
                      onChange={(e) => handleCriterionChange(idx, 'title', e.target.value)}
                      placeholder="Kriterientitel..."
                      className="flex-1 h-9 px-3 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-school-orange"
                    />
                    <div className="flex items-center gap-1 shrink-0">
                      <input
                        type="number"
                        value={crit.maxPoints}
                        onChange={(e) => handleCriterionChange(idx, 'maxPoints', Number(e.target.value) || 0)}
                        className="w-16 h-9 px-2 text-center rounded-lg border border-slate-300 bg-white font-mono text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-school-orange"
                        min={1}
                        max={100}
                      />
                      <span className="text-xs text-slate-500 font-bold">Pkt</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveCriterion(idx)}
                      title="Kriterium löschen"
                      className="w-9 h-9 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 flex items-center justify-center transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <textarea
                    value={crit.description}
                    onChange={(e) => handleCriterionChange(idx, 'description', e.target.value)}
                    placeholder="Leitfragen, Deskriptoren und Erwartungshorizont für die KI..."
                    rows={2}
                    className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-school-orange resize-y"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* TEIL 2: SYSTEMPROMPT FÜR GOOGLE GEMINI */}
          <div className="bg-white border border-school-border rounded-xl p-4 sm:p-5 shadow-soft space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  2. KI-Systemprompt (Rolle & Didaktischer Fokus)
                </h3>
                <p className="text-xs text-slate-500">
                  Steuert den Tonfall, das Thüringer Regelschulniveau und didaktische Korrekturrichtlinien.
                </p>
              </div>
            </div>

            <textarea
              value={currentConfig.systemPrompt}
              onChange={(e) => setCurrentConfig({ ...currentConfig, systemPrompt: e.target.value })}
              rows={8}
              className="w-full p-3.5 rounded-xl border border-slate-300 bg-white font-mono text-xs leading-relaxed text-slate-800 focus:outline-none focus:ring-2 focus:ring-school-orange transition resize-y"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-school-border bg-white flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 text-slate-500 hover:text-rose-600 text-xs font-bold transition px-3 py-2 rounded-xl hover:bg-rose-50"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Auf Stark-Standard zurücksetzen</span>
          </button>

          <div className="flex items-center gap-3">
            {hasSavedNotice && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 animate-fadeIn">
                <CheckCircle className="w-4 h-4" />
                <span>Gespeichert & sofort aktiv!</span>
              </span>
            )}

            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-2 bg-school-orange hover:bg-school-orangeDark text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-soft transition active:scale-[0.98]"
            >
              <Save className="w-4 h-4" />
              <span>Änderungen speichern</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
