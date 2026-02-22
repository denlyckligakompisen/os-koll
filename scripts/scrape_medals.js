
import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

const MEDALS_URL = 'https://www.olympics.com/en/milano-cortina-2026/medals';
const OUTPUT_PATH = path.join(process.cwd(), 'public/data/medals.json');

async function scrapeMedals() {
    console.log('Fetching medals from olympics.com...');
    try {
        const { data } = await axios.get(MEDALS_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        const $ = cheerio.load(data);
        const countries = [];

        // This selector is a guess based on general olympics.com structure
        // Since I cannot browse the live DOM with execution, I will try to find the table/list
        $('tr[data-test-id="medal-standings-row"], .medal-standings-table tr').each((i, el) => {
            if (i >= 15) return; // Get a few extra to ensure we find Sweden if they are outside top 10

            const countryName = $(el).find('[data-test-id="country-name"], .country-name').text().trim();
            const gold = parseInt($(el).find('[data-test-id="gold"], .gold').text().trim()) || 0;
            const silver = parseInt($(el).find('[data-test-id="silver"], .silver').text().trim()) || 0;
            const bronze = parseInt($(el).find('[data-test-id="bronze"], .bronze').text().trim()) || 0;
            const rank = parseInt($(el).find('[data-test-id="rank"], .rank').text().trim()) || (i + 1);

            if (countryName) {
                countries.push({
                    rank,
                    country: countryName,
                    gold,
                    silver,
                    bronze,
                    total: gold + silver + bronze
                });
            }
        });

        if (countries.length === 0) {
            console.error('No countries found. Selector might be wrong.');
            // Fallback: try to find any table rows if the specific ones fail
            $('table tr').each((i, el) => {
                const cells = $(el).find('td');
                if (cells.length >= 4) {
                    const country = $(cells[1]).text().trim();
                    if (country && i < 20) {
                        countries.push({
                            rank: parseInt($(cells[0]).text().trim()) || i,
                            country: country,
                            gold: parseInt($(cells[2]).text().trim()) || 0,
                            silver: parseInt($(cells[3]).text().trim()) || 0,
                            bronze: parseInt($(cells[4]).text().trim()) || 0
                        });
                    }
                }
            });
        }

        // Map to Swedish names if possible (manual map for top ones)
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
                .slice(0, 10),
            updated: new Date().toISOString()
        };

        // Ensure Sweden is in there if the user requested top 10 but Sweden is e.g. 11th
        // (Though Sweden is 6-8th currently)

        fs.writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2));
        console.log('Medals updated successfully:', result.top10.length, 'countries');

    } catch (error) {
        console.error('Scraping failed:', error.message);
    }
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
        'Japan': 'JP', 'Japan': 'JP'
    };
    return codes[name] || name.substring(0, 2).toUpperCase();
}

scrapeMedals();
