const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/data/allsvenskan_matches.json', 'utf8'));
const pattern = /^(MÅNDAG|TISDAG|ONSDAG|TORSDAG|FREDAG|LÖRDAG|SÖNDAG)\s+\d+\s+(JANUARI|FEBRUARI|MARS|APRIL|MAJ|JUNI|JULI|AUGUSTI|SEPTEMBER|OKTOBER|NOVEMBER|DECEMBER)$/i;

data.matches.forEach((m, i) => {
    if (!pattern.test(m.date)) {
        console.log(`Match ${i}: ${m.home} - ${m.away} has weird date: "${m.date}"`);
    }
});
