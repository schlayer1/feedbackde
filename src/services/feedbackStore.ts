// src/services/feedbackStore.ts - Persistenz für Abgaben, Versionen und Klasseneinstellungen
import { Submission, SubmissionVersion, ClassSettings, SubmissionStatus } from '../types/feedback';

const STORAGE_KEYS = {
  SUBMISSIONS: 'fbs_submissions_v1',
  CLASS_SETTINGS: 'fbs_class_settings_v1',
  FIREBASE_CONFIG: 'fbs_firebase_config_v1',
};

// Initialklassen 9a bis 9c und 10a bis 10c
export const INITIAL_CLASSES: string[] = ['9a', '9b', '9c', '10a', '10b', '10c'];

// Standard-Klasseneinstellungen
export const DEFAULT_CLASS_SETTINGS: Record<string, ClassSettings> = {
  '9a': { classId: '9a', instantFeedbackAllowed: true, defaultGraduation: 'quali_9' },
  '9b': { classId: '9b', instantFeedbackAllowed: true, defaultGraduation: 'quali_9' },
  '9c': { classId: '9c', instantFeedbackAllowed: true, defaultGraduation: 'quali_9' },
  '10a': { classId: '10a', instantFeedbackAllowed: false, defaultGraduation: 'realschule_10' }, // Prüfungsmodus mit Freigabe
  '10b': { classId: '10b', instantFeedbackAllowed: true, defaultGraduation: 'realschule_10' },
  '10c': { classId: '10c', instantFeedbackAllowed: true, defaultGraduation: 'realschule_10' },
};

