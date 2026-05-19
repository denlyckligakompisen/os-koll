import { chromium } from 'playwright';

async function main() {
  console.log('Launching browser to fetch seasons...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();

  console.log('Establishing session on sofascore.com...');
  await page.goto('https://www.sofascore.com/football/league/allsvenskan/40', {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });
  await page.waitForTimeout(3000);

  const url = 'https://api.sofascore.com/api/v1/unique-tournament/40/seasons';
  console.log(`Fetching seasons from: ${url}`);
  
  const result = await page.evaluate(async (fetchUrl) => {
    try {
      const resp = await fetch(fetchUrl, {
        headers: { 'Accept': 'application/json' },
      });
      if (!resp.ok) {
        return { error: true, status: resp.status, message: `HTTP ${resp.status}` };
      }
      const data = await resp.json();
      return { error: false, data };
    } catch (err) {
      return { error: true, status: 0, message: err.message };
    }
  }, url);

  if (result.error) {
    console.error('Error fetching:', result.message);
  } else {
    console.log('Seasons retrieved:');
    console.log(JSON.stringify(result.data, null, 2));
  }

  await browser.close();
}

main().catch(console.error);
