const url = 'https://api.fifa.com/api/v3/live/football/now';

const res = await fetch(url);
const data = await res.json();

if (data?.Results) {
    const match = data.Results.find(m => 
        m.IdCompetition === '17' && 
        (m.HomeTeam?.Abbreviation === 'CAN' || m.AwayTeam?.Abbreviation === 'CAN')
    );
    
    if (match) {
        // Extract just the data relevant for MatchCard
        const summary = {
            // === BASIC (already used) ===
            matchTime: match.MatchTime,
            matchStatus: match.MatchStatus,
            homeScore: match.HomeTeamScore,
            awayScore: match.AwayTeamScore,
            homeName: match.HomeTeam?.TeamName?.[0]?.Description,
            awayName: match.AwayTeam?.TeamName?.[0]?.Description,
            homeAbbr: match.HomeTeam?.Abbreviation,
            awayAbbr: match.AwayTeam?.Abbreviation,
            
            // === MATCH EVENTS (can show in card) ===
            goals: match.HomeTeam?.Goals?.concat(match.AwayTeam?.Goals || []),
            homeGoals: match.HomeTeam?.Goals,
            awayGoals: match.AwayTeam?.Goals,
            homeBookings: match.HomeTeam?.Bookings,
            awayBookings: match.AwayTeam?.Bookings,
            homeSubstitutions: match.HomeTeam?.Substitutions,
            awaySubstitutions: match.AwayTeam?.Substitutions,
            
            // === TACTICAL ===
            homeTactics: match.HomeTeam?.Tactics,
            awayTactics: match.AwayTeam?.Tactics,
            
            // === STADIUM / VENUE ===
            stadium: match.Stadium?.Name?.[0]?.Description,
            city: match.Stadium?.CityName?.[0]?.Description,
            attendance: match.Attendance,
            
            // === OFFICIALS ===
            referee: match.Officials?.find(o => o.OfficialType === 1)?.Name?.[0]?.Description,
            
            // === GROUP / STAGE ===
            group: match.GroupName?.[0]?.Description,
            stage: match.StageName?.[0]?.Description,
            
            // === COACHES ===
            homeCoach: match.HomeTeam?.Coaches?.[0]?.Name?.[0]?.Description,
            awayCoach: match.AwayTeam?.Coaches?.[0]?.Name?.[0]?.Description,
            
            // === STARTING XI ===
            homeStartingXI: match.HomeTeam?.Players?.filter(p => p.Status === 1)?.map(p => ({
                name: p.PlayerName?.[0]?.Description,
                number: p.ShirtNumber,
                position: p.Position, // 0=GK, 1=DEF, 2=MID, 3=FWD
                captain: p.Captain,
                photo: p.PlayerPicture?.PictureUrl,
            })),
            awayStartingXI: match.AwayTeam?.Players?.filter(p => p.Status === 1)?.map(p => ({
                name: p.PlayerName?.[0]?.Description,
                number: p.ShirtNumber,
                position: p.Position,
                captain: p.Captain,
                photo: p.PlayerPicture?.PictureUrl,
            })),
            
            // === SUBSTITUTES ===
            homeSubs: match.HomeTeam?.Players?.filter(p => p.Status === 2)?.map(p => ({
                name: p.PlayerName?.[0]?.Description,
                number: p.ShirtNumber,
                position: p.Position,
            })),
            awaySubs: match.AwayTeam?.Players?.filter(p => p.Status === 2)?.map(p => ({
                name: p.PlayerName?.[0]?.Description,
                number: p.ShirtNumber,
                position: p.Position,
            })),

            // === POSSESSION & STATS ===
            ballPossession: match.BallPossession,
            territorialPossession: match.TerritorialPossesion,
        };
        
        console.log(JSON.stringify(summary, null, 2));
    } else {
        console.log('VM-match ej hittad i /live/football/now');
        const wcMatches = data.Results.filter(m => m.IdCompetition === '17');
        console.log(`VM-matcher i live/now: ${wcMatches.length}`);
    }
}