// Muster-Schülerabgaben zur sofortigen Veranschaulichung im Lehrerdashboard
const SAMPLE_SUBMISSIONS: Submission[] = [
  {
    id: 'sub_sample_1',
    studentCode: 'LMUE',
    studentName: 'Lukas Müller',
    schoolClass: '9a',
    textTypeId: 'eroerterung',
    graduationType: 'quali_9',
    taskTitle: 'Sollten Handys im Schulunterricht an der Heimbürgeschule erlaubt sein?',
    currentVersion: 1,
    latestStatus: 'auto_released',
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    versions: [
      {
        versionNumber: 1,
        title: 'Version 1',
        textContent: 'Handys sind heute aus unserem Alltag nicht mehr wegzudenken. Viele Jugendliche verbringen täglich Stunden am Smartphone. Doch gehört das Handy auch in die Schule?\n\nEin wichtiger Grund dafür ist die schnelle Recherche im Unterricht. Wenn wir im Fach Geografie oder Deutsch nach Fakten suchen müssen, hat man mit dem Smartphone in wenigen Sekunden eine Antwort. Außerdem können wir Lernapps und digitale Vokabeltrainer nutzen.\n\nDemgegenüber steht jedoch die enorme Ablenkung. Viele Schüler spielen während der Arbeitsphase heimlich Videospiele oder chatten über WhatsApp. Das stört die Konzentration.\n\nMeiner Meinung nach sollten Handys nicht komplett verboten, sondern gezielt mit Erlaubnis des Lehrers genutzt werden.',
        wordCount: 114,
        createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
        status: 'auto_released',
        feedback: {
          gradeEstimate: 2,
          totalScore: 82,
          maxTotalScore: 100,
          percentage: 82,
          summaryTitle: 'Guter Argumentationsansatz mit klarem Pro-Contra-Aufbau',
          overallImpression: 'Du hast beide Seiten der Fragestellung beleuchtet und ein ausgewogenes Fazit gezogen. Die Gliederung ist für Klasse 9 sehr übersichtlich.',
          criteriaResults: [
            { criterionId: 'aufbau_gliederung', title: 'Aufbau & Gliederung', achievedPoints: 22, maxPoints: 25, status: 'passed', comment: 'Einleitung, Hauptteil und Schluss sind klar getrennt.' },
            { criterionId: 'argumentation_belege', title: 'Argumente & Lebensweltbezug', achievedPoints: 28, maxPoints: 35, status: 'partially', comment: 'Die Argumente sind gut, könnten aber noch durch eigene Erfahrungen untermauert werden.' },
            { criterionId: 'ausdruck_satzbau', title: 'Sprachlicher Ausdruck & Verknüpfungen', achievedPoints: 16, maxPoints: 20, status: 'passed', comment: 'Treffende Verbindungswörter wie "Demgegenüber steht" und "Außerdem".' },
            { criterionId: 'rechtschreibung_grammatik', title: 'Rechtschreibung & Sprachrichtigkeit', achievedPoints: 16, maxPoints: 20, status: 'passed', comment: 'Sehr wenige Fehler, Kommasetzung bei Nebensätzen überwiegend sicher.' }
          ],
          strengths: [
            { quote: 'Wenn wir im Fach Geografie oder Deutsch nach Fakten suchen müssen', explanation: 'Konkreter Bezug zu Schulfächern macht das Argument greifbar.' }
          ],
          improvements: [
            { quote: 'Meiner Meinung nach sollten Handys nicht komplett verboten', issue: 'Das Fazit könnte durch einen konkreten Regelvorschlag noch überzeugender wirken.', suggestion: 'Ergänze z. B.: "Ein bewährtes Modell wäre ein Handyparkplatz vorn im Klassenzimmer."' }
          ],
          examTips: [
            'Prüfungstipp Thüringen: Schließe jedes Argument mit einer klaren Folgerung ("Daraus ergibt sich...") ab.'
          ]
        }
      }
    ]
  },
  {
    id: 'sub_sample_2',
    studentCode: 'ESCH',
    studentName: 'Emma Schmidt',
    schoolClass: '10a',
    textTypeId: 'gedichtanalyse',
    graduationType: 'realschule_10',
    taskTitle: 'Gedichtanalyse zu "Städter" von Alfred Wolfenstein',
    currentVersion: 1,
    latestStatus: 'pending_teacher', // Im Prüfungsmodus: Wartet auf Freigabe
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    versions: [
      {
        versionNumber: 1,
        title: 'Version 1',
        textContent: 'Das expressionistische Gedicht "Städter" von Alfred Wolfenstein aus dem Jahr 1914 thematisiert die Anonymität und seelische Isolation des Individuums in der modernen Großstadt.\n\nMeine Deutungshypothese lautet, dass Wolfenstein die räumliche Enge als paradoxen Auslöser für emotionale Entfremdung darstellt. Die Menschen leben Wand an Wand, sind sich aber innerlich völlig fremd.\n\nFormal besteht das Werk aus 14 Versen in vier Strophen und folgt der Form des Sonetts (zwei Quartette, zwei Terzette). Das Versmaß ist ein regelmäßiger fünfhebiger Jambus.\n\nBereits in der ersten Strophe verwendet der Autor die Metapher "Dicht wie Löcher eines Siebes stehn Fenster beieinander" (V. 1f.), um die drangvolle Nähe plastisch vor Augen zu führen.',
        wordCount: 108,
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        status: 'pending_teacher',
        feedback: {
          gradeEstimate: 2,
          totalScore: 84,
          maxTotalScore: 100,
          percentage: 84,
          summaryTitle: 'Präzise Deutungshypothese und sichere formale Einordnung',
          overallImpression: 'Hervorragende Einleitung mit vollständigem Basissatz und gut begründeter Deutungshypothese für den Realschulabschluss.',
          criteriaResults: [
            { criterionId: 'deutungshypothese_einleitung', title: 'Einleitung & Deutungshypothese', achievedPoints: 18, maxPoints: 20, status: 'passed', comment: 'Exzellenter Basissatz und treffende Deutungshypothese.' },
            { criterionId: 'metrik_formale_analyse', title: 'Formale Analyse', achievedPoints: 22, maxPoints: 25, status: 'passed', comment: 'Sonettform und Versmaß korrekt erkannt.' },
            { criterionId: 'rhetorik_textbelege', title: 'Wirkungsanalyse rhetorischer Mittel', achievedPoints: 20, maxPoints: 25, status: 'passed', comment: 'Metapher richtig zitiert mit Versangabe.' },
            { criterionId: 'fazit_epochenbezug', title: 'Synthese & Epochenkontext', achievedPoints: 12, maxPoints: 15, status: 'partially', comment: 'Expressionistischer Kontext kann noch weiter vertieft werden.' },
            { criterionId: 'rechtschreibung_zitiertechnik', title: 'Fachsprache, Zitiertechnik & Norm', achievedPoints: 12, maxPoints: 15, status: 'passed', comment: 'Saubere Zitierweise (V. 1f.).' }
          ],
          strengths: [
            { quote: 'dass Wolfenstein die räumliche Enge als paradoxen Auslöser für emotionale Entfremdung darstellt', explanation: 'Treffende Erfassung des Leitmotivs Expressionismus.' }
          ],
          improvements: [
            { quote: 'Formal besteht das Werk aus 14 Versen', issue: 'Gehe noch auf die Kadenzen (männlich/weiblich) und das Reimschema ein.', suggestion: 'Ergänze z. B.: "Die Quartette weisen einen umarmenden Reim (abba) auf."' }
          ],
          examTips: [
            'Prüfungstipp Realschule: Belege jede Stilaussage mit mindestens einem Zitat und Zeilenangabe.'
          ]
        }
      }
    ]
  }
];

