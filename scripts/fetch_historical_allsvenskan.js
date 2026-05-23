/**
 * Fetch Historical Allsvenskan Standings and Matches (2017-2025)
 * 
 * Usage:
 *   node scripts/fetch_historical_allsvenskan.js --year 2024
 *   node scripts/fetch_historical_allsvenskan.js --all
 */

import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const TOURNAMENT_ID = 40; // Allsvenskan
const API_BASE = 'https://api.sofascore.com/api/v1';
const OUTPUT_DIR = path.join(process.cwd(), 'public/data');

const SEASONS = {
  2017: 12836,
  2018: 15731,
  2019: 19949,
  2020: 26784,
  2021: 35306,
  2022: 40406,
  2023: 47730,
  2024: 57284,
  2025: 69956,
};

const MONTHS_SV = {
  0: 'JANUARI', 1: 'FEBRUARI', 2: 'MARS', 3: 'APRIL',
  4: 'MAJ', 5: 'JUNI', 6: 'JULI', 7: 'AUGUSTI',
  8: 'SEPTEMBER', 9: 'OKTOBER', 10: 'NOVEMBER', 11: 'DECEMBER'
};

const DAYS_SV = {
  0: 'SÖNDAG', 1: 'MÅNDAG', 2: 'TISDAG', 3: 'ONSDAG',
  4: 'TORSDAG', 5: 'FREDAG', 6: 'LÖRDAG'
};

function formatDateSwedish(timestamp, yearVal) {
  const date = new Date(timestamp * 1000);
  const dayName = DAYS_SV[date.getDay()];
  const dayOfMonth = date.getDate();
  const monthName = MONTHS_SV[date.getMonth()];
  return `${dayName} ${dayOfMonth} ${monthName} ${yearVal}`;
}

function formatTime(timestamp) {
  const date = new Date(timestamp * 1000);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

let _browser = null;
let _page = null;

async function initBrowser() {
  if (_page) return;
  console.log('  🌐 Launching browser...');
  _browser = await chromium.launch({ headless: true });
  const context = await _browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    locale: 'sv-SE',
    timezoneId: 'Europe/Stockholm',
  });
  _page = await context.newPage();

  console.log('  🌐 Establishing session on sofascore.com...');
  await _page.goto('https://www.sofascore.com/football/league/allsvenskan/40', {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });
  await _page.waitForTimeout(3000);
  console.log('  ✓ Browser session established');
}

async function closeBrowser() {
  if (_browser) {
    await _browser.close();
    _browser = null;
    _page = null;
  }
}

