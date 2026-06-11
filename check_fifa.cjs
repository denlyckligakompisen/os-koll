const { chromium } = require('playwright');
(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://www.fifa.com/en/tournaments/mens/worldcup/qatar2022/scores-fixtures', { waitUntil: 'networkidle' });
    const html = await page.evaluate(() => {
        const item = document.querySelector('.wtw-match-item') || document.querySelector('[class*="MatchItem"]') || document.querySelector('.match-card');
        return item ? item.outerHTML : 'Not found';
    });
    console.log(html);
    await browser.close();
})();
