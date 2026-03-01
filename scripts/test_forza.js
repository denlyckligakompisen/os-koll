import axios from 'axios';

async function testFetch() {
    try {
        console.log("Fetching Forza...");
        const res = await axios.get('https://forzafootball.com/sv/tournament/allsvenskan-1511/fixtures', {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });
        console.log("Forza Status:", res.status);
    } catch (e) {
        console.error("Forza Error:", e.message);
    }
}
testFetch();
