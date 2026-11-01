// src/components/teacher/SubmissionReviewModal.tsx - Vollständige Prüfung & Fließtext-Editierung
import React, { useState } from 'react';
import { Submission, SubmissionVersion, EvaluatedCriterion, StarkFeedbackResult } from '../../types/feedback';
import { updateSubmissionStatus } from '../../services/feedbackStore';
import { getGradeDescriptor, calculateThuringiaGrade } from '../../services/evaluationEngine';
import { 
  X, 
  CheckCircle, 
  Printer, 
  MessageSquare, 
  Award, 
  Sparkles, 
  AlertTriangle, 
  Quote, 
  BookOpen, 
  Plus, 
  Trash2, 
  RotateCcw,
  Edit3,
  FileText,
  HelpCircle,
  Check
} from 'lucide-react';

interface SubmissionReviewModalProps {
  submission: Submission;
  version: SubmissionVersion;
  onClose: () => void;
  onUpdated: () => void;
}

const QUICK_TEACHER_SNIPPETS = [
  'Hervorragende Gedankenführung und saubere Gliederung!',
  'Achte bei der Abschlussprüfung unbedingt auf die genauen Zeilenangaben bei Zitaten (z. B. V. 12f.).',
  'Starke Leistungssteigerung im Vergleich zur ersten Version – weiter so!',
  'Lies den Text vor der Abgabe noch einmal gezielt auf Kommasetzung Korrektur.',
  'Untermauere deine Thesen im Hauptteil noch mit konkreten Beispielen aus deinem Alltag.',
  'Sehr überzeugendes Fazit mit ausgewogener eigener Meinung.'
];

