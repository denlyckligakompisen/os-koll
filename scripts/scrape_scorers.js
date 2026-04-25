import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const URLS = [
    { name: 'AFC', url: 'https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_qualification_(AFC)#Top_goalscorers' },
    { name: 'CAF', url: 'https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_qualification_(CAF)#Top_goalscorers' },
    { name: 'CONCACAF', url: 'https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_qualification_(CONCACAF)#Top_goalscorers' },
    { name: 'CONMEBOL', url: 'https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_qualification_(CONMEBOL)#Goalscorers' },
    { name: 'OFC', url: 'https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_qualification_(OFC)#Goalscorers' },
    { name: 'UEFA', url: 'https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_qualification_(UEFA)#Top_goalscorers' },
    { name: 'Inter-confederation', url: 'https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_qualification_(inter-confederation_play-offs)#Goalscorers' }
];

const OUTPUT_FILE = path.join(process.cwd(), 'public/data/worldcup_2026_scorers.json');

function isJunkPlayer(txt, title) {
    const lower = txt.toLowerCase();
    const titleLower = (title || '').toLowerCase();
    return txt.length <= 2 ||
        titleLower.includes('national football team') ||
        titleLower.includes('world cup') ||
        titleLower.includes('qualification') ||
        titleLower.includes('round') ||
        titleLower.includes('group') ||
        titleLower.includes('category:') ||
        titleLower.includes('edit') ||
        titleLower.includes('list of') ||
        titleLower.includes('main article') ||
        titleLower.includes('nations league') ||
        titleLower.includes('intercontinental cup') ||
        titleLower.includes('euro under') ||
        lower.includes('nations league') ||
        lower.includes('the original') ||
        lower.includes('main article') ||
        lower.includes('qualifiers') ||
        txt.includes('"') ||
        txt.includes('[') ||
        /^\d{4}$/.test(txt) ||      // "2024", "2025"
        /^'\d{2}/.test(txt);         // "'25", "'25-'26"
}

function extractTeamName(el, links) {
    // 1. Link with "national football team" in title
    const teamLink = links.find(l => {
        const title = (l.getAttribute('title') || '').toLowerCase();
        return title.includes('national football team');
    });
    if (teamLink) {
        return (teamLink.textContent.trim() || teamLink.getAttribute('title').replace(/ national football team/i, '')).trim();
    }

    // 2. Flag icon alt text
    const flag = el.querySelector('.flagicon img, img.mw-file-element');
    if (flag) {
        const alt = flag.getAttribute('alt');
        if (alt && alt.length > 1) return alt;
        const flagLink = flag.closest('a');
        if (flagLink) {
            const title = flagLink.getAttribute('title');
            if (title) return title;
        }
    }

    return '';
}

