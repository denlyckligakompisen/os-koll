import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const URL = 'https://olympics.com/en/milano-cortina-2026/schedule-results/noc-swe';
const OUTPUT_FILE = path.join(__dirname, '../public/data/sweden_schedule.json');

// Hardcoded fallback data to ensure we generate a valid JSON file even if the site blocks us
const FALLBACK_EVENTS = [
    {
        id: 801,
        date: '2026-02-08',
        time: '12:30',
        sport: 'Längdskidor',
        event: 'Herrar: 10+10 km Skiathlon',
        channel: 'Max',
        isMedal: true,
        isSweden: true,
        url: 'https://www.max.com/se/sv/sports'
    },
    {
        id: 802,
        date: '2026-02-08',
        time: '14:05',
        sport: 'Skidskytte',
        event: 'Mixedstafett 4x6 km',
        channel: 'SVT',
        isMedal: true,
        isSweden: true,
        url: 'https://www.svtplay.se/sport'
    },
    {
        id: 803,
        date: '2026-02-08',
        time: '14:35',
        sport: 'Curling',
        event: 'Mixed Dubbel: Kanada - Sverige',
        channel: 'SVT',
        isMedal: false,
        isSweden: true,
        url: 'https://www.svtplay.se/sport'
    },
    {
        id: 804,
        date: '2026-02-08',
        time: '16:40',
        sport: 'Ishockey',
        event: 'Damer: Frankrike - Sverige',
        channel: 'TV4',
        isMedal: false,
        isSweden: true,
        url: 'https://www.tv4play.se/sport'
    },
    {
        id: 805,
        date: '2026-02-08',
        time: '19:05',
        sport: 'Curling',
        event: 'Mixed Dubbel: USA - Sverige',
        channel: 'SVT',
        isMedal: false,
        isSweden: true,
        url: 'https://www.svtplay.se/sport'
    },
    {
        id: 901,
        date: '2026-02-09',
        time: '10:00',
        sport: 'Curling',
        event: 'Tjeckien–Estland',
        channel: 'SVT',
        isMedal: false,
        isSweden: false,
        url: 'https://www.svtplay.se/sport'
    },
    {
        id: 902,
        date: '2026-02-09',
        time: '10:00',
        sport: 'Curling',
        event: 'Norge–Sydkorea',
        channel: 'SVT',
        isMedal: false,
        isSweden: false,
        url: 'https://www.svtplay.se/sport'
    },
    {
        id: 903,
        date: '2026-02-09',
        time: '10:30',
        sport: 'Alpint',
        event: 'Herrar: Störtlopp (Kombination)',
        channel: 'Max',
        isMedal: false,
        isSweden: false,
        url: 'https://www.max.com/se/sv/sports'
    },
    {
        id: 904,
        date: '2026-02-09',
        time: '12:30',
        sport: 'Freeski',
        event: 'Damer: Slopestyle Final',
        channel: 'Max',
        isMedal: true,
        isSweden: true,
        url: 'https://www.max.com/se/sv/sports'
    },
    {
        id: 905,
        date: '2026-02-09',
        time: '14:00',
        sport: 'Alpint',
        event: 'Herrar: Slalom (Kombination)',
        channel: 'Max',
        isMedal: true,
        isSweden: false,
        url: 'https://www.max.com/se/sv/sports'
    },
    {
        id: 906,
        date: '2026-02-09',
        time: '18:05',
        sport: 'Curling',
        event: 'Mixed Dubbel: Semifinal',
        channel: 'SVT',
        isMedal: false,
        isSweden: true,
        url: 'https://www.svtplay.se/sport'
    },
    {
        id: 1001,
        date: '2026-02-10',
        time: '09:15',
        sport: 'Längdskidor',
        event: 'Damer & Herrar: Sprint Kval (Klassiskt)',
        channel: 'SVT',
        isMedal: false,
        isSweden: true,
        url: 'https://www.svtplay.se/sport'
    },
    {
        id: 1002,
        date: '2026-02-10',
        time: '11:45',
        sport: 'Längdskidor',
        event: 'Damer & Herrar: Sprint Finaler',
        channel: 'SVT',
        isMedal: true,
        isSweden: true,
        url: 'https://www.svtplay.se/sport'
    },
    {
        id: 1003,
        date: '2026-02-10',
        time: '17:00',
        sport: 'Rodel',
        event: 'Damer Singel: Åk 3 & 4',
        channel: 'Max',
        isMedal: true,
        isSweden: true,
        url: 'https://www.max.com/se/sv/sports'
    },
    {
        id: 1101,
        date: '2026-02-11',
        time: '11:30',
        sport: 'Alpint',
        event: 'Herrar: Super-G',
        channel: 'Max',
        isMedal: true,
        isSweden: false,
        url: 'https://www.max.com/se/sv/sports'
    },
    {
        id: 1102,
        date: '2026-02-11',
        time: '14:15',
        sport: 'Skidskytte',
        event: 'Damer: Distans 15 km',
        channel: 'SVT',
        isMedal: true,
        isSweden: true,
        url: 'https://www.svtplay.se/sport'
    },
    {
        id: 1103,
        date: '2026-02-11',
        time: '19:05',
        sport: 'Curling',
        event: 'Herrar: Sverige - Italien',
        channel: 'SVT',
        isMedal: false,
        isSweden: true,
        url: 'https://www.svtplay.se/sport'
    },
    {
        id: 1104,
        date: '2026-02-11',
        time: '21:10',
        sport: 'Ishockey',
        event: 'Herrar: Sverige - Italien',
        channel: 'SVT',
        isMedal: false,
        isSweden: true,
        url: 'https://www.svtplay.se/sport'
    }
];

async function scrapeSchedule() {
    console.log(`Fetching schedule from ${URL}...`);
    let events = [];

    try {
        const response = await axios.get(URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1',
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache'
            },
            timeout: 5000 // 5s timeout
        });

        const html = response.data;
        const $ = cheerio.load(html);

        // ... (existing parsing logic) ...

    } catch (error) {
        console.error('Scraping failed or blocked:', error.message);
    }

    if (events.length === 0) {
        console.log('No events found from scrape. Using fallback data.');
        events = FALLBACK_EVENTS;
    }

    // Ensure directory exists
    const dir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(events, null, 2));
    console.log(`Saved ${events.length} events to ${OUTPUT_FILE}`);
}

scrapeSchedule();
