/**
 * Allsvenskan Data Fetcher via SofaScore API (Browser-based)
 * 
 * Uses Playwright to launch a real browser, navigate to SofaScore to establish
 * a valid session, then makes API calls from within the browser context.
 * This bypasses anti-bot protections that block direct HTTP requests.
 * 
 * Usage:
 *   node scripts/fetch_allsvenskan_api.js
 *   node scripts/fetch_allsvenskan_api.js --matches
 *   node scripts/fetch_allsvenskan_api.js --table
 *   node scripts/fetch_allsvenskan_api.js --all  (default)
 */

import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright-extra';
import stealth from 'puppeteer-extra-plugin-stealth';
import { sanitizeObject } from './utils/sanitize.js';

chromium.use(stealth());

// ─── Configuration ───────────────────────────────────────────────────────────

const TOURNAMENT_ID = 40;   // Allsvenskan
const SEASON_ID = 87925;    // 2026 season
const API_BASE = 'https://api.sofascore.com/api/v1';

const OUTPUT_DIR = path.join(process.cwd(), 'public/data');

const OUTPUT_FILES = {
  matches: path.join(OUTPUT_DIR, 'allsvenskan_matches.json'),
  table: path.join(OUTPUT_DIR, 'allsvenskan_table.json'),
};

// ─── Swedish date formatting ─────────────────────────────────────────────────

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

// ─── Browser-based API fetch ─────────────────────────────────────────────────

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

  // Navigate to SofaScore to establish cookies & session
  console.log('  🌐 Establishing session on sofascore.com...');
  await _page.goto('https://www.sofascore.com/football/league/allsvenskan/40', {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });
  // Wait a moment for any JS challenges to resolve
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
  console.log(`  → GET ${endpoint}`);
  await initBrowser();

  const url = `${API_BASE}${endpoint}`;

  // Make the fetch call from within the browser context
  // This carries the browser's cookies, TLS fingerprint, and headers
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

// ─── Fetch Matches ───────────────────────────────────────────────────────────

