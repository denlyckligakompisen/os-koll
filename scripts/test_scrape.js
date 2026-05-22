import { chromium } from 'playwright';

(async () => {
    const b = await chromium.launch();
    const p = await b.newPage();
    await p.goto('https://allsvenskan.se/matcher/2026/6529849/djurgardens-if-mot-if-brommapojkarna', { waitUntil: 'networkidle' });
    await p.waitForTimeout(3000);
    
    const data = await p.evaluate(() => {
        const result = { info: [], stats: [], players: [] };
        
        // Match info (date, ref, arena, attendance)
        const infoBlocks = document.querySelectorAll('.match-hero__info > div');
        infoBlocks.forEach(div => result.info.push(div.innerText.trim()));
        
        // Match stats
        const dataRows = document.querySelectorAll('.data-container__row');
        dataRows.forEach(row => {
            const cols = row.querySelectorAll('div');
            if(cols.length >= 3) {
                result.stats.push({
                    home: cols[0].innerText.trim(),
                    label: cols[1].innerText.trim(),
                    away: cols[2].innerText.trim()
                });
            }
        });
        
        // Player stats
        const playerRows = document.querySelectorAll('.stats-table__row');
        playerRows.forEach(row => {
            const cols = row.querySelectorAll('div');
            if(cols.length > 3) {
                result.players.push(row.innerText.replace(/\n/g, ' | '));
            }
        });
        
        return result;
    });
    
    console.log(JSON.stringify(data, null, 2));
    await b.close();
})();
