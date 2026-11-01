# Feedbackstudio Deutsch – Staatliche Regelschule Heimbürgeschule Kahla

> **Kriterienorientiertes KI-Feedbackstudio für schriftliche Abschlussprüfungen in Thüringen**  
> Qualifizierender Hauptschulabschluss (Klasse 9) & Realschulabschluss (Klasse 10)  
> Angelehnt an die bewährten roten Stark-Prüfungshefte („Training Abschlussprüfung Deutsch“)

---

## 🌟 Kernfunktionen im Überblick

### 1. Für Schülerinnen und Schüler
- **Niedrigschwelliger Zugang mit 4-stelligem Schülerkürzel**:
  - Kein E-Mail-Zwang, keine Passwörter, die vergessen werden können.
  - Lukas Müller $\rightarrow$ `LMUE`, Tim Becker $\rightarrow$ `TBEC` nach dem Schulstandard.
  - Direkte Auswahl der Klassen **9a, 9b, 9c** oder **10a, 10b, 10c**.
- **Multimodale Texterfassung**:
  - Direkteingabe im integrierten Editor mit Live-Wort- & Zeichenzähler.
  - Upload von **Word (.docx)** und **PDF (.pdf)** mit automatischer Textextraktion.
  - Upload von **Screenshots und Fotos (.jpg, .png)** digitaler oder handschriftlicher Arbeiten mit nativer KI-Transkription durch Gemini Vision.
  - Text kann vor der Bewertung vom Schüler überprüft und korrigiert werden.
- **Stark-Prüfungsfeedback**:
  - Detaillierte Kriterienmatrix (Inhalt/Gliederung, Argumentation, sprachlicher Ausdruck, Rechtschreibung & Grammatik).
  - Punkteverteilung und **Notenprognose (1 bis 6)** nach dem offiziellen Thüringer Regelschulschlüssel.
  - Farbcodierte Stärken (Grün) und konkrete Verbesserungsansätze mit Originalzitaten.
  - Spezifische Prüfungstipps für die Thüringer Abschlussprüfung.
- **Iterative Überarbeitung ($v_1 \rightarrow v_2$)**:
  - Schüler können ihren Text direkt auf Basis der Tipps überarbeiten und als neue Version einreichen, um ihren Lernzuwachs sofort zu sehen.
- **Tintenschonender A4-Druckbogen (`PrintSheet`)**:
  - Optimiert für `@media print` ohne dunkle Tintenflächen.
  - Enthält Schülerkürzel, Aufgabenstellung, Kriterienmatrix, Punkte, Notenfeld und Lehrkraft-Unterschriftenlinie für den Hefter oder die Prüfungsmappe.

---

### 2. Für Fachlehrkräfte Deutsch
- **Zentrales Lehrer-Dashboard** (Passwort: `lehrer2026`):
  - **1-Klick-Klassenfilter**: Sofortiges Umschalten zwischen `Alle`, `9a`, `9b`, `9c`, `10a`, `10b`, `10c`.
  - Filter nach Textsorten (`Erörterung`, `Gedichtanalyse`, `Gestaltendes Schreiben`, `Sachtext`, `Aufsatz`) und Status.
  - **1-Klick-Kürzel-Kopieren**: Schnelles Nachschlagen und Kopieren des Schüler-Logins bei Nachfragen im Unterricht.
  - Klassen-Korrektur per Dropdown direkt in der Tabelle.
- **Flexibler Hybrid-Modus**:
  - Pro Klasse steuerbar: **Sofort-Feedback** (Übungsmodus) oder **Freigabepflicht durch Lehrkraft** (Prüfungsmodus).
- **Zweigeteilter Stark-Prompt- und Kriterien-Manager**:
  - Kriterien, Maximalpunkte und Leitfragen direkt in einer Tabelle anpassen.
  - Systemprompt im Texteditor anpassen – ohne die App neu coden zu müssen.
  - „Auf Stark-Standard zurücksetzen“-Button bei Bedarf.
- **Prüfen & Freigeben**:
  - Lehrkräfte können die Punkte der KI anpassen und persönliche Kommentare für den Schüler hinterlegen.

---

## 🚀 Lokale Entwicklung & Start

```bash
# Abhängigkeiten installieren
npm install

# Lokalen Entwicklungsserver starten
npm run dev

# Produktions-Build erstellen
npm run build

# Produktions-Vorschau testen
npm run preview
```

---

## 🔐 Wichtige Schritte zur Veröffentlichung (Vercel & GitHub)

### 1. Code auf GitHub veröffentlichen
Das Repository ist bereits mit deinem GitHub-Projekt verknüpft:
```bash
git add .
git commit -m "feat: Feedbackstudio Deutsch für Heimbürgeschule Kahla fertiggestellt"
git push -u origin main
```

### 2. Google Gemini API-Schlüssel in Vercel als Secret hinterlegen
Gemäß unserem Schulstandard (`gemini-school-api`) läuft der API-Schlüssel über den geschützten Serverless-Proxy `/api/gemini`:

1. Öffne dein Projekt im **Vercel Dashboard**.
2. Navigiere zu: **Settings** $\rightarrow$ **Environment Variables**.
3. Lege eine neue Variable an:
   - **Key**: `GEMINI_API_KEY` *(wichtig: ohne `VITE_`-Präfix!)*
   - **Value**: `[Dein Google Gemini API-Schlüssel aus aistudio.google.com]`
   - **Type**: `Secret`
   - **Environments**: Alle drei Haken setzen (`Production`, `Preview`, `Development`).
4. Klicke auf **Save**.
5. Klicke unter **Deployments** auf die drei Punkte (...) deines neuesten Deployments und wähle **Redeploy**.

---

## 📱 Responsives Design & Safe-Area

Entwickelt nach dem offiziellen Standard `responsive-school-apps`:
- **Smartphones (iPhone & Android)**: Vollflächige Nutzung mit `viewport-fit=cover`, dynamischer Aussparung für Notch & Home-Bar (`pt-safe`, `pb-safe`) und Daumen-Touch-Targets $\ge 44$px.
- **Tablets (iPads)**: Optimiertes 2-Spalten-Layout mit fingerfreundlichen Tabs.
- **Laptops & iMacs (bis 5K)**: Großzügige Werkbank bis 2100px Bildschirmbreite ohne künstliche Breitenbeschränkungen.
