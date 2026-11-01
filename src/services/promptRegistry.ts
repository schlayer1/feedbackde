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

// Standard-Kriterien für Erörterung (Quali Klasse 9) mit festen 4-Stufen-Ankern
const CRITERIA_EROERTERUNG_QUALI: CriterionItem[] = [
  {
    id: 'aufbau_gliederung',
    title: 'Aufbau & Gliederung',
    description: 'Klare Einleitung mit Hinführung zum Thema, logisch gegliederter Hauptteil, abrundender Schlussteil mit eigener Meinung.',
    maxPoints: 25,
    weightPercentage: 25,
    anchorLevels: {
      level4: '23-25 Pkt (Sehr gut): Vorbildliche Dreigliederung (Einleitung, Hauptteil, Schluss) mit klaren Sinnabsätzen und logischem Übergang.',
      level3: '19-22 Pkt (Gut): Gliederung deutlich erkennbar und überwiegend sauber getrennt, kleinere Unschärfen bei Einleitung oder Schluss.',
      level2: '13-18 Pkt (Befriedigend/Ausreichend): Dreiteilung nur in Ansätzen sichtbar, Absätze fehlen stellenweise, Schluss bricht abrupt ab.',
      level1: '0-12 Pkt (Mangelhaft/Ungenügend): Keine nachvollziehbare Gliederung, Textsortenaufbau verfehlt.'
    }
  },
  {
    id: 'argumentation_belege',
    title: 'Argumente & Lebensweltbezug',
    description: 'Mindestens zwei bis drei nachvollziehbare Argumente mit anschaulichen Beispielen aus Alltag, Schule oder Gesellschaft.',
    maxPoints: 35,
    weightPercentage: 35,
    anchorLevels: {
      level4: '32-35 Pkt (Sehr gut): Mindestens 2-3 überzeugende Thesen, jeweils logisch begründet und mit konkreten, anschaulichen Beispielen untermauert.',
      level3: '26-31 Pkt (Gut): Nachvollziehbare Argumente mit guten Beispielen, Begründungen schlüssig, kleine Lücken in der Beweisführung.',
      level2: '18-25 Pkt (Befriedigend/Ausreichend): Argumente bleiben oft bloße Behauptungen, Beispiele fehlen oder sind unpassend.',
      level1: '0-17 Pkt (Mangelhaft/Ungenügend): Kaum sachliche Argumente, unlogische Widersprüche oder Thema verfehlt.'
    }
  },
  {
    id: 'ausdruck_satzbau',
    title: 'Sprachlicher Ausdruck & Verknüpfungen',
    description: 'Abwechslungsreiche Konjunktionen (weil, da, außerdem, obwohl), treffende Wortwahl, klare Satzstrukturen.',
    maxPoints: 20,
    weightPercentage: 20,
    anchorLevels: {
      level4: '18-20 Pkt (Sehr gut): Vielfältiger Satzbau, treffende Verknüpfungswörter (Dennoch, Folglich, Demgegenüber), treffende Wortwahl ohne Umgangssprache.',
      level3: '15-17 Pkt (Gut): Flüssiger und verständlicher Stil, gute Satzverknüpfungen, vereinzelte Wortwiederholungen.',
      level2: '10-14 Pkt (Befriedigend/Ausreichend): Einfache Aneinanderreihung ("und dann"), monotone Satzanfänge, umgangssprachliche Floskeln.',
      level1: '0-9 Pkt (Mangelhaft/Ungenügend): Stark fehlerhafter, verworrener Satzbau, der den Sinn entstellt.'
    }
  },
  {
    id: 'rechtschreibung_grammatik',
    title: 'Rechtschreibung & Sprachrichtigkeit',
    description: 'Sichere Groß-/Kleinschreibung, korrekte Kommasetzung bei Nebensätzen, grammatikalisch stimmige Beugung.',
    maxPoints: 20,
    weightPercentage: 20,
    anchorLevels: {
      level4: '18-20 Pkt (Sehr gut): Nahezu fehlerfrei in Orthographie, Grammatik und Interpunktion (höchstens 1-2 minimale Flüchtigkeitsfehler).',
      level3: '15-17 Pkt (Gut): Wenige Fehler, die den Lesefluss nicht stören, Kommasetzung bei Nebensätzen weitgehend sicher.',
      level2: '10-14 Pkt (Befriedigend/Ausreichend): Häufigere Fehler bei dass/das, Groß-/Kleinschreibung oder Kommasetzung.',
      level1: '0-9 Pkt (Mangelhaft/Ungenügend): Hohe Fehlerdichte in jedem Satz, die das Verständnis massiv beeinträchtigt.'
    }
  }
];

