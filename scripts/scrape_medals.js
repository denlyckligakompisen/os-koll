
import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

const MEDALS_URL = 'https://www.olympics.com/en/milano-cortina-2026/medals';
const OUTPUT_PATH = path.join(process.cwd(), 'public/data/medals.json');

async function scrapeMedals() {
    console.log('Fetching medals (Adaptive Scraper)...');

    // Attempt 1: Wikipedia (Usually more reliable for simple GET)
    const WIKI_URL = 'https://en.wikipedia.org/wiki/2026_Winter_Olympics_medal_table';
    try {
        const { data } = await axios.get(WIKI_URL, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const $ = cheerio.load(data);
        const countries = [];

        $('.wikitable tr').each((i, el) => {
            const cells = $(el).find('td, th');
            if (cells.length < 5) return;

            const rowData = [];
            cells.each((j, cell) => {
                rowData.push({
                    text: $(cell).text().trim(),
                    hasLink: $(cell).find('a').length > 0,
                    linkText: $(cell).find('a').first().text().trim()
                });
            });

            // Find nation: usually the cell with a link and non-numeric text
            const nationIdx = rowData.findIndex(d => d.hasLink && d.text.length > 3 && isNaN(parseInt(d.text)));
            if (nationIdx === -1) return;

            const nation = rowData[nationIdx].linkText || rowData[nationIdx].text.replace(/\[\d+\]/g, '').trim();

            // Gold, Silver, Bronze are usually the 3 cells following nation
            const gold = parseInt(rowData[nationIdx + 1]?.text) || 0;
            const silver = parseInt(rowData[nationIdx + 2]?.text) || 0;
            const bronze = parseInt(rowData[nationIdx + 3]?.text) || 0;
            const rank = parseInt(rowData[0].text) || (countries.length + 1);

            if (nation && !isNaN(gold)) {
                countries.push({ rank, country: nation, gold, silver, bronze, total: gold + silver + bronze });
            }
        });

        if (countries.length >= 5) {
            saveResult(countries);
            return;
        }
    } catch (err) {
        console.warn('Wikipedia adaptive failed, trying olympics.com...');
    }

    // Attempt 2: Olympics.com (If wiki fails or has bad data)
    try {
        const { data } = await axios.get(MEDALS_URL, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
        });
        const $ = cheerio.load(data);
        const countries = [];

        $('tr').each((i, el) => {
            const country = $(el).find('[data-test-id="country-name"], .country-name').text().trim();
            const gold = parseInt($(el).find('[data-test-id="gold"], .gold').text().trim());
            if (country && !isNaN(gold)) {
                countries.push({
                    rank: parseInt($(el).find('[data-test-id="rank"], .rank').text().trim()) || (countries.length + 1),
                    country,
                    gold,
                    silver: parseInt($(el).find('[data-test-id="silver"], .silver').text().trim()) || 0,
                    bronze: parseInt($(el).find('[data-test-id="bronze"], .bronze').text().trim()) || 0
                });
            }
        });

        if (countries.length > 0) {
            saveResult(countries);
        } else {
            console.error('All scraping attempts failed.');
        }
    } catch (error) {
        console.error('Final attempt failed:', error.message);
    }
}

function saveResult(countries) {
    const nameMap = {
        'Norway': 'Norge', 'United States': 'USA', 'United States of America': 'USA',
        'Italy': 'Italien', 'Netherlands': 'Nederländerna', 'Germany': 'Tyskland',
        'France': 'Frankrike', 'Switzerland': 'Schweiz', 'Sweden': 'Sverige',
        'Austria': 'Österrike', 'Japan': 'Japan', 'Canada': 'Kanada', 'China': 'Kina'
    };

    const result = {
        top10: countries
            .map(c => ({
                ...c,
                country: nameMap[c.country] || c.country,
                code: getCountryCode(c.country)
            }))
            .sort((a, b) => a.rank - b.rank || b.gold - a.gold)
            .filter((c, i, self) => i === self.findIndex(t => t.country === c.country)) // Unique countries
            .slice(0, 10),
        updated: new Date().toISOString()
    };

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2));
    console.log('Medals updated. Top country:', result.top10[0]?.country, 'with', result.top10[0]?.gold, 'gold.');
}

function getCountryCode(name) {
    const codes = {
        'Norway': 'NO', 'Norge': 'NO',
        'USA': 'US', 'United States': 'US',
        'Netherlands': 'NL', 'Nederländerna': 'NL',
        'Italy': 'IT', 'Italien': 'IT',
        'Germany': 'DE', 'Tyskland': 'DE',
        'Sweden': 'SE', 'Sverige': 'SE',
        'France': 'FR', 'Frankrike': 'FR',
        'Switzerland': 'CH', 'Schweiz': 'CH',
        'Austria': 'AT', 'Österrike': 'AT',
        'Japan': 'JP'
    };
    return codes[name] || 'UN';
}

scrapeMedals();
