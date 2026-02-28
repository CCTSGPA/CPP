/* eslint-env node */
const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  const messages = [];

  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    messages.push({ type, text });
    console.log(`[console:${type}] ${text}`);
  });

  page.on('pageerror', err => {
    messages.push({ type: 'pageerror', text: err.message });
    console.log(`[pageerror] ${err.message}`);
  });

  try {
    const url = process.env.URL || 'http://localhost:5173/';
    console.log('Navigating to', url);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'scripts/screenshot.png', fullPage: true });
    console.log('Screenshot saved to scripts/screenshot.png');

    const result = { messages };
    fs.writeFileSync('scripts/console-log.json', JSON.stringify(result, null, 2));
    console.log('Console messages saved to scripts/console-log.json');

    const hasErrors = messages.some(m => m.type === 'error' || m.type === 'pageerror');
    await browser.close();
    process.exit(hasErrors ? 1 : 0);
  } catch (err) {
    console.error('Script error:', err);
    await browser.close();
    process.exit(2);
  }
})();