export const SubmissionReviewModal: React.FC<SubmissionReviewModalProps> = ({
  submission,
  version,
  onClose,
  onUpdated
}) => {
  const fb = version.feedback;
  if (!fb) return null;

  // Sub-Tab Navigation im Gutachten-Bereich
  const [activeTab, setActiveTab] = useState<'overall' | 'criteria' | 'quotes' | 'tips'>('overall');

  // Editierbare Zustände des gesamten Stark-Gutachtens
  const [summaryTitle, setSummaryTitle] = useState<string>(fb.summaryTitle || '');
  const [overallImpression, setOverallImpression] = useState<string>(fb.overallImpression || '');
  const [teacherNote, setTeacherNote] = useState<string>(fb.teacherNote || '');
  const [criteria, setCriteria] = useState<EvaluatedCriterion[]>(() => 
    JSON.parse(JSON.stringify(fb.criteriaResults || []))
  );
  const [strengths, setStrengths] = useState(() => 
    JSON.parse(JSON.stringify(fb.strengths || []))
  );
  const [improvements, setImprovements] = useState(() => 
    JSON.parse(JSON.stringify(fb.improvements || []))
  );
  const [examTips, setExamTips] = useState<string[]>(() => 
    [...(fb.examTips || [])]
  );

  const [isSaving, setIsSaving] = useState(false);

  // Punkte- & Notenberechnung in Echtzeit
  const totalScore = criteria.reduce((acc, c) => acc + (Number(c.achievedPoints) || 0), 0);
  const percentage = Math.round((totalScore / fb.maxTotalScore) * 100);
  const currentGrade = calculateThuringiaGrade(percentage);
  const gradeInfo = getGradeDescriptor(currentGrade);

  // Kriterien bearbeiten
  const handlePointChange = (index: number, points: number) => {
    const updated = [...criteria];
    const max = updated[index].maxPoints;
    const clamped = Math.max(0, Math.min(max, points));
    updated[index] = { 
      ...updated[index], 
      achievedPoints: clamped,
      status: clamped / max >= 0.8 ? 'passed' : clamped / max >= 0.5 ? 'partially' : 'needs_work'
    };
    setCriteria(updated);
  };

  const handleCriterionCommentChange = (index: number, comment: string) => {
    const updated = [...criteria];
    updated[index] = { ...updated[index], comment };
    setCriteria(updated);
  };

  // Stärken & Verbesserungen bearbeiten
  const handleStrengthChange = (index: number, field: 'quote' | 'explanation', value: string) => {
    const updated = [...strengths];
    updated[index] = { ...updated[index], [field]: value };
    setStrengths(updated);
  };

  const handleAddStrength = () => {
    setStrengths([
      ...strengths,
      { quote: 'Ausgewählte gelungene Textstelle', explanation: 'Didaktische Begründung...' }
    ]);
  };

  const handleRemoveStrength = (index: number) => {
    setStrengths(strengths.filter((_: any, i: number) => i !== index));
  };

  const handleImprovementChange = (index: number, field: 'quote' | 'issue' | 'suggestion', value: string) => {
    const updated = [...improvements];
    updated[index] = { ...updated[index], [field]: value };
    setImprovements(updated);
  };

  const handleAddImprovement = () => {
    setImprovements([
      ...improvements,
      { quote: 'Textstelle mit Verbesserungsbedarf', issue: 'Beobachtung der Lehrkraft', suggestion: 'Besser so: ...' }
    ]);
  };

  const handleRemoveImprovement = (index: number) => {
    setImprovements(improvements.filter((_: any, i: number) => i !== index));
  };

  // Prüfungstipps bearbeiten
  const handleTipChange = (index: number, value: string) => {
    const updated = [...examTips];
    updated[index] = value;
    setExamTips(updated);
  };

  const handleAddTip = () => {
    setExamTips([...examTips, 'Prüfungstipp Thüringer Regelschule: ...']);
  };

  const handleRemoveTip = (index: number) => {
    setExamTips(examTips.filter((_: any, i: number) => i !== index));
  };

  // Schnellauswahl Textbaustein anhängen
  const handleInsertSnippet = (snippet: string) => {
    if (!teacherNote.trim()) {
      setTeacherNote(snippet);
    } else {
      setTeacherNote(`${teacherNote}\n${snippet}`);
    }
  };

  // Alles speichern & freigeben
  const handleApproveAndRelease = () => {
    setIsSaving(true);

    const updatedFeedback: StarkFeedbackResult = {
      ...fb,
      summaryTitle,
      overallImpression,
      totalScore,
      percentage,
      gradeEstimate: currentGrade,
      criteriaResults: criteria,
      strengths,
      improvements,
      examTips,
      teacherNote
    };

    updateSubmissionStatus(submission.id, version.versionNumber, 'released_by_teacher', updatedFeedback);
    onUpdated();
    setIsSaving(false);
    onClose();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#FFFBF5] border border-school-border rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] flex flex-col overflow-hidden">
        {/* MODAL KOPFZEILE */}
        <div className="p-4 sm:p-5 border-b border-school-border flex flex-wrap items-center justify-between gap-3 bg-white shrink-0">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-mono font-bold text-school-blue bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                {submission.studentName} ({submission.studentCode})
              </span>
              <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                Klasse {submission.schoolClass}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-600 font-medium capitalize">
                {submission.textTypeId} ({submission.graduationType === 'realschule_10' ? 'Realschule' : 'Quali'})
              </span>
              <span className="font-mono text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 font-bold">
                Version {version.versionNumber}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 mt-1">
              {submission.taskTitle}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 transition"
              title="A4-Feedbackbogen drucken"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Drucken</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2-SPALTEN-WERKBANK (Schülertext links, Fließtext-Gutachten rechts) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LINKE SPALTE: Schülertext im Original */}
          <div className="lg:col-span-5 space-y-3 flex flex-col h-full">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-400" />
                <span>Eingereichter Schülertext ({version.wordCount} Wörter)</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">Originalfassung</span>
            </div>
            
            <div className="p-4 bg-white rounded-2xl border border-slate-200 text-xs sm:text-sm font-sans leading-relaxed text-slate-800 whitespace-pre-wrap overflow-y-auto max-h-[70vh] shadow-xs select-text">
              {version.textContent}
            </div>
          </div>

          {/* RECHTE SPALTE: Vollständiges, editierbares Fließtext-Gutachten */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Noten- & Punkteleiste mit Live-Berechnung */}
            <div className="p-4 rounded-2xl bg-white border border-school-border shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Berechnetes Prüfungsergebnis (Thüringer Schlüssel)
                </span>
                <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 tracking-tight">
                  {totalScore}
                  <span className="text-base text-slate-400 font-normal"> / {fb.maxTotalScore} Pkt</span>
                  <span className="text-sm text-school-blue font-bold ml-2">({percentage}%)</span>
                </div>
              </div>

              <div className={`px-4 py-2 rounded-2xl border-2 font-bold text-center shadow-xs ${gradeInfo.bg}`}>
                <span className="text-[9px] uppercase tracking-wider block leading-none text-slate-500">Note</span>
                <span className={`text-2xl sm:text-3xl font-black leading-tight ${gradeInfo.color}`}>
                  {currentGrade}
                </span>
                <span className={`text-[10px] font-bold block leading-none ${gradeInfo.color}`}>
                  {gradeInfo.label}
                </span>
              </div>
            </div>

            {/* TAB-NAVIGATION FÜR DAS FLIESSTEXT-GUTACHTEN */}
            <div className="flex items-center gap-1 bg-slate-200/70 p-1.5 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('overall')}
                className={`flex-1 py-2 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'overall'
                    ? 'bg-white text-school-blue shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Gesamtwürdigung</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('criteria')}
                className={`flex-1 py-2 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'criteria'
                    ? 'bg-white text-school-blue shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Kriterien ({criteria.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('quotes')}
                className={`flex-1 py-2 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'quotes'
                    ? 'bg-white text-school-blue shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Quote className="w-3.5 h-3.5" />
                <span>Zitate & Textarbeit</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('tips')}
                className={`flex-1 py-2 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'tips'
                    ? 'bg-white text-school-blue shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Tipps ({examTips.length})</span>
              </button>
            </div>

            {/* TAB-INHALT 1: GESAMTWÜRDIGUNG & LEHRERKOMMENTAR */}
            {activeTab === 'overall' && (
              <div className="space-y-4 animate-fadeIn">
                {/* Titel des Gutachtens */}
                <div className="bg-white border border-school-border rounded-xl p-4 shadow-soft space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Prägnanter Titel des Gutachtens
                  </label>
                  <input
                    type="text"
                    value={summaryTitle}
                    onChange={(e) => setSummaryTitle(e.target.value)}
                    placeholder="z. B. Solide dialektische Argumentation mit Ausbaupotenzial..."
                    className="w-full h-10 px-3.5 rounded-lg border border-slate-300 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-school-blue"
                  />
                </div>

                {/* Gesamtwürdigung der KI (vollständig editierbar) */}
                <div className="bg-white border border-school-border rounded-xl p-4 shadow-soft space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-school-orange" />
                      <span>Gesamteindruck & Pädagogische Würdigung (Fließtext)</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Direkt per Klick editierbar</span>
                  </div>
                  <textarea
                    value={overallImpression}
                    onChange={(e) => setOverallImpression(e.target.value)}
                    rows={5}
                    placeholder="Ausführlicher Fließtext zum Textverständnis, Aufbau und Gesamteindruck..."
                    className="w-full p-3 rounded-lg border border-slate-300 text-xs sm:text-sm leading-relaxed text-slate-800 focus:outline-none focus:ring-2 focus:ring-school-blue resize-y"
                  />
                </div>

                {/* Persönlicher Lehrkraft-Kommentar mit 1-Klick Textbausteinen */}
                <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 shadow-soft space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-school-blue uppercase tracking-wide flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Persönlicher Lehrkraft-Kommentar für den Schüler</span>
                    </label>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Erscheint hervorgehoben in der Schüleransicht und im A4-Druckbogen.
                    </p>
                  </div>

                  <textarea
                    value={teacherNote}
                    onChange={(e) => setTeacherNote(e.target.value)}
                    rows={3}
                    placeholder="Schreibe hier deinen persönlichen Kommentar oder nutze die Bausteine unten..."
                    className="w-full p-3 rounded-lg border border-blue-300 bg-white text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-school-blue resize-y"
                  />

                  {/* 1-Klick Textbausteine */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                      Schnellbausteine einfügen:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_TEACHER_SNIPPETS.map((snip, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleInsertSnippet(snip)}
                          className="text-[11px] font-medium bg-white hover:bg-blue-100/70 text-slate-700 border border-blue-200 px-2.5 py-1 rounded-lg text-left transition"
                        >
                          + {snip.slice(0, 48)}...
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB-INHALT 2: KRITERIEN-MATRIX MIT PUNKTEN & FLIESSTEXT */}
            {activeTab === 'criteria' && (
              <div className="space-y-3 animate-fadeIn">
                <p className="text-xs text-slate-500">
                  Passe sowohl die Punkte als auch den individuellen Begründungstext jedes Kriteriums an:
                </p>

                {criteria.map((crit, idx) => (
                  <div key={crit.criterionId || idx} className="p-4 bg-white rounded-xl border border-slate-200 space-y-2.5 shadow-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-xs sm:text-sm text-slate-900">
                        {crit.title}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <input
                          type="number"
                          value={crit.achievedPoints}
                          onChange={(e) => handlePointChange(idx, Number(e.target.value) || 0)}
                          max={crit.maxPoints}
                          min={0}
                          className="w-16 h-8 text-center font-mono font-bold text-xs rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-school-blue"
                        />
                        <span className="text-xs text-slate-400 font-bold">/ {crit.maxPoints} Pkt</span>
                      </div>
                    </div>

                    {/* Editierbarer Begründungstext des Kriteriums */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                        Begründungstext der Bewertung:
                      </label>
                      <textarea
                        value={crit.comment}
                        onChange={(e) => handleCriterionCommentChange(idx, e.target.value)}
                        rows={2}
                        className="w-full p-2.5 rounded-lg border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-school-blue resize-y"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB-INHALT 3: ZITATE & TEXTARBEIT */}
            {activeTab === 'quotes' && (
              <div className="space-y-5 animate-fadeIn">
                {/* Stärken */}
                <div className="bg-white border border-school-border rounded-xl p-4 shadow-soft space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wide flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Gelungene Textpassagen (Stärken)</span>
                    </h4>
                    <button
                      type="button"
                      onClick={handleAddStrength}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-md transition"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Stärke ergänzen</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {strengths.map((st: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-200 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={st.quote}
                            onChange={(e) => handleStrengthChange(idx, 'quote', e.target.value)}
                            placeholder="Wörtliches Zitat..."
                            className="flex-1 h-8 px-2.5 rounded border border-emerald-300 bg-white text-xs font-serif italic text-emerald-950 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveStrength(idx)}
                            className="w-7 h-7 text-slate-400 hover:text-rose-600 flex items-center justify-center transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={st.explanation}
                          onChange={(e) => handleStrengthChange(idx, 'explanation', e.target.value)}
                          placeholder="Didaktische Erklärung, warum das gelungen ist..."
                          className="w-full h-8 px-2.5 rounded border border-emerald-200 bg-white text-xs text-emerald-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Verbesserungsansätze */}
                <div className="bg-white border border-school-border rounded-xl p-4 shadow-soft space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-school-orange" />
                      <span>Kritische Stellen & Formulierungshilfen</span>
                    </h4>
                    <button
                      type="button"
                      onClick={handleAddImprovement}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-md transition"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Kritikpunkt ergänzen</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {improvements.map((imp: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-lg bg-amber-50/50 border border-amber-200 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={imp.quote}
                            onChange={(e) => handleImprovementChange(idx, 'quote', e.target.value)}
                            placeholder="Wörtliches Zitat..."
                            className="flex-1 h-8 px-2.5 rounded border border-amber-300 bg-white text-xs font-serif italic text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImprovement(idx)}
                            className="w-7 h-7 text-slate-400 hover:text-rose-600 flex items-center justify-center transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={imp.issue}
                          onChange={(e) => handleImprovementChange(idx, 'issue', e.target.value)}
                          placeholder="Problembeschreibung (z.B. fehlende Begründung)..."
                          className="w-full h-8 px-2.5 rounded border border-amber-200 bg-white text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                        <input
                          type="text"
                          value={imp.suggestion}
                          onChange={(e) => handleImprovementChange(idx, 'suggestion', e.target.value)}
                          placeholder="Besser so (konkrete Formulierungshilfe)..."
                          className="w-full h-8 px-2.5 rounded border border-school-blue/40 bg-white text-xs font-bold text-school-blue focus:outline-none focus:ring-1 focus:ring-school-blue"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB-INHALT 4: THÜRINGER PRÜFUNGSTIPPS */}
            {activeTab === 'tips' && (
              <div className="space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500">
                    Spezifische Hinweise für die Thüringer Regelschulprüfung:
                  </p>
                  <button
                    type="button"
                    onClick={handleAddTip}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-school-blue bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md transition"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Tipp hinzufügen</span>
                  </button>
                </div>

                {examTips.map((tip, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-school-blue text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={tip}
                      onChange={(e) => handleTipChange(idx, e.target.value)}
                      className="flex-1 h-9 px-3 rounded-lg border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-school-blue"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveTip(idx)}
                      className="w-8 h-8 text-slate-400 hover:text-rose-600 flex items-center justify-center transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 sm:p-5 border-t border-school-border bg-white flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Status:</span>
            <strong className="text-slate-800 uppercase font-mono">{version.status}</strong>
            <span className="text-slate-300">|</span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>Fließtext-Gutachten wird nach Freigabe live synchronisiert</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold transition"
            >
              Abbrechen
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={handleApproveAndRelease}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-extrabold shadow-soft transition flex items-center gap-2 active:scale-[0.98]"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Gutachten & Freigabe für Schüler speichern</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
