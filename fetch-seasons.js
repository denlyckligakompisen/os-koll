const query = `
query {
  seasons(configLeagueName: "Allsvenskan") {
    id
    name
    years
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
    console.log(JSON.stringify(data, null, 2));
  })
  .catch(err => console.error(err));
