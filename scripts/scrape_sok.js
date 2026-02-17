
import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const URL = 'https://sok.se/';
// Adjust path to save in src/data so the frontend can import it
const OUTPUT_FILE = path.join(__dirname, '../public/data/sok_schedule.json');

async function scrapeSok() {
    console.log(`Fetching schedule from ${URL}...`);
    try {
        const { data } = await axios.get(URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 10000
        });

        const $ = cheerio.load(data);
        const events = [];

        $('.lp-program-today--wrapper .lp-program-today--list .lp-program-today--item').each((i, el) => {
            const time = $(el).find('.lp-program-today-item--time').text().trim();
            const sport = $(el).find('.lp-program-today-item--sports').text().trim();
            const event = $(el).find('.lp-program-today-item--gamename').text().trim();

            // Extract details from the content div
            let details = '';
            $(el).find('.lp-program-today-item--content .sv-text-portlet-content p').each((j, p) => {
                const text = $(p).text().trim();
                if (text) {
                    details += (details ? '\n' : '') + text;
                }
            });

            // Extract external links (e.g. to athletes) if useful
            // const links = [];
            // $(el).find('a').each((k, a) => {
            //     links.push({
            //         text: $(a).text().trim(),
            //         href: $(a).attr('href')
            //     });
            // });

            if (time || sport || event) {
                events.push({
                    id: `sok-${i}-${Date.now()}`, // Simple ID
                    time,
                    sport,
                    event,
                    details
                });
            }
        });

        console.log(`Found ${events.length} events.`);

        // Ensure directory exists
        const dir = path.dirname(OUTPUT_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(events, null, 2));
        console.log(`Saved schedule to ${OUTPUT_FILE}`);

    } catch (error) {
        console.error('Scraping failed:', error.message);
        process.exit(1);
    }
}

scrapeSok();