async function fetchMatches(isDelta = false) {
  console.log('\n📅 Fetching Allsvenskan matches...');

  // Try to load existing matches from file
  let existingMatches = [];
  if (fs.existsSync(OUTPUT_FILES.matches)) {
    try {
      const content = fs.readFileSync(OUTPUT_FILES.matches, 'utf8');
      existingMatches = JSON.parse(content).matches || [];
    } catch (e) {
      console.log('  Could not read existing matches:', e.message);
    }
  }

  // Calculate start and end timestamp for yesterday, today, and tomorrow
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = Math.floor(new Date(todayStart.getTime() - 24 * 60 * 60 * 1000).getTime() / 1000);
  const tomorrowEnd = Math.floor(new Date(todayStart.getTime() + 2 * 24 * 60 * 60 * 1000).getTime() / 1000);

  const hasCache = existingMatches.length > 0 && !process.argv.includes('--all');
  if (hasCache) {
    console.log(`  Loaded ${existingMatches.length} existing matches from cache.`);
    console.log(`  Optimization active: Will ONLY update matches between yesterday and tomorrow.`);
  } else {
    console.log('  Running full sync (either no cache or --all flag supplied)...');
  }

  const allEvents = [];
  const maxPages = hasCache ? 2 : 10;

  // Fetch finished matches (paginated: page 0 is most recent)
  console.log(`  Fetching finished matches (max ${maxPages} pages)...`);
  for (let page = 0; page < maxPages; page++) {
    try {
      const data = await fetchApi(
        `/unique-tournament/${TOURNAMENT_ID}/season/${SEASON_ID}/events/last/${page}`
      );
      const events = data.events || [];
      if (events.length === 0) break;
      allEvents.push(...events);
      if (!data.hasNextPage) break;

      // Polite delay between page requests
      await new Promise(r => setTimeout(r, 300));
    } catch (e) {
      if (page === 0) throw e;
      break;
    }
  }

  // Fetch upcoming matches (paginated)
  console.log(`  Fetching upcoming matches (max ${maxPages} pages)...`);
  for (let page = 0; page < maxPages; page++) {
    try {
      const data = await fetchApi(
        `/unique-tournament/${TOURNAMENT_ID}/season/${SEASON_ID}/events/next/${page}`
      );
      const events = data.events || [];
      if (events.length === 0) break;
      allEvents.push(...events);
      if (!data.hasNextPage) break;

      // Polite delay between page requests
      await new Promise(r => setTimeout(r, 300));
    } catch (e) {
      if (page === 0) console.log('  ⚠ No upcoming matches found');
      break;
    }
  }

  console.log(`  ✓ Received ${allEvents.length} total events`);

  // Sort by date
  allEvents.sort((a, b) => a.startTimestamp - b.startTimestamp);

  // Deduplicate by event ID
  const seen = new Set();
  const uniqueEvents = allEvents.filter(e => {
    if (seen.has(e.id)) return false;
    seen.add(e.id);
    return true;
  });

  const matches = [...existingMatches];

  for (const event of uniqueEvents) {
    const home = event.homeTeam?.name || '';
    const away = event.awayTeam?.name || '';
    const id = event.id;
    const startTimestamp = event.startTimestamp || 0;

    // If cache exists, ONLY update if it falls within the yesterday-today-tomorrow window
    const in3DayWindow = startTimestamp >= yesterdayStart && startTimestamp < tomorrowEnd;
    if (hasCache && !in3DayWindow) {
      continue; // Skip updating matches outside the window
    }

    // Determine status
    let status = 'upcoming';
    const statusType = event.status?.type || '';
    if (statusType === 'finished') {
      status = 'finished';
    } else if (statusType === 'inprogress') {
      status = 'live';
    } else if (statusType === 'canceled' || statusType === 'postponed') {
      status = 'postponed';
    }

    // Format score
    let score = '';
    if (status === 'finished' || status === 'live') {
      const homeGoals = event.homeScore?.current ?? '?';
      const awayGoals = event.awayScore?.current ?? '?';
      score = `${homeGoals} - ${awayGoals}`;
    }

    // Time: finished → TBA (matching current format), upcoming → actual time
    const time = status === 'finished' ? 'TBA' : formatTime(event.startTimestamp);

    // Date in Swedish format
    const date = formatDateSwedish(event.startTimestamp);

    // Link
    const link = '';

    let liveCurrentTime = '';
    if (status === 'live' && event.time?.currentPeriodStartTimestamp) {
      const startSecs = event.time.currentPeriodStartTimestamp;
      const nowSecs = Math.floor(Date.now() / 1000);
      const elapsedMins = Math.floor((nowSecs - startSecs) / 60);
      
      const desc = (event.status?.description || '').toLowerCase();
      const isFirstHalf = desc.includes('1st half') || desc.includes('1st period');
      const isSecondHalf = desc.includes('2nd half') || desc.includes('2nd period');
      const isHalftime = desc.includes('halftime') || desc.includes('half-time');

      if (isFirstHalf) {
        if (elapsedMins >= 45) {
          liveCurrentTime = `45'+${elapsedMins - 44}`;
        } else {
          liveCurrentTime = `${elapsedMins + 1}'`;
        }
      } else if (isSecondHalf) {
        if (elapsedMins >= 45) {
          liveCurrentTime = `90'+${elapsedMins - 44}`;
        } else {
          liveCurrentTime = `${45 + elapsedMins + 1}'`;
        }
      } else if (isHalftime) {
        liveCurrentTime = 'Halvtid';
      } else {
        liveCurrentTime = event.status?.description || 'LIVE';
      }
    }

    const matchObj = { 
      id, 
      customId: event.customId,
      home, 
      away, 
      time, 
      date, 
      link, 
      score, 
      status, 
      startTimestamp: event.startTimestamp,
      liveCurrentTime
    };

    // Find existing match in cache
    const existing = existingMatches.find(m => m.id === id);

    // Fetch or reuse scorers if finished
    if (status === 'finished' || status === 'live') {
      const hasAssistsInCache = existing?.scorers?.home?.some(s => s.assist !== undefined) || 
                                existing?.scorers?.away?.some(s => s.assist !== undefined);
      if (status === 'finished' && existing && existing.scorers && hasAssistsInCache) {
        matchObj.scorers = existing.scorers;
      } else {
        try {
          console.log(`  Updating scorers and assists for ${home} - ${away} (ID: ${id})...`);
          const incidentsData = await fetchApi(`/event/${id}/incidents`);
          const incidents = incidentsData.incidents || [];
          
          const homeScorers = [];
          const awayScorers = [];
          
          const goals = incidents.filter(inc => inc.incidentType === 'goal');
          goals.forEach(goal => {
            const player = goal.player?.name || goal.player?.shortName || 'Okänd';
            const minute = goal.time + (goal.injuryTime ? `+${goal.injuryTime}` : '');
            
            let suffix = '';
            if (goal.goalType === 'penalty') suffix = ' (str)';
            else if (goal.goalType === 'own') suffix = ' (självmål)';
            
            const scorerObj = { player, minute };
            if (suffix) scorerObj.suffix = suffix;

            if (goal.assist1?.name || goal.assist1?.shortName) {
              scorerObj.assist = goal.assist1.name || goal.assist1.shortName;
            }

            // Determine scoring team
            let scoringTeam = goal.isHome ? 'home' : 'away';
            if (goal.goalType === 'own') {
              scoringTeam = goal.isHome ? 'away' : 'home';
            }

            if (scoringTeam === 'home') {
              homeScorers.push(scorerObj);
            } else {
              awayScorers.push(scorerObj);
            }
          });

          matchObj.scorers = {
            home: homeScorers,
            away: awayScorers
          };

          // Polite delay to prevent rate limit
          await new Promise(r => setTimeout(r, 200));
        } catch (err) {
          console.log(`  ⚠ Failed to fetch scorers for ${home} - ${away}: ${err.message}`);
        }
      }
    }

    if (home && away) {
      const idx = matches.findIndex(m => m.id === id);
      if (idx !== -1) {
        matches[idx] = matchObj;
      } else {
        matches.push(matchObj);
      }
    }
  }

  // Sort by startTimestamp so matches are always chronologically correct
  matches.sort((a, b) => (a.startTimestamp || 0) - (b.startTimestamp || 0));

  const output = {
    matches,
    lastUpdated: new Date().toISOString(),
    source: 'SofaScore',
  };

  fs.writeFileSync(OUTPUT_FILES.matches, JSON.stringify(sanitizeObject(output), null, 2));
  console.log(`  ✓ Saved ${matches.length} total matches to ${OUTPUT_FILES.matches}`);
}

