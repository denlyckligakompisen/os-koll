import fs from 'fs';
import path from 'path';

const dataDir = 'c:/dev/os-koll/public/data';
const files = fs.readdirSync(dataDir).filter(f => f.startsWith('allsvenskan_matches') && f.endsWith('.json'));

const teams = new Set();
files.forEach(file => {
  try {
    const data = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf-8'));
    if (data.matches) {
      data.matches.forEach(m => {
        if (m.home) teams.add(m.home);
        if (m.away) teams.add(m.away);
      });
    }
  } catch (e) {
    console.error('Error reading', file, e.message);
  }
});

// Also check table files
const tableFiles = fs.readdirSync(dataDir).filter(f => f.startsWith('allsvenskan_table') && f.endsWith('.json'));
tableFiles.forEach(file => {
  try {
    const data = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf-8'));
    if (data.table) {
      data.table.forEach(row => {
        if (row.team) teams.add(row.team);
      });
    }
  } catch (e) {
    console.error('Error reading', file, e.message);
  }
});

// Check maraton table
try {
  const maraton = JSON.parse(fs.readFileSync(path.join(dataDir, 'allsvenskan_maraton.json'), 'utf-8'));
  if (maraton.table) {
    maraton.table.forEach(row => {
      if (row.team) teams.add(row.team);
    });
  }
} catch (e) {
  console.error('Error reading maraton', e.message);
}

const logos = JSON.parse(fs.readFileSync('c:/dev/os-koll/public/data/allsvenskan_logos.json', 'utf-8'));
console.log('All unique teams found:');
const sortedTeams = Array.from(teams).sort();
sortedTeams.forEach(t => {
  const hasLogo = !!logos[t];
  console.log(`- "${t}": ${hasLogo ? 'Has Logo' : 'MISSING LOGO'}`);
});