export function getSubmissions(): Submission[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
    if (raw) {
      const parsed: Submission[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Fehler beim Laden der Abgaben:', e);
  }
  // Initialisiere mit Beispielen
  localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(SAMPLE_SUBMISSIONS));
  return SAMPLE_SUBMISSIONS;
}

export function saveSubmissions(list: Submission[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(list));
  } catch (e) {
    console.error('Konnte Abgaben nicht speichern:', e);
  }
}

export function getStudentSubmissions(studentCode: string): Submission[] {
  const all = getSubmissions();
  const cleanCode = (studentCode || '').trim().toUpperCase();
  return all.filter(s => s.studentCode.toUpperCase() === cleanCode);
}

export function getSubmissionById(id: string): Submission | undefined {
  const all = getSubmissions();
  return all.find(s => s.id === id);
}

export function createOrUpdateSubmission(sub: Submission): void {
  const all = getSubmissions();
  const index = all.findIndex(s => s.id === sub.id);
  if (index >= 0) {
    all[index] = { ...sub, updatedAt: new Date().toISOString() };
  } else {
    all.unshift({ ...sub, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }
  saveSubmissions(all);
}

export function addVersionToSubmission(submissionId: string, newVersion: SubmissionVersion): Submission | null {
  const all = getSubmissions();
  const index = all.findIndex(s => s.id === submissionId);
  if (index < 0) return null;

  const current = all[index];
  const updatedVersions = [...current.versions, newVersion];
  const updatedSub: Submission = {
    ...current,
    currentVersion: newVersion.versionNumber,
    versions: updatedVersions,
    latestStatus: newVersion.status,
    updatedAt: new Date().toISOString()
  };

  all[index] = updatedSub;
  saveSubmissions(all);
  return updatedSub;
}

export function updateSubmissionStatus(
  submissionId: string, 
  versionNumber: number, 
  newStatus: SubmissionStatus, 
  teacherNote?: string
): Submission | null {
  const all = getSubmissions();
  const index = all.findIndex(s => s.id === submissionId);
  if (index < 0) return null;

  const sub = all[index];
  const updatedVersions = sub.versions.map(v => {
    if (v.versionNumber === versionNumber) {
      return {
        ...v,
        status: newStatus,
        feedback: v.feedback ? {
          ...v.feedback,
          teacherNote: teacherNote !== undefined ? teacherNote : v.feedback.teacherNote
        } : undefined
      };
    }
    return v;
  });

  const latestV = updatedVersions[updatedVersions.length - 1];
  const updatedSub: Submission = {
    ...sub,
    versions: updatedVersions,
    latestStatus: latestV ? latestV.status : newStatus,
    updatedAt: new Date().toISOString()
  };

  all[index] = updatedSub;
  saveSubmissions(all);
  return updatedSub;
}

export function getAllClassSettings(): Record<string, ClassSettings> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLASS_SETTINGS);
    if (raw) {
      return { ...DEFAULT_CLASS_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn('Fehler beim Laden der Klasseneinstellungen:', e);
  }
  return DEFAULT_CLASS_SETTINGS;
}

export function getClassSetting(classId: string): ClassSettings {
  const all = getAllClassSettings();
  if (all[classId]) return all[classId];
  return {
    classId,
    instantFeedbackAllowed: true,
    defaultGraduation: classId.startsWith('10') ? 'realschule_10' : 'quali_9'
  };
}

export function saveClassSetting(setting: ClassSettings): void {
  try {
    const all = getAllClassSettings();
    all[setting.classId] = setting;
    localStorage.setItem(STORAGE_KEYS.CLASS_SETTINGS, JSON.stringify(all));
  } catch (e) {
    console.error('Konnte Klasseneinstellung nicht speichern:', e);
  }
}