// Standard-Kriterien für Erörterung (Realschule Klasse 10) mit festen 4-Stufen-Ankern
const CRITERIA_EROERTERUNG_REALSCHULE: CriterionItem[] = [
  {
    id: 'problemaufriss_einleitung',
    title: 'Einleitung & Hinführung zum Thema',
    description: 'Aktueller Aufhänger/Zitat/Statistik, präzise Formulierung der Fragestellung, Abgrenzung des Themas.',
    maxPoints: 15,
    weightPercentage: 15,
    anchorLevels: {
      level4: '14-15 Pkt: Motivierender Aufhänger, präzise Fragestellung, klare thematische Abgrenzung.',
      level3: '11-13 Pkt: Gelungene Hinführung, Fragestellung formuliert, Aufhänger solide.',
      level2: '8-10 Pkt: Einleitung sehr kurz, geht unvermittelt ins Thema ohne Hinführung.',
      level1: '0-7 Pkt: Einleitung fehlt oder geht am Thema vorbei.'
    }
  },
  {
    id: 'dialektischer_dreischritt',
    title: 'Argumentationskette (Behauptung, Begründung, Beleg)',
    description: 'Stringenter Dreischritt bei jedem Argument. Sinnvolle Gewichtung (Sanduhr-Prinzip oder Ping-Pong), Entkräften der Gegenseite.',
    maxPoints: 35,
    weightPercentage: 35,
    anchorLevels: {
      level4: '32-35 Pkt: Stringenter dialektischer Dreischritt bei allen Argumenten, geschicktes Entkräften der Gegenseite, starke Beweisführung.',
      level3: '26-31 Pkt: Dreischritt überwiegend konsequent umgesetzt, Gegenargumente berücksichtigt, Beispiele treffend.',
      level2: '18-25 Pkt: Dreischritt oft unvollständig (Belege fehlen), einseitige Argumentation, schwache Begründung.',
      level1: '0-17 Pkt: Kaum Argumente, bloße Behauptungen, unlogischer Aufbau.'
    }
  },
  {
    id: 'ueberleitungen_schlusssynthese',
    title: 'Kohärenz & Synthese im Schluss',
    description: 'Logische Überleitungen zwischen den Argumenten, abwägendes Gesamturteil mit weiterführendem Ausblick/Kompromiss.',
    maxPoints: 20,
    weightPercentage: 20,
    anchorLevels: {
      level4: '18-20 Pkt: Geschmeidige rhetorische Überleitungen, differenziertes und abgewogenes Fazit mit Kompromissformel/Ausblick.',
      level3: '15-17 Pkt: Gute Überleitungen, Fazit fasst Positionen zusammen und begründet eigene Meinung.',
      level2: '10-14 Pkt: Holprige Sprünge zwischen Argumenten, Fazit ist bloße Wiederholung ohne Synthese.',
      level1: '0-9 Pkt: Keine Überleitungen, Schluss fehlt oder ist widersprüchlich.'
    }
  },
  {
    id: 'stil_fachsprache',
    title: 'Stilistische Qualität & Fachwortschatz',
    description: 'Präzise Verknüpfungswörter, sachlicher und distanzierter Stil, differenzierter Wortschatz ohne Umgangssprache.',
    maxPoints: 15,
    weightPercentage: 15,
    anchorLevels: {
      level4: '14-15 Pkt: Hohes sprachliches Niveau, treffende Fachbegriffe, präzise Konjunktionen und Modalverben.',
      level3: '11-13 Pkt: Sachlicher Stil, differenzierte Wortwahl, flüssige Satzperioden.',
      level2: '8-10 Pkt: Wiederholungen, stellenweise umgangssprachlich oder unsachlich.',
      level1: '0-7 Pkt: Völlig unangemessener Stil, stark umgangssprachlich.'
    }
  },
  {
    id: 'normen_rechtschreibung',
    title: 'Orthographie, Grammatik & Interpunktion',
    description: 'Einhaltung der amtlichen Rechtschreibung, fehlerfreie Zeichensetzung (auch bei Infinitivgruppen) und korrekter Modus/Tempus.',
    maxPoints: 15,
    weightPercentage: 15,
    anchorLevels: {
      level4: '14-15 Pkt: Weitestgehend fehlerfrei (0-2 leichte Fehler).',
      level3: '11-13 Pkt: Wenige Fehler, beeinträchtigen Lesbarkeit nicht.',
      level2: '8-10 Pkt: Spürbare Fehlerhäufung bei Kommasetzung oder Grammatik.',
      level1: '0-7 Pkt: Gravierende Verstöße gegen Sprachnormen.'
    }
  }
];

