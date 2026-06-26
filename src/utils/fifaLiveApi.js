/**
 * FIFA Live API utility for World Cup 2026
 * 
 * Fetches live match data from FIFA's official API and maps it
 * to the Swedish team names and internal data structures used in the app.
 */

const FIFA_API_BASE = 'https://api.fifa.com/api/v3';
const ID_COMPETITION = '17';       // FIFA World Cup
const ID_SEASON = '285023';        // FIFA World Cup 2026

// FIFA abbreviation → Swedish name mapping
const ABBR_TO_SWEDISH = {
    'MEX': 'Mexiko',
    'RSA': 'Sydafrika',
    'KOR': 'Sydkorea',
    'CZE': 'Tjeckien',
    'CAN': 'Kanada',
    'BIH': 'Bosnien och Hercegovina',
    'USA': 'USA',
    'PAR': 'Paraguay',
    'QAT': 'Qatar',
    'SUI': 'Schweiz',
    'BRA': 'Brasilien',
    'MAR': 'Marocko',
    'HAI': 'Haiti',
    'SCO': 'Skottland',
    'AUS': 'Australien',
    'TUR': 'Turkiet',
    'GER': 'Tyskland',
    'CUW': 'Curaçao',
    'NED': 'Nederländerna',
    'JPN': 'Japan',
    'CIV': 'Elfenbenskusten',
    'ECU': 'Ecuador',
    'SWE': 'Sverige',
    'TUN': 'Tunisien',
    'ESP': 'Spanien',
    'CPV': 'Kap Verde',
    'BEL': 'Belgien',
    'EGY': 'Egypten',
    'KSA': 'Saudiarabien',
    'URU': 'Uruguay',
    'IRN': 'Iran',
    'NZL': 'Nya Zeeland',
    'FRA': 'Frankrike',
    'SEN': 'Senegal',
    'IRQ': 'Irak',
    'NOR': 'Norge',
    'ARG': 'Argentina',
    'ALG': 'Algeriet',
    'AUT': 'Österrike',
    'JOR': 'Jordanien',
    'POR': 'Portugal',
    'COD': 'DR Kongo',
    'ENG': 'England',
    'CRO': 'Kroatien',
    'GHA': 'Ghana',
    'PAN': 'Panama',
    'UZB': 'Uzbekistan',
    'COL': 'Colombia',
    'ITA': 'Italien',
    'DEN': 'Danmark',
    'BOL': 'Bolivia',
    'JAM': 'Jamaika',
};

const MONTH_MAP_REVERSE = [
    'januari', 'februari', 'mars', 'april', 'maj', 'juni',
    'juli', 'augusti', 'september', 'oktober', 'november', 'december'
];

/**
 * Get Swedish team name from FIFA abbreviation or placeholder
 */
export function getSwedishName(abbreviation) {
    if (!abbreviation) return '';
    // Format placeholder if it looks like "1A" or "3ABCDF"
    if (abbreviation.match(/^[1-3][A-Z]+$/)) {
        if (abbreviation.length > 2) {
            // Transform "3ABCDF" to "3A/B/C/D/F"
            return abbreviation[0] + abbreviation.slice(1).split('').join('/');
        }
        return abbreviation; // e.g. "1F"
    }
    return ABBR_TO_SWEDISH[abbreviation] || abbreviation;
}

/**
 * Formats a Date object to "D MMMM" (e.g. "11 juni")
 */
function formatDate(dateString) {
    if (!dateString) return '';
    const d = new Date(dateString);
    return `${d.getDate()} ${MONTH_MAP_REVERSE[d.getMonth()]}`;
}

/**
 * Formats a Date object to "HH:MM"
 */
