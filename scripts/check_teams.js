import { chromium } from 'playwright';

async function checkBPLogo() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://allsvenskan.se/');
    await page.waitForTimeout(3000);
    const logo = await page.evaluate(() => {
        const bpLink = Array.from(document.querySelectorAll('a')).find(a => a.href.includes('if-brommapojkarna'));
        if (!bpLink) return 'BP link not found';
        const img = bpLink.querySelector('img');
        return img ? img.src : 'Image not found in link';
    });
    console.log(logo);
    await browser.close();
}
checkBPLogo();
