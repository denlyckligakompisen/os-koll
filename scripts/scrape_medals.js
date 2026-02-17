
import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const URL = 'https://sok.se/';
const OUTPUT_FILE = path.join(__dirname, '../public/data/medals.json');

async function scrapeMedals() {
    console.log(`Fetching medals from ${URL}...`);
    try {
        const { data } = await axios.get(URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        const $ = cheerio.load(data);

        let gold = 0;
        let silver = 0;
        let bronze = 0;

        // Try to find the specific medal counters
        // Based on probe: .lp-game-medals__medal--gold .lp-game-medals__number

        const goldEl = $('.lp-game-medals__medal--gold .lp-game-medals__number');
        const silverEl = $('.lp-game-medals__medal--silver .lp-game-medals__number');
        const bronzeEl = $('.lp-game-medals__medal--bronze .lp-game-medals__number');

        if (goldEl.length) gold = parseInt(goldEl.text().trim(), 10) || 0;
        if (silverEl.length) silver = parseInt(silverEl.text().trim(), 10) || 0;
        if (bronzeEl.length) bronze = parseInt(bronzeEl.text().trim(), 10) || 0;

        const result = { gold, silver, bronze, updated: new Date().toISOString() };
        console.log('Scraped medals:', result);

        const dir = path.dirname(OUTPUT_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2));
        console.log(`Saved medals to ${OUTPUT_FILE}`);

    } catch (error) {
        console.error('Error scraping medals:', error.message);
    }
}

scrapeMedals();
