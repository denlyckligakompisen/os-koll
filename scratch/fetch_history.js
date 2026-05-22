import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const SEASONS = [
  { year: 2016, id: 11126 },
  { year: 2015, id: 9769 },
  { year: 2014, id: 7598 },
  { year: 2013, id: 5762 },
  { year: 2012, id: 4164 },
  { year: 2011, id: 3174 },
  { year: 2010, id: 2542 },
  { year: 2009, id: 1987 },
  { year: 2008, id: 452 }
];

const TOURNAMENT_ID = 40;
const API_BASE = 'https://api.sofascore.com/api/v1';
const OUTPUT_DIR = path.join(process.cwd(), 'public/data');

const MONTHS_SV = {
  0: 'JANUARI', 1: 'FEBRUARI', 2: 'MARS', 3: 'APRIL',
  4: 'MAJ', 5: 'JUNI', 6: 'JULI', 7: 'AUGUSTI',
  8: 'SEPTEMBER', 9: 'OKTOBER', 10: 'NOVEMBER', 11: 'DECEMBER'
};

const DAYS_SV = {
  0: 'SÖNDAG', 1: 'MÅNDAG', 2: 'TISDAG', 3: 'ONSDAG',
  4: 'TORSDAG', 5: 'FREDAG', 6: 'LÖRDAG'
};

function formatDateSwedish(timestamp) {
  const date = new Date(timestamp * 1000);
  const dayName = DAYS_SV[date.getDay()];
  const dayOfMonth = date.getDate();
  const monthName = MONTHS_SV[date.getMonth()];
  return `${dayName} ${dayOfMonth} ${monthName}`;
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
    viewport: { width: 1920, height: 1080 },
  });
  _page = await context.newPage();

  console.log('  🌐 Establishing session on sofascore.com...');
  await _page.goto('https://www.sofascore.com/football/league/allsvenskan/40', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await _page.waitForTimeout(3000);
  console.log('  ✓ Browser session established');
}

async function fetchApi(endpoint) {
  console.log(`  → GET ${endpoint}`);
  await initBrowser();
  const url = `${API_BASE}${endpoint}`;
  const result = await _page.evaluate(async (fetchUrl) => {
    try {
      const resp = await fetch(fetchUrl, { headers: { 'Accept': 'application/json' } });
      if (!resp.ok) return { error: true, status: resp.status, message: `HTTP ${resp.status}` };
      const data = await resp.json();
      return { error: false, data };
    } catch (err) {
      return { error: true, status: 0, message: err.message };
    }
  }, url);

  if (result.error) throw new Error(`HTTP ${result.status} for ${endpoint}: ${result.message}`);
  return result.data;
}

async function fetchMatchesForSeason(year, seasonId) {
  console.log(`\n📅 Fetching Allsvenskan matches for ${year}...`);
  const allEvents = [];
  
  for (let page = 0; page < 20; page++) {
    try {
      const data = await fetchApi(`/unique-tournament/${TOURNAMENT_ID}/season/${seasonId}/events/last/${page}`);
      const events = data.events || [];
      if (events.length === 0) break;
      allEvents.push(...events);
      if (!data.hasNextPage) break;
      await new Promise(r => setTimeout(r, 200));
    } catch (e) {
      break;
    }
  }

  allEvents.sort((a, b) => a.startTimestamp - b.startTimestamp);
  const seen = new Set();
  const uniqueEvents = allEvents.filter(e => {
    if (seen.has(e.id)) return false;
    seen.add(e.id);
    return true;
  });

  const matches = [];
  for (const event of uniqueEvents) {
    const home = event.homeTeam?.name || '';
    const away = event.awayTeam?.name || '';
    if (!home || !away) continue;
    
    let status = event.status?.type === 'finished' ? 'finished' : 'upcoming';
    const score = status === 'finished' ? `${event.homeScore?.current ?? '?'} - ${event.awayScore?.current ?? '?'}` : '';
    
    matches.push({
      id: event.id,
      customId: event.customId,
      home,
      away,
      time: 'TBA', // historical, no specific time needed usually
      date: formatDateSwedish(event.startTimestamp),
      link: '',
      score,
      status,
      startTimestamp: event.startTimestamp,
      round: event.roundInfo?.round
    });
  }

  const output = { matches, lastUpdated: new Date().toISOString(), source: 'SofaScore' };
  const filename = path.join(OUTPUT_DIR, `allsvenskan_matches_${year}.json`);
  fs.writeFileSync(filename, JSON.stringify(output, null, 2));
  console.log(`  ✓ Saved ${matches.length} matches to ${filename}`);
}

async function fetchTableForSeason(year, seasonId) {
  console.log(`\n📊 Fetching Allsvenskan standings for ${year}...`);
  const data = await fetchApi(`/unique-tournament/${TOURNAMENT_ID}/season/${seasonId}/standings/total`);
  const rows = data.standings?.[0]?.rows || [];
  
  const table = rows.map(row => ({
    rank: String(row.position),
    team: row.team?.name || '',
    played: String(row.matches ?? 0),
    won: String(row.wins ?? 0),
    drawn: String(row.draws ?? 0),
    lost: String(row.losses ?? 0),
    goals: `${row.scoresFor ?? 0}-${row.scoresAgainst ?? 0}`,
    gd: String((row.scoresFor ?? 0) - (row.scoresAgainst ?? 0)),
    points: String(row.points ?? 0),
  }));

  const output = { table, lastUpdated: new Date().toISOString() };
  const filename = path.join(OUTPUT_DIR, `allsvenskan_table_${year}.json`);
  fs.writeFileSync(filename, JSON.stringify(output, null, 2));
  console.log(`  ✓ Saved table to ${filename}`);
}

async function main() {
  try {
    for (const s of SEASONS) {
      await fetchMatchesForSeason(s.year, s.id);
      await fetchTableForSeason(s.year, s.id);
    }
  } catch (err) {
    console.error(err);
  } finally {
    if (_browser) await _browser.close();
  }
}
main();
