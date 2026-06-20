const FIFA_API_BASE = 'https://api.fifa.com/api/v3';

async function main() {
    const res = await fetch(FIFA_API_BASE + '/live/football/now');
    const data = await res.json();
    const wcMatches = (data.Results || []).filter(m => m.IdCompetition === '17');

    if (wcMatches.length === 0) {
        console.log('No live WC matches right now');
        return;
    }

    const match = wcMatches[0];
    const ha = match.HomeTeam?.Abbreviation || '?';
    const aa = match.AwayTeam?.Abbreviation || '?';
    console.log('=== ' + ha + ' vs ' + aa + ' ===\n');

    // Show all top-level keys
    console.log('--- TOP-LEVEL KEYS ---');
    console.log(Object.keys(match).join(', '));

    // Show HomeTeam keys
    console.log('\n--- HomeTeam KEYS ---');
    console.log(Object.keys(match.HomeTeam || {}).join(', '));

    // Show what arrays/events exist on HomeTeam
    const team = match.HomeTeam;
    for (const key of Object.keys(team || {})) {
        const val = team[key];
        if (Array.isArray(val) && val.length > 0) {
            console.log('\n--- HomeTeam.' + key + ' (' + val.length + ' items) ---');
            // Show first item structure
            console.log('First item keys: ' + Object.keys(val[0]).join(', '));
            console.log(JSON.stringify(val[0], null, 2));
        }
    }

    // Same for AwayTeam
    const away = match.AwayTeam;
    console.log('\n\n--- AwayTeam KEYS ---');
    console.log(Object.keys(away || {}).join(', '));
    for (const key of Object.keys(away || {})) {
        const val = away[key];
        if (Array.isArray(val) && val.length > 0) {
            console.log('\n--- AwayTeam.' + key + ' (' + val.length + ' items) ---');
            console.log('First item keys: ' + Object.keys(val[0]).join(', '));
            console.log(JSON.stringify(val[0], null, 2));
        }
    }

    // Show non-team, non-player top-level arrays/objects
    console.log('\n\n--- OTHER TOP-LEVEL DATA ---');
    for (const key of Object.keys(match)) {
        if (key === 'HomeTeam' || key === 'AwayTeam') continue;
        const val = match[key];
        if (Array.isArray(val) && val.length > 0) {
            console.log('\n--- ' + key + ' (' + val.length + ' items) ---');
            console.log(JSON.stringify(val[0], null, 2));
        } else if (val && typeof val === 'object' && !Array.isArray(val)) {
            console.log('\n--- ' + key + ' (object) ---');
            console.log(JSON.stringify(val, null, 2));
        } else if (val !== null && val !== undefined) {
            console.log(key + ': ' + val);
        }
    }
}

main().catch(console.error);
