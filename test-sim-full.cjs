const now = Date.now();
const fs = require('fs');
let matches = JSON.parse(fs.readFileSync('public/data/allsvenskan_matches.json', 'utf8'));

const isMatchWindowActive = matches.matches && matches.matches.some(m => {
    if (!m.startTimestamp) return false;
    const startMs = m.startTimestamp * 1000;
    return now >= startMs - (30 * 60 * 1000) && now <= startMs + (3 * 60 * 60 * 1000);
});

console.log('isMatchWindowActive:', isMatchWindowActive);

async function run() {
    if (!isMatchWindowActive) return;
    const liveQuery = `
    query {
      matchesForLeague(configLeagueName: "allsvenskan", configSeasonStartYear: 2026) {
        matches {
          id
          homeTeamName
          visitingTeamName
          status
          homeTeamScore
          visitingTeamScore
          matchMinute
          matchMinuteWithStoppageTime
        }
      }
    }`;
    const gqlRes = await fetch('https://gql.sportomedia.se/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: liveQuery })
    });
    const gqlData = await gqlRes.json();
    
    if (gqlData?.data?.matchesForLeague?.matches) {
        const liveMatches = gqlData.data.matchesForLeague.matches.filter(m => m.status === 'ONGOING' || m.status === 'FINISHED');
        for (const liveMatch of liveMatches) {
            const localMatchIndex = matches.matches.findIndex(m => 
                (m.home.includes(liveMatch.homeTeamName) || liveMatch.homeTeamName.includes(m.home)) &&
                (m.away.includes(liveMatch.visitingTeamName) || liveMatch.visitingTeamName.includes(m.away))
            );
            if (localMatchIndex !== -1) {
                console.log('Found match:', matches.matches[localMatchIndex].home, 'vs', matches.matches[localMatchIndex].away);
                const detailsQuery = `
                query {
                  match(id: ${liveMatch.id}, configLeagueName: "allsvenskan", configSeasonStartYear: 2026) {
                    match {
                      matchEvents {
                        type
                        gameTime
                        minuteWithStoppageTime
                        playerName
                        byHomeTeam
                        description
                      }
                    }
                  }
                }`;
                const detailsRes = await fetch('https://gql.sportomedia.se/graphql', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query: detailsQuery })
                });
                const detailsData = await detailsRes.json();
                const events = detailsData?.data?.match?.match?.matchEvents || [];
                const interestingEvents = events.filter(e => !['START', 'PERIOD_RESULT'].includes(e.type) && e.description);
                console.log('Interesting events:', interestingEvents.length);
            }
        }
    }
}
run();
