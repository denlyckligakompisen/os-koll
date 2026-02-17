
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

        // Structure assumption:
        // Day headers (h2, h3, etc) precede the list of items

        let currentDay = '';

        // Iterate through all children of the main content area
        // Often these are direct children of a content wrapper
        // The most reliable way is to traverse all elements and track "current day header" state

        // We look for elements that *could* be day headers or event items in document order
        // A common pattern is that both exist within a wrapper.

        // Let's refine the approach: Find all potential day headers AND items, sort by document position
        // Actually, just iterating over all elements in the main content div is easier if valid.

        // But the previous "backtrack" approach worked to get date strings like "onsdag 4 feb".
        // The issue was just the matching logic. Let's stick with the robust backtracking/finding approach that worked.

        $('.lp-schedule__program-item').each((i, el) => {
            const $el = $(el);
            let day = '';

            // Try to find the day header (closest preceding)
            // 1. Check if we are inside a day container?
            const parentDay = $el.closest('.lp-schedule__day');
            if (parentDay.length) {
                day = parentDay.find('.lp-schedule__day-header, h2, h3').first().text().trim();
            }

            // 2. Look for preceding headers
            if (!day) {
                // Get all preceding siblings that are headers
                const prevHeader = $el.prevAll('h2, h3, .lp-schedule__day-header').first();
                if (prevHeader.length) {
                    day = prevHeader.text().trim();
                } else {
                    // Start climbing up and checking previous siblings of parents
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

            let details = '';
            $el.find('.lp-schedule__content-wrap .sv-text-portlet-content p').each((j, p) => {
                const text = $(p).text().trim();
                if (text) details += text + '\n';
            });
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

        // Current Date Logic
        const today = new Date();
        const monthsFull = ['januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli', 'augusti', 'september', 'oktober', 'november', 'december'];
        const monthsShort = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];

        const dayNum = today.getDate();
        const monthIndex = today.getMonth();

        // We want to match "17 feb" or "17 februari"
        // Let's create a regex
        const dateRegex = new RegExp(`\\b${dayNum}\\s+(${monthsFull[monthIndex]}|${monthsShort[monthIndex]})\\b`, 'i');

        console.log(`Filtering for date pattern: ${dateRegex}`);

        const todaysEvents = allEvents.filter(e => {
            return dateRegex.test(e.day);
        });

        console.log(`Found ${todaysEvents.length} events for today.`);

        if (todaysEvents.length === 0 && allEvents.length > 0) {
            console.log('No events found for today. Verify date strings:', [...new Set(allEvents.map(e => e.day))].slice(0, 5));
        }

        // Ensure directory exists
        const dir = path.dirname(OUTPUT_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(todaysEvents, null, 2));
        console.log(`Saved schedule to ${OUTPUT_FILE}`);

    } catch (error) {
        console.error('Scraping failed:', error.message);
        process.exit(1);
    }
}

scrapeSok();