// Standard-Kriterien für Gedichtanalyse (Quali & Realschule)
const CRITERIA_GEDICHT_QUALI: CriterionItem[] = [
  {
    id: 'basissatz_thema',
    title: 'Einleitung & Grundstimmung',
    description: 'Nennung von Autor, Titel, Entstehungszeit, Thema und Erfassung des lyrischen Ichs.',
    maxPoints: 25,
    weightPercentage: 25,
    anchorLevels: {
      level4: '23-25 Pkt: Vollständiger Basissatz, treffende Thesen zum Thema und zur Stimmung.',
      level3: '19-22 Pkt: Basissatz weitgehend vollständig, Thema erfasst.',
      level2: '13-18 Pkt: Lückenhafter Basissatz, Thema nur oberflächlich.',
      level1: '0-12 Pkt: Basissatz fehlt, Thema missverstanden.'
    }
  },
  {
    id: 'form_reim',
    title: 'Äußere Form & Reimschema',
    description: 'Benennung der Strophen- und Versanzahl, Bestimmung der Reimformen (Paarreim, Kreuzreim etc.).',
    maxPoints: 25,
    weightPercentage: 25,
    anchorLevels: {
      level4: '23-25 Pkt: Strophen, Verse und Reimschema exakt bestimmt.',
      level3: '19-22 Pkt: Form und Reim überwiegend korrekt erkannt.',
      level2: '13-18 Pkt: Fehler bei Reimformen oder Verszählung.',
      level1: '0-12 Pkt: Formale Analyse fehlt.'
    }
  },
  {
    id: 'sprachliche_bilder',
    title: 'Sprachliche Mittel & Textstellen',
    description: 'Erkennen von Personifikationen, Vergleichen und Metaphern mit konkreten Textbelegen.',
    maxPoints: 30,
    weightPercentage: 30,
    anchorLevels: {
      level4: '27-30 Pkt: Mehrere Stilmittel mit treffenden Zitaten benannt und deren Wirkung erklärt.',
      level3: '22-26 Pkt: Gute Stilmittel mit Zitaten gefunden, Wirkung kurz gedeutet.',
      level2: '15-21 Pkt: Nur bloße Aufzählung von Stilmitteln ohne Deutung oder Zitate.',
      level1: '0-14 Pkt: Keine oder falsche Stilmittel.'
    }
  },
  {
    id: 'sprachrichtigkeit',
    title: 'Ausdruck & Rechtschreibung',
    description: 'Sachlicher Ton im Präsens, korrekte Grammatik und Rechtschreibung.',
    maxPoints: 20,
    weightPercentage: 20,
    anchorLevels: {
      level4: '18-20 Pkt: Durchgängig Präsens, sachlicher Ausdruck, fehlerfrei.',
      level3: '15-17 Pkt: Weitgehend fehlerfrei, gelegentliche Tempuswechsel.',
      level2: '10-14 Pkt: Häufigere Fehler oder Umgangssprache.',
      level1: '0-9 Pkt: Starke Mängel in Rechtschreibung und Tempus.'
    }
  }
];