// ─── Fetch Table/Standings ───────────────────────────────────────────────────

async function fetchTable() {
  console.log('\n📊 Fetching Allsvenskan standings...');

  const data = await fetchApi(
    `/unique-tournament/${TOURNAMENT_ID}/season/${SEASON_ID}/standings/total`
  );

  const rows = data.standings?.[0]?.rows || [];
  console.log(`  ✓ Received ${rows.length} teams in standings`);

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
    lastUpdated: new Date().toISOString(),
  };

  fs.writeFileSync(OUTPUT_FILES.table, JSON.stringify(sanitizeObject(output), null, 2));
  console.log(`  ✓ Saved ${table.length} teams to ${OUTPUT_FILES.table}`);
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const isDelta = args.includes('--delta');
  const runAll = args.length === 0 || args.includes('--all') || isDelta;

  console.log('⚽ Allsvenskan Data Fetcher (SofaScore API)');
  console.log(`   Tournament: Allsvenskan (ID: ${TOURNAMENT_ID})`);
  console.log(`   Season: 2026 (ID: ${SEASON_ID})`);
  console.log('   API: Browser-based (Playwright)');
  if (isDelta) {
    console.log('   Mode: Smart Delta Update (Last 24 Hours / Page 0 Only)');
  } else {
    console.log('   Mode: Full Schedule Sync');
  }
  console.log('─'.repeat(50));

  try {
    if (runAll || args.includes('--matches')) {
      await fetchMatches(isDelta);
    }

    if (runAll || args.includes('--table')) {
      await fetchTable();
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
