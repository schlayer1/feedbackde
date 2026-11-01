// src/components/teacher/TeacherDashboard.tsx - Zentrales Lehrer-Dashboard
import React, { useState } from 'react';
import { getSubmissions, createOrUpdateSubmission } from '../../services/feedbackStore';
import { Submission, SubmissionVersion } from '../../types/feedback';
import { SubmissionReviewModal } from './SubmissionReviewModal';
import { PromptManagerModal } from './PromptManagerModal';
import { ClassSettingsModal } from './ClassSettingsModal';
import { PrintSheet } from '../layout/PrintSheet';
import { getAllTextTypes } from '../../services/promptRegistry';
import { getGradeDescriptor } from '../../services/evaluationEngine';
import { DEFAULT_CLASSES } from '../../services/schoolStudentAuth';
import { 
  GraduationCap, 
  Search, 
  Filter, 
  Key, 
  Copy, 
  Check, 
  Clock, 
  CheckCircle2, 
  Sliders, 
  Settings, 
  Printer, 
  FileText, 
  RefreshCw,
  Award,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>(() => getSubmissions());
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedTextType, setSelectedTextType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modals
  const [reviewSubmission, setReviewSubmission] = useState<{ sub: Submission; version: SubmissionVersion } | null>(null);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [isClassSettingsOpen, setIsClassSettingsOpen] = useState(false);
  const [printSubmission, setPrintSubmission] = useState<{ sub: Submission; version: SubmissionVersion } | null>(null);

  // 1-Klick Kopieren Feedback
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const textTypes = getAllTextTypes();

  const handleCopyCode = (e: React.MouseEvent, code: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleClassChange = (sub: Submission, newClass: string) => {
    const updated: Submission = {
      ...sub,
      schoolClass: newClass,
      updatedAt: new Date().toISOString()
    };
    createOrUpdateSubmission(updated);
    setSubmissions(getSubmissions());
  };

  const reloadSubmissions = () => {
    setSubmissions(getSubmissions());
  };

  // Filter-Logik
  const filteredSubmissions = submissions.filter(sub => {
    // 1. Klasse
    if (selectedClass !== 'all' && sub.schoolClass !== selectedClass) return false;
    // 2. Textsorte
    if (selectedTextType !== 'all' && sub.textTypeId !== selectedTextType) return false;
    // 3. Status
    if (selectedStatus === 'pending' && sub.latestStatus !== 'pending_teacher') return false;
    if (selectedStatus === 'released' && !['auto_released', 'released_by_teacher'].includes(sub.latestStatus)) return false;
    if (selectedStatus === 'revised' && sub.currentVersion <= 1) return false;
    // 4. Volltextsuche
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchName = sub.studentName.toLowerCase().includes(term);
      const matchCode = sub.studentCode.toLowerCase().includes(term);
      const matchTitle = sub.taskTitle.toLowerCase().includes(term);
      if (!matchName && !matchCode && !matchTitle) return false;
    }
    return true;
  });

  // Statistiken
  const totalCount = submissions.length;
  const pendingCount = submissions.filter(s => s.latestStatus === 'pending_teacher').length;
  const revisedCount = submissions.filter(s => s.currentVersion > 1).length;

  const validScores = submissions
    .map(s => s.versions[s.versions.length - 1]?.feedback?.percentage)
    .filter((p): p is number => typeof p === 'number');
  const avgPercentage = validScores.length > 0 ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length) : 0;

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-12">
      {/* 1. KOPFZEILE MIT STATISTIKEN & SCHNELLAKTIONEN */}
      <div className="bg-white border border-school-border rounded-3xl p-5 sm:p-7 shadow-soft space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-school-blue/10 text-school-blue">
                <GraduationCap className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Zentrales Lehrerdashboard Deutsch
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Übersicht, Prüfung und Steuerung aller Schülerarbeiten der Klassen 9a–9c & 10a–10c.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsPromptModalOpen(true)}
              className="inline-flex items-center gap-1.5 bg-school-orange hover:bg-school-orangeDark text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-soft transition active:scale-[0.98]"
            >
              <Sliders className="w-4 h-4" />
              <span>Prompts & Raster anpassen</span>
            </button>

            <button
              type="button"
              onClick={() => setIsClassSettingsOpen(true)}
              className="inline-flex items-center gap-1.5 bg-white border border-school-border hover:border-slate-400 text-slate-700 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition"
            >
              <Settings className="w-4 h-4 text-slate-500" />
              <span>Klassen & Hybrid-Modi</span>
            </button>
          </div>
        </div>

        {/* 4 Statistik-Kacheln */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Gesamtabgaben</span>
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900">{totalCount}</span>
          </div>

          <div className={`p-4 rounded-2xl border transition-all ${
            pendingCount > 0 ? 'bg-amber-50 border-amber-300 text-amber-900 animate-pulse' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className="text-[11px] font-bold uppercase tracking-wider block">Warten auf Freigabe</span>
            <span className="text-2xl sm:text-3xl font-black font-mono">{pendingCount}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Überarbeitungen (v2+)</span>
            <span className="text-2xl sm:text-3xl font-black font-mono text-school-blue">{revisedCount}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Ø Punktedurchschnitt</span>
            <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-700">{avgPercentage}%</span>
          </div>
        </div>
      </div>

      {/* 2. FILTERLEISTE (KLASSEN-TABS & TEXTSORTEN) */}
      <div className="bg-white border border-school-border rounded-2xl p-4 shadow-soft space-y-3">
        {/* Klassen-Tabs mit 1-Klick */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar touch-pan-x">
          <span className="text-xs font-bold text-slate-500 mr-2 shrink-0">Klasse:</span>
          <button
            type="button"
            onClick={() => setSelectedClass('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
              selectedClass === 'all'
                ? 'bg-school-blue text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Alle Klassen
          </button>
          {DEFAULT_CLASSES.map(cls => (
            <button
              key={cls}
              type="button"
              onClick={() => setSelectedClass(cls)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                selectedClass === cls
                  ? 'bg-school-blue text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Klasse {cls}
            </button>
          ))}
        </div>

        {/* Dropdowns & Suchfeld */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
          {/* Textsorten-Filter */}
          <div className="relative">
            <select
              value={selectedTextType}
              onChange={(e) => setSelectedTextType(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-school-blue"
            >
              <option value="all">Alle Textsorten</option>
              {textTypes.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          </div>

          {/* Status-Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-school-blue"
            >
              <option value="all">Alle Status</option>
              <option value="pending">Wartet auf Freigabe</option>
              <option value="released">Freigegeben / Ausgewertet</option>
              <option value="revised">Überarbeitet (Version 2+)</option>
            </select>
          </div>

          {/* Volltext-Suche */}
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Suche nach Name, Kürzel (z.B. LMUE), Thema..."
              className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-school-blue"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>
        </div>
      </div>

      {/* 3. SCHÜLERABGABEN-TABELLE */}
      <div className="bg-white border border-school-border rounded-2xl shadow-soft overflow-hidden">
        <div className="p-4 border-b border-school-border flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800">
            Eingereichte Arbeiten ({filteredSubmissions.length})
          </h2>
        </div>

        {filteredSubmissions.length === 0 ? (
          <div className="p-10 text-center text-slate-500 text-xs">
            Keine Arbeiten für die gewählten Filterkriterien gefunden.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-school-border text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="p-3.5">Schüler & Kürzel</th>
                  <th className="p-3.5">Klasse</th>
                  <th className="p-3.5">Thema & Textsorte</th>
                  <th className="p-3.5">Abschluss</th>
                  <th className="p-3.5 text-center">Version</th>
                  <th className="p-3.5 text-center">Note / Punkte</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSubmissions.map((sub) => {
                  const latestVersion = sub.versions[sub.versions.length - 1];
                  const fb = latestVersion?.feedback;
                  const gradeInfo = fb ? getGradeDescriptor(fb.gradeEstimate) : null;
                  const isGradRealschule = sub.graduationType === 'realschule_10';

                  return (
                    <tr 
                      key={sub.id} 
                      className="hover:bg-slate-50/70 transition cursor-pointer"
                      onClick={() => setReviewSubmission({ sub, version: latestVersion })}
                    >
                      {/* Name & Kürzel mit 1-Klick-Kopieren */}
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 text-sm">{sub.studentName}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-900 px-2 py-0.5 rounded font-mono text-[10px] font-bold">
                            <Key className="w-3 h-3 text-amber-600" />
                            <span>{sub.studentCode}</span>
                          </span>

                          <button
                            type="button"
                            onClick={(e) => handleCopyCode(e, sub.studentCode)}
                            title="Kürzel in Zwischenablage kopieren"
                            className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 hover:text-school-blue hover:bg-blue-50 px-1.5 py-0.5 rounded transition"
                          >
                            {copiedCode === sub.studentCode ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-700 font-bold">Kopiert!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Kopieren</span>
                              </>
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Klasse mit Dropdown zur schnellen Korrektur */}
                      <td className="p-3.5" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={sub.schoolClass}
                          onChange={(e) => handleClassChange(sub, e.target.value)}
                          className="bg-slate-100 hover:bg-slate-200 font-mono font-bold text-xs text-slate-800 rounded px-2 py-1 border border-slate-200 cursor-pointer"
                        >
                          {DEFAULT_CLASSES.map(cls => (
                            <option key={cls} value={cls}>{cls}</option>
                          ))}
                        </select>
                      </td>

                      {/* Thema & Textsorte */}
                      <td className="p-3.5 max-w-xs">
                        <div className="font-bold text-slate-800 truncate" title={sub.taskTitle}>
                          {sub.taskTitle}
                        </div>
                        <div className="text-[11px] text-slate-500 capitalize">
                          {sub.textTypeId}
                        </div>
                      </td>

                      {/* Abschlussart */}
                      <td className="p-3.5">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          isGradRealschule
                            ? 'bg-orange-50 text-orange-800 border border-orange-200'
                            : 'bg-blue-50 text-blue-800 border border-blue-200'
                        }`}>
                          {isGradRealschule ? 'Realschule' : 'Quali'}
                        </span>
                      </td>

                      {/* Version */}
                      <td className="p-3.5 text-center">
                        <span className={`inline-block font-mono font-bold px-2 py-0.5 rounded text-xs ${
                          sub.currentVersion > 1 ? 'bg-purple-100 text-purple-900 border border-purple-200' : 'bg-slate-100 text-slate-700'
                        }`}>
                          v{sub.currentVersion}
                        </span>
                      </td>

                      {/* Note & Punkte */}
                      <td className="p-3.5 text-center">
                        {fb ? (
                          <div className="inline-flex items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded border font-mono font-bold text-xs ${gradeInfo?.bg} ${gradeInfo?.color}`}>
                              Note {fb.gradeEstimate}
                            </span>
                            <span className="font-mono text-slate-500 text-[11px]">
                              {fb.totalScore} Pkt
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        {latestVersion.status === 'pending_teacher' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Freigabe nötig</span>
                          </span>
                        )}
                        {['auto_released', 'released_by_teacher'].includes(latestVersion.status) && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Freigegeben</span>
                          </span>
                        )}
                      </td>

                      {/* Aktionen */}
                      <td className="p-3.5 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setReviewSubmission({ sub, version: latestVersion })}
                          className="px-3 py-1.5 rounded-lg bg-school-blue hover:bg-school-blueDark text-white font-bold text-xs shadow-xs transition"
                        >
                          {latestVersion.status === 'pending_teacher' ? 'Prüfen & Freigeben' : 'Öffnen'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODALS */}
      {reviewSubmission && (
        <SubmissionReviewModal
          submission={reviewSubmission.sub}
          version={reviewSubmission.version}
          onClose={() => setReviewSubmission(null)}
          onUpdated={reloadSubmissions}
        />
      )}

      {isPromptModalOpen && (
        <PromptManagerModal onClose={() => setIsPromptModalOpen(false)} />
      )}

      {isClassSettingsOpen && (
        <ClassSettingsModal
          onClose={() => setIsClassSettingsOpen(false)}
          onUpdated={reloadSubmissions}
        />
      )}
    </div>
  );
};
