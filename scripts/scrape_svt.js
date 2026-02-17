
import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const URL = 'https://www.svtplay.se/kategori/os-2026/tabla?scheduleCategory=svenskt-deltagande';
const OUTPUT_FILE = path.join(__dirname, '../public/data/svt_schedule.json');

const monthMap = {
    'januari': 0, 'februari': 1, 'mars': 2, 'april': 3, 'maj': 4, 'juni': 5,
    'juli': 6, 'augusti': 7, 'september': 8, 'oktober': 9, 'november': 10, 'december': 11,
    'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'jun': 5, 'jul': 6, 'aug': 7, 'sep': 8, 'okt': 9, 'nov': 10, 'dec': 11
};

function parseDate(heading) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (heading.toLowerCase() === 'idag') {
        return today;
    }
    if (heading.toLowerCase() === 'imorgon') {
        const d = new Date(today);
        d.setDate(d.getDate() + 1);
        return d;
    }

    // "Torsdag 19 februari"
    const parts = heading.match(/(\d+)\s+([a-ö]+)/i);
    if (parts) {
        const day = parseInt(parts[1], 10);
        const monthStr = parts[2].toLowerCase();
        const month = monthMap[monthStr];
        if (month !== undefined) {
            const year = today.getFullYear();
            // Handle year wrap if needed, though OS is usually Feb
            return new Date(year, month, day);
        }
    }
    return null;
}

async function scrapeSvt() {
    console.log(`Fetching SVT schedule from ${URL}...`);
    try {
        const { data } = await axios.get(URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        const $ = cheerio.load(data);
        const nextData = $('#__NEXT_DATA__').html();

        if (!nextData) {
            console.error('No __NEXT_DATA__ found');
            return;
        }

        const json = JSON.parse(nextData);
        if (!json.props.urqlState) {
            console.error('No urqlState found');
            return;
        }

        const allSvtEvents = [];

        Object.keys(json.props.urqlState).forEach(key => {
            const entry = json.props.urqlState[key];
            if (entry && entry.data) {
                try {
                    const parsed = JSON.parse(entry.data);
                    if (parsed.schedulePage && parsed.schedulePage.schedule && parsed.schedulePage.schedule.sections) {

                        parsed.schedulePage.schedule.sections.forEach(section => {
                            const date = parseDate(section.heading);
                            if (!date) return;

                            const yr = date.getFullYear();
                            const mo = String(date.getMonth() + 1).padStart(2, '0');
                            const dy = String(date.getDate()).padStart(2, '0');
                            const dateStr = `${yr}-${mo}-${dy}`;

                            if (section.modules) {
                                section.modules.forEach(mod => {
                                    if (mod.subsection && mod.subsection.scheduleItems) {
                                        mod.subsection.scheduleItems.forEach(item => {
                                            allSvtEvents.push({
                                                date: dateStr,
                                                time: item.timeLabel, // e.g. "19:00"
                                                title: item.heading,
                                                subtitle: item.subHeading,
                                                link: `https://www.svtplay.se${item.urls.svtplay}`,
                                                live: item.liveNow,
                                                duration: item.durationFormatted
                                            });
                                        });
                                    }
                                    // Handle direct items on modules if structure varies?
                                    // Probe showed explicit nested structure, so focusing on subsection.scheduleItems is safest.
                                });
                            }
                        });
                    }
                } catch (e) {
                    // ignore parse errors
                }
            }
        });

        console.log(`Found ${allSvtEvents.length} SVT events.`);

        // Dedup based on link or time+title
        const uniqueEvents = Array.from(new Map(allSvtEvents.map(item => [item.link + item.date, item])).values());
        console.log(`Unique events: ${uniqueEvents.length}`);

        // Sort by date then time
        uniqueEvents.sort((a, b) => {
            if (a.date !== b.date) return a.date.localeCompare(b.date);
            return a.time.localeCompare(b.time);
        });

        const dir = path.dirname(OUTPUT_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(uniqueEvents, null, 2));
        console.log(`Saved SVT schedule to ${OUTPUT_FILE}`);

    } catch (error) {
        console.error('Error scraping SVT:', error.message);
    }
}

scrapeSvt();
