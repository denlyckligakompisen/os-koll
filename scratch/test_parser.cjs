const https = require('https');

const url = 'https://api.fifa.com/api/v3/calendar/matches?idCompetition=17&idSeason=285023&count=200&language=en';

https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const json = JSON.parse(data);
        console.log(`Total matches: ${json.Results.length}`);
        
        const groups = {};
        const knockoutMatches = [];
        
        json.Results.forEach(m => {
            const groupName = m.GroupName?.[0]?.Description;
            const stageName = m.StageName?.[0]?.Description;
            const matchNo = m.MatchNumber;
            
            if (groupName) {
                if (!groups[groupName]) groups[groupName] = new Set();
                if (m.Home?.Abbreviation) groups[groupName].add(m.Home.Abbreviation);
                if (m.Away?.Abbreviation) groups[groupName].add(m.Away.Abbreviation);
            } else if (stageName) {
                knockoutMatches.push({
                    id: matchNo,
                    stage: stageName,
                    home: m.PlaceHolderA || m.Home?.Abbreviation,
                    away: m.PlaceHolderB || m.Away?.Abbreviation
                });
            }
        });
        
        console.log("Groups:", Object.keys(groups).map(k => `${k}: ${Array.from(groups[k]).join(', ')}`));
        console.log("Knockout:", knockoutMatches.slice(0, 3));
    });
});
