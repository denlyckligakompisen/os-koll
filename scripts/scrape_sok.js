
import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { AXIOS_CONFIG, MONTH_MAP } from './utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const URL = 'https://sok.se/olympiska-spel/tavlingar/spelen/milano-cortina-2026/svenska-os-guiden.html';
const OUTPUT_FILE = path.join(__dirname, '../public/data/sok_schedule.json');

async function scrapeSok() {
    console.log(`Fetching schedule from ${URL}...`);
    try {
        const { data } = await axios.get(URL, AXIOS_CONFIG);
        const $ = cheerio.load(data);
        const allEvents = [];

        $('.lp-schedule__program-item').each((i, el) => {
            const $el = $(el);
            let day = '';

            const parentDay = $el.closest('.lp-schedule__day');
            if (parentDay.length) {
                day = parentDay.find('.lp-schedule__day-header, h2, h3').first().text().trim();
            }

            if (!day) {
                const prevHeader = $el.prevAll('h2, h3, .lp-schedule__day-header').first();
                day = prevHeader.text().trim();
            }

            const time = $el.find('.lp-schedule__start-time-wrap').text().trim();
            const sport = $el.find('.lp-schedule__program-item__sport').text().trim();
            const event = $el.find('.lp-schedule__title-wrap h3').text().trim();

            const contentDiv = $el.find('.lp-schedule__content-wrap .sv-text-portlet-content');
            const $content = cheerio.load(contentDiv.html() || '')('body');
            $content.find('br').replaceWith('\n');

            let details = '';
            const paragraphs = $content.find('p');

            if (paragraphs.length > 0) {
                paragraphs.each((j, p) => {
                    const text = $(p).text().trim();
                    if (text) details += text + '\n';
                });
            } else {
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

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const futureEvents = allEvents.filter(e => {
            if (!e.day) return false;
            const match = e.day.match(/(\d+)\s+([a-zA-Z]+)/);
            if (!match) return false;

            const day = parseInt(match[1], 10);
            const monthStr = match[2].toLowerCase();
            const month = MONTH_MAP[monthStr] ?? MONTH_MAP[monthStr.substring(0, 3)];

            if (month === undefined) return false;
            const eventDate = new Date(2026, month, day);
            return eventDate >= today;
        });

        console.log(`Found ${futureEvents.length} future events.`);

        const dir = path.dirname(OUTPUT_FILE);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(futureEvents, null, 2));
        console.log(`Saved future schedule to ${OUTPUT_FILE}`);

    } catch (error) {
        console.error('Scraping failed:', error.message);
        process.exit(1);
    }
}

scrapeSok();
