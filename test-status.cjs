const query = `
query {
  matchesForLeague(configLeagueName: "allsvenskan", configSeasonStartYear: 2026) {
    matches {
      id
      homeTeamName
      visitingTeamName
      status
    }
  }
}
`;

fetch('https://gql.sportomedia.se/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ query })
}).then(res => res.json())
  .then(data => {
    const matches = data.data.matchesForLeague.matches;
    const malmoVasteras = matches.find(m => 
      (m.homeTeamName.includes('Malmö') && m.visitingTeamName.includes('Västerås'))
    );
    console.log(malmoVasteras);
  })
  .catch(err => console.error(err));
