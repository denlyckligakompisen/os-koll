async function test() {
  const query = `
    query {
      match(id: 6530018, configLeagueName: "allsvenskan", configSeasonStartYear: 2026) {
        match {
          matchEvents {
            type
            gameTime
            minuteWithStoppageTime
          }
        }
      }
    }`;
  
  const res = await fetch('https://gql.sportomedia.se/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  
  const json = await res.json();
  console.log(JSON.stringify(json, null, 2));
}

test();
