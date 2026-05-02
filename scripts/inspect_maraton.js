import { chromium } from 'playwright';

async function inspect() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://www.svenskfotboll.se/serier-cuper/elitfotboll/historik-herr/maratontabell/');
    await page.waitForTimeout(3000);
    
    const headers = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('th')).map(th => th.innerText.trim());
    });
    
    console.log(headers);
    await browser.close();
}
inspect();
