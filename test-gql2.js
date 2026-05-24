const query = `
query {
  __type(name: "MinimizedMatch") {
    fields {
      name
      type {
        name
        kind
        ofType {
          name
        }
      }
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
    console.log("MinimizedMatch fields:", data.data.__type.fields.map(f => f.name));
  })
  .catch(err => console.error(err));
