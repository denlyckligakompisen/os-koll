/**
 * FIFA World Cup 2026 Standings Fetcher via SofaScore API (through Playwright browser context)
 * 
 * Uses Playwright's browser context to bypass Cloudflare protection,
 * then makes clean JSON API calls to SofaScore to retrieve group standings.
 */

import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';
import { translateTeam } from './constants.js';

// ─── Configuration ───────────────────────────────────────────────────────────

const TOURNAMENT_ID = 16;   // FIFA World Cup
const SEASON_ID = 58210;    // 2026 season
const API_BASE = 'https://www.sofascore.com/api/v1';

const OUTPUT_PATH = path.join(process.cwd(), 'public/data/worldcup_2026_groups.json');

async function fetchFifaStandings() {
  console.log('🚀 Starting FIFA World Cup 2026 standings update via SofaScore API...');
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox'],
  });
  
  // Get default User-Agent and clean it (remove HeadlessChrome) to match a real browser fingerprint
  const tempContext = await browser.newContext();
  const tempPage = await tempContext.newPage();
  const defaultUA = await tempPage.evaluate(() => navigator.userAgent);
  await tempPage.close();
  await tempContext.close();
  
  const cleanUA = defaultUA.replace(/HeadlessChrome/g, 'Chrome');

  const context = await browser.newContext({
    userAgent: cleanUA,
    viewport: { width: 1920, height: 1080 },
    locale: 'sv-SE',
    timezoneId: 'Europe/Stockholm',
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
    // Try to establish SofaScore session with Cloudflare challenge handling
    let sessionEstablished = false;
    try {
      console.log('  Establishing SofaScore session...');
      const response = await page.goto('https://www.sofascore.com', { waitUntil: 'networkidle', timeout: 30000 });
      if (response && response.status() === 200) {
        sessionEstablished = true;
        console.log('  ✓ Session established.');
      } else {
        const status = response?.status() || 'unknown';
        console.warn(`  ⚠️  Homepage returned status ${status}. Cloudflare may be active.`);
        console.log('  ⏳ Waiting for Cloudflare challenge to resolve...');
        await page.waitForTimeout(5000);
        try {
          const testResult = await page.evaluate(async () => {
            const r = await fetch('/api/v1/config/top-tournaments/SE');
            return r.status;
          });
          if (testResult === 200) {
            sessionEstablished = true;
            console.log('  ✓ Session established after challenge wait.');
          }
        } catch { /* session not established */ }
      }
    } catch (err) {
      console.warn(`  ⚠️  Failed to load SofaScore homepage: ${err.message}`);
    }

    // Dedicated page for direct API navigation (used as fallback)
    const apiPage = await context.newPage();
    const STANDINGS_API_DOMAINS = [API_BASE, 'https://api.sofascore.app/api/v1'];

    const fetchApi = async (endpoint) => {
      console.log(`  → GET ${endpoint}`);
      
      // Strategy 1: In-page fetch (fastest, works when session cookies are valid)
      if (sessionEstablished) {
        try {
          const result = await page.evaluate(async (url) => {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP_${res.status}`);
            return res.json();
          }, `${API_BASE}${endpoint}`);
          return result;
        } catch (e) {
          const msg = e.message.split('\n')[0];
          console.log(`  ⚠️  In-page fetch failed (${msg}). Trying direct navigation...`);
          sessionEstablished = false;
        }
      }

      // Strategy 2: Navigate directly to API URL (full browser pipeline)
      for (const base of STANDINGS_API_DOMAINS) {
        try {
          const url = `${base}${endpoint}`;
          const response = await apiPage.goto(url, { waitUntil: 'commit', timeout: 15000 });
          if (response && response.ok()) {
            return await response.json();
          }
        } catch { continue; }
      }

      // Strategy 3: Playwright's built-in request API (shares browser cookies)
      for (const base of STANDINGS_API_DOMAINS) {
        try {
          const response = await context.request.get(`${base}${endpoint}`);
          if (response.ok()) {
            return await response.json();
          }
        } catch { continue; }
      }

      throw new Error(`All fetch strategies failed for ${endpoint}`);
    };

    // Fetch and save Standings
    console.log('📊 Fetching and updating standings...');
    const standingsRes = await fetchApi(`/unique-tournament/${TOURNAMENT_ID}/season/${SEASON_ID}/standings/total`);
    if (standingsRes && standingsRes.standings && standingsRes.standings.length > 0) {
      const translatedGroups = standingsRes.standings.map(g => {
        const groupName = g.name.replace('Group', 'Grupp');
        const teams = g.rows.map(row => {
          const gd = (row.scoresFor ?? 0) - (row.scoresAgainst ?? 0);
          return {
            name: translateTeam(row.team.name),
            played: row.matches ?? 0,
            gd: gd,
            pts: row.points ?? 0
          };
        });
        return { name: groupName, teams };
      });

      fs.writeFileSync(OUTPUT_PATH, JSON.stringify({
        name: 'FIFA World Cup 2026',
        groups: translatedGroups,
        lastUpdated: new Date().toISOString(),
        source: 'SofaScore API'
      }, null, 2));
      console.log(`Successfully updated FIFA standings for ${translatedGroups.length} groups.`);
    }

  } catch (err) {
    console.error('Failed to update group standings:', err.message);
  } finally {
    await browser.close();
  }
}

fetchFifaStandings();
