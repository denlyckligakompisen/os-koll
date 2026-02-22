
import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

const WIKI_URL = 'https://en.wikipedia.org/wiki/2026_Winter_Olympics_medal_table';
const OUTPUT_PATH = path.join(process.cwd(), 'public/data/medals.json');

async function scrapeMedals() {
    console.log('Fetching medals from Wikipedia...');
    try {
        const { data } = await axios.get(WIKI_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        const $ = cheerio.load(data);
        const countries = [];

        // Wikipedia medal tables usually have class 'wikitable' and 'sortable'
        // The header row is skipped, and we look for the main standings
        $('table.wikitable.sortable tbody tr').each((i, el) => {
            const cells = $(el).find('td');
            if (cells.length >= 4) {
                // First cell is rank (sometimes in a <th>), second is country
                let rankText = $(el).find('th').first().text().trim();
                if (!rankText || isNaN(parseInt(rankText))) {
                    rankText = $(cells[0]).text().trim();
                }

                const countryLink = $(cells[0]).find('a').last().text().trim() || $(cells[1]).find('a').last().text().trim();
                const countryName = countryLink || $(cells[0]).text().trim();

                // Usually: Rank, Nation, Gold, Silver, Bronze, Total
                // But sometimes Rank is <th>. Let's adjust.
                const offset = $(el).find('th').length > 0 ? -1 : 0;

                const gold = parseInt($(cells[1 + offset])?.text().trim()) || 0;
                const silver = parseInt($(cells[2 + offset])?.text().trim()) || 0;
                const bronze = parseInt($(cells[3 + offset])?.text().trim()) || 0;
                const rank = parseInt(rankText);

                if (countryName && !isNaN(gold)) {
                    countries.push({
                        rank: rank || (countries.length + 1),
                        country: countryName,
                        gold,
                        silver,
                        bronze,
                        total: gold + silver + bronze
                    });
                }
            }
        });

        if (countries.length === 0) {
            // Second attempt with broader selector
            $('.wikitable tr').each((i, el) => {
                const cells = $(el).find('td');
                if (cells.length >= 4) {
                    const country = $(cells[0]).find('a').last().text().trim();
                    if (country) {
                        countries.push({
                            rank: i,
                            country: country,
                            gold: parseInt($(cells[1]).text().trim()) || 0,
                            silver: parseInt($(cells[2]).text().trim()) || 0,
                            bronze: parseInt($(cells[3]).text().trim()) || 0
                        });
                    }
                }
            });
        }

        const nameMap = {
            'Norway': 'Norge',
            'United States': 'USA',
            'United States of America': 'USA',
            'Italy': 'Italien',
            'Netherlands': 'Nederländerna',
            'Germany': 'Tyskland',
            'France': 'Frankrike',
            'Switzerland': 'Schweiz',
            'Sweden': 'Sverige',
            'Austria': 'Österrike',
            'Japan': 'Japan',
            'Canada': 'Kanada',
            'China': 'Kina'
        };

        const result = {
            top10: countries
                .map(c => ({
                    ...c,
                    country: nameMap[c.country] || c.country,
                    code: getCountryCode(c.country)
                }))
                .filter(c => c.rank <= 15) // Get a few extra
                .sort((a, b) => a.rank - b.rank)
                .slice(0, 10),
            updated: new Date().toISOString()
        };

        fs.writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2));
        console.log('Medals updated from Wikipedia:', result.top10.length, 'countries');

    } catch (error) {
        console.error('Wikipedia scraping failed:', error.message);
    }
}

function getCountryCode(name) {
    const codes = {
        'Norway': 'NO', 'Norge': 'NO',
        'USA': 'US', 'United States': 'US', 'United States of America': 'US',
        'Netherlands': 'NL', 'Nederländerna': 'NL',
        'Italy': 'IT', 'Italien': 'IT',
        'Germany': 'DE', 'Tyskland': 'DE',
        'Sweden': 'SE', 'Sverige': 'SE',
        'France': 'FR', 'Frankrike': 'FR',
        'Switzerland': 'CH', 'Schweiz': 'CH',
        'Austria': 'AT', 'Österrike': 'AT',
        'Japan': 'JP', 'Japan': 'JP'
    };
    return codes[name] || name.substring(0, 2).toUpperCase();
}

scrapeMedals();
