// src/types/feedback.ts - Datenmodell für Textsorten, Stark-Kriterien und Einreichungen

export type GraduationType = 'quali_9' | 'realschule_10';

export interface TextTypeDefinition {
  id: string; // z.B. 'eroerterung', 'gedichtanalyse', 'tagebuch', 'aufsatz', 'sachtext'
  title: string;
  shortDesc: string;
  category: 'argumentieren' | 'analysieren' | 'gestalten' | 'informieren';
  icon: string;
  allowedGraduations: GraduationType[];
  isCustom?: boolean;
}

export interface CriterionItem {
  id: string;
  title: string; // z.B. "Inhalt & Argumentationsaufbau"
  description: string; // Leitfragen & Erwartungshorizont
  maxPoints: number; // z.B. 40
  weightPercentage: number; // z.B. 40%
}

export interface PromptConfig {
  textTypeId: string;
  graduationType: GraduationType;
  title: string;
  systemPrompt: string;
  criteria: CriterionItem[];
  updatedAt?: string;
  isCustomized?: boolean;
}

export interface EvaluatedCriterion {
  criterionId: string;
  title: string;
  achievedPoints: number;
  maxPoints: number;
  status: 'passed' | 'partially' | 'needs_work';
  comment: string;
}

export interface StarkFeedbackResult {
  gradeEstimate: number; // 1 bis 6 nach Thüringer Regelschulschlüssel
  totalScore: number; // Erreichte Punkte (z.B. 78)
  maxTotalScore: number; // z.B. 100
  percentage: number; // z.B. 78%
  summaryTitle: string; // z.B. "Solide dialektische Argumentation mit Ausbaupotenzial im Fazit"
  overallImpression: string; // Fließtext-Würdigung
  criteriaResults: EvaluatedCriterion[];
  strengths: {
    quote: string;
    explanation: string;
  }[];
  improvements: {
    quote: string;
    issue: string;
    suggestion: string;
  }[];
  examTips: string[]; // Konkrete Tipps für die Thüringer Abschlussprüfung
  teacherNote?: string; // Manuelle Ergänzung der Lehrkraft
}

export type SubmissionStatus = 
  | 'draft'               // Vorbereitung im Editor
  | 'analyzing'           // KI analysiert gerade
  | 'auto_released'       // Sofort freigegeben (im Sofort-Modus)
  | 'pending_teacher'     // Wartet auf Freigabe durch Lehrkraft (im Freigabe-Modus)
  | 'released_by_teacher' // Durch Lehrkraft freigegeben & ggf. kommentiert
  | 'revised';            // Schüler hat neuere Version erstellt

export interface SubmissionVersion {
  versionNumber: number; // 1, 2, 3 ...
  title: string;
  textContent: string;
  wordCount: number;
  createdAt: string;
  feedback?: StarkFeedbackResult;
  status: SubmissionStatus;
  originalFileName?: string;
  originalFileType?: 'docx' | 'pdf' | 'jpg' | 'png' | 'direct';
}

export interface Submission {
  id: string;
  studentCode: string; // z.B. "LMUE"
  studentName: string;
  schoolClass: string; // z.B. "9a", "10b"
  textTypeId: string;
  graduationType: GraduationType;
  taskTitle: string;
  taskDescription?: string;
  currentVersion: number;
  versions: SubmissionVersion[];
  createdAt: string;
  updatedAt: string;
  latestStatus: SubmissionStatus;
}

export interface ClassSettings {
  classId: string; // z.B. "9a"
  instantFeedbackAllowed: boolean; // true = Sofort-Feedback aktiv, false = Freigabe erforderlich
  defaultGraduation: GraduationType;
  customNotes?: string;
}
