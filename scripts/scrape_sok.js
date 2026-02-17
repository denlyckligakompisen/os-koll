
import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const URL = 'https://sok.se/olympiska-spel/tavlingar/spelen/milano-cortina-2026/svenska-os-guiden.html';
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
        const allEvents = [];

        $('.lp-schedule__program-item').each((i, el) => {
            const $el = $(el);
            let day = '';

            // Try to find the day header (closest preceding)
            const parentDay = $el.closest('.lp-schedule__day');
            if (parentDay.length) {
                day = parentDay.find('.lp-schedule__day-header, h2, h3').first().text().trim();
            }

            if (!day) {
                const prevHeader = $el.prevAll('h2, h3, .lp-schedule__day-header').first();
                if (prevHeader.length) {
                    day = prevHeader.text().trim();
                } else {
                    let parent = $el.parent();
                    while (parent.length && !day && !parent.is('body')) {
                        const parentPrevHeader = parent.prevAll('h2, h3, .lp-schedule__day-header').first();
                        if (parentPrevHeader.length) {
                            day = parentPrevHeader.text().trim();
                        }
                        parent = parent.parent();
                    }
                }
            }

            const time = $el.find('.lp-schedule__start-time-wrap').text().trim();
            const sport = $el.find('.lp-schedule__program-item__sport').text().trim();
            const eventEl = $el.find('.lp-schedule__title-wrap h3');
            const event = eventEl.text().trim();

            const contentDiv = $el.find('.lp-schedule__content-wrap .sv-text-portlet-content');

            // Clone the content to avoid modifying the original $
            const $content = cheerio.load(contentDiv.html() || '')('body');

            // Replace <br> tags with newlines
            $content.find('br').replaceWith('\n');

            let details = '';
            const paragraphs = $content.find('p');

            if (paragraphs.length > 0) {
                paragraphs.each((j, p) => {
                    const text = $(p).text().trim();
                    if (text) details += text + '\n';
                });
            } else {
                // If no paragraphs, take the whole text (which now has \n for <br>)
                details = $content.text();
            }
            details = details.trim();

            if (time && sport) {
                allEvents.push({
                    id: `sok-${i}-${Date.now()}`,
                    day: day || 'Unknown Date',
                    time,
                    sport,
                    event,
                    details
                });
            }
        });

        // Current Date Logic: Filter from today onwards
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const monthMap = {
            'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'maj': 4, 'jun': 5,
            'jul': 6, 'aug': 7, 'sep': 8, 'okt': 9, 'nov': 10, 'dec': 11,
            'januari': 0, 'februari': 1, 'mars': 2, 'april': 3, 'juni': 5,
            'juli': 6, 'augusti': 7, 'september': 8, 'oktober': 9, 'november': 10, 'december': 11,
            'oktober': 9
        };

        const futureEvents = allEvents.filter(e => {
            if (!e.day) return false;

            const match = e.day.match(/(\d+)\s+([a-zA-Z]+)/);
            if (!match) return false;

            const day = parseInt(match[1], 10);
            const monthStr = match[2].toLowerCase();
            const month = monthMap[monthStr];

            if (month === undefined) return false;

            // Using 2026 for Olympics context
            const eventDate = new Date(2026, month, day);

            return eventDate >= today;
        });

        console.log(`Found ${futureEvents.length} events from today onwards.`);

        if (futureEvents.length === 0 && allEvents.length > 0) {
            console.log('No future events found. Verify date parsing:', [...new Set(allEvents.map(e => e.day))].slice(0, 5));
        }

        const dir = path.dirname(OUTPUT_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(futureEvents, null, 2));
        console.log(`Saved future schedule to ${OUTPUT_FILE}`);

    } catch (error) {
        console.error('Scraping failed:', error.message);
        process.exit(1);
    }
}

scrapeSok();
