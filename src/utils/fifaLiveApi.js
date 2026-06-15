/**
 * FIFA Live API utility for World Cup 2026
 * 
 * Fetches live match data from FIFA's official API and maps it
 * to the Swedish team names used in the app.
 */

const FIFA_API_BASE = 'https://api.fifa.com/api/v3';
const ID_COMPETITION = '17';       // FIFA World Cup
const ID_SEASON = '285023';        // FIFA World Cup 2026

// FIFA abbreviation → Swedish name mapping
// Built from the local match data + TEAM_ABBR in VMKollen
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

/**
 * Maps FIFA MatchStatus to our local status string.
 * FIFA statuses:
 *   0 = Finished
 *   1 = Not started / Scheduled
 *   3 = In progress (Live)
 *   4 = Postponed
 *   10 = Cancelled
 *   12 = Abandoned
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
 * Get Swedish team name from FIFA abbreviation
 */
function getSwedishName(abbreviation) {
    return ABBR_TO_SWEDISH[abbreviation] || abbreviation;
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
 * Returns a Map<string, enrichedData> keyed by "homeName|awayName".
 * Only contains matches that are currently in progress (MatchStatus === 3).
 */
async function fetchFifaLiveNow() {
    try {
        // Using /now instead of /recent to fix API errors
        const url = `${FIFA_API_BASE}/live/football/now`;
        const response = await fetch(url);

        if (!response.ok) {
            console.warn('[FIFA Live Now] Response not OK:', response.status);
            return null;
        }

        const data = await response.json();
        if (!data?.Results || !Array.isArray(data.Results)) return null;

        // Filter to only World Cup matches
        const wcMatches = data.Results.filter(m => m.IdCompetition === ID_COMPETITION);
        if (wcMatches.length === 0) return null;

        const enrichedMap = new Map();

        wcMatches.forEach(match => {
            const homeAbbr = match.HomeTeam?.Abbreviation;
            const awayAbbr = match.AwayTeam?.Abbreviation;
            if (!homeAbbr || !awayAbbr) return;

            const homeName = getSwedishName(homeAbbr);
            const awayName = getSwedishName(awayAbbr);
            const key = `${homeName}|${awayName}`;

            // Build player maps for ID → name lookups
            const homePlayers = buildPlayerMap(match.HomeTeam);
            const awayPlayers = buildPlayerMap(match.AwayTeam);
            const allPlayers = new Map([...homePlayers, ...awayPlayers]);

            const homeTeamId = match.HomeTeam?.IdTeam;

            // --- Goals → scorers format matching MatchCard ---
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

            // --- Bookings ---
            const allBookings = [
                ...(match.HomeTeam?.Bookings || []).map(b => ({ ...b, _side: 'home' })),
                ...(match.AwayTeam?.Bookings || []).map(b => ({ ...b, _side: 'away' })),
            ].map(b => ({
                player: { name: allPlayers.get(b.IdPlayer) || 'Okänd' },
                minute: b.Minute?.replace("'", '') || '',
                card: b.Card === 2 ? 'red' : 'yellow',
                side: b._side,
            }));

            // --- Substitutions ---
            const allSubstitutions = [
                ...(match.HomeTeam?.Substitutions || []).map(s => ({ ...s, _side: 'home' })),
                ...(match.AwayTeam?.Substitutions || []).map(s => ({ ...s, _side: 'away' })),
            ].map(s => ({
                playerOff: s.PlayerOffName?.[0]?.Description || allPlayers.get(s.IdPlayerOff) || '',
                playerOn: s.PlayerOnName?.[0]?.Description || allPlayers.get(s.IdPlayerOn) || '',
                minute: s.Minute?.replace("'", '') || '',
                side: s._side,
            }));

            // --- Red cards as scorer-like entries (for MatchCard display) ---
            const homeRedCards = allBookings
                .filter(b => b.card === 'red' && b.side === 'home')
                .map(b => ({
                    player: b.player,
                    minute: b.minute,
                    time: b.minute,
                    incidentClass: 'red-card',
                }));
            const awayRedCards = allBookings
                .filter(b => b.card === 'red' && b.side === 'away')
                .map(b => ({
                    player: b.player,
                    minute: b.minute,
                    time: b.minute,
                    incidentClass: 'red-card',
                }));

            // --- Lineups ---
            const extractPlayer = (p) => ({
                name: p.PlayerName?.[0]?.Description || p.ShortName?.[0]?.Description || 'Okänd',
                number: p.ShirtNumber,
                position: p.Position, // 0=GK, 1=DEF, 2=MID, 3=FWD
                captain: p.Captain,
                photo: p.PlayerPicture?.PictureUrl
            });

            const homeStartingXI = match.HomeTeam?.Players?.filter(p => p.Status === 1)?.map(extractPlayer) || [];
            const awayStartingXI = match.AwayTeam?.Players?.filter(p => p.Status === 1)?.map(extractPlayer) || [];
            const homeSubs = match.HomeTeam?.Players?.filter(p => p.Status === 2)?.map(extractPlayer) || [];
            const awaySubs = match.AwayTeam?.Players?.filter(p => p.Status === 2)?.map(extractPlayer) || [];

            enrichedMap.set(key, {
                period: match.Period,
                scorers: {
                    home: [...homeGoals, ...homeRedCards],
                    away: [...awayGoals, ...awayRedCards],
                },
                bookings: allBookings,
                substitutions: allSubstitutions,
                tactics: {
                    home: match.HomeTeam?.Tactics || '',
                    away: match.AwayTeam?.Tactics || '',
                },
                stadium: match.Stadium?.Name?.[0]?.Description || '',
                city: match.Stadium?.CityName?.[0]?.Description || '',
                referee: match.Officials?.find(o => o.OfficialType === 1)?.Name?.[0]?.Description || '',
                coaches: {
                    home: match.HomeTeam?.Coaches?.[0]?.Name?.[0]?.Description || '',
                    away: match.AwayTeam?.Coaches?.[0]?.Name?.[0]?.Description || '',
                },
                startingXI: {
                    home: homeStartingXI,
                    away: awayStartingXI
                },
                subs: {
                    home: homeSubs,
                    away: awaySubs
                }
            });
        });

        console.log(`[FIFA Live Now] Enriched ${enrichedMap.size} WC matches`);
        return enrichedMap;

    } catch (err) {
        console.warn('[FIFA Live Now] Error:', err.message);
        return null;
    }
}

/**
 * Fetches all World Cup 2026 matches from FIFA API.
 * Uses /calendar/matches as the primary source for scores and status.
 * If any matches are live (MatchStatus === 3), also fetches from
 * /live/football/now to enrich with goal scorers, cards, substitutions etc.
 *
 * Returns a Map<string, LiveMatchData> keyed by "homeName|awayName".
 */
export async function fetchFifaLiveMatches() {
    try {
        const url = `${FIFA_API_BASE}/calendar/matches?idCompetition=${ID_COMPETITION}&idSeason=${ID_SEASON}&count=200&language=en`;
        const response = await fetch(url);
        
        if (!response.ok) {
            console.warn('[FIFA API] Response not OK:', response.status);
            return null;
        }
        
        const data = await response.json();
        
        if (!data?.Results || !Array.isArray(data.Results)) {
            console.warn('[FIFA API] No results in response');
            return null;
        }
        
        // Fetch enriched data in parallel (now uses /recent to include finished matches)
        const enrichedData = await fetchFifaLiveNow();
        
        // Build a map for easy lookup
        const liveData = new Map();
        
        data.Results.forEach(match => {
            const homeAbbr = match.Home?.Abbreviation;
            const awayAbbr = match.Away?.Abbreviation;
            
            if (!homeAbbr || !awayAbbr) return;
            
            const homeName = getSwedishName(homeAbbr);
            const awayName = getSwedishName(awayAbbr);
            
            // Convert FIFA date to unix timestamp for matching
            const fifaTimestamp = match.Date ? Math.floor(new Date(match.Date).getTime() / 1000) : null;
            
            const status = mapMatchStatus(match.MatchStatus);
            const homeScore = match.HomeTeamScore;
            const awayScore = match.AwayTeamScore;
            const matchTime = match.MatchTime;
            
            // Create score string in "X - Y" format if scores available
            let score = '';
            if (homeScore !== null && homeScore !== undefined && awayScore !== null && awayScore !== undefined) {
                score = `${homeScore} - ${awayScore}`;
            }
            
            const key = `${homeName}|${awayName}`;
            
            // Merge enriched data from /live/football/now if available
            const enriched = enrichedData?.get(key);
            
            const liveMatch = {
                homeName,
                awayName,
                homeAbbr,
                awayAbbr,
                status,
                score,
                homeScore,
                awayScore,
                matchTime: matchTime || '',
                period: match.Period,
                fifaTimestamp,
                fifaMatchId: match.IdMatch,
                // Enriched data from /live/football/now
                ...(enriched || {}),
            };
            
            liveData.set(key, liveMatch);
        });
        
        console.log(`[FIFA API] Fetched ${liveData.size} matches${enrichedData ? ` (${enrichedData.size} enriched)` : ''}`);
        return liveData;
        
    } catch (err) {
        console.warn('[FIFA API] Error fetching live data:', err.message);
        return null;
    }
}

/**
 * Merges FIFA live data into the local matches array.
 * Returns a new array with updated scores, statuses, goal scorers,
 * bookings, substitutions, tactics, and venue info.
 * Does NOT mutate the original array.
 */
export function mergeLiveData(localMatches, liveData) {
    if (!liveData || !localMatches) return localMatches;
    
    let updatedCount = 0;
    
    const merged = localMatches.map(match => {
        const key = `${match.home}|${match.away}`;
        const live = liveData.get(key);
        
        if (!live) return match;
        
        // Ignore upcoming matches
        if (live.status === 'upcoming') {
            return match;
        }

        // If the match is finished, only update it if our local data isn't already up to date
        // This prevents the app from constantly "updating" matches that have already ended.
        if (live.status === 'finished' && match.status === 'finished' && match.score === live.score) {
            return match;
        }
        
        updatedCount++;
        
        const updated = {
            ...match,
            status: live.status,
            score: live.score || match.score,
            liveCurrentTime: live.matchTime || undefined,
            period: live.period,
            _fifaMatchId: live.fifaMatchId,
        };
        
        // Enriched data from /live/football/now
        if (live.scorers) {
            updated.scorers = live.scorers;
        }
        if (live.bookings) {
            updated.bookings = live.bookings;
        }
        if (live.substitutions) {
            updated.substitutions = live.substitutions;
        }
        if (live.tactics) {
            updated.tactics = live.tactics;
        }
        if (live.stadium) {
            updated.stadium = live.stadium;
        }
        if (live.city) {
            updated.city = live.city;
        }
        if (live.referee) {
            updated.referee = live.referee;
        }
        if (live.coaches) {
            updated.coaches = live.coaches;
        }
        if (live.startingXI) {
            updated.startingXI = live.startingXI;
        }
        if (live.subs) {
            updated.subs = live.subs;
        }
        
        return updated;
    });
    
    if (updatedCount > 0) {
        console.log(`[FIFA API] Updated ${updatedCount} matches with live data`);
    }
    
    return merged;
}

/**
 * Returns true if any match in the array is currently live
 * or is about to start within 15 minutes.
 */
export function hasActiveMatches(matches) {
    if (!matches) return false;
    const now = Date.now();
    const FIFTEEN_MIN = 15 * 60 * 1000;
    
    return matches.some(m => {
        if (m.status === 'live') return true;
        if (m.status === 'finished') return false; // Do not poll frequently if match is already finished
        if (m.startTimestamp) {
            const startMs = m.startTimestamp * 1000;
            const diff = startMs - now;
            // Match has started (diff <= 0) but not older than 3 hours (-180 minutes)
            if (diff >= -180 * 60 * 1000 && diff <= 0) return true;
        }
        return false;
    });
}
