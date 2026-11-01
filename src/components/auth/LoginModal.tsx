// src/components/auth/LoginModal.tsx - Duales LoginModal gemäß school-student-auth
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Key, UserPlus, GraduationCap, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { generateStudentCode, DEFAULT_CLASSES } from '../../services/schoolStudentAuth';
import { SchoolClass } from '../../types/auth';

export const LoginModal: React.FC = () => {
  const { loginAsStudent, registerAndLoginStudent, loginAsTeacher } = useAuth();
  const [activeTab, setActiveTab] = useState<'existing' | 'new' | 'teacher'>('existing');

  // Form State
  const [existingCode, setExistingCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedClass, setSelectedClass] = useState<SchoolClass>('9a');
  const [teacherPass, setTeacherPass] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live-Kürzel-Vorschau
  const previewCode = generateStudentCode(fullName);

  const handleExistingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!existingCode.trim()) {
      setError('Bitte gib dein 4-stelliges Schülerkürzel ein.');
      return;
    }
    setIsSubmitting(true);
    try {
      const ok = await loginAsStudent(existingCode);
      if (!ok) setError('Ungültiges Kürzel.');
    } catch (err: any) {
      setError(err.message || 'Anmeldung fehlgeschlagen.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!fullName.trim() || fullName.trim().length < 2) {
      setError('Bitte gib deinen vollen Vor- und Nachnamen ein.');
      return;
    }
    setIsSubmitting(true);
    try {
      await registerAndLoginStudent(fullName, selectedClass);
    } catch (err: any) {
      setError(err.message || 'Registrierung fehlgeschlagen.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!teacherPass.trim()) {
      setError('Bitte gib das Lehrkraft-Passwort ein.');
      return;
    }
    setIsSubmitting(true);
    try {
      const ok = await loginAsTeacher(teacherPass);
      if (!ok) setError('Falsches Lehrer-Passwort. (Tipp: lehrer2026)');
    } catch (err: any) {
      setError(err.message || 'Anmeldung fehlgeschlagen.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-[#FFFBF5] border border-school-border rounded-2xl shadow-float max-w-md w-full overflow-hidden flex flex-col max-h-[95vh]">
        {/* Modal Kopfbereich mit Schulsiegel */}
        <div className="p-5 sm:p-6 pb-4 border-b border-school-border text-center bg-white">
          <div className="w-14 h-14 mx-auto mb-3 rounded-full border border-school-border bg-school-bg flex items-center justify-center shadow-xs">
            <img src="/siegel_bunt.png" alt="Heimbürgeschule" className="w-12 h-12 rounded-full object-contain" />
          </div>
          <h2 className="text-xl font-extrabold text-school-blue tracking-tight">Feedbackstudio Deutsch</h2>
          <p className="text-xs text-slate-500 mt-1">
            Staatliche Regelschule Heimbürgeschule Kahla
          </p>
        </div>

        {/* Tab-Auswahl: Schüler (Kürzel) / Neu anlegen / Lehrer */}
        <div className="grid grid-cols-3 p-1.5 bg-slate-100/80 border-b border-school-border text-xs font-bold">
          <button
            type="button"
            onClick={() => { setActiveTab('existing'); setError(null); }}
            className={`py-2 px-1 rounded-lg transition-all flex items-center justify-center gap-1 ${
              activeTab === 'existing'
                ? 'bg-white text-school-blue shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Mein Kürzel</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('new'); setError(null); }}
            className={`py-2 px-1 rounded-lg transition-all flex items-center justify-center gap-1 ${
              activeTab === 'new'
                ? 'bg-white text-school-blue shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Neu anlegen</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('teacher'); setError(null); }}
            className={`py-2 px-1 rounded-lg transition-all flex items-center justify-center gap-1 ${
              activeTab === 'teacher'
                ? 'bg-white text-school-orange shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Lehrkraft</span>
          </button>
        </div>

        {/* Fehleranzeige */}
        {error && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab-Inhalte */}
        <div className="p-5 sm:p-6 overflow-y-auto">
          {/* TAB 1: Ich habe ein Kürzel */}
          {activeTab === 'existing' && (
            <form onSubmit={handleExistingSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Dein 4-stelliges Schülerkürzel
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={existingCode}
                    onChange={(e) => setExistingCode(e.target.value.toUpperCase())}
                    placeholder="z. B. LMUE"
                    maxLength={10}
                    className="w-full h-12 px-4 rounded-xl border border-slate-300 bg-white font-mono text-center text-lg font-bold tracking-widest text-slate-800 focus:outline-none focus:ring-2 focus:ring-school-blue focus:border-transparent transition"
                    autoFocus
                  />
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-4" />
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  Tipp: Wenn du dein Kürzel vergessen hast, frage einfach kurz deine Lehrkraft – sie kann es im Dashboard einsehen.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !existingCode.trim()}
                className="w-full h-11 bg-school-blue hover:bg-school-blueDark disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-soft transition flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <span>Einloggen</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* TAB 2: Neues Kürzel anlegen */}
          {activeTab === 'new' && (
            <form onSubmit={handleNewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Vollständiger Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="z. B. Lukas Müller"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-school-blue focus:border-transparent transition"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Deine Klasse
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {DEFAULT_CLASSES.map(cls => (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => setSelectedClass(cls)}
                      className={`h-10 rounded-xl border font-bold text-sm transition ${
                        selectedClass === cls
                          ? 'bg-school-blue text-white border-school-blue shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {cls}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live-Vorschau des generierten Kürzels */}
              {previewCode && (
                <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] uppercase font-bold text-amber-700 block">Dein Schülerkürzel:</span>
                    <span className="font-mono text-base font-extrabold tracking-wider">{previewCode}</span>
                  </div>
                  <span className="text-xs bg-amber-200/80 text-amber-900 font-semibold px-2 py-0.5 rounded-md">
                    Klasse {selectedClass}
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !fullName.trim()}
                className="w-full h-11 bg-school-teal hover:bg-school-tealDark disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-soft transition flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <Sparkles className="w-4 h-4" />
                <span>Kürzel erstellen & Starten</span>
              </button>
            </form>
          )}

          {/* TAB 3: Lehrerzugang */}
          {activeTab === 'teacher' && (
            <form onSubmit={handleTeacherSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Fachlehrer-Passwort
                </label>
                <input
                  type="password"
                  value={teacherPass}
                  onChange={(e) => setTeacherPass(e.target.value)}
                  placeholder="Passwort eingeben..."
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-school-orange focus:border-transparent transition"
                  autoFocus
                />
                <p className="text-[11px] text-slate-500 mt-2">
                  Zugang zum zentralen Dashboard zur Verwaltung aller Abgaben der Klassen 9a–9c & 10a–10c.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !teacherPass.trim()}
                className="w-full h-11 bg-school-orange hover:bg-school-orangeDark disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-soft transition flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Lehrer-Dashboard öffnen</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
