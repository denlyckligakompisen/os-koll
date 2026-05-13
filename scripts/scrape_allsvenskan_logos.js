/**
 * Download high-resolution team logos from SofaScore and save locally.
 * Uses direct HTTP requests to api.sofascore.com (no Cloudflare/Playwright needed).
 * 
 * Usage: node scripts/scrape_allsvenskan_logos.js
 */

import fs from 'fs';
import path from 'path';
import axios from 'axios';

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
  console.log('🏟  Downloading Allsvenskan team logos from SofaScore (direct HTTP)...');

  const logosDir = path.join(process.cwd(), 'public/logos');
  if (!fs.existsSync(logosDir)) {
    fs.mkdirSync(logosDir, { recursive: true });
  }

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

    const API_DOMAINS = [
      'https://api.sofascore.app/api/v1',
      'https://api.sofascore.com/api/v1',
      'https://www.sofascore.com/api/v1'
    ];

    let success = false;
    for (const domain of API_DOMAINS) {
      try {
        const response = await axios.get(`${domain}/team/${teamId}/image`, {
          responseType: 'arraybuffer',
          timeout: 15000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
            'Accept': 'image/png,image/*;q=0.8,*/*;q=0.5',
            'Referer': 'https://www.sofascore.com/',
            'Origin': 'https://www.sofascore.com'
          }
        });

        const buffer = Buffer.from(response.data);
        fs.writeFileSync(filepath, buffer);
        logoMap[teamName] = `/logos/${filename}`;
        console.log(`  ✓ ${teamName} (${Math.round(buffer.length / 1024)}KB) [via ${domain}]`);
        success = true;
        await new Promise(r => setTimeout(r, 300));
        break;
      } catch (e) {
        // Silently try next domain
      }
    }

    if (!success) {
      console.log(`  ✗ ${teamName}: Failed across all API domains`);
      await new Promise(r => setTimeout(r, 300));
    }
  }

  // Keep the Allsvenskan SVG logo reference
  logoMap['ALLSVENSKAN_LOGO'] = 'https://allsvenskan.se/wp-content/themes/sef-leagues/images/allsvenskan/allsvenskan-logo.svg';

  const outputPath = path.join(process.cwd(), 'public/data/allsvenskan_logos.json');
  fs.writeFileSync(outputPath, JSON.stringify(logoMap, null, 2));
  console.log(`\n✅ Saved ${Object.keys(logoMap).length} logos to ${logosDir}`);
  console.log(`   Updated ${outputPath}`);
}

scrapeLogos().catch(e => {
  console.error('❌ Error:', e.message);
  process.exit(1);
});
