const query = `{
  matchesForLeague(
    configLeagueName: "Allsvenskan",
    configSeasonStartYear: 2026,
    startDate: "2026-06-12T00:00:00Z",
    endDate: "2026-06-12T23:59:59Z"
  ) {
    matches {
      id
      homeTeamName
      visitingTeamName
      homeTeamScore
      visitingTeamScore
      status
      matchMinute
      startDate
    }
  }
}`;

fetch('https://gql.sportomedia.se/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query })
})
  .then(r => r.json())
  .then(d => console.log(JSON.stringify(d, null, 2)))
  .catch(e => console.error(e));
