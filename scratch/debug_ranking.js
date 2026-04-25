import { chromium } from 'playwright';

async function debug() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://inside.fifa.com/fifa-world-ranking/men', { waitUntil: 'load' });
    
    // Scroll down multiple times
    for (let i = 0; i < 3; i++) {
        await page.evaluate(() => window.scrollBy(0, 1000));
        await page.waitForTimeout(1000);
    }
    
    const elements = await page.evaluate(() => {
        const all = Array.from(document.querySelectorAll('*'));
        return all
            .filter(el => (el.innerText || "").includes('Show more') || (el.innerText || "").includes('Visa fler'))
            .map(el => ({
                tag: el.tagName,
                text: el.innerText.trim(),
                class: el.className,
                visible: el.offsetWidth > 0 && el.offsetHeight > 0
            }))
            .filter(el => el.text.length < 50); // Filter out containers
    });
    console.log(JSON.stringify(elements, null, 2));
    await browser.close();
}

debug();
