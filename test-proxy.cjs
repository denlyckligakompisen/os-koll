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
        const res = await fetch('http://localhost:5173/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: liveQuery })
        });
        const data = await res.json();
        console.log("PROXY RESULT:", data);
    } catch (e) {
        console.error("PROXY ERROR:", e.message);
    }
}
run();
