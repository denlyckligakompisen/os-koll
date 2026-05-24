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
    console.log(JSON.stringify(gqlData, null, 2));
}
run();
