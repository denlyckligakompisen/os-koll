import fs from 'fs';

const matchesData = JSON.parse(fs.readFileSync('public/data/allsvenskan_matches.json', 'utf8'));
const allMatches = matchesData.matches;

const cleanTeamName = (n) => {
    if (!n) return '';
    return n.replace(/\b(IF|FF|BK|AIF)\b/g, '').replace(/\s+/g, ' ').trim();
};

const printFinishedMatches = (teamName) => {
    const cleanTeam = cleanTeamName(teamName);
    const teamFinished = allMatches
        .filter(m => m.status === 'finished' && m.score && m.score.includes('-'))
        .filter(m => cleanTeamName(m.home) === cleanTeam || cleanTeamName(m.away) === cleanTeam);

    console.log(`\nFinished matches for ${teamName} (Cleaned: ${cleanTeam}):`);
    teamFinished.forEach(m => {
        console.log(`  ${m.date} Omg ${m.round}: ${m.home} ${m.score} ${m.away} (${m.status})`);
    });
};

printFinishedMatches("Hammarby IF");
printFinishedMatches("Mjällby AIF");
