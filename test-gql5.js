const query = `
query {
  matchesForLeague(configLeagueName: "allsvenskan", configSeasonStartYear: 2026) {
    matches {
      id
      homeTeamName
      visitingTeamName
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
      (m.homeTeamName.includes('Malmö') && m.visitingTeamName.includes('Västerås')) ||
      (m.homeTeamName.includes('Västerås') && m.visitingTeamName.includes('Malmö'))
    );
    if (!malmoVasteras) return;
    
    const detailsQuery = `
    query {
      match(id: ${malmoVasteras.id}, configLeagueName: "allsvenskan", configSeasonStartYear: 2026) {
        match {
          id
          status
          matchMinute
          homeTeamScore
          visitingTeamScore
          matchEvents {
            type
            typeString
            gameTime
            playerName
            byHomeTeam
            description
          }
        }
      }
    }
    `;
    return fetch('https://gql.sportomedia.se/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: detailsQuery })
    }).then(res => res.json())
      .then(detailsData => {
        console.log(JSON.stringify(detailsData, null, 2));
      });
  })
  .catch(err => console.error(err));
