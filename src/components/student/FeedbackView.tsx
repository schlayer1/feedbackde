// src/components/student/FeedbackView.tsx - Interaktive Auswertung im Stark-Heft-Stil
import React, { useEffect } from 'react';
import { Submission, SubmissionVersion } from '../../types/feedback';
import { getGradeDescriptor } from '../../services/evaluationEngine';
import { 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  Printer, 
  RefreshCw, 
  Sparkles, 
  BookOpen, 
  ArrowLeft,
  Quote,
  MessageSquare,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface FeedbackViewProps {
  submission: Submission;
  version: SubmissionVersion;
  onRevise: () => void;
  onBack: () => void;
}

export const FeedbackView: React.FC<FeedbackViewProps> = ({
  submission,
  version,
  onRevise,
  onBack
}) => {
  const fb = version.feedback;

  useEffect(() => {
    // Wenn Note 1 oder 2, lasse Konfetti steigen!
    if (fb && fb.gradeEstimate <= 2) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    }
  }, [fb]);

  if (!fb) {
    return (
      <div className="bg-white border border-school-border rounded-2xl p-8 text-center max-w-xl mx-auto my-12 shadow-soft">
        <Clock className="w-12 h-12 text-amber-500 mx-auto mb-3 animate-spin" />
        <h3 className="text-lg font-bold text-slate-800">Feedback in Vorbereitung</h3>
        <p className="text-sm text-slate-600 mt-1">
          {version.status === 'pending_teacher'
            ? 'Deine Einreichung wurde erfasst und wartet auf die finale Freigabe durch deine Lehrkraft.'
            : 'Die Analyse wird gerade durchgeführt...'}
        </p>
        <button
          onClick={onBack}
          className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Zurück zur Übersicht</span>
        </button>
      </div>
    );
  }

  const gradeInfo = getGradeDescriptor(fb.gradeEstimate);
  const gradLabel = submission.graduationType === 'realschule_10'
    ? 'Realschulabschluss (Klasse 10)'
    : 'Qualifizierender Hauptschulabschluss (Klasse 9)';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-12">
      {/* Aktionsleiste Oben */}
      <div className="flex flex-wrap items-center justify-between gap-3 no-print">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-school-blue px-3 py-2 rounded-xl hover:bg-white text-xs font-bold transition border border-transparent hover:border-school-border"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Alle meine Abgaben</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 bg-white border border-school-border hover:border-slate-400 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs transition"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>A4-Hefterbogen drucken</span>
          </button>

          <button
            type="button"
            onClick={onRevise}
            className="inline-flex items-center gap-1.5 bg-school-blue hover:bg-school-blueDark text-white px-4 py-2 rounded-xl text-xs font-bold shadow-soft transition active:scale-[0.98]"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Als Version {submission.currentVersion + 1} überarbeiten</span>
          </button>
        </div>
      </div>

      {/* STARK-HERO-CARD: Noten- und Punkte-Dashboard */}
      <div className="bg-white border-2 border-school-border rounded-2xl shadow-stark p-5 sm:p-7 relative overflow-hidden">
        {/* Dekorative Stark-Farbleiste */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-school-orange via-school-blue to-school-teal" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-1">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="bg-school-blue/10 text-school-blue font-bold px-2.5 py-0.5 rounded-full">
                {gradLabel}
              </span>
              <span className="bg-amber-100 text-amber-900 font-mono font-bold px-2.5 py-0.5 rounded-full">
                Version {version.versionNumber}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500 font-medium">{submission.textTypeId}</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {fb.summaryTitle}
            </h1>
            <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
              {fb.overallImpression}
            </p>

            {fb.deltaSummary && (
              <div className="mt-2.5 p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-950 flex items-start gap-2">
                <RefreshCw className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-purple-900 block font-bold">Lernfortschritt im Vergleich zu Version 1:</strong>
                  <span>{fb.deltaSummary}</span>
                </div>
              </div>
            )}
          </div>

          {/* Noten- & Punktebox */}
          <div className="shrink-0 flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="text-right">
              <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-slate-900">
                {fb.totalScore}
                <span className="text-lg sm:text-xl text-slate-400 font-normal"> / {fb.maxTotalScore}</span>
              </div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Punkte ({fb.percentage}%)
              </div>
            </div>

            <div className={`w-16 h-16 sm:w-18 sm:h-18 rounded-2xl border-2 flex flex-col items-center justify-center shadow-xs ${gradeInfo.bg}`}>
              <span className="text-[10px] uppercase font-bold tracking-wider leading-none text-slate-500">Note</span>
              <span className={`text-2xl sm:text-3xl font-black leading-tight ${gradeInfo.color}`}>
                {fb.gradeEstimate}
              </span>
              <span className={`text-[10px] font-bold leading-none ${gradeInfo.color}`}>
                {gradeInfo.label}
              </span>
            </div>
          </div>
        </div>

        {/* Lehrkraft-Kommentar falls vorhanden */}
        {fb.teacherNote && (
          <div className="mt-5 p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
            <MessageSquare className="w-4 h-4 text-school-blue shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-school-blue block">Persönlicher Kommentar deiner Lehrkraft:</span>
              <p className="mt-0.5 italic">{fb.teacherNote}</p>
            </div>
          </div>
        )}
      </div>

      {/* KRITERIEN-MATRIX (Fortschritt & Deskriptoren) */}
      <div className="bg-white border border-school-border rounded-2xl shadow-soft p-5 sm:p-7 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-school-orange" />
            <h2 className="text-base font-bold text-slate-900">
              Kriterienmatrix nach Thüringer Regelschulschlüssel
            </h2>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {fb.criteriaResults.length} Bewertungsbereiche
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fb.criteriaResults.map((crit, idx) => {
            const ratio = crit.achievedPoints / crit.maxPoints;
            const percentage = Math.round(ratio * 100);

            return (
              <div 
                key={idx} 
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-school-blue/40 transition space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {crit.status === 'passed' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                    {crit.status === 'partially' && (
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    )}
                    {crit.status === 'needs_work' && (
                      <HelpCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    )}
                    <span className="font-bold text-xs sm:text-sm text-slate-800 truncate">
                      {crit.title}
                    </span>
                  </div>

                  <span className="font-mono text-xs font-bold text-slate-900 shrink-0 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {crit.achievedPoints} / {crit.maxPoints} Pkt
                  </span>
                </div>

                {/* Fortschrittsbalken */}
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      percentage >= 80 ? 'bg-emerald-500' : percentage >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {crit.comment}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* DETAIL-FEEDBACK: Stärken & Konkrete Überarbeitungstipps (Zitate) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stärken */}
        <div className="bg-white border border-school-border rounded-2xl shadow-soft p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 text-emerald-800 border-b border-slate-100 pb-3">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-sm sm:text-base">Das gelingt dir schon richtig gut:</h3>
          </div>

          <div className="space-y-3">
            {fb.strengths.map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-1.5">
                <div className="flex items-start gap-2">
                  <Quote className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-serif italic text-xs sm:text-sm text-emerald-950">
                    "{item.quote}"
                  </span>
                </div>
                <p className="text-xs text-emerald-900 font-medium pl-5">
                  ➔ {item.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Verbesserungsbedarf */}
        <div className="bg-white border border-school-border rounded-2xl shadow-soft p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 text-amber-900 border-b border-slate-100 pb-3">
            <AlertTriangle className="w-5 h-5 text-school-orange" />
            <h3 className="font-bold text-sm sm:text-base">Daran solltest du gezielt arbeiten:</h3>
          </div>

          <div className="space-y-3">
            {fb.improvements.map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-1.5">
                <div className="flex items-start gap-2">
                  <Quote className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                  <span className="font-serif italic text-xs sm:text-sm text-slate-800 line-through decoration-amber-500">
                    "{item.quote}"
                  </span>
                </div>
                <div className="text-xs text-amber-900 pl-5 space-y-0.5">
                  <p className="text-slate-600 font-normal"><strong>Beobachtung:</strong> {item.issue}</p>
                  <p className="text-school-blue font-bold"><strong>Besser so:</strong> {item.suggestion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* THÜRINGER PRÜFUNGSTIPPS */}
      <div className="bg-gradient-to-r from-school-blueLight to-school-tealLight border border-school-blue/20 rounded-2xl p-5 sm:p-6 shadow-soft space-y-3">
        <div className="flex items-center gap-2 text-school-blue font-bold text-sm sm:text-base">
          <BookOpen className="w-5 h-5 text-school-blue" />
          <h3>Stark-Prüfungstipps für die Thüringer Regelschulprüfung:</h3>
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {fb.examTips.map((tip, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs text-slate-800 bg-white/80 p-3 rounded-xl border border-school-blue/10">
              <span className="w-5 h-5 rounded-full bg-school-blue text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                {idx + 1}
              </span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Originaltext-Einsicht (ausklappbar) */}
      <details className="bg-white border border-school-border rounded-2xl p-5 shadow-soft group">
        <summary className="font-bold text-xs sm:text-sm text-slate-700 cursor-pointer list-none flex items-center justify-between">
          <span>Dein eingereichter Text (Version {version.versionNumber}, {version.wordCount} Wörter)</span>
          <span className="text-xs text-school-blue group-open:rotate-180 transition-transform">▼</span>
        </summary>
        <div className="mt-4 pt-3 border-t border-slate-100 whitespace-pre-wrap font-sans text-xs sm:text-sm text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
          {version.textContent}
        </div>
      </details>
    </div>
  );
};