function formatTime(dateString) {
    if (!dateString) return '';
    const d = new Date(dateString);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

/**
 * Maps FIFA MatchStatus to our local status string.
 */
function mapMatchStatus(fifaStatus) {
    switch (fifaStatus) {
        case 0: return 'finished';
        case 1: return 'upcoming';
        case 3: return 'live';
        case 4: return 'postponed';
        default: return 'upcoming';
    }
}

/**
 * Build a player ID → name map from the Players array in a live team object.
 */
function buildPlayerMap(team) {
    const map = new Map();
    if (!team?.Players) return map;
    team.Players.forEach(p => {
        const name = p.PlayerName?.[0]?.Description || p.ShortName?.[0]?.Description || '';
        if (p.IdPlayer && name) {
            map.set(p.IdPlayer, name);
        }
    });
    return map;
}

/**
 * Fetches enriched live data from /live/football/now for currently active WC matches.
 */
async function fetchFifaLiveNow() {
    try {
        const url = `${FIFA_API_BASE}/live/football/now`;
        const response = await fetch(url);
        if (!response.ok) return null;

        const data = await response.json();
        if (!data?.Results || !Array.isArray(data.Results)) return null;

        const wcMatches = data.Results.filter(m => m.IdCompetition === ID_COMPETITION);
        if (wcMatches.length === 0) return null;

        const enrichedMap = new Map();

        wcMatches.forEach(match => {
            const matchId = match.IdMatch;
            if (!matchId) return;

            const homePlayers = buildPlayerMap(match.HomeTeam);
            const awayPlayers = buildPlayerMap(match.AwayTeam);
            const allPlayers = new Map([...homePlayers, ...awayPlayers]);

            const homeGoals = (match.HomeTeam?.Goals || []).map(g => ({
                player: { name: allPlayers.get(g.IdPlayer) || 'Okänd' },
                minute: g.Minute?.replace("'", '') || '',
                time: g.Minute?.replace("'", '') || '',
                incidentClass: g.Type === 3 ? 'penalty-goal' : 'goal',
            }));
            const awayGoals = (match.AwayTeam?.Goals || []).map(g => ({
                player: { name: allPlayers.get(g.IdPlayer) || 'Okänd' },
                minute: g.Minute?.replace("'", '') || '',
                time: g.Minute?.replace("'", '') || '',
                incidentClass: g.Type === 3 ? 'penalty-goal' : 'goal',
            }));

            const allBookings = [
                ...(match.HomeTeam?.Bookings || []).map(b => ({ ...b, _side: 'home' })),
                ...(match.AwayTeam?.Bookings || []).map(b => ({ ...b, _side: 'away' })),
            ].map(b => ({
                player: { name: allPlayers.get(b.IdPlayer) || 'Okänd' },
                minute: b.Minute?.replace("'", '') || '',
                card: b.Card === 2 ? 'red' : 'yellow',
                side: b._side,
            }));

            const allSubstitutions = [
                ...(match.HomeTeam?.Substitutions || []).map(s => ({ ...s, _side: 'home' })),
                ...(match.AwayTeam?.Substitutions || []).map(s => ({ ...s, _side: 'away' })),
            ].map(s => ({
                playerOff: s.PlayerOffName?.[0]?.Description || allPlayers.get(s.IdPlayerOff) || '',
                playerOn: s.PlayerOnName?.[0]?.Description || allPlayers.get(s.IdPlayerOn) || '',
                minute: s.Minute?.replace("'", '') || (s.Period === 4 ? '46' : ''),
                side: s._side,
            }));

            const homeRedCards = allBookings.filter(b => b.card === 'red' && b.side === 'home').map(b => ({ player: b.player, minute: b.minute, time: b.minute, incidentClass: 'red-card' }));
            const awayRedCards = allBookings.filter(b => b.card === 'red' && b.side === 'away').map(b => ({ player: b.player, minute: b.minute, time: b.minute, incidentClass: 'red-card' }));

            const extractPlayer = (p) => ({
                name: p.PlayerName?.[0]?.Description || p.ShortName?.[0]?.Description || 'Okänd',
                number: p.ShirtNumber,
                position: p.Position,
                captain: p.Captain,
                photo: p.PlayerPicture?.PictureUrl
            });

            const homeStartingXI = match.HomeTeam?.Players?.filter(p => p.Status === 1)?.map(extractPlayer) || [];
            const awayStartingXI = match.AwayTeam?.Players?.filter(p => p.Status === 1)?.map(extractPlayer) || [];
            const homeSubs = match.HomeTeam?.Players?.filter(p => p.Status === 2)?.map(extractPlayer) || [];
            const awaySubs = match.AwayTeam?.Players?.filter(p => p.Status === 2)?.map(extractPlayer) || [];

            enrichedMap.set(matchId, {
                period: match.Period,
                scorers: {
                    home: [...homeGoals, ...homeRedCards],
                    away: [...awayGoals, ...awayRedCards],
                },
                bookings: allBookings,
                substitutions: allSubstitutions,
                tactics: { home: match.HomeTeam?.Tactics || '', away: match.AwayTeam?.Tactics || '' },
                stadium: match.Stadium?.Name?.[0]?.Description || '',
                city: match.Stadium?.CityName?.[0]?.Description || '',
                referee: match.Officials?.find(o => o.OfficialType === 1)?.Name?.[0]?.Description || '',
                coaches: { home: match.HomeTeam?.Coaches?.[0]?.Name?.[0]?.Description || '', away: match.AwayTeam?.Coaches?.[0]?.Name?.[0]?.Description || '' },
                startingXI: { home: homeStartingXI, away: awayStartingXI },
                subs: { home: homeSubs, away: awaySubs }
            });
        });

        return enrichedMap;
    } catch (err) {
        console.warn('[FIFA Live Now] Error:', err.message);
        return null;
    }
}

/**
 * Stage mapping to internal IDs
 */
const STAGE_MAP = {
    'First Stage': 'group',
    'Round of 32': 'r32',
    'Round of 16': 'r16',
    'Quarter-final': 'qf',
    'Semi-final': 'sf',
    'Play-off for third place': 'third',
    'Final': 'final'
};

const STAGE_NAMES = {
    'r32': '1/16-final',
    'r16': 'Åttondelsfinal',
    'qf': 'Kvartsfinal',
    'sf': 'Semifinal',
    'third': 'Bronsmatch',
    'final': 'Final'
};

/**
 * Fetches all World Cup 2026 matches from FIFA API and transforms them into
 * the complete dataset needed for the app (matchesData, knockoutData, groupsData).
 */
export async function fetchAllFifaData() {
    try {
        const url = `${FIFA_API_BASE}/calendar/matches?idCompetition=${ID_COMPETITION}&idSeason=${ID_SEASON}&count=200&language=en`;
        const response = await fetch(url);
        
        if (!response.ok) {
            console.warn('[FIFA API] Response not OK:', response.status);
            return null;
        }
        
        const data = await response.json();
        if (!data?.Results || !Array.isArray(data.Results)) {
            return null;
        }

        const enrichedData = await fetchFifaLiveNow();
        
        const matchesData = [];
        const knockoutData = { rounds: [] };
        const groupsData = [];
        const groupsMap = new Map();
        
        const knockoutRoundsMap = new Map();

        data.Results.forEach(match => {
            const homeAbbr = match.Home?.Abbreviation || match.PlaceHolderA;
            const awayAbbr = match.Away?.Abbreviation || match.PlaceHolderB;
            
            if (!homeAbbr || !awayAbbr) return;
            
            const homeName = getSwedishName(homeAbbr);
            const awayName = getSwedishName(awayAbbr);
            
            const fifaTimestamp = match.Date ? Math.floor(new Date(match.Date).getTime() / 1000) : null;
            const status = mapMatchStatus(match.MatchStatus);
            
            let score = '';
            if (match.HomeTeamScore !== null && match.AwayTeamScore !== null) {
                score = `${match.HomeTeamScore} - ${match.AwayTeamScore}`;
            }

            const enriched = enrichedData?.get(match.IdMatch) || {};
            
            const matchObj = {
                id: match.MatchNumber, // Use FIFA's match number (1-104)
                home: homeName,
                away: awayName,
                homeAbbr,
                awayAbbr,
                date: formatDate(match.Date),
                time: formatTime(match.Date),
                venue: match.Stadium?.CityName?.[0]?.Description || '',
                status,
                score,
                homeScore: match.HomeTeamScore,
                awayScore: match.AwayTeamScore,
                liveCurrentTime: match.MatchTime || '',
                period: match.Period,
                startTimestamp: fifaTimestamp,
                _fifaMatchId: match.IdMatch,
                ...enriched
            };

            const stageDesc = match.StageName?.[0]?.Description;
            const stageId = STAGE_MAP[stageDesc];

            if (stageId === 'group') {
                const groupName = match.GroupName?.[0]?.Description;
                if (groupName) {
                    matchObj.group = groupName;
                    
                    // Track unique teams for groupsData
                    if (!groupsMap.has(groupName)) {
                        groupsMap.set(groupName, new Set());
                    }
                    if (match.Home?.Abbreviation) groupsMap.get(groupName).add(match.Home.Abbreviation);
                    if (match.Away?.Abbreviation) groupsMap.get(groupName).add(match.Away.Abbreviation);
                }
                matchesData.push(matchObj);
            } else if (stageId) {
                if (!knockoutRoundsMap.has(stageId)) {
                    knockoutRoundsMap.set(stageId, {
                        name: STAGE_NAMES[stageId],
                        id: stageId,
                        date: formatDate(match.Date), // Will just use first match's date
                        matches: []
                    });
                }
                knockoutRoundsMap.get(stageId).matches.push(matchObj);
            }
        });

        // Compile Knockout Rounds
        const roundOrder = ['r32', 'r16', 'qf', 'sf', 'third', 'final'];
        roundOrder.forEach(rId => {
            if (knockoutRoundsMap.has(rId)) {
                // Sort matches by MatchNumber within the round
                const round = knockoutRoundsMap.get(rId);
                round.matches.sort((a, b) => a.id - b.id);
                knockoutData.rounds.push(round);
            }
        });

        // Compile Groups Data
        Array.from(groupsMap.keys()).sort().forEach(groupName => {
            const teams = Array.from(groupsMap.get(groupName)).map(abbr => ({
                name: getSwedishName(abbr),
                abbr: abbr
            }));
            groupsData.push({
                name: groupName,
                teams: teams
            });
        });

        console.log(`[FIFA API] Processed ${matchesData.length} matches, ${groupsData.length} groups, ${knockoutData.rounds.length} knockout rounds.`);
        
        return {
            matchesData,
            knockoutData,
            groupsData
        };
        
    } catch (err) {
        console.warn('[FIFA API] Error fetching live data:', err.message);
        return null;
    }
}

/**
 * Returns true if any match in the array is currently live
 * or is about to start within 15 minutes.
 */
export function hasActiveMatches(matches) {
    if (!matches) return false;
    const now = Date.now();
    
    return matches.some(m => {
        if (m.status === 'live') return true;
        if (m.status === 'finished') return false; 
        if (m.startTimestamp) {
            const startMs = m.startTimestamp * 1000;
            const diff = startMs - now;
            if (diff >= -180 * 60 * 1000 && diff <= 0) return true;
        }
        return false;
    });
}