const CRITERIA_GEDICHT_REALSCHULE: CriterionItem[] = [
  {
    id: 'deutungshypothese_einleitung',
    title: 'Einleitung & Deutungshypothese',
    description: 'Vollständiger Basissatz, Epocheneinordnung, prägnante und problemorientierte Deutungshypothese zur Kernaussage.',
    maxPoints: 20,
    weightPercentage: 20,
    anchorLevels: {
      level4: '18-20 Pkt: Vollständiger Basissatz, Epocheneinordnung, prägnante und problemorientierte Deutungshypothese.',
      level3: '15-17 Pkt: Basissatz komplett, Deutungshypothese nachvollziehbar formuliert.',
      level2: '10-14 Pkt: Deutungshypothese unklar oder fehlt, Basissatz lückenhaft.',
      level1: '0-9 Pkt: Einleitung mangelhaft.'
    }
  },
  {
    id: 'metrik_formale_analyse',
    title: 'Formale Analyse (Metrum, Kadenzen, Reime)',
    description: 'Exakte Versmaßbestimmung (Jambus, Trochäus etc.), Kadenzen (männlich/weiblich), Strophenbau und deren funktionale Wirkung.',
    maxPoints: 25,
    weightPercentage: 25,
    anchorLevels: {
      level4: '23-25 Pkt: Metrum, Kadenzen, Reimschema und Bauform (z.B. Sonett) exakt analysiert und funktional gedeutet.',
      level3: '19-22 Pkt: Formale Bestimmungen überwiegend richtig, Verbindung zur Wirkung hergestellt.',
      level2: '13-18 Pkt: Formmerkmale nur mechanisch aufgezählt, Fehler beim Metrum.',
      level1: '0-12 Pkt: Formale Analyse ungenügend.'
    }
  },
  {
    id: 'rhetorik_textbelege',
    title: 'Wirkungsanalyse rhetorischer Mittel',
    description: 'Nicht nur Aufzählen, sondern funktionale Deutung von Metaphern, Alliterationen, Enjambements etc. mit exakten Zeilenbelegen.',
    maxPoints: 25,
    weightPercentage: 25,
    anchorLevels: {
      level4: '23-25 Pkt: Tiefgründige Analyse sprachlicher Bilder mit exakten Verszitaten und Deutung für die Gesamtaussage.',
      level3: '19-22 Pkt: Wichtige rhetorische Mittel erfasst, zitiert und sinnvoll gedeutet.',
      level2: '13-18 Pkt: Nur Aufzählung ("Es gibt eine Metapher in V. 3") ohne Deutung.',
      level1: '0-12 Pkt: Kaum sprachliche Analyse.'
    }
  },
  {
    id: 'fazit_epochenbezug',
    title: 'Synthese & Epochenkontext',
    description: 'Überprüfung der Deutungshypothese im Schlussteil, zeitgeschichtlicher oder existenzieller Bezug des Werkes.',
    maxPoints: 15,
    weightPercentage: 15,
    anchorLevels: {
      level4: '14-15 Pkt: Rückbezug auf Deutungshypothese, reflektierter Epochen- und Zeitbezug.',
      level3: '11-13 Pkt: Fazit fasst Deutung zusammen, Epochenbezug erkennbar.',
      level2: '8-10 Pkt: Schlussteil sehr kurz, keine Synthese.',
      level1: '0-7 Pkt: Fazit fehlt.'
    }
  },
  {
    id: 'rechtschreibung_zitiertechnik',
    title: 'Fachsprache, Zitiertechnik & Norm',
    description: 'Fehlerfreie wörtliche und indirekte Zitate nach Zeilenangaben (z. B. "V. 12"), differenzierte Interpretationssprache.',
    maxPoints: 15,
    weightPercentage: 15,
    anchorLevels: {
      level4: '14-15 Pkt: Einwandfreie Zitiertechnik nach Versen, differenzierte Fachsprache, fehlerfrei.',
      level3: '11-13 Pkt: Korrekte Zitate, gute Fachsprache, wenige Fehler.',
      level2: '8-10 Pkt: Fehler bei Zitierweise, einfache Sprache.',
      level1: '0-7 Pkt: Zitierregeln missachtet, starke Sprachmängel.'
    }
  }
];

