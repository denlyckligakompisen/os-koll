import { chromium } from 'playwright';

const TOURNAMENT_ID = 40;   // Allsvenskan
const SEASON_ID = 87925;    // 2026 season
const API_BASE = 'https://www.sofascore.com/api/v1';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  console.log('Navigating to SofaScore...');
  await page.goto('https://www.sofascore.com', { waitUntil: 'domcontentloaded', timeout: 15000 });

  const fetchApi = async (endpoint) => {
    return await page.evaluate(async (url) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      return res.json();
    }, `${API_BASE}${endpoint}`);
  };

  try {
    console.log('Fetching last events...');
    // We fetch page 0 and page 1 of finished matches
    for (let p = 0; p < 3; p++) {
      const data = await fetchApi(`/unique-tournament/${TOURNAMENT_ID}/season/${SEASON_ID}/events/last/${p}`);
      const events = data.events || [];
      for (const event of events) {
        const home = event.homeTeam?.name;
        const away = event.awayTeam?.name;
        if (home?.includes('Sirius') && away?.includes('Kalmar') || home?.includes('Kalmar') && away?.includes('Sirius')) {
          console.log(`\n🎉 MATCH FOUND!`);
          console.log(`ID: ${event.id}`);
          console.log(`Match: ${home} ${event.homeScore?.current} - ${event.awayScore?.current} ${away}`);
          console.log(`Date: ${new Date(event.startTimestamp * 1000).toLocaleDateString('sv-SE')}`);
          
          console.log('\nFetching incidents for this match...');
          const incidents = await fetchApi(`/event/${event.id}/incidents`);
          console.log(JSON.stringify(incidents, null, 2));
        }
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

main();
