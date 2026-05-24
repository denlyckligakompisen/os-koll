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
    const m = gqlData.data.matchesForLeague.matches.find(m => m.homeTeamName === 'Malmö FF' && m.visitingTeamName === 'Västerås SK');
    console.log("MATCH:", m);
}
run();