// Standard-Kriterien für Gestaltendes Schreiben (Tagebucheintrag)
const CRITERIA_TAGEBUCH_STANDARD: CriterionItem[] = [
  {
    id: 'perspektivtreue',
    title: 'Perspektivtreue & Rollenübernahme',
    description: 'Glaubhafte Ich-Erzählperspektive der gewählten Figur, passender Gefühls- und Erfahrungshorizont.',
    maxPoints: 30,
    weightPercentage: 30,
    anchorLevels: {
      level4: '27-30 Pkt: Vollkommene Identifikation mit der Figur, authentische Gedanken- und Gefühlswelt.',
      level3: '22-26 Pkt: Rollenübernahme überzeugend, Sprache passt zur Figur.',
      level2: '15-21 Pkt: Figur verlässt gelegentlich die Perspektive oder klingt unpassend.',
      level1: '0-14 Pkt: Rolle nicht erfasst.'
    }
  },
  {
    id: 'textbezug_handlung',
    title: 'Bezug zur Ausgangshandlung / Situation',
    description: 'Sinnvolle Anknüpfung an die literarische Vorgabe, Berücksichtigung vorheriger Geschehnisse.',
    maxPoints: 25,
    weightPercentage: 25,
    anchorLevels: {
      level4: '23-25 Pkt: Enge und plausible Verknüpfung mit den literarischen Geschehnissen.',
      level3: '19-22 Pkt: Handlungssituation gut eingebunden.',
      level2: '13-18 Pkt: Nur lockerer Bezug, wichtige Handlungsdetails ignoriert.',
      level1: '0-12 Pkt: Kein Bezug zur Textvorgabe.'
    }
  },
  {
    id: 'emotionale_tiefe',
    title: 'Gedanken, Konflikte & Reflexion',
    description: 'Darstellung innerer Monologe, Zerrissenheit, Sorgen, Hoffnungen oder Zukunftsabsichten.',
    maxPoints: 25,
    weightPercentage: 25,
    anchorLevels: {
      level4: '23-25 Pkt: Differenzierte innere Konflikte, psychologisch stimmig und berührend.',
      level3: '19-22 Pkt: Gute Reflexion der Gefühle und Absichten.',
      level2: '13-18 Pkt: Gefühle nur oberflächlich benannt.',
      level1: '0-12 Pkt: Reine Nacherzählung ohne Innensicht.'
    }
  },
  {
    id: 'textsortenmerkmale_sprache',
    title: 'Textsortenmerkmale & Sprachrichtigkeit',
    description: 'Datum, passende Anrede/Verabschiedung des Tagebuchs, ausdrucksstarke Sprache, Rechtschreibung.',
    maxPoints: 20,
    weightPercentage: 20,
    anchorLevels: {
      level4: '18-20 Pkt: Tagebuchform perfekt gewahrt (Datum, Adressat), ausdrucksstarke Sprache, fehlerfrei.',
      level3: '15-17 Pkt: Textsortenmerkmale vorhanden, gute Sprache, wenige Fehler.',
      level2: '10-14 Pkt: Formmerkmale unvollständig, sprachliche Mängel.',
      level1: '0-9 Pkt: Textsorte verfehlt.'
    }
  }
];

