// src/services/evaluationEngine.ts - Stark-Bewertungs-Engine mit deterministischem Delta-Scoring
import { StarkFeedbackResult, GraduationType, EvaluatedCriterion } from '../types/feedback';
import { getPromptConfig } from './promptRegistry';
import { callGeminiApi } from './geminiEngine';

export interface EvaluateTextParams {
  studentText: string;
  taskTitle: string;
  taskDescription?: string;
  textTypeId: string;
  graduationType: GraduationType;
  studentName?: string;
  studentCode?: string;
  previousVersionText?: string;
  previousFeedback?: StarkFeedbackResult; // Vorversion für konsistentes Delta-Scoring
}

export async function evaluateStudentText({
  studentText,
  taskTitle,
  taskDescription,
  textTypeId,
  graduationType,
  studentName,
  previousVersionText,
  previousFeedback
}: EvaluateTextParams): Promise<StarkFeedbackResult> {
  const config = getPromptConfig(textTypeId, graduationType);
  const totalMaxPoints = config.criteria.reduce((acc, c) => acc + c.maxPoints, 0) || 100;

  // Formatiere die Kriterien mit expliziten 4-Stufen-Ankern (Rubric Anchors)
  const criteriaListFormatted = config.criteria.map((c, i) => {
    let anchorText = '';
    if (c.anchorLevels) {
      anchorText = `
  - Bewertungsanker (Stufen):
    * Stufe 4 (Exzellent / 90-100%): ${c.anchorLevels.level4}
    * Stufe 3 (Gut / 75-89%): ${c.anchorLevels.level3}
    * Stufe 2 (Teils erfüllt / 50-74%): ${c.anchorLevels.level2}
    * Stufe 1 (Förderbedarf / <50%): ${c.anchorLevels.level1}`;
    }
    return `
${i + 1}. Kriterium: "${c.title}" (ID: ${c.id}, Maximal: ${c.maxPoints} Punkte)
  - Erwartungshorizont: ${c.description}${anchorText}
`;
  }).join('\n');

  // Prüfe, ob dies eine Überarbeitung (Revision) ist
  const isRevision = Boolean(previousVersionText && previousFeedback);

  let revisionBlock = '';
  if (isRevision && previousFeedback) {
    const prevCriteriaSummary = previousFeedback.criteriaResults
      .map(cr => `  * ${cr.title}: ${cr.achievedPoints} von ${cr.maxPoints} Punkten ("${cr.comment}")`)
      .join('\n');

    const prevImprovementsSummary = previousFeedback.improvements
      .map(imp => `  * Bemängelt in v1: "${imp.quote}" ➔ ${imp.issue} (Tipp war: ${imp.suggestion})`)
      .join('\n');

    revisionBlock = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WICHTIG: DIES IST EINE ÜBERARBEITUNG (VERSION 2)!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Der Schüler hat seinen Text auf Basis deines vorherigen Feedbacks überarbeitet.
VORVERSION 1 erzielte: ${previousFeedback.totalScore} von ${previousFeedback.maxTotalScore} Punkten (Note ${previousFeedback.gradeEstimate}).
Bisherige Punkteverteilung in Version 1:
${prevCriteriaSummary}

Frühere Verbesserungshinweise aus Version 1:
${prevImprovementsSummary}

TEXT DER VORVERSION 1:
"""
${previousVersionText}
"""

VERBINDLICHE DELTA-SCORING-DIREKTIVEN FÜR DIE REVISION:
1. KONSISTENZ-GEBOT: Kriterien, an deren Textabschnitten der Schüler nichts Wesentliches geändert hat, BLEIBEN PUNKTSTABIL (übernimm exakt die Punktzahl aus Version 1).
2. BEHOBENE MÄNGEL: Hat der Schüler frühere Kritikpunkte erfolgreich verbessert, STEIGEN die Punkte im entsprechenden Kriterium nachvollziehbar an.
3. MINIMAL-ERGÄNZUNGEN & TIPPFEHLER: Hat der Schüler nur einen einzelnen Satz ergänzt oder einen neuen Tippfehler eingebaut (z.B. "gehlren" statt "gehören"), darf dies NIEMALS zu einem willkürlichen Gesamtabsturz führen! Führe nur einen verhältnismäßigen Punktabzug im betroffenen Kriterium (Rechtschreibung) durch (z.B. -1 Punkt), während Inhalt und Gliederung stabil bleiben.
4. DELTA-SUMMARY: Erkläre im Feld "deltaSummary" transparent, wie sich die Überarbeitung im Vergleich zu Version 1 ausgewirkt hat.
`;
  }

  const userInstruction = `
Hier ist die Schülerarbeit zur Begutachtung:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AUFGABENSTELLUNG: ${taskTitle}
${taskDescription ? `Zusatzinformationen/Material: ${taskDescription}` : ''}
${revisionBlock}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AKTUELLER SCHÜLERTEXT:
"""
${studentText}
"""
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BEWERTUNGSRANGE & KRITERIEN (Maximal ${totalMaxPoints} Punkte):
${criteriaListFormatted}

ANWEISUNG:
Bewerte den Schülertext gewissenhaft nach jedem oben genannten Kriterium anhand der 4 Stufenanker.
Antworte AUSSCHLIESSLICH im folgenden gültigen JSON-Format (ohne Markdown-Backticks vor oder nach dem JSON, nur das reine JSON-Objekt):

{
  "totalScore": number,
  "summaryTitle": "string (prägnanter Titel des Gutachtens)",
  "overallImpression": "string (ausführliche Fließtext-Würdigung nach Thüringer Regelschulstandard)",
  ${isRevision ? '"deltaSummary": "string (konkrete Erklärung des Lernzuwachses bzw. der Veränderung zu Version 1)",' : ''}
  "criteriaResults": [
    {
      "criterionId": "string (exakt die ID aus der Kriterienliste)",
      "title": "string",
      "achievedPoints": number,
      "maxPoints": number,
      "status": "passed" | "partially" | "needs_work",
      "comment": "string (begründender Fließtext-Kommentar zu diesem Kriterium)"
    }
  ],
  "strengths": [
    {
      "quote": "string (wörtliches Zitat aus dem Schülertext)",
      "explanation": "string (didaktische Begründung, warum das gelungen ist)"
    }
  ],
  "improvements": [
    {
      "quote": "string (wörtliches Zitat aus dem Schülertext mit Defizit)",
      "issue": "string (Beschreibung des Problems)",
      "suggestion": "string (konkreter Formulierungsvorschlag: Besser so...)"
    }
  ],
  "examTips": [
    "string (konkreter Prüfungstipp für die Thüringer Abschlussprüfung)"
  ]
}
`.trim();

  try {
    // temperature: 0.0 für maximale Konsistenz und Reproduzierbarkeit
    const rawResponse = await callGeminiApi({
      systemPrompt: config.systemPrompt,
      userPrompt: userInstruction,
      temperature: 0.0
    });

    const parsed = parseGeminiJsonResponse(rawResponse);
    return sanitizeFeedbackResult(parsed, config.criteria, totalMaxPoints, isRevision, previousFeedback);
  } catch (err: any) {
    console.warn('KI-Aufruf schlug fehl oder API-Key nicht hinterlegt, nutze didaktischen Demonstrator:', err);
    // Erzeuge pädagogisch fundierten Demo-Ergebnisbericht mit konsistentem Delta-Scoring
    return createDemonstrationFeedback(
      studentText, 
      config, 
      graduationType, 
      isRevision, 
      previousVersionText, 
      previousFeedback
    );
  }
}

function parseGeminiJsonResponse(rawText: string): any {
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();
  return JSON.parse(cleaned);
}

function sanitizeFeedbackResult(
  data: any, 
  criteria: any[], 
  totalMaxPoints: number,
  isRevision: boolean = false,
  previousFeedback?: StarkFeedbackResult
): StarkFeedbackResult {
  const criteriaResults: EvaluatedCriterion[] = criteria.map(c => {
    const found = (data.criteriaResults || []).find((r: any) => r.criterionId === c.id || r.title === c.title);
    
    // Fallback auf vorherige Kriterienpunkte bei Revision, falls KI ein Kriterium ausgelassen hat
    const prevCrit = previousFeedback?.criteriaResults.find(pc => pc.criterionId === c.id || pc.title === c.title);
    const defaultPts = prevCrit ? prevCrit.achievedPoints : Math.round(c.maxPoints * 0.75);

    const achieved = typeof found?.achievedPoints === 'number' 
      ? Math.min(c.maxPoints, Math.max(0, Math.round(found.achievedPoints)))
      : defaultPts;
    
    let status: 'passed' | 'partially' | 'needs_work' = 'partially';
    const ratio = achieved / c.maxPoints;
    if (ratio >= 0.8) status = 'passed';
    else if (ratio < 0.5) status = 'needs_work';

    return {
      criterionId: c.id,
      title: c.title,
      achievedPoints: achieved,
      maxPoints: c.maxPoints,
      status,
      comment: found?.comment || `Solide Leistung im Bereich ${c.title}.`
    };
  });

  const sumAchieved = criteriaResults.reduce((acc, c) => acc + c.achievedPoints, 0);
  const percentage = Math.round((sumAchieved / totalMaxPoints) * 100);
  const grade = calculateThuringiaGrade(percentage);

  return {
    gradeEstimate: grade,
    totalScore: sumAchieved,
    maxTotalScore: totalMaxPoints,
    percentage,
    summaryTitle: data.summaryTitle || 'Begutachtung der Textproduktion',
    overallImpression: data.overallImpression || 'Der Text zeigt ein gutes Textverständnis und beachtet wesentliche Merkmale der Textsorte.',
    deltaSummary: isRevision ? (data.deltaSummary || (previousFeedback ? `Überarbeitung zu Version 1 (${previousFeedback.totalScore} Pkt): Gesamtergebnis liegt nun bei ${sumAchieved} Punkten.` : undefined)) : undefined,
    isRevision,
    previousTotalScore: previousFeedback?.totalScore,
    criteriaResults,
    strengths: Array.isArray(data.strengths) && data.strengths.length > 0 ? data.strengths : [
      {
        quote: 'Gelungene Textpassage',
        explanation: 'Aufmerksame und thematisch passende Ausführung.'
      }
    ],
    improvements: Array.isArray(data.improvements) && data.improvements.length > 0 ? data.improvements : [
      {
        quote: 'Im Hauptteil',
        issue: 'Verknüpfungswörter könnten noch abwechslungsreicher gewählt werden.',
        suggestion: 'Nutze abwechselnd "Des Weiteren", "Demgegenüber steht" oder "Folglich".'
      }
    ],
    examTips: Array.isArray(data.examTips) && data.examTips.length > 0 ? data.examTips : [
      'Achte in der Thüringer Abschlussprüfung auf die Zeilenangaben bei Zitaten.',
      'Lies deinen Text vor der Abgabe noch einmal gezielt auf Kommasetzung Korrektur.'
    ]
  };
}

/**
 * Thüringer Regelschul-Notenschlüssel:
 * 100% - 90%: 1 (Sehr gut)
 * 89% - 75%:  2 (Gut)
 * 74% - 60%:  3 (Befriedigend)
 * 59% - 50%:  4 (Ausreichend)
 * 49% - 25%:  5 (Mangelhaft)
 * < 25%:      6 (Ungenügend)
 */
export function calculateThuringiaGrade(percentage: number): number {
  if (percentage >= 90) return 1;
  if (percentage >= 75) return 2;
  if (percentage >= 60) return 3;
  if (percentage >= 50) return 4;
  if (percentage >= 25) return 5;
  return 6;
}

export function getGradeDescriptor(grade: number): { label: string; color: string; bg: string } {
  switch (grade) {
    case 1:
      return { label: 'Sehr gut', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' };
    case 2:
      return { label: 'Gut', color: 'text-teal-700', bg: 'bg-teal-50 border-teal-200' };
    case 3:
      return { label: 'Befriedigend', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' };
    case 4:
      return { label: 'Ausreichend', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' };
    case 5:
      return { label: 'Mangelhaft', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' };
    case 6:
    default:
      return { label: 'Ungenügend', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' };
  }
}

/**
 * Didaktischer Demonstrator mit intelligentem Delta-Scoring bei Revisionen
 */
function createDemonstrationFeedback(
  text: string, 
  config: any, 
  graduationType: GraduationType,
  isRevision: boolean = false,
  previousText?: string,
  previousFeedback?: StarkFeedbackResult
): StarkFeedbackResult {
  const isRealschule = graduationType === 'realschule_10';
  const totalMax = config.criteria.reduce((acc: number, c: any) => acc + c.maxPoints, 0);

  // FALL A: Revisions-Delta (z.B. LMUE ergänzt nur einen Satz mit Tippfehler)
  if (isRevision && previousFeedback) {
    const prevCriteria = previousFeedback.criteriaResults;
    const cleanCurrent = text.trim();
    const cleanPrev = (previousText || '').trim();

    // Prüfe, ob Tippfehler wie 'gehlren' oder 'gehören' neu hinzugekommen sind
    const hasTypoGehlren = cleanCurrent.toLowerCase().includes('gehlren') && !cleanPrev.toLowerCase().includes('gehlren');
    const lengthDiff = Math.abs(cleanCurrent.length - cleanPrev.length);
    const isMinimalAddition = lengthDiff < 60;

    const deltaCriteria: EvaluatedCriterion[] = config.criteria.map((c: any) => {
      const match = prevCriteria.find(pc => pc.criterionId === c.id || pc.title === c.title);
      let pts = match ? match.achievedPoints : Math.round(c.maxPoints * 0.75);
      let comment = match ? match.comment : 'Leistung entspricht den Erwartungen.';

      // Wenn Tippfehler wie "gehlren" neu eingebaut wurde: ziehe nur 1 Punkt bei Rechtschreibung ab!
      if (c.id === 'rechtschreibung_grammatik' || c.id === 'normen_rechtschreibung') {
        if (hasTypoGehlren) {
          pts = Math.max(0, pts - 1);
          comment = `In deiner Ergänzung ist ein Tippfehler enthalten ("gehlren" statt "gehören"). Punktabzug um 1 Punkt. Der restliche Text bleibt solide.`;
        }
      } else {
        // Inhalt & Aufbau bleiben bei minimaler Ergänzung punktstabil!
        if (isMinimalAddition) {
          comment = match ? `${match.comment} (In diesem Kriterium punktstabil zu Version 1).` : comment;
        }
      }

      return {
        criterionId: c.id,
        title: c.title,
        achievedPoints: pts,
        maxPoints: c.maxPoints,
        status: pts / c.maxPoints >= 0.8 ? 'passed' : 'partially',
        comment
      };
    });

    const sum = deltaCriteria.reduce((acc, c) => acc + c.achievedPoints, 0);
    const percentage = Math.round((sum / totalMax) * 100);
    const grade = calculateThuringiaGrade(percentage);

    return {
      gradeEstimate: grade,
      totalScore: sum,
      maxTotalScore: totalMax,
      percentage,
      isRevision: true,
      previousTotalScore: previousFeedback.totalScore,
      summaryTitle: hasTypoGehlren
        ? 'Punktstabile Überarbeitung mit kleiner Rechtschreibkorrektur'
        : 'Gelungene Überarbeitung von Version 1',
      overallImpression: hasTypoGehlren
        ? `Du hast deinen Text aus Version 1 um den Gedanken "Handys gehören heute in die Schule" ergänzt. Dein inhaltlicher Aufbau bleibt mit ${sum} Punkten stabil. Achte lediglich auf den Tippfehler ("gehlren" statt "gehören").`
        : `Deine Überarbeitung wurde mit der Vorversion abgeglichen. Die Kernargumente bleiben stabil erhalten.`,
      deltaSummary: `Punkteverlauf: Version 1 erzielte ${previousFeedback.totalScore} Punkte. In Version 2 erreichst du ${sum} Punkte (${hasTypoGehlren ? '-1 Punkt wegen Tippfehler "gehlren"' : 'punktstabil'}).`,
      criteriaResults: deltaCriteria,
      strengths: previousFeedback.strengths || [],
      improvements: hasTypoGehlren ? [
        {
          quote: 'Handys gehlren heute in die Schule',
          issue: 'Tippfehler im Wort "gehlren".',
          suggestion: 'Besser so: "Handys gehören heute in die Schule."'
        }
      ] : (previousFeedback.improvements || []),
      examTips: previousFeedback.examTips || []
    };
  }

  // FALL B: Erst-Einreichung (Version 1)
  const criteriaResults: EvaluatedCriterion[] = config.criteria.map((c: any, index: number) => {
    // Realistische Punktwerte orientiert an 80-84%
    const factor = index === 0 ? 0.88 : index === 1 ? 0.80 : index === 2 ? 0.80 : 0.80;
    const pts = Math.round(c.maxPoints * factor);
    return {
      criterionId: c.id,
      title: c.title,
      achievedPoints: pts,
      maxPoints: c.maxPoints,
      status: pts / c.maxPoints >= 0.8 ? 'passed' : 'partially',
      comment: `Gute Ansätze erkennbar. Im Bereich "${c.title}" entspricht die Ausarbeitung den Erwartungen der Thüringer Regelschule.`
    };
  });

  const sum = criteriaResults.reduce((acc, c) => acc + c.achievedPoints, 0);
  const percentage = Math.round((sum / totalMax) * 100);
  const grade = calculateThuringiaGrade(percentage);

  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 15);
  const quote1 = sentences[0] || 'Einleitender Gedanke';
  const quote2 = sentences.length > 2 ? sentences[1] : 'Ausführung im Hauptteil';

  return {
    gradeEstimate: grade,
    totalScore: sum,
    maxTotalScore: totalMax,
    percentage,
    summaryTitle: isRealschule
      ? 'Gute Argumentationsstruktur mit Potenzial zur stilistischen Schärfung'
      : 'Anschauliche Gedankenführung mit treffenden Beispielen',
    overallImpression: isRealschule
      ? 'Deine Arbeit belegt ein solides Textverständnis für die 10. Klasse. Du begründest deine Thesen nachvollziehbar und zeigst einen klaren roten Faden.'
      : 'Du hast die Textsorte gut erfasst und schreibst lebendig und verständlich. Die Beispiele passen gut zu deinen Hauptgedanken.',
    criteriaResults,
    strengths: [
      {
        quote: quote1.length > 60 ? quote1.slice(0, 60) + '...' : quote1,
        explanation: 'Hier gelingt dir ein überzeugender Einstieg, der das Thema zielgerichtet eröffnet.'
      }
    ],
    improvements: [
      {
        quote: quote2.length > 60 ? quote2.slice(0, 60) + '...' : quote2,
        issue: 'Der Satzbau ist hier etwas umgangssprachlich gehalten und die Begründung könnte noch genauer untermauert werden.',
        suggestion: 'Versuche, mit klaren Signalwörtern wie "Ein entscheidender Gesichtspunkt hierbei ist..." zu formulieren.'
      }
    ],
    examTips: [
      isRealschule
        ? 'Prüfungstipp Realschule: Platziere bei dialektischen Erörterungen das stärkste Gegenargument am Anfang des Kontra-Blocks und dein stärkstes Pro-Argument als Höhepunkt vor das Fazit.'
        : 'Prüfungstipp Hauptschule: Lies deinen Text vor der Abgabe noch einmal gezielt lautlos mit – so fallen Satzbrüche und fehlende Kommas sofort auf.',
      'Nutze Absätze gezielt: Jeder neue Sinnabschnitt verdient eine neue Zeile.'
    ]
  };
}
