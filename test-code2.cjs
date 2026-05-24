const fs = require('fs');
const content = fs.readFileSync('src/components/AllsvenskanKollen.jsx', 'utf8');
const lines = content.split('\n').slice(255, 290);
console.log(lines.join('\n'));
