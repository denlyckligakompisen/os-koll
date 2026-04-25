import fs from 'fs';

const d = JSON.parse(fs.readFileSync('public/data/fifa_ranking.json','utf8'));
const flagSrc = fs.readFileSync('src/utils/flags.js','utf8');

const missing = [];
d.rankings.forEach(r => {
    // Check if the team name appears as a key in FLAG_MAP
    if (!flagSrc.includes("'" + r.team + "'")) {
        missing.push(r.team);
    }
});

if (missing.length) {
    console.log(missing.length + ' missing from flags.js:');
    missing.forEach(t => console.log('  ' + t));
} else {
    console.log('✅ All ' + d.rankings.length + ' teams have flag entries in flags.js!');
}