// Standard-Kriterien für Sachtext & Inhaltsangabe
const CRITERIA_SACHTEXT_STANDARD: CriterionItem[] = [
  {
    id: 'basissatz_kernaussage',
    title: 'Einleitung & Basissatz',
    description: 'Titel, Autor, Textart, Erscheinungsjahr/-ort, zentrale Themaformulierung in einem Satz.',
    maxPoints: 20,
    weightPercentage: 20,
    anchorLevels: {
      level4: '18-20 Pkt: Präziser und vollständiger Basissatz mit treffender Kernaussage.',
      level3: '15-17 Pkt: Basissatz vollständig, Thema gut erfasst.',
      level2: '10-14 Pkt: Einleitung lückenhaft.',
      level1: '0-9 Pkt: Basissatz fehlt.'
    }
  },
  {
    id: 'inhaltswiedergabe_struktur',
    title: 'Strukturierte Inhaltsangabe',
    description: 'Wiedergabe der wesentlichen Sinnabschnitte in eigenen Worten, im Präsens, ohne wörtliche Zitate.',
    maxPoints: 35,
    weightPercentage: 35,
    anchorLevels: {
      level4: '32-35 Pkt: Sinnabschnitte logisch erfasst, durchgängig in eigenen Worten, Präsens gewahrt, keine Zitate.',
      level3: '26-31 Pkt: Wesentlicher Inhalt sachlich wiedergegeben, überwiegend eigene Worte.',
      level2: '18-25 Pkt: Unwichtiges miterzählt, Textstellen wörtlich abgeschrieben oder Tempusfehler.',
      level1: '0-17 Pkt: Inhalt verfälscht oder unvollständig.'
    }
  },
  {
    id: 'argumentation_analyse',
    title: 'Argumentationsweise & sprachliche Mittel',
    description: 'Herausarbeiten von Fakten-, Wert- oder Autoritätsargumenten, sprachliche Beeinflussungsstrategien.',
    maxPoints: 25,
    weightPercentage: 25,
    anchorLevels: {
      level4: '23-25 Pkt: Argumenttypen exakt bestimmt und sprachliche Strategien des Autors treffend analysiert.',
      level3: '19-22 Pkt: Argumente gut erfasst, sprachliche Mittel belegt.',
      level2: '13-18 Pkt: Nur oberflächliche Betrachtung.',
      level1: '0-12 Pkt: Analyse fehlt.'
    }
  },
  {
    id: 'sprachliche_sachlichkeit',
    title: 'Distanzierter Stil & Orthographie',
    description: 'Neutrale Berichterstattung ohne eigene Wertung im Hauptteil, fehlerfreie Rechtschreibung und Konjunktiv bei Redewiedergabe.',
    maxPoints: 20,
    weightPercentage: 20,
    anchorLevels: {
      level4: '18-20 Pkt: Vollkommen neutral, korrekter Konjunktiv, fehlerfrei.',
      level3: '15-17 Pkt: Sachlich formuliert, wenige Fehler.',
      level2: '10-14 Pkt: Eigene Meinungsäußerung im Hauptteil oder Sprachfehler.',
      level1: '0-9 Pkt: Unsachlich und stark fehlerhaft.'
    }
  }
];

