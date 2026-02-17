
import axios from 'axios';
import * as cheerio from 'cheerio';

async function probe() {
    const { data } = await axios.get('https://sok.se/', {
        headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const $ = cheerio.load(data);
    console.log('Medal section html:', $('.lp-game-medals').html());
}
probe();
