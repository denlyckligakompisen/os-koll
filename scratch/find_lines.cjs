const fs = require('fs');
const lines = fs.readFileSync('public/data/allsvenskan_matches.json', 'utf8').split('\n');

lines.forEach((line, i) => {
    if (line.includes('IK Sirius') || line.includes('Kalmar FF')) {
        console.log(`${i + 1}: ${line}`);
    }
});
