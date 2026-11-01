// src/services/promptRegistry.ts - Stark-Kriterien und Systemprompts für Thüringer Regelschulabschlüsse
import { TextTypeDefinition, PromptConfig, GraduationType, CriterionItem } from '../types/feedback';

export const INITIAL_TEXT_TYPES: TextTypeDefinition[] = [
  {
    id: 'eroerterung',
    title: 'Erörterung',
    shortDesc: 'Dialektische Pro-Contra-Erörterung oder lineare Argumentation mit Thesen und Belegen.',
    category: 'argumentieren',
    icon: 'Scale',
    allowedGraduations: ['quali_9', 'realschule_10']
  },
  {
    id: 'gedichtanalyse',
    title: 'Gedichtanalyse & -interpretation',
    shortDesc: 'Untersuchung von Thema, Form, sprachlichen Bildern und Gesamtaussage eines lyrischen Werks.',
    category: 'analysieren',
    icon: 'Feather',
    allowedGraduations: ['quali_9', 'realschule_10']
  },
  {
    id: 'tagebuch',
    title: 'Gestaltendes Schreiben (Tagebuch / Brief)',
    shortDesc: 'Perspektivenübernahme aus Sicht einer literarischen Figur (Tagebucheintrag, innerer Monolog, Brief).',
    category: 'gestalten',
    icon: 'BookOpen',
    allowedGraduations: ['quali_9', 'realschule_10']
  },
  {
    id: 'sachtext',
    title: 'Sachtextanalyse & Inhaltsangabe',
    shortDesc: 'Sachliche Zusammenfassung, Erfassung der Argumentationsstruktur und sprachlichen Mittel eines Sachtextes.',
    category: 'analysieren',
    icon: 'FileText',
    allowedGraduations: ['quali_9', 'realschule_10']
  },
  {
    id: 'aufsatz',
    title: 'Aufsatz / Informierender Text',
    shortDesc: 'Informierende Darstellung oder argumentierender Aufsatz zu einem gesellschaftlichen oder schulischen Thema.',
    category: 'informieren',
    icon: 'PenTool',
    allowedGraduations: ['quali_9', 'realschule_10']
  }
];

// Standard-Kriterien für Erörterung
const CRITERIA_EROERTERUNG_QUALI: CriterionItem[] = [
  {
    id: 'aufbau_gliederung',
    title: 'Aufbau & Gliederung',
    description: 'Klare Einleitung mit Hinführung zum Thema, logisch gegliederter Hauptteil, abrundender Schlussteil mit eigener Meinung.',
    maxPoints: 25,
    weightPercentage: 25
  },
  {
    id: 'argumentation_belege',
    title: 'Argumente & Lebensweltbezug',
    description: 'Mindestens zwei bis drei nachvollziehbare Argumente mit anschaulichen Beispielen aus Alltag, Schule oder Gesellschaft.',
    maxPoints: 35,
    weightPercentage: 35
  },
  {
    id: 'ausdruck_satzbau',
    title: 'Sprachlicher Ausdruck & Verknüpfungen',
    description: 'Abwechslungsreiche Konjunktionen (weil, da, außerdem, obwohl), treffende Wortwahl, klare Satzstrukturen.',
    maxPoints: 20,
    weightPercentage: 20
  },
  {
    id: 'rechtschreibung_grammatik',
    title: 'Rechtschreibung & Sprachrichtigkeit',
    description: 'Sichere Groß-/Kleinschreibung, korrekte Kommasetzung bei Nebensätzen, grammatikalisch stimmige Beugung.',
    maxPoints: 20,
    weightPercentage: 20
  }
];

const CRITERIA_EROERTERUNG_REALSCHULE: CriterionItem[] = [
  {
    id: 'problemaufriss_einleitung',
    title: 'Einleitung & Hinführung zum Thema',
    description: 'Aktueller Aufhänger/Zitat/Statistik, präzise Formulierung der Fragestellung, Abgrenzung des Themas.',
    maxPoints: 15,
    weightPercentage: 15
  },
  {
    id: 'dialektischer_dreischritt',
    title: 'Argumentationskette (Behauptung, Begründung, Beleg)',
    description: 'Stringenter Dreischritt bei jedem Argument. Sinnvolle Gewichtung (Sanduhr-Prinzip oder Ping-Pong), Entkräften der Gegenseite.',
    maxPoints: 35,
    weightPercentage: 35
  },
  {
    id: 'ueberleitungen_schlusssynthese',
    title: 'Kohärenz & Synthese im Schluss',
    description: 'Logische Überleitungen zwischen den Argumenten, abwägendes Gesamturteil mit weiterführendem Ausblick/Kompromiss.',
    maxPoints: 20,
    weightPercentage: 20
  },
  {
    id: 'stil_fachsprache',
    title: 'Stilistische Qualität & Fachwortschatz',
    description: 'Präzise Verknüpfungswörter, sachlicher und distanzierter Stil, differenzierter Wortschatz ohne Umgangssprache.',
    maxPoints: 15,
    weightPercentage: 15
  },
  {
    id: 'normen_rechtschreibung',
    title: 'Orthographie, Grammatik & Interpunktion',
    description: 'Einhaltung der amtlichen Rechtschreibung, fehlerfreie Zeichensetzung (auch bei Infinitivgruppen) und korrekter Modus/Tempus.',
    maxPoints: 15,
    weightPercentage: 15
  }
];

