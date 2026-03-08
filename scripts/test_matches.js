
import axios from 'axios';
async function run() {
    const res = await axios.get('https://www.fotmob.com/api/leagues?id=171', { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const siriusMatches = res.data.fixtures.allMatches.filter(m =>
        m.home.name.includes('Sirius') || m.away.name.includes('Sirius')
    );
    console.log(JSON.stringify(siriusMatches[3], null, 2)); // Should be today's match
}
run();
