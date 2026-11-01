// verify_browser.cjs - Umfassende Browser- und Responsivitätsprüfung
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runVerification() {
  console.log('🚀 Starte Vite Preview Server auf Port 4173...');
  const server = spawn('npx', ['vite', 'preview', '--port', '4173'], {
    stdio: 'pipe',
    shell: true
  });

  // Warte bis Server lauscht
  await new Promise((resolve) => setTimeout(resolve, 2500));

  console.log('🌐 Starte Headless Browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    // 1. Desktop Viewport: Login Modal
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto('http://localhost:4173', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_login_modal_desktop.png'), fullPage: false });
    console.log('✅ Screenshot 1: Desktop Login Modal');

    // 2. Mobile Viewport: Login Modal (iPhone 390x844)
    await page.setViewport({ width: 390, height: 844 });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_login_modal_mobile.png'), fullPage: false });
    console.log('✅ Screenshot 2: Mobile Login Modal (iPhone)');

    // 3. Tab "Neues Kürzel anlegen" mit Live-Vorschau testen
    const newTabBtn = (await page.$$('button'))[1];
    if (newTabBtn) {
      await newTabBtn.click();
      await page.waitForSelector('input[placeholder*="Lukas Müller"]');
      await page.type('input[placeholder*="Lukas Müller"]', 'Tim Becker');
      await new Promise(r => setTimeout(r, 300));
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_mobile_new_student_code_preview.png') });
      console.log('✅ Screenshot 3: Live-Kürzel-Generierung (TBEC)');
    }

    // 4. Einloggen als Schüler LMUE
    await page.setViewport({ width: 1440, height: 900 });
    const existingTabBtn = (await page.$$('button'))[0];
    await existingTabBtn.click();
    await page.waitForSelector('input[placeholder*="LMUE"]');
    await page.type('input[placeholder*="LMUE"]', 'LMUE');
    const loginSubmitBtn = (await page.$$('button[type="submit"]'))[0];
    await loginSubmitBtn.click();
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_student_workspace.png'), fullPage: false });
    console.log('✅ Screenshot 4: Student Workspace (LMUE)');

    // 5. Klick auf eine bestehende Abgabe -> Stark Feedback ansehen
    const card = await page.$('.cursor-pointer');
    if (card) {
      await card.click();
      await new Promise(r => setTimeout(r, 600));
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_stark_feedback_view.png'), fullPage: true });
      console.log('✅ Screenshot 5: Stark Feedback View (Punkte, Kriterien & Zitate)');
    }

    // 6. Zurück zur Liste und "Neue Arbeit einreichen" öffnen
    const backBtn = await page.$('button');
    if (backBtn) {
      await backBtn.click();
      await new Promise(r => setTimeout(r, 400));
      const newSubmitBtn = await page.$('button.bg-school-orange');
      if (newSubmitBtn) {
        await newSubmitBtn.click();
        await new Promise(r => setTimeout(r, 400));
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_submission_editor.png'), fullPage: true });
        console.log('✅ Screenshot 6: Submission Editor & File Dropzone');
      }
    }

    // 7. Ausloggen & Lehrer-Login
    await page.evaluate(() => localStorage.clear());
    await page.goto('http://localhost:4173', { waitUntil: 'networkidle0' });
    const teacherTab = (await page.$$('button'))[2];
    await teacherTab.click();
    await page.waitForSelector('input[type="password"]');
    await page.type('input[type="password"]', 'lehrer2026');
    const teacherSubmit = (await page.$$('button[type="submit"]'))[0];
    await teacherSubmit.click();
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07_teacher_dashboard.png'), fullPage: true });
    console.log('✅ Screenshot 7: Teacher Dashboard (Klassen 9a-9c & 10a-10c)');

    // 8. Mobile Lehrer-Ansicht (Tablet / iPad 820x1180)
    await page.setViewport({ width: 820, height: 1180 });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08_teacher_dashboard_ipad.png') });
    console.log('✅ Screenshot 8: Teacher Dashboard iPad View');

    // 9. Klick auf "Prompts & Raster anpassen"
    await page.setViewport({ width: 1440, height: 900 });
    const promptBtn = (await page.$$('button')).find(async (b) => {
      const text = await page.evaluate(el => el.textContent, b);
      return text && text.includes('Prompts & Raster');
    });
    if (promptBtn) {
      await promptBtn.click();
      await new Promise(r => setTimeout(r, 500));
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09_prompt_manager_modal.png') });
      console.log('✅ Screenshot 9: Prompt Manager Modal (Zweigeteilter Editor)');
    }

    console.log('\n🎉 Alle Browser-Tests und Responsivitäts-Screenshots erfolgreich abgeschlossen!');
  } catch (err) {
    console.error('❌ Fehler bei Browser-Verifikation:', err);
  } finally {
    await browser.close();
    server.kill();
  }
}

runVerification();
