const fs = require('fs');
const content = fs.readFileSync('src/components/AllsvenskanKollen.jsx', 'utf8');
const match = content.match(/const isMatchWindowActive = [\s\S]*?\n\s*\}\);/);
console.log(match ? match[0] : 'NOT FOUND');
