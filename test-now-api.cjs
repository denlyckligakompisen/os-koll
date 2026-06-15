const https = require('https');

https.get('https://api.fifa.com/api/v3/live/football/now', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const parsed = JSON.parse(data);
            console.log("Results length:", parsed.Results?.length);
            const wcMatches = parsed.Results?.filter(m => m.IdCompetition === "17") || [];
            console.log("WC Matches length:", wcMatches.length);
            
            if (wcMatches.length > 0) {
                console.log(JSON.stringify(wcMatches[0], null, 2));
            }
        } catch(e) {
            console.log("Error parsing JSON:", e.message);
        }
    });
});
