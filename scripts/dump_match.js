import { chromium } from 'playwright';
import fs from 'fs';

(async () => {
    const b = await chromium.launch();
    const p = await b.newPage();
    await p.goto('https://allsvenskan.se/matcher/2026/6529849/djurgardens-if-mot-if-brommapojkarna', { waitUntil: 'networkidle' });
    
    // Dump HTML from the page
    const html = await p.evaluate(() => {
        return document.body.innerHTML;
    });
    
    fs.writeFileSync('C:/dev/os-koll/match_page.html', html);
    
    console.log("Dumped to match_page.html");
    await b.close();
})();
