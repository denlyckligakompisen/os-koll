import { chromium } from 'playwright';

async function inspectCup() {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();
    await page.goto('https://www.svenskfotboll.se/serier-cuper/spelprogram/svenska-cupen-202526-slutspel/127930/');
    await page.waitForTimeout(10000);
    const text = await page.evaluate(() => document.body.innerText);
    console.log(text);
    await browser.close();
}
inspectCup();
