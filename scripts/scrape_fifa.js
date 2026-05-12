/**
 * FIFA World Cup 2026 Data Fetcher via SofaScore API (through Playwright browser context)
 * 
 * Uses Playwright's browser context to bypass Cloudflare protection,
 * then makes clean JSON API calls to SofaScore to retrieve match schedules,
 * live scores, and group standings.
 */

import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';
import { translateTeam } from './constants.js';

// ─── Configuration ───────────────────────────────────────────────────────────

const TOURNAMENT_ID = 16;   // FIFA World Cup
const SEASON_ID = 58210;    // 2026 season
const API_BASE = 'https://www.sofascore.com/api/v1';

const TV4_LIST_URL = 'https://www.tv4play.se/lista/1EGE533EMNsEsyaAulLPNT';
const TV4_DEFAULT_LINK = 'https://www.tv4play.se/kategorier/fifa-fotbolls-vm-2026';

const OUTPUT_DIR = path.join(process.cwd(), 'public/data');
const OUTPUT_FILES = {
  matches: path.join(OUTPUT_DIR, 'worldcup_2026_matches.json'),
  groups: path.join(OUTPUT_DIR, 'worldcup_2026_groups.json'),
  knockout: path.join(OUTPUT_DIR, 'worldcup_2026_knockout.json')
};

// ─── Swedish date formatting ─────────────────────────────────────────────────

const MONTHS_SV = {
  0: 'januari', 1: 'februari', 2: 'mars', 3: 'april',
  4: 'maj', 5: 'juni', 6: 'juli', 7: 'augusti',
  8: 'september', 9: 'oktober', 10: 'november', 11: 'december'
};

function formatDateSwedish(timestamp) {
  const date = new Date(timestamp * 1000);
  const day = parseInt(date.toLocaleDateString('sv-SE', { day: 'numeric', timeZone: 'Europe/Stockholm' }));
  const monthIndex = parseInt(date.toLocaleDateString('sv-SE', { month: 'numeric', timeZone: 'Europe/Stockholm' })) - 1;
  return `${day} ${MONTHS_SV[monthIndex]}`;
}

function formatTime(timestamp) {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Europe/Stockholm' });
}

// ─── TV4 play link scraping helper ───────────────────────────────────────────

async function scrapeTv4Links(page) {
  console.log(`Scraping TV4 Play links from ${TV4_LIST_URL}...`);
  try {
    await page.goto(TV4_LIST_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    return await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a[href*="/program/"]'))
        .map(a => ({
          text: a.innerText.trim(),
          href: a.href.startsWith('http') ? a.href : 'https://www.tv4play.se' + a.getAttribute('href')
        }))
        .filter(l => l.text.length > 5);
    });
  } catch (e) {
    console.error('Failed to scrape TV4 links:', e.message);
    return [];
  }
}

// ─── Main Runner ─────────────────────────────────────────────────────────────