// Standard-Kriterien für Aufsatz
const CRITERIA_AUFSATZ_STANDARD: CriterionItem[] = [
  {
    id: 'thema_roter_faden',
    title: 'Themenbezug & Roter Faden',
    description: 'Vollständige Bearbeitung der Aufgabenstellung, logische Verknüpfung aller Gedankenschritte.',
    maxPoints: 30,
    weightPercentage: 30,
    anchorLevels: {
      level4: '27-30 Pkt: Vollständiger Themenbezug, stringenter und leserorientierter roter Faden.',
      level3: '22-26 Pkt: Aufgabenstellung gut gelöst, Gedankenfolge schlüssig.',
      level2: '15-21 Pkt: Thema nur teilweise getroffen, Gedankensprünge.',
      level1: '0-14 Pkt: Thema verfehlt.'
    }
  },
  {
    id: 'sachwissen_gedankentiefe',
    title: 'Inhaltliche Qualität & Beispiele',
    description: 'Differenzierte Gedankenführung, treffende und lebensnahe Beispiele zur Veranschaulichung.',
    maxPoints: 30,
    weightPercentage: 30,
    anchorLevels: {
      level4: '27-30 Pkt: Hohe Gedankentiefe, originelle und überzeugende Beispiele.',
      level3: '22-26 Pkt: Gute Gedanken und passende Beispiele.',
      level2: '15-21 Pkt: Gedanken bleiben an der Oberfläche, Beispiele dünn.',
      level1: '0-14 Pkt: Inhaltlich substanzlos.'
    }
  },
  {
    id: 'ausdruck_satzvielfalt',
    title: 'Wortschatz & Satzbau',
    description: 'Vielfältige Satzanfänge, treffende Verben und Adjektive, leserfreundlicher Stil.',
    maxPoints: 20,
    weightPercentage: 20,
    anchorLevels: {
      level4: '18-20 Pkt: Reicher Wortschatz, abwechslungsreicher Satzbau, lebendige Sprache.',
      level3: '15-17 Pkt: Flüssiger Stil, gute Wortwahl.',
      level2: '10-14 Pkt: Monotone Sätze, Wortwiederholungen.',
      level1: '0-9 Pkt: Mangelhafter Ausdruck.'
    }
  },
  {
    id: 'rechtschreibung_zeichensetzung',
    title: 'Rechtschreibung & Grammatik',
    description: 'Zuverlässige Anwendung der Rechtschreib- und Kommaregeln.',
    maxPoints: 20,
    weightPercentage: 20,
    anchorLevels: {
      level4: '18-20 Pkt: Weitgehend fehlerfrei (0-2 Fehler).',
      level3: '15-17 Pkt: Wenige Fehler, guter Gesamteindruck.',
      level2: '10-14 Pkt: Gehäufte Fehler bei Rechtschreibung oder Zeichensetzung.',
      level1: '0-9 Pkt: Hohe Fehlerdichte.'
    }
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
3. Kriterien-Anker: Halte dich exakt an die 4 Stufenanker jedes Kriteriums (Stufe 4 = 90-100%, Stufe 3 = 75-89%, Stufe 2 = 50-74%, Stufe 1 = <50%). Vergib Punkte niemals willkürlich oder aus dem Bauch heraus!
4. Zitiere konkrete gelungene sowie verbesserungswürdige Textstellen direkt aus der Arbeit des Schülers und erkläre die didaktische Ursache.
5. Gib dem Schüler sofort umsetzbare, konkrete Formulierungshilfen für die Überarbeitung ("Besser so: ...").
6. Ermittle eine realistische Notentendenz (1 bis 6) nach dem Thüringer Regelschulschlüssel (100–90% = 1, 89–75% = 2, 74–60% = 3, 59–50% = 4, 49–25% = 5, unter 25% = 6).
7. Verhältnismäßigkeit: Kleine Tippfehler oder minimale Ergänzungen führen nur im jeweiligen Kriterium (z.B. Rechtschreibung) zu einem maßvollen Abzug, dürfen aber niemals die Gesamtpunktzahl willkürlich entwerten.
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
