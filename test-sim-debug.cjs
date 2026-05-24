const fs = require('fs');
const matches = JSON.parse(fs.readFileSync('public/data/allsvenskan_matches.json', 'utf8'));

async function run() {
    const liveQuery = `
    query {
      matchesForLeague(configLeagueName: "allsvenskan", configSeasonStartYear: 2026) {
        matches {
          id
          homeTeamName
          visitingTeamName
          status
        }
      }
    }`;
    const gqlRes = await fetch('https://gql.sportomedia.se/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: liveQuery })
    });
    const gqlData = await gqlRes.json();
    
    const liveMatches = gqlData.data.matchesForLeague.matches.filter(m => m.status === 'ONGOING' || m.status === 'FINISHED');
    console.log("Live matches:", liveMatches.length);
    for (const liveMatch of liveMatches) {
        console.log("Checking live match:", liveMatch.homeTeamName, "vs", liveMatch.visitingTeamName);
        const localMatchIndex = matches.matches.findIndex(m => 
            (m.home.includes(liveMatch.homeTeamName) || liveMatch.homeTeamName.includes(m.home)) &&
            (m.away.includes(liveMatch.visitingTeamName) || liveMatch.visitingTeamName.includes(m.away))
        );
        console.log("Local match index:", localMatchIndex);
    }
}
run();
