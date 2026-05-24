const query = `
query {
  matchesForLeague(
    configLeagueName: "allsvenskan", 
    configSeasonStartYear: 2026
  ) {
    matches {
      id
      homeTeamName
      visitingTeamName
      startDate
      status
      homeTeamScore
      visitingTeamScore
      matchMinute
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
    if (data.errors) {
      console.error(data.errors);
      return;
    }
    const matches = data.data.matchesForLeague.matches;
    const malmoVasteras = matches.find(m => 
      (m.homeTeamName.includes('Malmö') && m.visitingTeamName.includes('Västerås')) ||
      (m.homeTeamName.includes('Västerås') && m.visitingTeamName.includes('Malmö'))
    );
    if (malmoVasteras) {
      console.log(`Live: ${malmoVasteras.homeTeamName} ${malmoVasteras.homeTeamScore} - ${malmoVasteras.visitingTeamScore} ${malmoVasteras.visitingTeamName}`);
      console.log(`Minut: ${malmoVasteras.matchMinute} (Status: ${malmoVasteras.status})`);
    } else {
      console.log("Kunde inte hitta matchen.");
    }
  })
  .catch(err => console.error(err));