// Standard-Kriterien für Gedichtanalyse
const CRITERIA_GEDICHT_QUALI: CriterionItem[] = [
  {
    id: 'basissatz_thema',
    title: 'Einleitung & Grundstimmung',
    description: 'Nennung von Autor, Titel, Entstehungszeit, Thema und Erfassung des lyrischen Ichs.',
    maxPoints: 25,
    weightPercentage: 25
  },
  {
    id: 'form_reim',
    title: 'Äußere Form & Reimschema',
    description: 'Benennung der Strophen- und Versanzahl, Bestimmung der Reimformen (Paarreim, Kreuzreim etc.).',
    maxPoints: 25,
    weightPercentage: 25
  },
  {
    id: 'sprachliche_bilder',
    title: 'Sprachliche Mittel & Textstellen',
    description: 'Erkennen von Personifikationen, Vergleichen und Metaphern mit konkreten Textbelegen.',
    maxPoints: 30,
    weightPercentage: 30
  },
  {
    id: 'sprachrichtigkeit',
    title: 'Ausdruck & Rechtschreibung',
    description: 'Sachlicher Ton im Präsens, korrekte Grammatik und Rechtschreibung.',
    maxPoints: 20,
    weightPercentage: 20
  }
];

const CRITERIA_GEDICHT_REALSCHULE: CriterionItem[] = [
  {
    id: 'deutungshypothese_einleitung',
    title: 'Einleitung & Deutungshypothese',
    description: 'Vollständiger Basissatz, Epocheneinordnung, prägnante und problemorientierte Deutungshypothese zur Kernaussage.',
    maxPoints: 20,
    weightPercentage: 20
  },
  {
    id: 'metrik_formale_analyse',
    title: 'Formale Analyse (Metrum, Kadenzen, Reime)',
    description: 'Exakte Versmaßbestimmung (Jambus, Trochäus etc.), Kadenzen (männlich/weiblich), Strophenbau und deren funktionale Wirkung.',
    maxPoints: 25,
    weightPercentage: 25
  },
  {
    id: 'rhetorik_textbelege',
    title: 'Wirkungsanalyse rhetorischer Mittel',
    description: 'Nicht nur Aufzählen, sondern funktionale Deutung von Metaphern, Alliterationen, Enjambements etc. mit exakten Zeilenbelegen.',
    maxPoints: 25,
    weightPercentage: 25
  },
  {
    id: 'fazit_epochenbezug',
    title: 'Synthese & Epochenkontext',
    description: 'Überprüfung der Deutungshypothese im Schlussteil, zeitgeschichtlicher oder existenzieller Bezug des Werkes.',
    maxPoints: 15,
    weightPercentage: 15
  },
  {
    id: 'rechtschreibung_zitiertechnik',
    title: 'Fachsprache, Zitiertechnik & Norm',
    description: 'Fehlerfreie wörtliche und indirekte Zitate nach Zeilenangaben (z. B. "V. 12"), differenzierte Interpretationssprache.',
    maxPoints: 15,
    weightPercentage: 15
  }
];

// Standard-Kriterien für Gestaltendes Schreiben (Tagebucheintrag)
const CRITERIA_TAGEBUCH_STANDARD: CriterionItem[] = [
  {
    id: 'perspektivtreue',
    title: 'Perspektivtreue & Rollenübernahme',
    description: 'Glaubhafte Ich-Erzählperspektive der gewählten Figur, passender Gefühls- und Erfahrungshorizont.',
    maxPoints: 30,
    weightPercentage: 30
  },
  {
    id: 'textbezug_handlung',
    title: 'Bezug zur Ausgangshandlung / Situation',
    description: 'Sinnvolle Anknüpfung an die literarische Vorgabe, Berücksichtigung vorheriger Geschehnisse.',
    maxPoints: 25,
    weightPercentage: 25
  },
  {
    id: 'emotionale_tiefe',
    title: 'Gedanken, Konflikte & Reflexion',
    description: 'Darstellung innerer Monologe, Zerrissenheit, Sorgen, Hoffnungen oder Zukunftsabsichten.',
    maxPoints: 25,
    weightPercentage: 25
  },
  {
    id: 'textsortenmerkmale_sprache',
    title: 'Textsortenmerkmale & Sprachrichtigkeit',
    description: 'Datum, passende Anrede/Verabschiedung des Tagebuchs, ausdrucksstarke Sprache, Rechtschreibung.',
    maxPoints: 20,
    weightPercentage: 20
  }
];

