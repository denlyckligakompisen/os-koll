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
 * Fetches all World Cup 2026 matches from FIFA API.
 * Returns a Map<string, LiveMatchData> keyed by a composite key
 * of "homeAbbr-awayAbbr-date" for easy lookup.
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
                fifaTimestamp,
                fifaMatchId: match.IdMatch,
            };
            
            // Key by Swedish team names for matching
            const key = `${homeName}|${awayName}`;
            liveData.set(key, liveMatch);
        });
        
        console.log(`[FIFA API] Fetched ${liveData.size} matches`);
        return liveData;
        
    } catch (err) {
        console.warn('[FIFA API] Error fetching live data:', err.message);
        return null;
    }
}

/**
 * Merges FIFA live data into the local matches array.
 * Returns a new array with updated scores, statuses, etc.
 * Does NOT mutate the original array.
 */
export function mergeLiveData(localMatches, liveData) {
    if (!liveData || !localMatches) return localMatches;
    
    let updatedCount = 0;
    
    const merged = localMatches.map(match => {
        const key = `${match.home}|${match.away}`;
        const live = liveData.get(key);
        
        if (!live) return match;
        
        // Only update if there's meaningful live data
        const hasLiveScore = live.status === 'live' || live.status === 'finished';
        
        if (!hasLiveScore && live.status === 'upcoming') {
            return match; // Nothing to update
        }
        
        updatedCount++;
        
        return {
            ...match,
            status: live.status,
            score: live.score || match.score,
            liveCurrentTime: live.matchTime || undefined,
            _fifaMatchId: live.fifaMatchId,
        };
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
