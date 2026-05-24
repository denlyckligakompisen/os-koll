const fs = require('fs');
const now = Date.now();
const data = JSON.parse(fs.readFileSync('public/data/allsvenskan_matches.json', 'utf8'));

const isMatchWindowActive = data.matches && data.matches.some(m => {
    if (!m.startTimestamp) return false;
    const startMs = m.startTimestamp * 1000;
    return now >= startMs - (30 * 60 * 1000) && now <= startMs + (3 * 60 * 60 * 1000);
});

console.log("isMatchWindowActive:", isMatchWindowActive);
