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
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  try {
    // Navigate once to Sofascore to bypass Cloudflare
    await page.goto('https://www.sofascore.com', { waitUntil: 'domcontentloaded', timeout: 30000 });

    const fetchApi = async (endpoint) => {
      console.log(`  → GET ${endpoint}`);
      return await page.evaluate(async (url) => {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        return res.json();
      }, `${API_BASE}${endpoint}`);
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
