const fs = require('fs');
const https = require('https');

const url = 'https://api.fifa.com/api/v3/calendar/matches?idCompetition=17&idSeason=285023&count=200&language=en';

https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        fs.writeFileSync('api_dump.json', data);
        console.log('Done!');
    });
});
