const query = `
query {
  matchesForLeague(
    configLeagueName: "Allsvenskan", 
    configSeasonStartYear: 2026,
    startDate: "2026-05-24T00:00:00Z",
    endDate: "2026-05-24T23:59:59Z"
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
      console.log(`Live Uppdatering: ${malmoVasteras.homeTeamName} ${malmoVasteras.homeTeamScore} - ${malmoVasteras.visitingTeamScore} ${malmoVasteras.visitingTeamName}`);
      console.log(`Status: ${malmoVasteras.status}, Minut: ${malmoVasteras.matchMinute}`);
    } else {
      console.log("Kunde inte hitta matchen Malmö - Västerås idag.");
      console.log("Alla matcher idag:", matches.map(m => `${m.homeTeamName} - ${m.visitingTeamName}`));
    }
  })
  .catch(err => console.error(err));
