import axios from 'axios';
import * as cheerio from 'cheerio';

async function aftonbladet() {
    try {
        const { data } = await axios.get('https://minklubb.fotbolldirekt.se/sirius/matcher/svenska-cupen-herrar-1.40130', {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        console.log("fotbolldirekt HTML:", data.length);
        const $ = cheerio.load(data);
        console.log($('title').text());

        const matcher = [];
        $('.match-row, tr, .match').each((i, el) => {
            matcher.push($(el).text().replace(/\s+/g, ' ').trim().substring(0, 100));
        });
        console.log(matcher);

    } catch (e) {
        console.error("fotbolldirekt blocked:", e.message);
    }
}
aftonbladet();
