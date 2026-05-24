const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/data/allsvenskan_matches.json', 'utf8'));

const m = data.matches.find(m => m.home.includes('Malmö') || m.away.includes('Malmö'));
console.log(m);
