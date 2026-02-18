
import axios from 'axios';
import * as cheerio from 'cheerio';
import { AXIOS_CONFIG } from './utils.js';

const URL = 'https://sok.se/olympiska-spel/tavlingar/spelen/milano-cortina-2026/svenska-os-guiden.html';

async function debugFetch() {
    try {
        console.log(`Fetching from ${URL}...`);
        const response = await axios.get(URL, AXIOS_CONFIG);
        console.log('Response data length:', response.data.length);

        console.log('Cheerio keys:', Object.keys(cheerio));
        const $ = cheerio.load(response.data);
        const items = $('.lp-schedule__program-item');
        console.log(`Found ${items.length} items with cheerio`);

    } catch (e) {
        console.error('Fetch error:', e.message);
    }
}

debugFetch();
