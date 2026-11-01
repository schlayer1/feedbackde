// src/components/student/SubmissionEditor.tsx - Textbearbeitung & Multimodaler Upload
import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAllTextTypes } from '../../services/promptRegistry';
import { extractTextFromFile } from '../../services/documentExtractor';
import { evaluateStudentText } from '../../services/evaluationEngine';
import { getClassSetting, createOrUpdateSubmission, addVersionToSubmission } from '../../services/feedbackStore';
import { GraduationType, Submission, SubmissionVersion } from '../../types/feedback';
import { 
  FileText, 
  Upload, 
  Sparkles, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle, 
  FileUp, 
  Image as ImageIcon,
  RotateCcw,
  BookOpen,
  Info
} from 'lucide-react';

interface SubmissionEditorProps {
  existingSubmission?: Submission | null;
  isRevisionMode?: boolean;
  onCancel: () => void;
  onSubmitted: (submission: Submission, version: SubmissionVersion) => void;
}

export const SubmissionEditor: React.FC<SubmissionEditorProps> = ({
  existingSubmission,
  isRevisionMode = false,
  onCancel,
  onSubmitted
}) => {
  const { studentCode, studentName, schoolClass } = useAuth();
  const classSetting = getClassSetting(schoolClass);

  const availableTextTypes = getAllTextTypes();

  // Initialwerte
  const [selectedTextType, setSelectedTextType] = useState<string>(
    existingSubmission?.textTypeId || availableTextTypes[0]?.id || 'eroerterung'
  );
  const [selectedGraduation, setSelectedGraduation] = useState<GraduationType>(
    existingSubmission?.graduationType || classSetting.defaultGraduation || (schoolClass.startsWith('10') ? 'realschule_10' : 'quali_9')
  );
  const [taskTitle, setTaskTitle] = useState<string>(
    existingSubmission?.taskTitle || ''
  );
  const [taskDescription, setTaskDescription] = useState<string>(
    existingSubmission?.taskDescription || ''
  );

  // Vorheriger Text für Revision
  const prevVersion = existingSubmission?.versions[existingSubmission.versions.length - 1];
  const [textContent, setTextContent] = useState<string>(
    isRevisionMode && prevVersion ? prevVersion.textContent : ''
  );

  // Status & Dateiverarbeitung
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractStatus, setExtractStatus] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileType, setUploadedFileType] = useState<'docx' | 'pdf' | 'jpg' | 'png' | 'direct'>('direct');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Zähler
  const wordCount = textContent.trim() ? textContent.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = textContent.length;

  const handleFileUpload = async (file: File) => {
    setErrorMessage(null);
    setIsExtracting(true);
    setExtractStatus(`Lese Datei "${file.name}" ein...`);

    try {
      if (['jpg', 'jpeg', 'png'].includes(file.name.split('.').pop()?.toLowerCase() || '')) {
        setExtractStatus('Screenshot wird per multimodaler KI transkribiert...');
      } else if (file.name.endsWith('.docx')) {
        setExtractStatus('Word-Dokument wird formatiert extrahiert...');
      } else if (file.name.endsWith('.pdf')) {
        setExtractStatus('PDF-Text wird ausgelesen...');
      }

      const res = await extractTextFromFile(file);
      setTextContent(res.text);
      setUploadedFileName(res.fileName);
      setUploadedFileType(res.fileType);
      setExtractStatus(`Text erfolgreich extrahiert (${res.wordCount} Wörter)! Du kannst ihn nun im Editor überprüfen.`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Dateiverarbeitung fehlgeschlagen.');
      setExtractStatus(null);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!taskTitle.trim()) {
      setErrorMessage('Bitte gib das Thema oder die Aufgabenstellung ein.');
      return;
    }

    if (!textContent.trim() || wordCount < 20) {
      setErrorMessage('Der Text ist noch zu kurz für eine didaktische Beurteilung (mindestens 20 Wörter erforderlich).');
      return;
    }

    setIsAnalyzing(true);

    try {
      // 1. KI-Bewertung anfordern
      const feedbackResult = await evaluateStudentText({
        studentText: textContent,
        taskTitle,
        taskDescription,
        textTypeId: selectedTextType,
        graduationType: selectedGraduation,
        studentName,
        studentCode,
        previousVersionText: isRevisionMode && prevVersion ? prevVersion.textContent : undefined
      });

      // 2. Status ermitteln (Hybrid-Modus der Klasse)
      const shouldAutoRelease = classSetting.instantFeedbackAllowed;
      const initialStatus = shouldAutoRelease ? 'auto_released' : 'pending_teacher';

      const nextVersionNum = isRevisionMode && existingSubmission ? existingSubmission.currentVersion + 1 : 1;

      const newVersion: SubmissionVersion = {
        versionNumber: nextVersionNum,
        title: `Version ${nextVersionNum}`,
        textContent,
        wordCount,
        createdAt: new Date().toISOString(),
        feedback: feedbackResult,
        status: initialStatus,
        originalFileName: uploadedFileName || undefined,
        originalFileType: uploadedFileType
      };

      let finalSubmission: Submission;

      if (isRevisionMode && existingSubmission) {
        const updated = addVersionToSubmission(existingSubmission.id, newVersion);
        finalSubmission = updated || existingSubmission;
      } else {
        const newSubId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        finalSubmission = {
          id: newSubId,
          studentCode,
          studentName,
          schoolClass,
          textTypeId: selectedTextType,
          graduationType: selectedGraduation,
          taskTitle,
          taskDescription,
          currentVersion: 1,
          versions: [newVersion],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          latestStatus: initialStatus
        };
        createOrUpdateSubmission(finalSubmission);
      }

      onSubmitted(finalSubmission, newVersion);
    } catch (err: any) {
      setErrorMessage(err.message || 'Die Begutachtung ist fehlgeschlagen. Bitte versuche es erneut.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-12 animate-fadeIn">
      {/* Kopfbereich */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-xl hover:bg-white text-xs font-bold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Abbrechen</span>
        </button>

        <span className="text-xs font-bold text-school-blue bg-school-blueLight px-3 py-1 rounded-full">
          {isRevisionMode ? `Überarbeitung: Version ${existingSubmission?.currentVersion || 1} ➔ Version ${(existingSubmission?.currentVersion || 1) + 1}` : 'Neue Einreichung'}
        </span>
      </div>

      {/* Revisions-Banner */}
      {isRevisionMode && prevVersion && prevVersion.feedback && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-3">
          <RotateCcw className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block">
              Du überarbeitest gerade Version {prevVersion.versionNumber} ({prevVersion.feedback.totalScore} von {prevVersion.feedback.maxTotalScore} Punkten, Note {prevVersion.feedback.gradeEstimate}).
            </span>
            <p className="text-slate-700 text-xs">
              Dein bisheriger Text ist bereits im Editor geladen. Setze die Tipps um und klicke anschließend auf „Überarbeitung prüfen lassen“, um deinen Lernfortschritt zu sehen!
            </p>
          </div>
        </div>
      )}

      {/* Hauptformular */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* GRUNDDATEN: Abschluss & Textsorte */}
        <div className="bg-white border border-school-border rounded-2xl p-5 sm:p-6 shadow-soft space-y-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            1. Rahmenbedingungen festlegen
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Abschlussart */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Ziel-Abschlussprüfung (Thüringen)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={isRevisionMode}
                  onClick={() => setSelectedGraduation('quali_9')}
                  className={`p-3 rounded-xl border text-left transition ${
                    selectedGraduation === 'quali_9'
                      ? 'border-school-blue bg-school-blueLight/50 text-school-blue font-bold shadow-xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="block text-xs uppercase text-slate-500">Klasse 9</span>
                  <span className="text-xs sm:text-sm font-extrabold block">Quali (Hauptschule)</span>
                </button>

                <button
                  type="button"
                  disabled={isRevisionMode}
                  onClick={() => setSelectedGraduation('realschule_10')}
                  className={`p-3 rounded-xl border text-left transition ${
                    selectedGraduation === 'realschule_10'
                      ? 'border-school-orange bg-school-orangeLight text-school-orangeDark font-bold shadow-xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="block text-xs uppercase text-slate-500">Klasse 10</span>
                  <span className="text-xs sm:text-sm font-extrabold block">Realschulabschluss</span>
                </button>
              </div>
            </div>

            {/* Textsorte */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Textsorte
              </label>
              <select
                disabled={isRevisionMode}
                value={selectedTextType}
                onChange={(e) => setSelectedTextType(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-school-blue focus:border-transparent transition"
              >
                {availableTextTypes.map(tt => (
                  <option key={tt.id} value={tt.id}>{tt.title}</option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                {availableTextTypes.find(t => t.id === selectedTextType)?.shortDesc}
              </p>
            </div>
          </div>

          {/* Thema & Aufgabenstellung */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Thema / Fragestellung der Arbeit *
              </label>
              <input
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="z. B. Sollten Handys an der Heimbürgeschule erlaubt sein?"
                className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-school-blue focus:border-transparent transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Zusätzliche Materialien / Hinweistexte (optional)
              </label>
              <input
                type="text"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="z. B. Basierend auf dem Textauszug 'Digitalpakt' oder Gedicht von Wolfenstein..."
                className="w-full h-9 px-3.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-school-blue focus:border-transparent transition"
              />
            </div>
          </div>
        </div>

        {/* 2. DATEI-UPLOAD & MULTIMODALE EXTRAKTION */}
        {!isRevisionMode && (
          <div className="bg-white border border-school-border rounded-2xl p-5 sm:p-6 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                2. Datei hochladen (Word, PDF oder Screenshot-Foto)
              </h2>
              <span className="text-[11px] text-slate-400">Optional (oder direkt unten tippen)</span>
            </div>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-school-border hover:border-school-blue bg-school-bg/60 hover:bg-school-blueLight/20 rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".docx,.pdf,.jpg,.jpeg,.png,.txt"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />

              <div className="w-12 h-12 mx-auto rounded-full bg-white border border-school-border shadow-xs flex items-center justify-center text-school-blue group-hover:scale-110 transition-transform mb-3">
                <FileUp className="w-6 h-6" />
              </div>

              <p className="text-sm font-bold text-slate-800">
                Klicke hier oder ziehe eine Datei per Drag & Drop hinein
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Unterstützt werden Word (.docx), PDF (.pdf) sowie Screenshots und Fotos (.jpg, .png)
              </p>
            </div>

            {/* Extraktions-Status / Spinner */}
            {isExtracting && (
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-school-blue text-xs flex items-center gap-2 animate-pulse">
                <Sparkles className="w-4 h-4 shrink-0 animate-spin" />
                <span className="font-bold">{extractStatus}</span>
              </div>
            )}

            {extractStatus && !isExtracting && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{extractStatus}</span>
              </div>
            )}
          </div>
        )}

        {/* 3. LIVE-TEXTEDITOR */}
        <div className="bg-white border border-school-border rounded-2xl p-5 sm:p-6 shadow-soft space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              3. Schülertext kontrollieren & bearbeiten
            </h2>
            <div className="flex items-center gap-3 text-xs font-mono font-bold text-slate-600">
              <span>{wordCount} Wörter</span>
              <span>•</span>
              <span>{charCount} Zeichen</span>
            </div>
          </div>

          <textarea
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            placeholder="Schreibe deinen Text hier oder füge ihn ein..."
            rows={14}
            className="w-full p-4 rounded-xl border border-slate-300 bg-white font-sans text-sm leading-relaxed text-slate-800 focus:outline-none focus:ring-2 focus:ring-school-blue focus:border-transparent transition resize-y"
            required
          />

          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Tipp: Formuliere in klaren Absätzen für Einleitung, Hauptteil und Schluss.</span>
            {textContent && (
              <button
                type="button"
                onClick={() => setTextContent('')}
                className="text-slate-400 hover:text-rose-600 transition"
              >
                Text leeren
              </button>
            )}
          </div>
        </div>

        {/* Fehlermeldung */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ABSENDE-BUTTON */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-bold transition"
          >
            Abbrechen
          </button>

          <button
            type="submit"
            disabled={isAnalyzing || isExtracting || !textContent.trim() || wordCount < 20}
            className="h-12 px-6 rounded-xl bg-school-blue hover:bg-school-blueDark disabled:opacity-50 text-white text-sm font-extrabold shadow-soft transition flex items-center gap-2 active:scale-[0.98]"
          >
            {isAnalyzing ? (
              <>
                <Sparkles className="w-5 h-5 animate-spin" />
                <span>KI analysiert Text nach Thüringer Kriterien...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>
                  {isRevisionMode ? 'Version 2 prüfen lassen' : 'Text einreichen & Stark-Feedback anfordern'}
                </span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