// Standard-Kriterien für Sachtext & Inhaltsangabe
const CRITERIA_SACHTEXT_STANDARD: CriterionItem[] = [
  {
    id: 'basissatz_kernaussage',
    title: 'Einleitung & Basissatz',
    description: 'Titel, Autor, Textart, Erscheinungsjahr/-ort, zentrale Themaformulierung in einem Satz.',
    maxPoints: 20,
    weightPercentage: 20
  },
  {
    id: 'inhaltswiedergabe_struktur',
    title: 'Strukturierte Inhaltsangabe',
    description: 'Wiedergabe der wesentlichen Sinnabschnitte in eigenen Worten, im Präsens, ohne wörtliche Zitate.',
    maxPoints: 35,
    weightPercentage: 35
  },
  {
    id: 'argumentation_analyse',
    title: 'Argumentationsweise & sprachliche Mittel',
    description: 'Herausarbeiten von Fakten-, Wert- oder Autoritätsargumenten, sprachliche Beeinflussungsstrategien.',
    maxPoints: 25,
    weightPercentage: 25
  },
  {
    id: 'sprachliche_sachlichkeit',
    title: 'Distanzierter Stil & Orthographie',
    description: 'Neutrale Berichterstattung ohne eigene Wertung im Hauptteil, fehlerfreie Rechtschreibung und Konjunktiv bei Redewiedergabe.',
    maxPoints: 20,
    weightPercentage: 20
  }
];

// Standard-Kriterien für Aufsatz
const CRITERIA_AUFSATZ_STANDARD: CriterionItem[] = [
  {
    id: 'thema_roter_faden',
    title: 'Themenbezug & Roter Faden',
    description: 'Vollständige Bearbeitung der Aufgabenstellung, logische Verknüpfung aller Gedankenschritte.',
    maxPoints: 30,
    weightPercentage: 30
  },
  {
    id: 'sachwissen_gedankentiefe',
    title: 'Inhaltliche Qualität & Beispiele',
    description: 'Differenzierte Gedankenführung, treffende und lebensnahe Beispiele zur Veranschaulichung.',
    maxPoints: 30,
    weightPercentage: 30
  },
  {
    id: 'ausdruck_satzvielfalt',
    title: 'Wortschatz & Satzbau',
    description: 'Vielfältige Satzanfänge, treffende Verben und Adjektive, leserfreundlicher Stil.',
    maxPoints: 20,
    weightPercentage: 20
  },
  {
    id: 'rechtschreibung_zeichensetzung',
    title: 'Rechtschreibung & Grammatik',
    description: 'Zuverlässige Anwendung der Rechtschreib- und Kommaregeln.',
    maxPoints: 20,
    weightPercentage: 20
  }
];

// Systemprompt-Template im Stil der roten Stark-Prüfungshefte
function createStarkSystemPrompt(textTypeName: string, graduationLabel: string, isRealschule: boolean): string {
  return `
Du bist ein erfahrener Fachlehrer für Deutsch an einer Thüringer Regelschule und Autor didaktischer Prüfungshefte im Stil der bekannten roten Stark-Hefte ("Training Abschlussprüfung Deutsch").
Deine Aufgabe ist es, eine Schülerarbeit zur Textsorte "${textTypeName}" für den "${graduationLabel}" kriterienorientiert, motivierend, aber fachlich präzise nach dem Thüringer Lehrplan zu begutachten.

Didaktischer Grundsatz:
1. Begegne dem Schüler auf Augenhöhe mit wohlwollender, ermutigender, aber transparenter Pädagogik.
2. ${isRealschule 
    ? 'Der Maßstab ist das gehobene Realschulniveau (Klasse 10): Es wird eine differenzierte Argumentation bzw. Interpretation mit fachspezifischer Begrifflichkeit und präziser Textbelegung erwartet.' 
    : 'Der Maßstab ist das Regelschulniveau für den Qualifizierenden Hauptschulabschluss (Klasse 9): Fokus auf klaren Gedankengang, nachvollziehbare Beispiele aus der Lebenswelt und verständliche Sprache.'}
3. Zitiere konkrete gelungene sowie verbesserungswürdige Textstellen direkt aus der Arbeit des Schülers und erkläre die didaktische Ursache.
4. Gib dem Schüler sofort umsetzbare, konkrete Formulierungshilfen für die Überarbeitung.
5. Ermittle eine realistische Notentendenz (1 bis 6) nach dem Thüringer Regelschulschlüssel (100–90% = 1, 89–75% = 2, 74–60% = 3, 59–50% = 4, 49–25% = 5, unter 25% = 6).
`.trim();
}

