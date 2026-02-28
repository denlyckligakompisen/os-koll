import axios from 'axios';
import fs from 'fs';

async function testFetch() {
    try {
        const { data } = await axios.get('https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/scores-fixtures?country=SE&wtw-filter=ALL', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        fs.writeFileSync('fifa_test.html', data);
        console.log('Saved fifa_test.html');
    } catch (err) {
        console.error(err);
    }
}
testFetch();
