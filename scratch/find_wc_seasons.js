import { chromium } from 'playwright';

async function findSeasons() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  // Navigate to SofaScore once to get cookies/session
  await page.goto('https://www.sofascore.com', { waitUntil: 'domcontentloaded', timeout: 15000 });

  console.log('Fetching World Cup seasons...');
  const result = await page.evaluate(async () => {
    const res = await fetch('https://www.sofascore.com/api/v1/unique-tournament/16/seasons');
    return res.json();
  });

  console.log('Seasons found:', JSON.stringify(result, null, 2));
  await browser.close();
}

findSeasons();
