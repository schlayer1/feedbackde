// src/components/layout/PrintSheet.tsx - Druckoptimierter A4-Hefterbogen ohne Tintendunkelheit
import React from 'react';
import { Submission, SubmissionVersion } from '../../types/feedback';
import { getGradeDescriptor } from '../../services/evaluationEngine';

interface PrintSheetProps {
  submission: Submission;
  version: SubmissionVersion;
}

export const PrintSheet: React.FC<PrintSheetProps> = ({ submission, version }) => {
  const fb = version.feedback;
  if (!fb) return null;

  const gradeInfo = getGradeDescriptor(fb.gradeEstimate);
  const gradLabel = submission.graduationType === 'realschule_10'
    ? 'Realschulabschluss (Klasse 10)'
    : 'Qualifizierender Hauptschulabschluss (Klasse 9)';

  const formattedDate = new Date(version.createdAt).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  return (
    <div id="printable-sheet" className="hidden print:block bg-white text-slate-900 p-6 max-w-[210mm] mx-auto text-[11pt] leading-normal font-sans">
      {/* Kopfzeile mit Schule & Prüfungsbezug */}
      <div className="border-b-2 border-slate-800 pb-3 mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold tracking-tight uppercase text-slate-900">
            Staatliche Regelschule Heimbürgeschule Kahla
          </h1>
          <p className="text-xs font-semibold text-slate-600">
            Fachschaft Deutsch • Kriterienorientierter Feedbackbogen zur Abschlussprüfung
          </p>
        </div>
        <div className="text-right">
          <span className="inline-block border border-slate-700 px-2 py-0.5 rounded text-xs font-mono font-bold">
            Login: {submission.studentCode}
          </span>
          <p className="text-[10px] text-slate-500 mt-0.5">{formattedDate}</p>
        </div>
      </div>

      {/* Stammdaten-Tabelle */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 p-3 border border-slate-300 rounded mb-4 text-xs bg-slate-50/50">
        <div><strong className="text-slate-600">Schüler/in:</strong> {submission.studentName}</div>
        <div><strong className="text-slate-600">Klasse:</strong> {submission.schoolClass}</div>
        <div><strong className="text-slate-600">Abschlussart:</strong> {gradLabel}</div>
        <div><strong className="text-slate-600">Textsorte & Version:</strong> {submission.textTypeId} (Version {version.versionNumber})</div>
        <div className="col-span-2 pt-1 border-t border-slate-200">
          <strong className="text-slate-600">Thema / Aufgabe:</strong> {submission.taskTitle}
        </div>
      </div>

      {/* Gesamtergebnis-Kasten */}
      <div className="flex items-center justify-between p-3 border-2 border-slate-800 rounded mb-4 bg-white">
        <div>
          <span className="text-xs uppercase font-bold text-slate-500 tracking-wider block">Gesamtbewertung</span>
          <p className="font-bold text-sm text-slate-900">{fb.summaryTitle}</p>
          <p className="text-xs text-slate-600 mt-0.5 italic">{fb.overallImpression}</p>
        </div>
        <div className="text-right flex items-center gap-3 pl-4 border-l border-slate-300">
          <div>
            <div className="text-2xl font-black font-mono tracking-tight text-slate-900">
              {fb.totalScore} / {fb.maxTotalScore}
            </div>
            <div className="text-[10px] font-semibold text-slate-500">Punkte ({fb.percentage}%)</div>
          </div>
          <div className="w-12 h-12 border-2 border-slate-900 rounded flex flex-col items-center justify-center">
            <span className="text-[9px] uppercase font-bold text-slate-500 leading-none">Note</span>
            <span className="text-xl font-black leading-none">{fb.gradeEstimate}</span>
          </div>
        </div>
      </div>

      {/* Kriterien-Tabelle (Stark-Modell) */}
      <div className="mb-4 print-avoid-break">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
          Bewertungsmatrix nach Thüringer Regelschulschlüssel
        </h2>
        <table className="w-full text-xs border-collapse border border-slate-300">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-300 text-slate-700">
              <th className="p-1.5 text-left font-bold w-1/3">Bewertungskriterium</th>
              <th className="p-1.5 text-center font-bold w-20">Punkte</th>
              <th className="p-1.5 text-left font-bold">Didaktischer Kommentar & Beobachtung</th>
            </tr>
          </thead>
          <tbody>
            {fb.criteriaResults.map((c, i) => (
              <tr key={i} className="border-b border-slate-200">
                <td className="p-1.5 font-semibold text-slate-900 align-top">{c.title}</td>
                <td className="p-1.5 text-center font-mono font-bold align-top">
                  {c.achievedPoints} / {c.maxPoints}
                </td>
                <td className="p-1.5 text-slate-700 align-top">{c.comment}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Stärken & Fördertipps */}
      <div className="grid grid-cols-2 gap-4 mb-4 print-avoid-break text-xs">
        <div className="border border-slate-300 rounded p-2.5 bg-slate-50/30">
          <h3 className="font-bold text-slate-900 uppercase tracking-wide text-[11px] mb-1">
            Besonders gelungen (Stärken)
          </h3>
          <ul className="space-y-1.5">
            {fb.strengths.slice(0, 2).map((s, idx) => (
              <li key={idx} className="text-slate-700">
                <span className="italic font-serif">"{s.quote}"</span>
                <p className="text-[11px] text-slate-600 mt-0.5">• {s.explanation}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="border border-slate-300 rounded p-2.5 bg-slate-50/30">
          <h3 className="font-bold text-slate-900 uppercase tracking-wide text-[11px] mb-1">
            Konkrete Verbesserungsansätze
          </h3>
          <ul className="space-y-1.5">
            {fb.improvements.slice(0, 2).map((imp, idx) => (
              <li key={idx} className="text-slate-700">
                <span className="italic font-serif text-slate-600">"{imp.quote}"</span>
                <p className="text-[11px] text-slate-800 font-medium mt-0.5">➔ {imp.suggestion}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Lehrkraft-Anmerkungen & Unterschrift / Stempel */}
      <div className="border border-slate-400 rounded p-3 mb-2 print-avoid-break text-xs">
        <div className="font-bold text-slate-800 uppercase tracking-wide text-[10px] mb-1">
          Individuelle Anmerkungen der Lehrkraft:
        </div>
        <p className="text-slate-700 italic min-h-[32px]">
          {fb.teacherNote || 'Vollständige Prüfungsvorbereitung im Feedbackstudio Deutsch erfasst.'}
        </p>

        <div className="grid grid-cols-2 gap-8 pt-4 mt-2 border-t border-dashed border-slate-300">
          <div>
            <div className="border-b border-slate-400 h-6 mb-1"></div>
            <span className="text-[9px] text-slate-500 uppercase tracking-wider">Datum & Unterschrift der Lehrkraft</span>
          </div>
          <div>
            <div className="border-b border-slate-400 h-6 mb-1"></div>
            <span className="text-[9px] text-slate-500 uppercase tracking-wider">Schulstempel / Kenntnisnahme Erziehungsberechtigte</span>
          </div>
        </div>
      </div>
    </div>
  );
};
