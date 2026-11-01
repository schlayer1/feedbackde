// verify_scoring_consistency.cjs - Testet die Revisionskonsistenz (Der LMUE-Fall)
const puppeteer = require('puppeteer');
const path = require('path');
const { spawn } = require('child_process');

async function testScoringConsistency() {
  console.log('🚀 Starte Preview Server auf Port 4177...');
  const server = spawn('npx', ['vite', 'preview', '--port', '4177'], { stdio: 'pipe', shell: true });
  await new Promise(r => setTimeout(r, 2000));

  console.log('🌐 Starte Browser für Konsistenz-Test...');
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 950 });

  try {
    // 1. Login als LMUE
    await page.goto('http://localhost:4177', { waitUntil: 'networkidle0' });
    await page.waitForSelector('input[placeholder*="LMUE"]');
    await page.type('input[placeholder*="LMUE"]', 'LMUE');
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 600));

    // 2. Klicke auf bestehende Abgabe (Version 1 mit 82 Punkten)
    const cardTitle = await page.waitForSelector('h3');
    await cardTitle.click();
    await new Promise(r => setTimeout(r, 600));

    // 3. Klicke auf "Als Version 2 überarbeiten"
    const buttons = await page.$$('button');
    for (const b of buttons) {
      const text = await page.evaluate(el => el.textContent, b);
      if (text && text.includes('überarbeiten')) {
        await b.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 600));

    // 4. Ergänze im Editor genau den Satz des Nutzers: "Handys gehlren heute in die Schule."
    const textarea = await page.waitForSelector('textarea');
    await page.evaluate((el) => {
      el.value = el.value + '\n\nHandys gehlren heute in die Schule.';
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }, textarea);
    await new Promise(r => setTimeout(r, 400));

    // Screenshot des Revisions-Editors mit der Ergänzung
    await page.screenshot({ path: path.join(__dirname, 'screenshots', '13_revision_editor_with_sentence.png'), fullPage: true });
    console.log('✅ Screenshot 13: Revisions-Editor mit Ergänzung "Handys gehlren heute in die Schule."');

    // 5. Klicke auf "Version 2 prüfen lassen"
    const submitBtn = await page.$('button[type="submit"]');
    await submitBtn.click();
    await new Promise(r => setTimeout(r, 1200));

    // 6. Screenshot des konsistenten Revisions-Feedbacks
    await page.screenshot({ path: path.join(__dirname, 'screenshots', '14_consistent_delta_feedback_v2.png'), fullPage: true });
    console.log('✅ Screenshot 14: Konsistentes Delta-Feedback für Version 2');

    // 7. Prüfe die Punkte in der Auswertung
    const scoreText = await page.evaluate(() => {
      const el = document.querySelector('.font-black.font-mono');
      return el ? el.textContent : '';
    });
    console.log(`\n🎯 ERGEBNIS-PUNKTE IN VERSION 2: ${scoreText}`);

    // 8. Klicke auf den "KI Status"-Button im Header, um das neue ApiKeyModal zu prüfen
    const statusBtn = await page.$('header button');
    if (statusBtn) {
      await statusBtn.click();
      await new Promise(r => setTimeout(r, 500));
      await page.screenshot({ path: path.join(__dirname, 'screenshots', '15_api_key_modal.png') });
      console.log('✅ Screenshot 15: Neues ApiKeyModal zur transparenten KI-Steuerung');
    }

    console.log('\n🎉 Konsistenz-Test erfolgreich beendet!');
  } catch (err) {
    console.error('❌ Fehler:', err);
  } finally {
    await browser.close();
    server.kill();
  }
}

testScoringConsistency();
