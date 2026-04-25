import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const URLS = [
    { name: 'AFC', url: 'https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_qualification_(AFC)#Top_goalscorers' },
    { name: 'CAF', url: 'https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_qualification_(CAF)#Top_goalscorers' }
];

const OUTPUT_FILE = path.join(process.cwd(), 'public/data/worldcup_2026_scorers.json');

async function scrapeScorers() {
    console.log('Starting Wikipedia scraper for top goalscorers...');
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));

    let allScorers = [];

    try {
        for (const { name, url } of URLS) {
            console.log(`Scraping ${name} from ${url}...`);
            await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
            
            const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 1000));
            console.log('BODY TEXT PREVIEW:', bodyText);

            const scorers = await page.evaluate((confName) => {
                const results = [];
                const allElements = Array.from(document.querySelectorAll('h2, h3, h4, h5, h6, li, tr, p'));
                let currentGoals = 0;

                allElements.forEach(el => {
                    const text = el.textContent.trim();
                    
                    // Match "X goals" or "X goal"
                    const goalMatch = text.match(/^(\d+)\s+goals?$/i);
                    if (goalMatch) {
                        currentGoals = parseInt(goalMatch[1]);
                        return;
                    }

                    if (currentGoals > 0 && (el.tagName === 'LI' || el.tagName === 'TR')) {
                        const links = Array.from(el.querySelectorAll('a'));
                        
                        // Player link: has a title, doesn't contain junk
                        const playerLink = links.find(l => {
                            const title = (l.getAttribute('title') || '').toLowerCase();
                            const txt = l.textContent.trim();
                            return txt.length > 2 && 
                                   !title.includes('national football team') &&
                                   !title.includes('world cup') && 
                                   !title.includes('qualification') && 
                                   !title.includes('round') && 
                                   !title.includes('group') &&
                                   !title.includes('category:') &&
                                   !title.includes('edit') &&
                                   !title.includes('list of') &&
                                   !txt.includes('"') &&
                                   !txt.includes('['); // avoid [1], [2] etc
                        });

                        if (playerLink) {
                            let teamName = '';
                            
                            // 1. Look for a link that is definitely a team
                            const teamLink = links.find(l => {
                                const title = (l.getAttribute('title') || '').toLowerCase();
                                return title.includes('national football team');
                            });

                            if (teamLink) {
                                teamName = teamLink.textContent.trim() || teamLink.getAttribute('title').replace(' national football team', '');
                            } else {
                                // 2. Look for flag icon and its title
                                const flag = el.querySelector('.flagicon img, img.mw-file-element');
                                if (flag) {
                                    teamName = flag.getAttribute('alt') || flag.closest('a')?.getAttribute('title');
                                }
                                
                                // 3. Fallback to parsing text "Team – Player"
                                if (!teamName || teamName.length < 2) {
                                    const parts = text.split(/[–\-·]/).map(p => p.trim());
                                    if (parts.length >= 2) teamName = parts[0].replace(/^\d+\s+goals?\s*/i, '').trim();
                                }
                            }

                            if (teamName && teamName.length > 2 && teamName.length < 40) {
                                results.push({
                                    player: playerLink.textContent.trim(),
                                    goals: currentGoals,
                                    team: teamName.replace(' national football team', '').replace('Flag of ', '').trim(),
                                    confederation: confName
                                });
                            }
                        }
                    }
                });
                return results;
            }, name);

            console.log(`Found ${scorers.length} scorers for ${name}`);
            allScorers = allScorers.concat(scorers);
        }

        // Sort by goals descending
        allScorers.sort((a, b) => b.goals - a.goals);

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