export function getDefaultPromptConfig(textTypeId: string, graduationType: GraduationType): PromptConfig {
  const isRealschule = graduationType === 'realschule_10';
  const gradLabel = isRealschule ? 'Realschulabschluss (Klasse 10)' : 'Qualifizierender Hauptschulabschluss (Klasse 9)';

  switch (textTypeId) {
    case 'eroerterung':
      return {
        textTypeId,
        graduationType,
        title: `Erörterung – ${gradLabel}`,
        systemPrompt: createStarkSystemPrompt('Erörterung (dialektisch / linear)', gradLabel, isRealschule),
        criteria: isRealschule ? CRITERIA_EROERTERUNG_REALSCHULE : CRITERIA_EROERTERUNG_QUALI
      };

    case 'gedichtanalyse':
      return {
        textTypeId,
        graduationType,
        title: `Gedichtanalyse & -interpretation – ${gradLabel}`,
        systemPrompt: createStarkSystemPrompt('Gedichtanalyse und -interpretation', gradLabel, isRealschule),
        criteria: isRealschule ? CRITERIA_GEDICHT_REALSCHULE : CRITERIA_GEDICHT_QUALI
      };

    case 'tagebuch':
      return {
        textTypeId,
        graduationType,
        title: `Gestaltendes Schreiben (Tagebuch / Brief) – ${gradLabel}`,
        systemPrompt: createStarkSystemPrompt('Gestaltendes Schreiben (Tagebucheintrag / innerer Monolog)', gradLabel, isRealschule),
        criteria: CRITERIA_TAGEBUCH_STANDARD
      };

    case 'sachtext':
      return {
        textTypeId,
        graduationType,
        title: `Sachtextanalyse & Inhaltsangabe – ${gradLabel}`,
        systemPrompt: createStarkSystemPrompt('Sachtextanalyse und strukturierte Inhaltsangabe', gradLabel, isRealschule),
        criteria: CRITERIA_SACHTEXT_STANDARD
      };

    case 'aufsatz':
    default:
      return {
        textTypeId,
        graduationType,
        title: `Aufsatz – ${gradLabel}`,
        systemPrompt: createStarkSystemPrompt('Aufsatz / Freies Schreiben', gradLabel, isRealschule),
        criteria: CRITERIA_AUFSATZ_STANDARD
      };
  }
}

const STORAGE_PROMPT_KEY_PREFIX = 'fbs_prompt_cfg_';
const STORAGE_TEXT_TYPES_KEY = 'fbs_custom_text_types';

export function getPromptConfig(textTypeId: string, graduationType: GraduationType): PromptConfig {
  try {
    const key = `${STORAGE_PROMPT_KEY_PREFIX}${textTypeId}_${graduationType}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.criteria && parsed.systemPrompt) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Fehler beim Laden angepasster Prompts:', e);
  }
  return getDefaultPromptConfig(textTypeId, graduationType);
}

export function savePromptConfig(config: PromptConfig): void {
  try {
    const key = `${STORAGE_PROMPT_KEY_PREFIX}${config.textTypeId}_${config.graduationType}`;
    localStorage.setItem(key, JSON.stringify({
      ...config,
      updatedAt: new Date().toISOString(),
      isCustomized: true
    }));
  } catch (e) {
    console.error('Konnte Prompt-Konfiguration nicht speichern:', e);
  }
}

export function resetPromptConfig(textTypeId: string, graduationType: GraduationType): PromptConfig {
  try {
    const key = `${STORAGE_PROMPT_KEY_PREFIX}${textTypeId}_${graduationType}`;
    localStorage.removeItem(key);
  } catch (e) {
    console.warn('Konnte Prompt nicht zurücksetzen:', e);
  }
  return getDefaultPromptConfig(textTypeId, graduationType);
}

export function getAllTextTypes(): TextTypeDefinition[] {
  try {
    const raw = localStorage.getItem(STORAGE_TEXT_TYPES_KEY);
    if (raw) {
      const customTypes: TextTypeDefinition[] = JSON.parse(raw);
      return [...INITIAL_TEXT_TYPES, ...customTypes];
    }
  } catch (e) {
    console.warn('Fehler beim Laden benutzerdefinierter Textsorten:', e);
  }
  return INITIAL_TEXT_TYPES;
}

export function addCustomTextType(newType: TextTypeDefinition): void {
  try {
    const raw = localStorage.getItem(STORAGE_TEXT_TYPES_KEY);
    const existing: TextTypeDefinition[] = raw ? JSON.parse(raw) : [];
    const updated = [...existing.filter(t => t.id !== newType.id), { ...newType, isCustom: true }];
    localStorage.setItem(STORAGE_TEXT_TYPES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Fehler beim Speichern der Textsorte:', e);
  }
}