async function fetchFifaData() {
  console.log('🚀 Starting FIFA World Cup 2026 update via SofaScore API...');
  
  const browser = await chromium.launch({ headless: true });
  
  // Get default User-Agent and clean it (remove HeadlessChrome) to match a real browser fingerprint
  const tempContext = await browser.newContext();
  const tempPage = await tempContext.newPage();
  const defaultUA = await tempPage.evaluate(() => navigator.userAgent);
  await tempPage.close();
  await tempContext.close();
  
  const cleanUA = defaultUA.replace(/HeadlessChrome/g, 'Chrome');

  const context = await browser.newContext({
    userAgent: cleanUA,
    extraHTTPHeaders: {
      'Accept-Language': 'sv-SE,sv;q=0.9,en-SE;q=0.8,en;q=0.7,en-US;q=0.6',
    }
  });

  // Hide webdriver property to bypass basic headless detection
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', {
      get: () => undefined
    });
  });

  const page = await context.newPage();

  try {
    // Navigate once to Sofascore to bypass Cloudflare
    try {
      console.log('  Establishing SofaScore session...');
      const response = await page.goto('https://www.sofascore.com', { waitUntil: 'domcontentloaded', timeout: 30000 });
      if (response && response.status() !== 200) {
        console.warn(`  ⚠️  Homepage load returned status ${response.status()}. Cloudflare challenge may be active.`);
      }
    } catch (err) {
      console.warn(`  ⚠️  Failed to load SofaScore homepage: ${err.message}. Will rely on fallback API requests.`);
    }

    const fetchApi = async (endpoint) => {
      console.log(`  → GET ${endpoint}`);
      try {
        // Try primary API domain (www.sofascore.com)
        const result = await page.evaluate(async (url) => {
          const res = await fetch(url);
          if (!res.ok) throw new Error(`HTTP_${res.status}`);
          return res.json();
        }, `${API_BASE}${endpoint}`);
        return result;
      } catch (e) {
        console.log(`  ⚠️  Primary fetch failed (${e.message}). Falling back to api.sofascore.app...`);
        try {
          // Fallback to secondary API domain (api.sofascore.app)
          const result = await page.evaluate(async (url) => {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP_${res.status}`);
            return res.json();
          }, `https://api.sofascore.app/api/v1${endpoint}`);
          return result;
        } catch (fallbackError) {
          throw new Error(`Both primary and fallback fetches failed. Primary: ${e.message}, Fallback: ${fallbackError.message}`);
        }
      }
    };

    // 1. Scrape TV4 Direct Play Links
    const tv4Links = await scrapeTv4Links(page);
    console.log(`Found ${tv4Links.length} potential TV4 links.`);

    // 2. Fetch all events (matches)
    console.log('\n📅 Fetching matches...');
    let allEvents = [];
    
    // Fetch upcoming next matches
    let pageNum = 0;
    let hasMore = true;
    while (hasMore) {
      try {
        const result = await fetchApi(`/unique-tournament/${TOURNAMENT_ID}/season/${SEASON_ID}/events/next/${pageNum}`);
        if (result.events && result.events.length > 0) {
          allEvents = allEvents.concat(result.events);
        }
        hasMore = result.hasNextPage;
        pageNum++;
      } catch (err) {
        console.error(`Error next matches page ${pageNum}:`, err.message);
        hasMore = false;
      }
    }

    // Fetch finished past matches (just in case they already started/finished)
    pageNum = 0;
    hasMore = true;
    while (hasMore) {
      try {
        const result = await fetchApi(`/unique-tournament/${TOURNAMENT_ID}/season/${SEASON_ID}/events/last/${pageNum}`);
        if (result.events && result.events.length > 0) {
          allEvents = allEvents.concat(result.events);
        }
        hasMore = result.hasNextPage;
        pageNum++;
      } catch (err) {
        // Quiet capture of 404 since there are no past matches yet
        hasMore = false;
      }
    }

    // Filter duplicates by event ID
    const uniqueEventsMap = new Map();
    allEvents.forEach(e => uniqueEventsMap.set(e.id, e));
    const uniqueEvents = Array.from(uniqueEventsMap.values());
    console.log(`Successfully fetched ${uniqueEvents.length} unique events.`);

    // Load existing match data to preserve manual additions (broadcasters, etc.)
    const existingMatchesData = fs.existsSync(OUTPUT_FILES.matches) 
      ? JSON.parse(fs.readFileSync(OUTPUT_FILES.matches, 'utf8')) 
      : { matches: [] };
    const existingMatches = existingMatchesData.matches || [];

    // Separate group matches from knockout matches
    const groupStageMatches = [];
    const knockoutStageEvents = [];

    for (const event of uniqueEvents) {
      if (event.tournament?.isGroup) {
        groupStageMatches.push(event);
      } else {
        knockoutStageEvents.push(event);
      }
    }

    console.log(`Group Stage matches: ${groupStageMatches.length}`);
    console.log(`Knockout Stage matches: ${knockoutStageEvents.length}`);

    // Parse and save Group Stage Matches
    const parsedGroupMatches = [];
    for (const event of groupStageMatches) {
      const home = translateTeam(event.homeTeam?.name || '');
      const away = translateTeam(event.awayTeam?.name || '');
      const date = formatDateSwedish(event.startTimestamp);
      const time = formatTime(event.startTimestamp);
      
      const groupName = event.tournament.groupName 
        ? event.tournament.groupName.replace('Group', 'Grupp') 
        : (event.tournament.groupSign ? 'Grupp ' + event.tournament.groupSign : '');

      // Find existing match to preserve broadcaster and venue
      const existingMatch = existingMatches.find(em => 
        (em.home === home && em.away === away && em.date === date) ||
        (em.id === event.id)
      );

      const broadcast = existingMatch?.broadcast || "";
      const venue = event.venue?.city?.name || event.venue?.name || existingMatch?.venue || "";
      let link = existingMatch?.link || "";

      // Handle TV4 Direct Links
      if (broadcast.includes('TV4')) {
        const directLink = tv4Links.find(tl => {
          const t = tl.text.toLowerCase();
          const h = home.toLowerCase();
          const a = away.toLowerCase();
          return t.includes(h) && t.includes(a);
        });
        link = directLink ? directLink.href : TV4_DEFAULT_LINK;
      }

      // Determine match status and score
      let status = 'upcoming';
      const statusType = event.status?.type || '';
      if (statusType === 'finished') {
        status = 'finished';
      } else if (statusType === 'inprogress') {
        status = 'live';
      } else if (statusType === 'canceled' || statusType === 'postponed') {
        status = 'postponed';
      }

      let score = '';
      if (status === 'finished' || status === 'live') {
        const homeGoals = event.homeScore?.current ?? 0;
        const awayGoals = event.awayScore?.current ?? 0;
        score = `${homeGoals} - ${awayGoals}`;
      }

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
        id: event.id,
        customId: event.customId,
        date,
        time,
        home,
        away,
        venue,
        broadcast,
        group: groupName,
        link,
        status,
        score,
        startTimestamp: event.startTimestamp,
        liveCurrentTime
      };

      // Add scorers if finished or live
      if (status === 'finished' || status === 'live') {
        if (status === 'finished' && existingMatch?.scorers) {
          matchObj.scorers = existingMatch.scorers;
        } else {
          try {
            console.log(`  Fetching scorers for ${home} - ${away} (ID: ${event.id})...`);
            const incidentsData = await fetchApi(`/event/${event.id}/incidents`);
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
            
            // Polite delay
            await new Promise(r => setTimeout(r, 200));
          } catch (err) {
            console.log(`  ⚠ Failed to fetch scorers for ${home} - ${away}: ${err.message}`);
          }
        }
      }

      parsedGroupMatches.push(matchObj);
    }

    // Sort group stage matches chronologically
    parsedGroupMatches.sort((a, b) => a.startTimestamp - b.startTimestamp);

    fs.writeFileSync(OUTPUT_FILES.matches, JSON.stringify({
      matches: parsedGroupMatches,
      lastUpdated: new Date().toISOString(),
      source: 'SofaScore API'
    }, null, 2));
    console.log(`Saved group matches to ${OUTPUT_FILES.matches}`);

    // 3. Process and save Knockout Stage Matches
    if (knockoutStageEvents.length > 0 && fs.existsSync(OUTPUT_FILES.knockout)) {
      console.log('\n🏆 Processing knockout matches...');
      const knockoutData = JSON.parse(fs.readFileSync(OUTPUT_FILES.knockout, 'utf8'));

      const roundMapping = {
        "Round of 32": "r32",
        "Round of 16": "r16",
        "Quarterfinals": "qf",
        "Semifinals": "sf",
        "Match for 3rd place": "3p",
        "Final": "f"
      };

      // Map Sofascore events into round buckets
      const buckets = { r32: [], r16: [], qf: [], sf: [], '3p': [], f: [] };
      knockoutStageEvents.forEach(event => {
        const roundName = event.roundInfo?.name;
        const roundId = roundMapping[roundName];
        if (roundId) {
          buckets[roundId].push(event);
        }
      });

      // Sort each bucket chronologically
      Object.keys(buckets).forEach(roundId => {
        buckets[roundId].sort((a, b) => a.startTimestamp - b.startTimestamp);
      });

      // Pair and update knockout rounds
      knockoutData.rounds.forEach(round => {
        const roundId = round.id;
        const bucket = buckets[roundId] || [];
        
        round.matches.forEach((m, idx) => {
          const event = bucket[idx];
          if (event) {
            m.time = formatTime(event.startTimestamp);
            m.date = formatDateSwedish(event.startTimestamp);
            m.startTimestamp = event.startTimestamp;
            
            if (event.venue) {
              m.venue = event.venue.city?.name || event.venue.name;
            }

            let status = 'upcoming';
            const statusType = event.status?.type || '';
            if (statusType === 'finished') {
              status = 'finished';
            } else if (statusType === 'inprogress') {
              status = 'live';
            }

            m.status = status;
            
            if (status === 'finished' || status === 'live') {
              m.score = `${event.homeScore?.current ?? 0}-${event.awayScore?.current ?? 0}`;
            }

            // Real country names if they are resolved (disabled: false means real team)
            if (event.homeTeam && !event.homeTeam.disabled) {
              m.realHome = translateTeam(event.homeTeam.name);
            }
            if (event.awayTeam && !event.awayTeam.disabled) {
              m.realAway = translateTeam(event.awayTeam.name);
            }
          }
        });
      });

      knockoutData.lastUpdated = new Date().toISOString();
      knockoutData.source = 'SofaScore API';
      fs.writeFileSync(OUTPUT_FILES.knockout, JSON.stringify(knockoutData, null, 2));
      console.log(`Saved knockout stages to ${OUTPUT_FILES.knockout}`);
    }

  } catch (err) {
    console.error('Global fetch error:', err.message);
  } finally {
    await browser.close();
  }
}

fetchFifaData();
