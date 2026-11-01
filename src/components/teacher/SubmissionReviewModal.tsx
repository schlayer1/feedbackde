// src/components/teacher/SubmissionReviewModal.tsx - Lehrkraft-Prüfung & Freigabe
import React, { useState } from 'react';
import { Submission, SubmissionVersion, EvaluatedCriterion } from '../../types/feedback';
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
  Send,
  Quote
} from 'lucide-react';

interface SubmissionReviewModalProps {
  submission: Submission;
  version: SubmissionVersion;
  onClose: () => void;
  onUpdated: () => void;
}

export const SubmissionReviewModal: React.FC<SubmissionReviewModalProps> = ({
  submission,
  version,
  onClose,
  onUpdated
}) => {
  const fb = version.feedback;

  const [teacherNote, setTeacherNote] = useState<string>(fb?.teacherNote || '');
  const [criteria, setCriteria] = useState<EvaluatedCriterion[]>(fb?.criteriaResults || []);
  const [isSaving, setIsSaving] = useState(false);

  if (!fb) return null;

  const handlePointChange = (index: number, points: number) => {
    const updated = [...criteria];
    const max = updated[index].maxPoints;
    const clamped = Math.max(0, Math.min(max, points));
    updated[index] = { ...updated[index], achievedPoints: clamped };
    setCriteria(updated);
  };

  const totalScore = criteria.reduce((acc, c) => acc + c.achievedPoints, 0);
  const percentage = Math.round((totalScore / fb.maxTotalScore) * 100);
  const currentGrade = calculateThuringiaGrade(percentage);
  const gradeInfo = getGradeDescriptor(currentGrade);

  const handleApproveAndRelease = () => {
    setIsSaving(true);
    // Aktualisiere Feedback mit den ggf. angepassten Punkten
    fb.criteriaResults = criteria;
    fb.totalScore = totalScore;
    fb.percentage = percentage;
    fb.gradeEstimate = currentGrade;
    fb.teacherNote = teacherNote;

    updateSubmissionStatus(submission.id, version.versionNumber, 'released_by_teacher', teacherNote);
    onUpdated();
    setIsSaving(false);
    onClose();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#FFFBF5] border border-school-border rounded-2xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-school-border flex items-center justify-between bg-white shrink-0">
          <div>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-mono font-bold text-school-blue bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                {submission.studentName} ({submission.studentCode})
              </span>
              <span className="font-bold text-slate-700">Klasse {submission.schoolClass}</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500 font-medium">Version {version.versionNumber}</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
              {submission.taskTitle}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 transition"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Drucken</span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2-Spalten-Layout (Schülertext links, KI-Feedback & Lehrerkommentar rechts) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Linke Spalte: Schülertext */}
          <div className="lg:col-span-6 space-y-3 flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Originaltext des Schülers ({version.wordCount} Wörter)
              </h3>
            </div>
            <div className="flex-1 p-4 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm font-sans leading-relaxed text-slate-800 whitespace-pre-wrap overflow-y-auto max-h-[60vh]">
              {version.textContent}
            </div>
          </div>

          {/* Rechte Spalte: Stark-Kriterien & Freigabe */}
          <div className="lg:col-span-6 space-y-5">
            {/* Noten- & Punkteleiste */}
            <div className="p-4 rounded-xl bg-white border border-school-border shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Berechnete Punktzahl
                </span>
                <span className="text-2xl font-black font-mono text-slate-900">
                  {totalScore} / {fb.maxTotalScore} Pkt ({percentage}%)
                </span>
              </div>

              <div className={`px-4 py-2 rounded-xl border-2 font-bold text-center ${gradeInfo.bg}`}>
                <span className="text-[9px] uppercase tracking-wider block leading-none text-slate-500">Note</span>
                <span className={`text-2xl font-black leading-none ${gradeInfo.color}`}>{currentGrade}</span>
              </div>
            </div>

            {/* Kriterien mit anpassbaren Punkten */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Punkteanpassung je Kriterium:
              </h4>

              {criteria.map((crit, idx) => (
                <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-800">{crit.title}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <input
                        type="number"
                        value={crit.achievedPoints}
                        onChange={(e) => handlePointChange(idx, Number(e.target.value) || 0)}
                        max={crit.maxPoints}
                        min={0}
                        className="w-14 h-8 text-center font-mono font-bold text-xs rounded border border-slate-300 bg-slate-50 focus:bg-white"
                      />
                      <span className="text-slate-400 font-bold">/ {crit.maxPoints}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600 italic">{crit.comment}</p>
                </div>
              ))}
            </div>

            {/* Lehrer-Kommentarfeld */}
            <div className="space-y-1.5 bg-blue-50/60 p-4 rounded-xl border border-blue-200">
              <label className="block text-xs font-bold text-school-blue flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Persönlicher Kommentar der Lehrkraft für den Schüler:</span>
              </label>
              <textarea
                value={teacherNote}
                onChange={(e) => setTeacherNote(e.target.value)}
                placeholder="z. B. Sehr gute Argumente im Hauptteil! Achte bei der Abschlussprüfung noch auf die Zeilennummern bei Zitaten."
                rows={3}
                className="w-full p-2.5 rounded-lg border border-blue-300 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-school-blue resize-y"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-school-border bg-white flex items-center justify-between gap-3 shrink-0">
          <span className="text-xs text-slate-500">
            Status: <strong className="text-slate-800">{version.status}</strong>
          </span>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold transition"
            >
              Schließen
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={handleApproveAndRelease}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-soft transition flex items-center gap-2 active:scale-[0.98]"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Feedback für Schüler freigeben</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
