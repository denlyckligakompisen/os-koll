const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync('public/data/allsvenskan_matches.json', 'utf8'));
const matches = data.matches.filter(m => 
    (m.home.includes('Sirius') && m.away.includes('Kalmar')) ||
    (m.home.includes('Kalmar') && m.away.includes('Sirius'))
);

console.log(JSON.stringify(matches, null, 2));