async function scrapeScorers() {
    console.log('Starting Wikipedia scraper for top goalscorers...');
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();

    let allScorers = [];

    try {
        for (const { name, url } of URLS) {
            console.log(`Scraping ${name} from ${url}...`);
            await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });

            const scorers = await page.evaluate((confName) => {
                const results = [];

                // Find the goalscorers section by its ID anchor
                const sectionIds = ['Top_goalscorers', 'Goalscorers', 'Top_scorers'];
                let sectionHeader = null;
                for (const id of sectionIds) {
                    sectionHeader = document.getElementById(id);
                    if (sectionHeader) break;
                }
                if (!sectionHeader) return results;

                // Navigate to the wrapper (mw-heading div) or the header itself
                let startEl = sectionHeader.closest('.mw-heading') || sectionHeader;

                // Collect all sibling elements after the header until next h2
                const sectionElements = [];
                let el = startEl.nextElementSibling;
                while (el) {
                    // Stop at next h2 section
                    if (el.classList.contains('mw-heading') && el.querySelector('h2')) break;
                    if (el.tagName === 'H2') break;
                    sectionElements.push(el);
                    el = el.nextElementSibling;
                }

                let currentGoals = 0;

                for (const secEl of sectionElements) {
                    const text = secEl.textContent.trim();

                    // Stop at "Below are full goalscorer lists" to avoid per-group data
                    if (text.toLowerCase().includes('below are full goalscorer lists')) break;

                    // Check for "X goals" in <p>, <h3>, <h4>, etc.
                    const goalMatch = text.match(/^(\d+)\s+goals?\b/i);
                    if (goalMatch && (secEl.tagName === 'P' || secEl.tagName.match(/^H[3-6]$/))) {
                        currentGoals = parseInt(goalMatch[1]);
                        continue;
                    }

                    if (currentGoals <= 0) continue;

                    // Process <li> elements inside this element (handles both <ul> and <div class="div-col">)
                    const listItems = secEl.querySelectorAll('li');
                    if (listItems.length > 0) {
                        listItems.forEach(li => {
                            const links = Array.from(li.querySelectorAll('a'));
                            const playerLink = links.find(l => {
                                const title = l.getAttribute('title') || '';
                                const txt = l.textContent.trim();
                                const titleLower = title.toLowerCase();
                                return txt.length > 2 &&
                                    !titleLower.includes('national football team') &&
                                    !titleLower.includes('world cup') &&
                                    !titleLower.includes('qualification') &&
                                    !titleLower.includes('category:') &&
                                    !titleLower.includes('edit') &&
                                    !titleLower.includes('nations league') &&
                                    !titleLower.includes('euro under') &&
                                    !titleLower.includes('intercontinental') &&
                                    !txt.includes('"') &&
                                    !txt.includes('[') &&
                                    !/^\d{4}$/.test(txt) &&
                                    !/^'\d{2}/.test(txt);
                            });

                            if (playerLink) {
                                let teamName = '';
                                // Team link
                                const teamLink = links.find(l => (l.getAttribute('title') || '').toLowerCase().includes('national football team'));
                                if (teamLink) {
                                    teamName = teamLink.textContent.trim() || teamLink.getAttribute('title').replace(/ national football team/i, '');
                                } else {
                                    const flag = li.querySelector('.flagicon img, img.mw-file-element');
                                    if (flag) {
                                        teamName = flag.getAttribute('alt') || flag.closest('a')?.getAttribute('title') || '';
                                    }
                                }
                                teamName = teamName.replace(/ national football team/i, '').replace(/^Flag of /i, '').trim();

                                if (teamName.length > 2 && teamName.length < 40 && !teamName.includes('.') && !teamName.includes('^')) {
                                    results.push({
                                        player: playerLink.textContent.trim(),
                                        goals: currentGoals,
                                        team: teamName,
                                        confederation: confName
                                    });
                                }
                            }
                        });
                        continue;
                    }

                    // Process <tr> elements (table format)
                    const rows = secEl.querySelectorAll('tr');
                    rows.forEach(row => {
                        const links = Array.from(row.querySelectorAll('a'));
                        const playerLink = links.find(l => {
                            const title = l.getAttribute('title') || '';
                            const txt = l.textContent.trim();
                            const titleLower = title.toLowerCase();
                            return txt.length > 2 &&
                                !titleLower.includes('national football team') &&
                                !titleLower.includes('world cup') &&
                                !titleLower.includes('qualification') &&
                                !titleLower.includes('category:') &&
                                !titleLower.includes('edit') &&
                                !txt.includes('"') &&
                                !txt.includes('[') &&
                                !/^\d{4}$/.test(txt) &&
                                !/^'\d{2}/.test(txt);
                        });

                        if (playerLink) {
                            let teamName = '';
                            const teamLink = links.find(l => (l.getAttribute('title') || '').toLowerCase().includes('national football team'));
                            if (teamLink) {
                                teamName = teamLink.textContent.trim() || teamLink.getAttribute('title').replace(/ national football team/i, '');
                            } else {
                                const flag = row.querySelector('.flagicon img, img.mw-file-element');
                                if (flag) {
                                    teamName = flag.getAttribute('alt') || flag.closest('a')?.getAttribute('title') || '';
                                }
                            }
                            teamName = teamName.replace(/ national football team/i, '').replace(/^Flag of /i, '').trim();

                            if (teamName.length > 2 && teamName.length < 40 && !teamName.includes('.') && !teamName.includes('^')) {
                                results.push({
                                    player: playerLink.textContent.trim(),
                                    goals: currentGoals,
                                    team: teamName,
                                    confederation: confName
                                });
                            }
                        }
                    });
                }

                return results;
            }, name);

            console.log(`Found ${scorers.length} scorers for ${name}`);
            allScorers = allScorers.concat(scorers);
        }

        // Sort by goals descending
        allScorers.sort((a, b) => b.goals - a.goals);

        // Remove duplicates (same player + team)
        const seen = new Set();
        allScorers = allScorers.filter(s => {
            const key = `${s.player}|${s.team}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        const outputData = {
            scorers: allScorers,
            lastUpdated: new Date().toISOString(),
            sources: URLS.map(u => u.url)
        };

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(outputData, null, 2));
        console.log(`Successfully saved ${allScorers.length} scorers to ${OUTPUT_FILE}`);

    } catch (error) {
        console.error('Scraping error:', error);
    } finally {
        await browser.close();
    }
}

scrapeScorers();
