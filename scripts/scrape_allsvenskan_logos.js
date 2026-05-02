import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function scrapeLogos() {
    console.log('Scraping Allsvenskan team logos...');
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
        await page.goto('https://allsvenskan.se/', { waitUntil: 'networkidle' });
        
        const logos = await page.evaluate(() => {
            const results = {};
            const teamBar = document.querySelector('.team-bar');
            if (teamBar) {
                const teamLinks = teamBar.querySelectorAll('a');
                teamLinks.forEach(link => {
                    const img = link.querySelector('img');
                    const title = link.getAttribute('title') || img?.getAttribute('alt') || '';
                    if (img && img.src && title) {
                        // Title is often like "AIK", "Malmö FF"
                        results[title.trim()] = img.src;
                    }
                });
            }

            const mainLogoEl = document.querySelector('.site-navigation__logo img');
            if (mainLogoEl && mainLogoEl.src) {
                results['ALLSVENSKAN_LOGO'] = mainLogoEl.src;
            }

            return results;
        });

        const outputPath = path.join(process.cwd(), 'public/data/allsvenskan_logos.json');
        fs.writeFileSync(outputPath, JSON.stringify(logos, null, 2));
        console.log(`Successfully scraped ${Object.keys(logos).length} logos and saved to ${outputPath}`);
        console.log(JSON.stringify(logos, null, 2));

    } catch (error) {
        console.error('Error scraping logos:', error.message);
    } finally {
        await browser.close();
    }
}

scrapeLogos();
