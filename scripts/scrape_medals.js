
import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { AXIOS_CONFIG } from './utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const URL = 'https://sok.se/olympiska-spel/tavlingar/spelen/milano-cortina-2026/svenska-os-guiden.html'; // Often has a summary of medals
const MAIN_URL = 'https://sok.se/';
const OUTPUT_FILE = path.join(__dirname, '../public/data/medals.json');

async function scrapeMedals() {
    console.log(`Fetching medals from ${MAIN_URL}...`);
    try {
        const { data: mainData } = await axios.get(MAIN_URL, AXIOS_CONFIG);
        const $ = cheerio.load(mainData);

        const summary = {
            gold: parseInt($('.lp-game-medals__medal--gold .lp-game-medals__number').text().trim(), 10) || 0,
            silver: parseInt($('.lp-game-medals__medal--silver .lp-game-medals__number').text().trim(), 10) || 0,
            bronze: parseInt($('.lp-game-medals__medal--bronze .lp-game-medals__number').text().trim(), 10) || 0
        };

        const medalists = [];

        // Since the SOK site might have a specific medal list page, let's try to find it or parse from a list if available
        // For now, I'll mock some medalist data if the count is > 0 but no list is found, 
        // to show the interactive feature, then I'll try to find the real selector.
        // Actually, during the games, SOK usually has a ".lp-medalists" or similar section.

        $('.lp-medal-list__item, .medal-item').each((i, el) => {
            const $el = $(el);
            medalists.push({
                type: $el.hasClass('gold') ? 'gold' : ($el.hasClass('silver') ? 'silver' : 'bronze'),
                name: $el.find('.name').text().trim(),
                event: $el.find('.event').text().trim()
            });
        });

        // Fallback for demo purposes if we have counts but can't find selectors yet (early in games)
        if (summary.gold > 0 && medalists.length === 0) {
            // This is just to ensure the feature works for the user during development
            // In a real scenario, we'd adjust selectors based on the actual live site
        }

        const result = {
            ...summary,
            medalists,
            updated: new Date().toISOString()
        };

        const dir = path.dirname(OUTPUT_FILE);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2));
        console.log('Saved medals with list.');
    } catch (error) {
        console.error('Error scraping medals:', error.message);
    }
}

scrapeMedals();
