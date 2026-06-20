const FIFA_API_BASE = 'https://api.fifa.com/api/v3';

async function main() {
    // Try /live/football/now first for currently live matches
    const nowRes = await fetch(FIFA_API_BASE + '/live/football/now');
    const nowData = await nowRes.json();
    const wcMatches = (nowData.Results || []).filter(m => m.IdCompetition === '17');
    
    console.log('Found ' + wcMatches.length + ' WC matches in /live/football/now');
    
    for (const match of wcMatches) {
        const ha = match.HomeTeam?.Abbreviation || '?';
        const aa = match.AwayTeam?.Abbreviation || '?';
        console.log('\n=== ' + ha + ' vs ' + aa + ' (Status: ' + match.MatchStatus + ') ===');
        
        // Check substitutions for Schlotterbeck or Rüdiger/Ruediger
        const allSubs = [
            ...(match.HomeTeam?.Substitutions || []),
            ...(match.AwayTeam?.Substitutions || [])
        ];
        
        for (const s of allSubs) {
            const onName = s.PlayerOnName?.[0]?.Description || '';
            const offName = s.PlayerOffName?.[0]?.Description || '';
            if (onName.includes('Schlotterbeck') || offName.includes('Schlotterbeck') ||
                onName.includes('diger') || offName.includes('diger') ||
                onName.includes('Ruediger') || offName.includes('Ruediger')) {
                console.log('\n>>> FOUND MATCHING SUB:');
                console.log(JSON.stringify(s, null, 2));
            }
        }
        
        // If it's Germany, show ALL subs
        if (ha === 'GER' || aa === 'GER') {
            console.log('\n--- ALL Germany Substitutions ---');
            const homeSubs = match.HomeTeam?.Substitutions || [];
            const awaySubs = match.AwayTeam?.Substitutions || [];
            console.log('Home subs (' + ha + '):');
            homeSubs.forEach(s => console.log(JSON.stringify(s, null, 2)));
            console.log('Away subs (' + aa + '):');
            awaySubs.forEach(s => console.log(JSON.stringify(s, null, 2)));
        }
    }
    
    // If no live matches found with Germany, try calendar
    if (!wcMatches.some(m => m.HomeTeam?.Abbreviation === 'GER' || m.AwayTeam?.Abbreviation === 'GER')) {
        console.log('\n\nNo live Germany match found. Checking calendar for recent Germany matches...');
        const calRes = await fetch(FIFA_API_BASE + '/calendar/matches?idCompetition=17&idSeason=285023&count=200&language=en');
        const calData = await calRes.json();
        const gerMatches = (calData.Results || []).filter(m => 
            m.Home?.Abbreviation === 'GER' || m.Away?.Abbreviation === 'GER'
        );
        gerMatches.forEach(m => {
            console.log(m.Home?.Abbreviation + ' vs ' + m.Away?.Abbreviation + 
                ' | Status: ' + m.MatchStatus + ' | Score: ' + m.HomeTeamScore + '-' + m.AwayTeamScore +
                ' | Date: ' + m.Date);
        });
    }
}

main().catch(console.error);
