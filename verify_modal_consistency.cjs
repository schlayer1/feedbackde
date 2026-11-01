// verify_modal_consistency.cjs
const puppeteer = require('puppeteer');
const { spawn } = require('child_process');

async function main() {
  console.log('🚀 Spawning Vite preview server on port 4180...');
  const server = spawn('npx', ['vite', 'preview', '--port', '4180', '--strictPort'], {
    stdio: 'pipe',
    shell: true
  });

  await new Promise((resolve) => {
    server.stdout.on('data', (d) => {
      const msg = d.toString();
      if (msg.includes('4180')) resolve();
    });
    setTimeout(resolve, 3000);
  });

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true }); // iPhone 14/15 size

    console.log('📱 Navigating to app...');
    await page.goto('http://localhost:4180', { waitUntil: 'networkidle2' });

    // Login with existing code LMUE
    console.log('🔑 Logging in with code LMUE...');
    await page.waitForSelector('input', { timeout: 5000 });
    await page.type('input', 'LMUE');
    await page.click('button[type="submit"]');
    await page.waitForNetworkIdle({ idleTime: 500 });

    // Click KI-Pill in Header
    console.log('🔍 Clicking KI Status Pill in Header...');
    const kiPill = await page.waitForSelector('button[title*="Gemini"], button[title*="Offline"], button[title*="KI"]', { timeout: 5000 });
    await kiPill.click();

    await page.waitForSelector('h2', { timeout: 3000 });
    await new Promise(r => setTimeout(r, 600));

    // Capture initial modal screenshot
    await page.screenshot({ path: 'screenshots/16_modal_consistent_initial.png' });
    console.log('📸 Saved screenshots/16_modal_consistent_initial.png');

    // Click "Verbindung testen"
    console.log('⚡ Clicking "Verbindung testen"...');
    const testBtn = await page.waitForSelector('button ::-p-text(Verbindung testen)');
    await testBtn.click();

    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: 'screenshots/17_modal_consistent_tested.png' });
    console.log('📸 Saved screenshots/17_modal_consistent_tested.png');

    console.log('✅ Modal consistency verification completed successfully!');
  } finally {
    await browser.close();
    server.kill();
  }
}

main().catch(err => {
  console.error('❌ Error during verification:', err);
  process.exit(1);
});
