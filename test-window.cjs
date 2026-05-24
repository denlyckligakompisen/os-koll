const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/data/allsvenskan_matches.json', 'utf8'));
const now = Date.now();

let activeCount = 0;
data.matches.forEach(m => {
    if (!m.startTimestamp) return;
    const startMs = m.startTimestamp * 1000;
    const isActive = now >= startMs - (30 * 60 * 1000) && now <= startMs + (3 * 60 * 60 * 1000);
    if (isActive) {
        console.log(`Active Match: ${m.home} vs ${m.away} at ${new Date(startMs).toLocaleString()}`);
        activeCount++;
    }
});

console.log('Total active matches right now:', activeCount);
