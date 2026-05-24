async function run() {
    const liveQuery = `
    query {
      matchesForLeague(configLeagueName: "allsvenskan", configSeasonStartYear: 2026) {
        matches {
          id
          homeTeamName
        }
      }
    }`;
    try {
        const gqlRes = await fetch('https://corsproxy.io/?' + encodeURIComponent('https://gql.sportomedia.se/graphql'), {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Origin': 'http://localhost:5173'
            },
            body: JSON.stringify({ query: liveQuery })
        });
        const gqlData = await gqlRes.json();
        console.log('SUCCESS:', gqlData?.data ? 'Data received' : gqlData);
    } catch (e) {
        console.error('ERROR:', e.message);
    }
}
run();
