import { chromium } from 'playwright';
import fs from 'fs';

async function debug() {
    console.log("🔍 Starting deep debug of FIFA Ranking page...");
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
        await page.goto('https://inside.fifa.com/fifa-world-ranking/men', { waitUntil: 'load', timeout: 60000 });
        await page.waitForSelector('table', { timeout: 30000 });
        
        // Scroll down a bit to ensure elements are loaded
        await page.evaluate(() => window.scrollTo(0, 2000));
        await page.waitForTimeout(2000);

        const data = await page.evaluate(() => {
            const results = {};
            const content = document.body.innerText;
            
            // Extract dates
            const lastMatch = content.match(/Last official update[:\s]+([^|\n]+)/i);
            if (lastMatch) results.lastUpdate = lastMatch[1].trim();
            
            const nextMatch = content.match(/Next official update[:\s]+([^|\n]+)/i);
            if (nextMatch) results.nextUpdate = nextMatch[1].trim();
            
            // Find all "Show more" buttons with their context
            const buttons = Array.from(document.querySelectorAll('button, a, div[role="button"]'))
                .map(el => ({
                    tag: el.tagName,
                    text: el.innerText.trim(),
                    class: el.className,
                    visible: el.offsetWidth > 0 && el.offsetHeight > 0,
                    rect: el.getBoundingClientRect()
                }))
                .filter(b => b.text.toLowerCase().includes('show') || b.text.toLowerCase().includes('more'));

            return { results, buttons };
        });

        fs.writeFileSync('scratch/debug_output.json', JSON.stringify(data, null, 2));
        console.log("✅ Debug data saved to scratch/debug_output.json");

    } catch (e) {
        console.error("❌ Error during debug:", e);
    } finally {
        await browser.close();
    }
}

debug();
