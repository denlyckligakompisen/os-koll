import axios from 'axios';
import fs from 'fs';

async function fetchHTMLs() {
    const urls = [
        { url: 'https://www.allsvenskan.se/tabell', name: 'allsvenskan_tabell.html' },
        { url: 'https://forzafootball.com/sv/tournament/allsvenskan-1511/fixtures', name: 'allsvenskan_matcher.html' },
        { url: 'https://forzafootball.com/sv/tournament/svenska-cupen-494/results', name: 'cupen_matcher.html' },
        { url: 'https://forzafootball.com/sv/match/ik-sirius-gif-sundsvall-1219369316/table', name: 'cupen_tabell.html' }
    ];

    for (const { url, name } of urls) {
        try {
            console.log(`Fetching ${url}...`);
            const res = await axios.get(url, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
            });
            fs.writeFileSync(name, res.data);
            console.log(`Saved to ${name}`);
        } catch (e) {
            console.error(`Failed ${url}:`, e.message);
        }
    }
}
fetchHTMLs();
