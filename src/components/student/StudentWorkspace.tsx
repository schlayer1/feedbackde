// src/components/student/StudentWorkspace.tsx - Schüler-Übersicht & Abgabenverwaltung
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getStudentSubmissions } from '../../services/feedbackStore';
import { Submission, SubmissionVersion } from '../../types/feedback';
import { SubmissionEditor } from './SubmissionEditor';
import { FeedbackView } from './FeedbackView';
import { PrintSheet } from '../layout/PrintSheet';
import { 
  PlusCircle, 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  Award, 
  RefreshCw, 
  FileText, 
  Printer, 
  ChevronRight,
  Sparkles,
  Key
} from 'lucide-react';
import { getGradeDescriptor } from '../../services/evaluationEngine';

export const StudentWorkspace: React.FC = () => {
  const { studentCode, studentName, schoolClass } = useAuth();

  // Ansichts-Zustand: 'list' | 'editor' | 'feedback'
  const [viewMode, setViewMode] = useState<'list' | 'editor' | 'feedback'>('list');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<SubmissionVersion | null>(null);
  const [isRevisionMode, setIsRevisionMode] = useState<boolean>(false);

  const studentSubmissions = getStudentSubmissions(studentCode);

  const handleOpenFeedback = (sub: Submission, version?: SubmissionVersion) => {
    setSelectedSubmission(sub);
    setSelectedVersion(version || sub.versions[sub.versions.length - 1]);
    setViewMode('feedback');
  };

  const handleStartNew = () => {
    setSelectedSubmission(null);
    setSelectedVersion(null);
    setIsRevisionMode(false);
    setViewMode('editor');
  };

  const handleStartRevision = (sub: Submission) => {
    setSelectedSubmission(sub);
    setIsRevisionMode(true);
    setViewMode('editor');
  };

  const handleSubmitted = (sub: Submission, version: SubmissionVersion) => {
    setSelectedSubmission(sub);
    setSelectedVersion(version);
    setViewMode('feedback');
  };

  return (
    <div className="w-full">
      {/* 1. EDITOR-MODUS */}
      {viewMode === 'editor' && (
        <SubmissionEditor
          existingSubmission={selectedSubmission}
          isRevisionMode={isRevisionMode}
          onCancel={() => setViewMode('list')}
          onSubmitted={handleSubmitted}
        />
      )}

      {/* 2. FEEDBACK-ANSICHT */}
      {viewMode === 'feedback' && selectedSubmission && selectedVersion && (
        <>
          <FeedbackView
            submission={selectedSubmission}
            version={selectedVersion}
            onRevise={() => handleStartRevision(selectedSubmission)}
            onBack={() => setViewMode('list')}
          />
          {/* Unsichtbare Druckvorlage für den Browser-Drucker */}
          <PrintSheet submission={selectedSubmission} version={selectedVersion} />
        </>
      )}

      {/* 3. LISTEN-ANSICHT (HOME) */}
      {viewMode === 'list' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Begrüßungs-Banner */}
          <div className="bg-gradient-to-r from-school-blue via-school-blueDark to-[#05435B] text-white rounded-3xl p-6 sm:p-8 shadow-float flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
            <div className="space-y-2 max-w-2xl relative z-10">
              <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-white/90">
                <Key className="w-3.5 h-3.5 text-school-orangeLight" />
                <span>Angemeldet als {studentName} ({studentCode}) • Klasse {schoolClass}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Dein persönliches Feedbackstudio Deutsch
              </h1>
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                Reiche deine Übungstexte für die Thüringer Abschlussprüfungen (Hauptschul- oder Realschulabschluss) ein, erhalte kriterienorientiertes Stark-Feedback und verbessere deine Noten Schritt für Schritt.
              </p>
            </div>

            <button
              type="button"
              onClick={handleStartNew}
              className="relative z-10 shrink-0 inline-flex items-center justify-center gap-2.5 h-13 px-6 rounded-2xl bg-school-orange hover:bg-school-orangeDark text-white font-extrabold text-sm shadow-lg transition active:scale-[0.98]"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Neue Arbeit einreichen</span>
            </button>
          </div>

          {/* Abgaben-Historie */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-school-blue" />
                <span>Deine bisherigen Ausarbeitungen ({studentSubmissions.length})</span>
              </h2>
            </div>

            {studentSubmissions.length === 0 ? (
              <div className="bg-white border border-school-border rounded-2xl p-10 sm:p-12 text-center space-y-4 shadow-soft">
                <div className="w-16 h-16 mx-auto rounded-full bg-school-blueLight text-school-blue flex items-center justify-center">
                  <FileText className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-800">Noch keine Arbeiten eingereicht</h3>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                    Lade deinen ersten Text hoch (Word, PDF oder Screenshot) oder tippe ihn direkt ein, um eine detaillierte Rückmeldung zu erhalten.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleStartNew}
                  className="inline-flex items-center gap-2 bg-school-blue hover:bg-school-blueDark text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-soft transition"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Jetzt erste Arbeit einreichen</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {studentSubmissions.map((sub) => {
                  const latestVersion = sub.versions[sub.versions.length - 1];
                  const fb = latestVersion?.feedback;
                  const gradeInfo = fb ? getGradeDescriptor(fb.gradeEstimate) : null;
                  const isGradRealschule = sub.graduationType === 'realschule_10';

                  return (
                    <div
                      key={sub.id}
                      onClick={() => handleOpenFeedback(sub, latestVersion)}
                      className="bg-white border border-school-border hover:border-school-blue/50 rounded-2xl p-5 shadow-soft hover:shadow-float transition cursor-pointer flex flex-col justify-between space-y-4 group"
                    >
                      <div className="space-y-2.5">
                        {/* Badges: Textsorte & Abschluss */}
                        <div className="flex flex-wrap items-center justify-between gap-1.5 text-[11px]">
                          <span className={`font-bold px-2 py-0.5 rounded-md ${
                            isGradRealschule
                              ? 'bg-orange-50 text-orange-800 border border-orange-200'
                              : 'bg-blue-50 text-blue-800 border border-blue-200'
                          }`}>
                            {isGradRealschule ? 'Realschule (Kl. 10)' : 'Quali (Kl. 9)'}
                          </span>

                          <span className="font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            v{sub.currentVersion}
                          </span>
                        </div>

                        {/* Aufgabentitel */}
                        <h3 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-school-blue transition line-clamp-2">
                          {sub.taskTitle}
                        </h3>

                        <p className="text-xs text-slate-500 capitalize">
                          Textsorte: <strong className="text-slate-700">{sub.textTypeId}</strong>
                        </p>
                      </div>

                      {/* Noten- & Status-Banner */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        {fb && latestVersion.status !== 'pending_teacher' ? (
                          <div className="flex items-center gap-2">
                            <div className={`px-2.5 py-1 rounded-lg border font-mono font-bold text-xs ${gradeInfo?.bg} ${gradeInfo?.color}`}>
                              Note {fb.gradeEstimate}
                            </div>
                            <span className="text-xs font-semibold text-slate-600">
                              {fb.totalScore} / {fb.maxTotalScore} Pkt
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs text-amber-700 font-semibold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Wartet auf Freigabe</span>
                          </div>
                        )}

                        <span className="text-xs font-bold text-school-blue group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                          <span>Details</span>
                          <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
