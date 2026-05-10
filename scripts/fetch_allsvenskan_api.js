/**
 * Allsvenskan Data Fetcher via SofaScore API (through Playwright browser context)
 * 
 * Uses Playwright's browser context to bypass Cloudflare protection,
 * then makes clean JSON API calls to SofaScore. Much faster and more
 * reliable than DOM scraping — no fragile selectors, just stable API endpoints.
 * 
 * Usage:
 *   node scripts/fetch_allsvenskan_api.js
 *   node scripts/fetch_allsvenskan_api.js --matches
 *   node scripts/fetch_allsvenskan_api.js --table
 *   node scripts/fetch_allsvenskan_api.js --all  (default)
 */

import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

// ─── Configuration ───────────────────────────────────────────────────────────

const TOURNAMENT_ID = 40;   // Allsvenskan
const SEASON_ID = 87925;    // 2026 season
const API_BASE = 'https://www.sofascore.com/api/v1';

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

async function createBrowserFetcher() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  // Navigate to SofaScore once to get cookies/session
  await page.goto('https://www.sofascore.com', { waitUntil: 'domcontentloaded', timeout: 15000 });

  const fetchApi = async (endpoint) => {
    console.log(`  → GET ${endpoint}`);
    const result = await page.evaluate(async (url) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      return res.json();
    }, `${API_BASE}${endpoint}`);
    return result;
  };

  const close = () => browser.close();

  return { fetchApi, close };
}

// ─── Fetch Matches ───────────────────────────────────────────────────────────

async function fetchMatches(fetchApi, isDelta = false) {
  console.log('\n📅 Fetching Allsvenskan matches...');

  const allEvents = [];
  const maxPages = isDelta ? 1 : 10;

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

  // Try to load existing matches to reuse already fetched scorers
  let existingMatches = [];
  if (fs.existsSync(OUTPUT_FILES.matches)) {
    try {
      const content = fs.readFileSync(OUTPUT_FILES.matches, 'utf8');
      existingMatches = JSON.parse(content).matches || [];
    } catch (e) {
      console.log('  Could not read existing matches for caching:', e.message);
    }
  }

  const matches = [];
  for (const event of uniqueEvents) {
    const home = event.homeTeam?.name || '';
    const away = event.awayTeam?.name || '';
    const id = event.id;

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
      round: event.roundInfo?.round,
      liveCurrentTime
    };

    // Find existing match in cache
    const existing = existingMatches.find(m => 
      (m.id === id) || 
      (m.home === home && m.away === away && m.date === date)
    );

    // Reuse existing H2H if available
    if (existing && existing.h2h) {
      matchObj.h2h = existing.h2h;
    }

    // For upcoming matches that don't have the last 5 H2H yet, fetch it
    if (status === 'upcoming' && (!matchObj.h2h || !matchObj.h2h.isLast5) && event.customId) {
      try {
        console.log(`  Fetching H2H history for ${home} - ${away} (customId: ${event.customId})...`);
        const h2hRes = await fetchApi(`/event/${event.customId}/h2h/events`);
        if (h2hRes && h2hRes.events) {
          const finished = h2hRes.events.filter(e => e.winnerCode !== undefined);
          
          let homeWins = 0;
          let draws = 0;
          let awayWins = 0;

          const cleanName = (n) => n.replace(/\b(IF|FF|BK|AIF|SK)\b/g, '').replace(/\s+/g, ' ').trim();
          const cleanHomeTarget = cleanName(home);
          const cleanAwayTarget = cleanName(away);

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

          matchObj.h2h = {
            homeWins,
            draws,
            awayWins,
            isLast5: true
          };
          console.log(`    → H2H (last 5) loaded: ${homeWins}V - ${draws}O - ${awayWins}F`);
        }
        // Polite delay to prevent rate limit
        await new Promise(r => setTimeout(r, 200));
      } catch (err) {
        console.log(`  ⚠ Failed to fetch H2H for ${home} - ${away}: ${err.message}`);
      }
    }

    // Fetch or reuse scorers if finished
    if (status === 'finished' || status === 'live') {
      if (status === 'finished' && existing && existing.scorers) {
        matchObj.scorers = existing.scorers;
      } else {
        try {
          console.log(`  Fetching scorers for ${home} - ${away} (ID: ${id})...`);
          const incidentsData = await fetchApi(`/event/${id}/incidents`);
          const incidents = incidentsData.incidents || [];
          
          const homeScorers = [];
          const awayScorers = [];
          
          const goals = incidents.filter(inc => inc.incidentType === 'goal');
          goals.forEach(goal => {
            const player = goal.player?.shortName || goal.player?.name || 'Okänd';
            const minute = goal.time + (goal.injuryTime ? `+${goal.injuryTime}` : '');
            
            let suffix = '';
            if (goal.goalType === 'penalty') suffix = ' (str)';
            else if (goal.goalType === 'own') suffix = ' (självmål)';
            
            const scorerObj = { player, minute };
            if (suffix) scorerObj.suffix = suffix;

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
      matches.push(matchObj);
    }
  }

  // If in delta mode, merge with existing matches that were not in the newly fetched pages
  if (isDelta) {
    console.log('  Merging newly fetched matches with existing matches...');
    const newlyFetchedIds = new Set(matches.map(m => m.id));
    let mergedCount = 0;
    for (const existing of existingMatches) {
      if (!newlyFetchedIds.has(existing.id)) {
        matches.push(existing);
        mergedCount++;
      }
    }
    console.log(`  ✓ Merged ${mergedCount} existing matches from cache`);
  }

  // Sort by startTimestamp so matches are always chronologically correct
  matches.sort((a, b) => (a.startTimestamp || 0) - (b.startTimestamp || 0));

  const output = {
    matches,
    lastUpdated: new Date().toISOString(),
    source: 'SofaScore',
  };

  fs.writeFileSync(OUTPUT_FILES.matches, JSON.stringify(output, null, 2));
  console.log(`  ✓ Saved ${matches.length} total matches to ${OUTPUT_FILES.matches}`);
}

// ─── Fetch Table/Standings ───────────────────────────────────────────────────

async function fetchTable(fetchApi) {
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

  fs.writeFileSync(OUTPUT_FILES.table, JSON.stringify(output, null, 2));
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
  if (isDelta) {
    console.log('   Mode: Smart Delta Update (Last 24 Hours / Page 0 Only)');
  } else {
    console.log('   Mode: Full Schedule Sync');
  }
  console.log('─'.repeat(50));

  const { fetchApi, close } = await createBrowserFetcher();

  try {
    if (runAll || args.includes('--matches')) {
      await fetchMatches(fetchApi, isDelta);
    }

    if (runAll || args.includes('--table')) {
      await fetchTable(fetchApi);
    }

    console.log('\n✅ All done!');
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  } finally {
    await close();
  }
}

main();
