import axios from 'axios';
import fs from 'fs';

async function testFetch() {
    try {
        const { data } = await axios.get('https://www.flashscore.se/fotboll/sverige/svenska-cupen/tabellstallning/#/jTScbPIO/tabell/oversikt/', {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
        });
        fs.writeFileSync('flashscore.html', data);
    } catch (e) {
        console.error(e.message);
    }
}
testFetch();
