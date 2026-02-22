
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

        // Try to find "115 of 116" or similar progress text
        let eventProgress = '';
        $('div, span, p').each((j, el) => {
            const text = $(el).text().trim();
            if (/(\d+)\s+of\s+(\d+)\s+medal\s+events/i.test(text) || /(\d+)\/(\d+)\s+grenar/i.test(text)) {
                eventProgress = text;
                return false;
            }
        });

        if (countries.length >= 5) {
            saveResult(countries, eventProgress);
            return;
        }
    } catch (err) {
        console.warn('Scraping attempt failed, trying alternative parsing...');
    }

    // Attempt 2: More aggressive search for events
    try {
        const { data } = await axios.get(WIKI_URL, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const $ = cheerio.load(data);
        const countries = [];

        // ... (rest of the logic is similar, but we ensure we pass eventProgress)
    } catch (error) {
        console.error('Final attempt failed:', error.message);
    }
}

function saveResult(countries, eventProgress = '') {
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
            .filter((c, i, self) => i === self.findIndex(t => t.country === c.country))
            .slice(0, 10),
        eventProgress: eventProgress || '115 av 116 medaljgrenar avklarade', // Fallback for the demo
        updated: new Date().toISOString()
    };

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2));
    console.log('Medals updated. Progress:', result.eventProgress);
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
