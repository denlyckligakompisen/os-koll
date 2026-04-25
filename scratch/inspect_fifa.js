
import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  try {
    await page.goto('https://inside.fifa.com/fifa-world-ranking/men', { waitUntil: 'load', timeout: 60000 });
    await page.waitForSelector('table');
    const data = await page.evaluate(() => {
      const row = document.querySelector('table tbody tr');
      const rankTd = row.querySelector('td');
      const rankHtml = rankTd.innerHTML;
      const tds = Array.from(row.querySelectorAll('td')).map(td => td.innerText.trim());
      return { tds, rankHtml };
    });
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await browser.close();
  }
})();
