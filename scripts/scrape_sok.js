
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
        const response = await axios.get(URL, AXIOS_CONFIG);
        const $ = cheerio.load(response.data);
        const items = $('.lp-schedule__program-item');
        console.log(`Found ${items.length} items.`);

        const allEvents = [];

        items.each((i, el) => {
            const $el = $(el);
            let day = '';

            const parentDay = $el.closest('.lp-schedule__day');
            if (i === 0) {
                console.log('Item 0 Closest .lp-schedule__day length:', parentDay.length);
                if (parentDay.length) console.log('Item 0 Parent HTML (100 chars):', parentDay.html().substring(0, 100));
            }

            if (parentDay.length) {
                day = parentDay.find('.lp-schedule__day-header, .lp-schedule__date-title, .lp-schedule-day, h2, h3').first().text().trim();
            }

            if (!day) {
                const prevAll = $el.prevAll();
                if (i === 0) {
                    const parent = $el.parent();
                    console.log('Item 0 Parent Tag:', parent.prop('tagName'));
                    console.log('Item 0 Parent Class:', parent.attr('class'));

                    const grandParent = parent.parent();
                    console.log('Item 0 GrandParent Tag:', grandParent.prop('tagName'));
                    console.log('Item 0 GrandParent Class:', grandParent.attr('class'));

                    // Also log siblings of PARENT
                    const parentPrev = parent.prevAll();
                    if (parentPrev.length) console.log('Parent Prev All Length:', parentPrev.length);
                }
                const prevHeader = $el.prevAll('.lp-schedule__day-header, .lp-schedule__date-title, .lp-schedule-day, h2, h3').first();
                day = prevHeader.text().trim();

                // If not found, try finding via parent's siblings
                if (!day) {
                    const parentPrev = $el.parent().prevAll('.lp-schedule__day-header, .lp-schedule__date-title, .lp-schedule-day, h2, h3').first();
                    day = parentPrev.text().trim();
                }

                // If still not found, try grandparent
                if (!day) {
                    const gpPrev = $el.parent().parent().prevAll('.lp-schedule__day-header, .lp-schedule__date-title, .lp-schedule-day, h2, h3').first();
                    day = gpPrev.text().trim();
                }
            }

            // Fallback for day if still empty - maybe iterate backwards
            if (!day) {
                let prev = $el.prev();
                while (prev.length) {
                    if (prev.is('.lp-schedule-day') || prev.find('.lp-schedule-day').length) {
                        day = prev.text().trim(); // Rough
                        break;
                    }
                    prev = prev.prev();
                }
            }

            const time = $el.find('.lp-schedule__start-time-wrap').text().trim();
            const sport = $el.find('.lp-schedule__program-item__sport').text().trim();
            // Use requested 'title' field for the specific event description
            const title = $el.find('.lp-schedule__title-wrap h3').text().trim();

            const contentDiv = $el.find('.lp-schedule__content-wrap .sv-text-portlet-content');

            // Safe load of content
            let details = '';
            if (contentDiv.length) {
                const $content = cheerio.load(contentDiv.html() || '')('body');
                $content.find('br').replaceWith('\n');

                const paragraphs = $content.find('p');
                if (paragraphs.length > 0) {
                    paragraphs.each((j, p) => {
                        const text = $(p).text().trim();
                        if (text) details += text + '\n';
                    });
                } else {
                    details = $content.text();
                }
            }
            details = details.trim();

            if (time && sport) {
                allEvents.push({
                    id: `sok-${i}-${Date.now()}`,
                    day: day || 'Unknown Date',
                    time,
                    sport,
                    title,
                    details
                });
            } else {
                // Log first failure ONLY
                if (i === 0) console.log(`Item 0 missing data: time='${time}', sport='${sport}'`);
            }
        });

        console.log(`Parsed ${allEvents.length} events.`);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const stopDate = new Date(2026, 1, 23); // Feb 23, 2026 (inclusive endpoint for data, usually means don't include this day)
        stopDate.setHours(0, 0, 0, 0);

        const futureEvents = allEvents.filter(e => {
            if (!e.day || e.day === 'Unknown Date') {
                // console.log(`Missing day for event ${e.id}`);
                return true;
            }

            // "onsdag 18 feb" -> capture 18 and feb
            const match = e.day.match(/(\d+)\s+([a-zA-Zåäö]+)/i);
            if (!match) {
                // console.log(`Failed to match day: '${e.day}'`);
                return true;
            }

            const dayVal = parseInt(match[1], 10);
            const monthStr = match[2].toLowerCase();
            const month = MONTH_MAP[monthStr] ?? MONTH_MAP[monthStr.substring(0, 3)];

            if (month === undefined) {
                // console.log(`Undefined month: '${monthStr}' in '${e.day}'`);
                return true;
            }

            const eventDate = new Date(2026, month, dayVal);

            // Keep events from today up until but NOT including stopDate (Feb 23)
            // If the user wants to include Feb 23, they would say "stop after 23"
            return eventDate >= today && eventDate < stopDate;
        });

        console.log(`Found ${futureEvents.length} future events.`);

        const dir = path.dirname(OUTPUT_FILE);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(futureEvents, null, 2));
        console.log(`Saved to ${OUTPUT_FILE}`);

    } catch (error) {
        console.error('Scraping failed:', error.message);
        process.exit(1);
    }
}

scrapeSok();
