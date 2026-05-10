import fs from 'fs';
import { chromium } from 'playwright';

const MATCHES_FILE = 'public/data/allsvenskan_matches.json';
const API_BASE = 'https://www.sofascore.com/api/v1';

async function run() {
  console.log('Loading matches...');
  const data = JSON.parse(fs.readFileSync(MATCHES_FILE, 'utf8'));
  const matches = data.matches;

  const now = new Date();
  
  // Find upcoming matches
  const parseMatchDate = (dateStr, timeStr) => {
    const MONTH_MAP = { 
      'jan': 0, 'januari': 0, 'feb': 1, 'februari': 1, 'mar': 2, 'mars': 2,
      'apr': 3, 'april': 3, 'maj': 4, 'jun': 5, 'juni': 5, 'jul': 6, 'juli': 6,
      'aug': 7, 'augusti': 7, 'sep': 8, 'september': 8, 'okt': 9, 'oktober': 9,
      'nov': 10, 'november': 10, 'dec': 11, 'december': 11
    };
    if (!dateStr) return new Date();
    const parts = dateStr.split(' ');
    const day = parseInt(parts[1]);
    const monthName = parts[2]?.toLowerCase();
    const year = parseInt(parts[3]) || 2026;
    let hour = 0, minute = 0;
    if (timeStr && timeStr.includes(':')) {
      const [h, m] = timeStr.split(':').map(Number);
      hour = h;
      minute = m;
    }
    return new Date(year, MONTH_MAP[monthName] ?? 0, day, hour, minute);
  };

  const upcomingMatches = matches.filter(m => m.status === 'upcoming');
  console.log(`Found ${upcomingMatches.length} upcoming matches.`);

  if (upcomingMatches.length === 0) {
    console.log('No upcoming matches to update.');
    return;
  }

  console.log('Launching browser to fetch H2H data...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  console.log('Navigating to sofascore.com...');
  await page.goto('https://www.sofascore.com', { waitUntil: 'domcontentloaded', timeout: 15000 });

  // Update next 16 upcoming matches (full 2 rounds)
  const targets = upcomingMatches.slice(0, 16);
  console.log(`Updating H2H for next ${targets.length} matches...`);

  for (const match of targets) {
    // If we don't have customId, we can skip or look it up. Let's make sure we have it.
    // If it's missing, let's fetch event detail to get customId
    if (!match.customId && match.id) {
      try {
        const url = `${API_BASE}/event/${match.id}`;
        console.log(`  Fetching event details for ${match.home} - ${match.away} (ID: ${match.id})...`);
        const eventRes = await page.evaluate(async (fetchUrl) => {
          const res = await fetch(fetchUrl);
          return res.ok ? res.json() : null;
        }, url);
        if (eventRes && eventRes.event && eventRes.event.customId) {
          match.customId = eventRes.event.customId;
          match.round = eventRes.event.roundInfo?.round;
        }
      } catch (err) {
        console.log(`  ⚠ Failed to fetch event details: ${err.message}`);
      }
    }

    if (match.customId) {
      try {
        const url = `${API_BASE}/event/${match.customId}/h2h/events`;
        console.log(`  Fetching H2H history for ${match.home} - ${match.away} (customId: ${match.customId})...`);
        const h2hRes = await page.evaluate(async (fetchUrl) => {
          const res = await fetch(fetchUrl);
          return res.ok ? res.json() : null;
        }, url);

        if (h2hRes && h2hRes.events) {
          const finished = h2hRes.events.filter(e => e.winnerCode !== undefined);
          
          let homeWins = 0;
          let draws = 0;
          let awayWins = 0;

          const cleanName = (n) => n.replace(/\b(IF|FF|BK|AIF|SK)\b/g, '').replace(/\s+/g, ' ').trim();
          const cleanHomeTarget = cleanName(match.home);
          const cleanAwayTarget = cleanName(match.away);

          finished.slice(0, 5).forEach(e => {
            if (e.winnerCode === 3) {
              draws++;
            } else {
              const cleanPastHome = cleanName(e.homeTeam.name);
              const cleanPastAway = cleanName(e.awayTeam.name);
              
              const homeWon = e.winnerCode === 1;
              const winnerName = homeWon ? cleanPastHome : cleanPastAway;
              
              if (winnerName.includes(cleanHomeTarget) || cleanHomeTarget.includes(winnerName)) {
                homeWins++;
              } else if (winnerName.includes(cleanAwayTarget) || cleanAwayTarget.includes(winnerName)) {
                awayWins++;
              }
            }
          });

          match.h2h = {
            homeWins,
            draws,
            awayWins,
            isLast5: true
          };
          console.log(`    → H2H (last 5) loaded: ${homeWins}V - ${draws}O - ${awayWins}F`);
        }
        await new Promise(r => setTimeout(r, 100));
      } catch (err) {
        console.log(`  ⚠ Failed to fetch H2H: ${err.message}`);
      }
    }
  }

  await browser.close();

  // Write changes
  console.log('Writing updated matches to disk...');
  data.lastUpdated = new Date().toISOString();
  fs.writeFileSync(MATCHES_FILE, JSON.stringify(data, null, 2), 'utf8');
  console.log('Done!');
}

run().catch(err => console.error('Error:', err));