async function fetchApi(endpoint) {
  await initBrowser();
  const url = `${API_BASE}${endpoint}`;
  const result = await _page.evaluate(async (fetchUrl) => {
    try {
      const resp = await fetch(fetchUrl, {
        headers: {
          'Accept': 'application/json',
        },
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
    throw new Error(`HTTP ${result.status} for ${endpoint}: ${result.message}`);
  }
  return result.data;
}

async function fetchHistoricalStandings(year, seasonId) {
  console.log(`📊 Fetching Allsvenskan standings for ${year}...`);
  try {
    const data = await fetchApi(`/unique-tournament/${TOURNAMENT_ID}/season/${seasonId}/standings/total`);
    const rows = data.standings?.[0]?.rows || [];
    console.log(`  ✓ Received ${rows.length} teams in standings for ${year}`);

    const table = rows.map(row => {
      const team = row.team?.name || '';
      return {
        rank: String(row.position),
        team,
        played: String(row.matches ?? 0),
        won: String(row.wins ?? 0),
        drawn: String(row.draws ?? 0),
        lost: String(row.losses ?? 0),
        goals: `${row.scoresFor ?? 0}-${row.scoresAgainst ?? 0}`,
        gd: String((row.scoresFor ?? 0) - (row.scoresAgainst ?? 0)),
        points: String(row.points ?? 0),
      };
    });

    const output = {
      table,
      year: parseInt(year),
      lastUpdated: new Date().toISOString(),
    };

    const filePath = path.join(OUTPUT_DIR, `allsvenskan_table_${year}.json`);
    fs.writeFileSync(filePath, JSON.stringify(output, null, 2));
    console.log(`  ✓ Saved ${table.length} teams to ${filePath}`);
  } catch (error) {
    console.error(`  ❌ Failed to fetch standings for ${year}: ${error.message}`);
  }
}

async function fetchHistoricalMatches(year, seasonId) {
  console.log(`📅 Fetching Allsvenskan matches for ${year}...`);
  const allEvents = [];
  
  for (let page = 0; page < 20; page++) {
    try {
      console.log(`  → Fetching page ${page} of finished matches for ${year}...`);
      const data = await fetchApi(
        `/unique-tournament/${TOURNAMENT_ID}/season/${seasonId}/events/last/${page}`
      );
      const events = data.events || [];
      if (events.length === 0) break;
      allEvents.push(...events);
      if (!data.hasNextPage) break;

      // Polite delay between page requests
      await new Promise(r => setTimeout(r, 400));
    } catch (e) {
      console.log(`  ⚠ Finished paginated fetches at page ${page}: ${e.message}`);
      break;
    }
  }

  console.log(`  ✓ Received ${allEvents.length} total events for ${year}`);

  // Sort by date
  allEvents.sort((a, b) => a.startTimestamp - b.startTimestamp);

  // Deduplicate by event ID
  const seen = new Set();
  const uniqueEvents = allEvents.filter(e => {
    if (seen.has(e.id)) return false;
    seen.add(e.id);
    return true;
  });

  const matches = uniqueEvents.map(event => {
    const home = event.homeTeam?.name || '';
    const away = event.awayTeam?.name || '';
    const id = event.id;

    // Determine status (all finished for history)
    const status = 'finished';

    // Format score
    const homeGoals = event.homeScore?.current ?? '?';
    const awayGoals = event.awayScore?.current ?? '?';
    const score = `${homeGoals} - ${awayGoals}`;

    // Time is finished, set as TBA (matching existing UI expectations)
    const time = 'TBA';

    // Date in Swedish format with year
    const date = formatDateSwedish(event.startTimestamp, year);

    return { 
      id, 
      customId: event.customId,
      home, 
      away, 
      time, 
      date, 
      link: '', 
      score, 
      status, 
      startTimestamp: event.startTimestamp,
      liveCurrentTime: ''
    };
  }).filter(m => m.home && m.away);

  const output = {
    matches,
    year: parseInt(year),
    lastUpdated: new Date().toISOString(),
    source: 'SofaScore',
  };

  const filePath = path.join(OUTPUT_DIR, `allsvenskan_matches_${year}.json`);
  fs.writeFileSync(filePath, JSON.stringify(output, null, 2));
  console.log(`  ✓ Saved ${matches.length} total matches to ${filePath}`);
}

async function main() {
  const args = process.argv.slice(2);
  const runAll = args.includes('--all');
  const yearIdx = args.indexOf('--year');
  const targetYear = yearIdx !== -1 ? args[yearIdx + 1] : null;

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log('⚽ Allsvenskan Historical Data Fetcher');
  console.log('─'.repeat(50));

  try {
    if (runAll) {
      const years = Object.keys(SEASONS).sort();
      for (const year of years) {
        const seasonId = SEASONS[year];
        await fetchHistoricalStandings(year, seasonId);
        await fetchHistoricalMatches(year, seasonId);
        // Add a nice pause between seasons
        await new Promise(r => setTimeout(r, 1000));
      }
    } else if (targetYear && SEASONS[targetYear]) {
      const seasonId = SEASONS[targetYear];
      await fetchHistoricalStandings(targetYear, seasonId);
      await fetchHistoricalMatches(targetYear, seasonId);
    } else {
      console.log('Please provide a valid option:');
      console.log('  node scripts/fetch_historical_allsvenskan.js --all');
      console.log('  node scripts/fetch_historical_allsvenskan.js --year 2024');
      process.exit(1);
    }
    console.log('\n✅ All done!');
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  } finally {
    await closeBrowser();
  }
}

main();
