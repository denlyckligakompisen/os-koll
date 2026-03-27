import axios from 'axios';

async function testFotmob() {
    try {
        const teamId = 8487; // Sweden FotMob ID
        console.log(`Fetching matches for Sweden (8487)...`);
        const url = `https://www.fotmob.com/api/teams?id=${teamId}`;
        const { data } = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        const fixtures = data.fixtures?.allFixtures?.fixtures || [];
        const next = fixtures.find(f => f.pageUrl.includes('20260331'));
        
        if (next) {
            console.log('Next match found:', next.pageUrl);
            const matchId = next.id;
            console.log(`Match ID: ${matchId}`);
            
            // Fetch match details
            const matchUrl = `https://www.fotmob.com/api/matchDetails?matchId=${matchId}`;
            const { data: mData } = await axios.get(matchUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            
            const broad = mData.content?.matchFacts?.infoBox?.tvChannels?.channels || [];
            console.log('TV Channels:', broad.map(c => c.name));
        } else {
            console.log('No Poland/Sweden final found in fixtures.');
        }

    } catch (e) {
        console.error(e.message);
    }
}

testFotmob();
