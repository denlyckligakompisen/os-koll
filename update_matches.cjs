const fs = require('fs');

fetch('https://gql.sportomedia.se/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: '{ matchesForLeague(configLeagueName: "allsvenskan", configSeasonStartYear: 2026) { matches { homeTeamName visitingTeamName status homeTeamScore visitingTeamScore } } }' })
}).then(res => res.json()).then(data => {
    if (!data?.data?.matchesForLeague?.matches) return console.log('No data');
    const liveMatches = data.data.matchesForLeague.matches.filter(m => m.status === 'FINISHED' || m.status === 'ONGOING');
    const file = 'public/data/allsvenskan_matches.json';
    const json = JSON.parse(fs.readFileSync(file, 'utf8'));
    let updated = 0;
    liveMatches.forEach(lm => {
        const m = json.matches.find(m => (m.home.includes(lm.homeTeamName) || lm.homeTeamName.includes(m.home)) && (m.away.includes(lm.visitingTeamName) || lm.visitingTeamName.includes(m.away)));
        if (m) {
            m.status = lm.status === 'ONGOING' ? 'live' : 'finished';
            m.score = lm.homeTeamScore + ' - ' + lm.visitingTeamScore;
            updated++;
        }
    });
    fs.writeFileSync(file, JSON.stringify(json, null, 4));
    console.log('Updated ' + updated + ' matches in ' + file);
}).catch(console.error);
