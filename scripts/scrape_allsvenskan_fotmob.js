import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const FOTMOB_URL = 'https://www.fotmob.com/leagues/42/season/2026';
const OUTPUT_FILE = path.join(process.cwd(), 'public/data/allsvenskan_matches.json');

// Swedish month names and day names
const MONTHS = {
  1: 'JANUARI',
  2: 'FEBRUARI',
  3: 'MARS',
  4: 'APRIL',
  5: 'MAJ',
  6: 'JUNI',
  7: 'JULI',
  8: 'AUGUSTI',
  9: 'SEPTEMBER',
  10: 'OKTOBER',
  11: 'NOVEMBER',
  12: 'DECEMBER'
};

const DAYS = {
  0: 'SÖNDAG',
  1: 'MÅNDAG',
  2: 'TISDAG',
  3: 'ONSDAG',
  4: 'TORSDAG',
  5: 'FREDAG',
  6: 'LÖRDAG'
};

function formatDate(dateString) {
  // Parse date like "Saturday, April 4" into Swedish format
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString; // Return as-is if parsing fails
    }
    const dayOfWeek = DAYS[date.getDay()];
    const dayOfMonth = date.getDate();
    const month = MONTHS[date.getMonth() + 1];
    return `${dayOfWeek} ${dayOfMonth} ${month}`;
  } catch (e) {
    return dateString;
  }
}

async function scrapeAllsvenskan() {
  console.log(`Fetching Allsvenskan matches from FotMob...`);
  console.log(`URL: ${FOTMOB_URL}`);

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();

    await page.goto(FOTMOB_URL, { waitUntil: 'networkidle', timeout: 60000 });
    console.log('✓ Page loaded');

    // Wait for match elements to load
    await page.waitForSelector('[data-testid*="match"]', { timeout: 10000 }).catch(() => {
      console.log('⚠ Match elements might be loading differently');
    });

    // Extract matches using FotMob's API endpoint directly
    const matches = await page.evaluate(() => {
      const results = [];
      
      // Try to find all match cards
      const matchCards = document.querySelectorAll('[data-testid*="match-card"], .Match, [class*="match"]');
      
      matchCards.forEach(card => {
        try {
          const text = card.innerText || '';
          const link = card.querySelector('a');
          
          // Look for team names, time, date, and score
          const homeTeam = card.querySelector('[data-testid="home-team"]')?.innerText || '';
          const awayTeam = card.querySelector('[data-testid="away-team"]')?.innerText || '';
          const scoreEl = card.querySelector('[data-testid="score"]');
          const score = scoreEl?.innerText || '';
          const timeEl = card.querySelector('[data-testid="kick-off-time"]');
          const time = timeEl?.innerText || 'TBA';
          
          if (homeTeam && awayTeam) {
            results.push({
              home: homeTeam.trim(),
              away: awayTeam.trim(),
              time: time.trim(),
              score: score.trim(),
              link: link?.href || '',
              text: text
            });
          }
        } catch (e) {
          // Skip this card
        }
      });
      
      return results;
    });

    if (matches.length === 0) {
      console.log('⚠ No matches found with standard selectors, trying alternative method...');
      
      // Alternative: Use FotMob's internal data if available
      const alternativeMatches = await page.evaluate(() => {
        const results = [];
        
        // Look for any visible text that looks like match info
        const allText = document.body.innerText;
        const matchPattern = /(\w+(?:\s+\w+)?)\s+(\d+:\d+|\w+)\s+(\w+(?:\s+\w+)?)/g;
        
        // Try to extract from the page structure
        const rows = document.querySelectorAll('[role="row"], .table-row, tr');
        
        rows.forEach(row => {
          const cells = row.querySelectorAll('[role="cell"], td, .cell');
          if (cells.length >= 4) {
            const home = cells[0]?.innerText?.trim() || '';
            const score = cells[1]?.innerText?.trim() || '';
            const away = cells[2]?.innerText?.trim() || '';
            const time = cells[3]?.innerText?.trim() || '';
            
            if (home && away && score) {
              results.push({
                home,
                away,
                score,
                time,
                link: ''
              });
            }
          }
        });
        
        return results;
      });
      
      if (alternativeMatches.length > 0) {
        console.log(`✓ Found ${alternativeMatches.length} matches using alternative method`);
        matches.push(...alternativeMatches);
      }
    }

    // Parse and format matches
    const formattedMatches = matches.map(m => {
      const [homeScore, awayScore] = m.score.split(/[-–]/).map(s => s.trim());
      
      return {
        home: m.home.toUpperCase().replace(/^VS\s+/i, '').trim(),
        away: m.away.toUpperCase().replace(/^VS\s+/i, '').trim(),
        time: m.time !== 'TBA' && m.time !== '' ? m.time : 'TBA',
        date: 'HÄMTAD FRÅN FOTMOB', // Placeholder, dates need better parsing
        link: m.link || `https://www.fotmob.com`,
        score: (homeScore && awayScore) ? `${homeScore} - ${awayScore}` : '',
        status: m.score ? 'finished' : 'upcoming'
      };
    }).filter(m => m.home && m.away);

    const data = {
      matches: formattedMatches,
      lastUpdated: new Date().toISOString(),
      source: 'FotMob',
      note: 'Dates need to be extracted properly from FotMob page structure'
    };

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));
    console.log(`✓ Successfully fetched ${formattedMatches.length} matches from FotMob`);
    console.log(`✓ Saved to ${OUTPUT_FILE}`);

  } catch (error) {
    console.error('❌ Error scraping FotMob:', error.message);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

scrapeAllsvenskan();
