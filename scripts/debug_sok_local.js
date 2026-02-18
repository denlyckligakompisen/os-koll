
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FILE_PATH = path.join(__dirname, '../axios_dump.html');

function debugLocal() {
    try {
        const data = fs.readFileSync(FILE_PATH, 'utf8');
        const $ = cheerio.load(data);
        const items = $('.lp-schedule__program-item');
        console.log(`Found ${items.length} items with class .lp-schedule__program-item`);

        if (items.length > 0) {
            const first = items.first();
            console.log('First item HTML snippet:', first.html().substring(0, 100));
        }

    } catch (e) {
        console.error(e);
    }
}

debugLocal();
