/**
 * Download high-resolution team logos from SofaScore and save locally.
 * Uses Playwright browser context to bypass Cloudflare.
 * 
 * Usage: node scripts/scrape_allsvenskan_logos.js
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const TEAMS = {
  'AIK': 1764,
  'BK Häcken': 1760,
  'Degerfors IF': 1807,
  'Djurgårdens IF': 1759,
  'GAIS': 1786,
  'Halmstads BK': 1767,
  'Hammarby IF': 1758,
  'IF Brommapojkarna': 1787,
  'IF Elfsborg': 1762,
  'IFK Göteborg': 1761,
  'IK Sirius': 1793,
  'Kalmar FF': 1891,
  'Malmö FF': 1892,
  'Mjällby AIF': 1783,
  'Västerås SK': 1775,
  'Örgryte IS': 1766,
};

async function scrapeLogos() {
  console.log('🏟  Downloading Allsvenskan team logos from SofaScore...');

  const logosDir = path.join(process.cwd(), 'public/logos');
  if (!fs.existsSync(logosDir)) {
    fs.mkdirSync(logosDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Navigate to SofaScore to get cookies
  await page.goto('https://www.sofascore.com', { waitUntil: 'domcontentloaded', timeout: 15000 });

  const logoMap = {};

  for (const [teamName, teamId] of Object.entries(TEAMS)) {
    const filename = teamName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/å/g, 'a').replace(/ä/g, 'a').replace(/ö/g, 'o') + '.png';
    const filepath = path.join(logosDir, filename);

    // Skip downloading if the file already exists and is not empty
    if (fs.existsSync(filepath) && fs.statSync(filepath).size > 0) {
      logoMap[teamName] = `/logos/${filename}`;
      console.log(`  ✓ ${teamName} (cached)`);
      continue;
    }

    try {
      const base64 = await page.evaluate(async (url) => {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`${res.status}`);
        const blob = await res.blob();
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result.split(',')[1]);
          reader.readAsDataURL(blob);
        });
      }, `https://api.sofascore.app/api/v1/team/${teamId}/image`);

      const buffer = Buffer.from(base64, 'base64');
      fs.writeFileSync(filepath, buffer);
      logoMap[teamName] = `/logos/${filename}`;
      console.log(`  ✓ ${teamName} (${Math.round(buffer.length / 1024)}KB)`);
      
      // Polite delay after successful download
      await new Promise(r => setTimeout(r, 500));
    } catch (e) {
      console.log(`  ✗ ${teamName}: ${e.message}`);
      // Polite delay on error
      await new Promise(r => setTimeout(r, 500));
    }
  }

  // Keep the Allsvenskan SVG logo reference
  logoMap['ALLSVENSKAN_LOGO'] = 'https://allsvenskan.se/wp-content/themes/sef-leagues/images/allsvenskan/allsvenskan-logo.svg';

  const outputPath = path.join(process.cwd(), 'public/data/allsvenskan_logos.json');
  fs.writeFileSync(outputPath, JSON.stringify(logoMap, null, 2));
  console.log(`\n✅ Saved ${Object.keys(logoMap).length} logos to ${logosDir}`);
  console.log(`   Updated ${outputPath}`);

  await browser.close();
}

scrapeLogos().catch(e => {
  console.error('❌ Error:', e.message);
  process.exit(1);
});
