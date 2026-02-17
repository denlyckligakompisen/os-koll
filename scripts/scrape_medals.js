
import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { AXIOS_CONFIG } from './utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const URL = 'https://sok.se/';
const OUTPUT_FILE = path.join(__dirname, '../public/data/medals.json');

async function scrapeMedals() {
    console.log(`Fetching medals from ${URL}...`);
    try {
        const { data } = await axios.get(URL, AXIOS_CONFIG);
        const $ = cheerio.load(data);

        const gold = parseInt($('.lp-game-medals__medal--gold .lp-game-medals__number').text().trim(), 10) || 0;
        const silver = parseInt($('.lp-game-medals__medal--silver .lp-game-medals__number').text().trim(), 10) || 0;
        const bronze = parseInt($('.lp-game-medals__medal--bronze .lp-game-medals__number').text().trim(), 10) || 0;

        const result = { gold, silver, bronze, updated: new Date().toISOString() };
        console.log('Scraped medals:', result);

        const dir = path.dirname(OUTPUT_FILE);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Error scraping medals:', error.message);
    }
}

scrapeMedals();
