import * as cheerio from 'cheerio';
import fs from 'fs';

function extract() {
    const html = fs.readFileSync('flashscore.html', 'utf-8');
    const $ = cheerio.load(html);

    // Look for anything resembling data
    let jsonMatch = html.match(/window\.environment\s*=\s*(\{.*?\});/);
    if (jsonMatch) {
        console.log("Found window.environment");
    }

    const elementsWithSirius = [];
    $('*').each((i, el) => {
        if ($(el).text().includes('Sirius')) {
            elementsWithSirius.push($(el).prop('tagName'));
        }
    });
    console.log("Tags:", new Set(elementsWithSirius));
}
extract();
