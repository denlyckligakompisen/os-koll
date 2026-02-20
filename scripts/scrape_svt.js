
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { AXIOS_CONFIG, MONTH_MAP, getLocalYMD } from './utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const URL = 'https://www.svtplay.se/kategori/os-2026/tabla?scheduleCategory=svenskt-deltagande';
const OUTPUT_FILE = path.join(__dirname, '../public/data/svt_schedule.json');

function parseDate(heading) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lower = heading.toLowerCase();
    if (lower === 'idag') return today;
    if (lower === 'imorgon') {
        const d = new Date(today);
        d.setDate(d.getDate() + 1);
        return d;
    }

    const parts = heading.match(/(\d+)\s+([a-ö]+)/i);
    if (parts) {
        const day = parseInt(parts[1], 10);
        const monthStr = parts[2].toLowerCase();
        const month = MONTH_MAP[monthStr] ?? MONTH_MAP[monthStr.substring(0, 3)];
        if (month !== undefined) {
            return new Date(today.getFullYear(), month, day);
        }
    }
    return null;
}

async function scrapeSvt() {
    console.log(`Fetching SVT schedule from ${URL}...`);
    try {
        const { data } = await axios.get(URL, AXIOS_CONFIG);
        const match = data.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);

        if (!match) throw new Error('No __NEXT_DATA__ found');

        const json = JSON.parse(match[1]);
        const urqlState = json.props?.pageProps?.urqlState || json.props?.urqlState;
        if (!urqlState) throw new Error('No urqlState found');

        const allSvtEvents = [];

        Object.values(urqlState).forEach(entry => {
            if (!entry?.data) return;
            try {
                const parsed = JSON.parse(entry.data);
                const sections = parsed.schedulePage?.schedule?.sections;
                if (!sections) return;

                sections.forEach(section => {
                    const date = parseDate(section.heading);
                    if (!date) return;
                    const dateStr = getLocalYMD(date);

                    section.modules?.forEach(mod => {
                        mod.subsection?.scheduleItems?.forEach(item => {
                            allSvtEvents.push({
                                date: dateStr,
                                time: item.timeLabel,
                                title: item.heading,
                                subtitle: item.subHeading,
                                link: `https://www.svtplay.se${item.urls.svtplay}`,
                                live: item.liveNow,
                                duration: item.durationFormatted
                            });
                        });
                    });
                });
            } catch (e) { /* ignore parse errors for individual entries */ }
        });

        const stopDay = '2026-02-23';
        const filteredSvtEvents = allSvtEvents.filter(e => e.date < stopDay);

        console.log(`Found ${filteredSvtEvents.length} SVT events (filtered).`);
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(filteredSvtEvents, null, 2));

    } catch (error) {
        console.error('SVT Scraping failed:', error.message);
        process.exit(1);
    }
}

scrapeSvt();
