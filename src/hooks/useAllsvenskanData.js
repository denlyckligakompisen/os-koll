import { useState, useEffect } from 'react';

export const useAllsvenskanData = (selectedSeason) => {
    const [matchesData, setMatchesData] = useState(null);
    const [logosData, setLogosData] = useState({});
    const [tableData, setTableData] = useState(null);
    const [maratonData, setMaratonData] = useState(null);
    const [squadsData, setSquadsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [liveError, setLiveError] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        const fetchData = async (isBackground = false) => {
            try {
                if (!isBackground) {
                    setIsPlaying(false);
                    setLoading(true);
                }
                const matchesUrl = selectedSeason === 2026 
                    ? '/data/allsvenskan_matches.json' 
                    : `/data/allsvenskan_matches_${selectedSeason}.json`;
                const tableUrl = selectedSeason === 2026 
                    ? '/data/allsvenskan_table.json' 
                    : `/data/allsvenskan_table_${selectedSeason}.json`;

                const [matchesRes, logosRes, tableRes, maratonRes] = await Promise.all([
                    fetch(matchesUrl),
                    fetch('/data/allsvenskan_logos.json'),
                    fetch(tableUrl),
                    fetch('/data/allsvenskan_maraton.json')
                ]);
                const matches = await matchesRes.json();
                const logos = await logosRes.json();
                const table = await tableRes.json();
                const maraton = await maratonRes.json();

                // Squads loaded separately to avoid crashing main data load
                let squads = null;
                try {
                    const squadsRes = await fetch('/data/allsvenskan_squads.json');
                    const contentType = squadsRes.headers.get('content-type') || '';
                    if (squadsRes.ok && contentType.includes('application/json')) {
                        squads = await squadsRes.json();
                    }
                } catch (e) {
                    // Squads data not available yet - ignore
                }

                // ---- LOCALSTORAGE CACHE ----
                let liveCache = {};
                try {
                    const cacheStr = localStorage.getItem('allsvenskan_live_cache');
                    if (cacheStr) {
                        const parsedCache = JSON.parse(cacheStr);
                        if (Date.now() - parsedCache.timestamp < 16 * 60 * 60 * 1000) {
                            liveCache = parsedCache.liveData || {};
                        } else {
                            localStorage.removeItem('allsvenskan_live_cache');
                        }
                    }
                } catch (e) {
                    console.error('Failed to parse live cache', e);
                }

                if (Object.keys(liveCache).length > 0 && matches?.matches) {
                    matches.matches.forEach((m, idx) => {
                        const cacheKey = `${m.home}-${m.away}`;
                        if (liveCache[cacheKey]) {
                            matches.matches[idx] = {
                                ...matches.matches[idx],
                                ...liveCache[cacheKey]
                            };
                        }
                    });
                }
                // ---- END CACHE ----

                // GraphQL Live Updates Integration
                let cacheUpdated = false;
                try {
                    const now = Date.now();
                    
                    const isMatchWindowActive = matches?.matches?.some(m => {
                        if (!m.startTimestamp) return false;
                        const startMs = m.startTimestamp * 1000;
                        return now >= startMs - (15 * 60 * 1000) && now <= startMs + (135 * 60 * 1000);
                    });

                    if (selectedSeason === 2026 && isMatchWindowActive) {
                        const liveQuery = `
                        query {
                          matchesForLeague(configLeagueName: "allsvenskan", configSeasonStartYear: 2026) {
                            matches {
                              id
                              homeTeamName
                              visitingTeamName
                              status
                              homeTeamScore
                              visitingTeamScore
                              matchMinute
                            }
                          }
                        }`;
                        const gqlRes = await fetch('https://gql.sportomedia.se/graphql', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ query: liveQuery })
                        });
                        const gqlData = await gqlRes.json();
                        
                        if (gqlData?.data?.matchesForLeague?.matches) {
                            const liveMatches = gqlData.data.matchesForLeague.matches.filter(m => m.status === 'ONGOING' || m.status === 'FINISHED' || m.status === 'HALF_TIME' || m.status === 'HALFTIME');
                            
                            for (const liveMatch of liveMatches) {
                                const localMatchIndex = matches.matches.findIndex(m => 
                                    (m.home.includes(liveMatch.homeTeamName) || liveMatch.homeTeamName.includes(m.home)) &&
                                    (m.away.includes(liveMatch.visitingTeamName) || liveMatch.visitingTeamName.includes(m.away))
                                );
                                
                                if (localMatchIndex !== -1) {
                                    let homeScorers = [];
                                    let awayScorers = [];
                                    let bookings = [];
                                    
                                    // Fetch details for ONGOING matches, or FINISHED matches if the local data doesn't have scorers yet
                                    if (liveMatch.status === 'ONGOING' || liveMatch.status === 'HALF_TIME' || liveMatch.status === 'HALFTIME' || (liveMatch.status === 'FINISHED' && matches.matches[localMatchIndex].status !== 'finished')) {
                                        const detailsQuery = `
                                        query {
                                          match(id: ${liveMatch.id}, configLeagueName: "allsvenskan", configSeasonStartYear: 2026) {
                                            match {
                                              matchEvents {
                                                type
                                                gameTime
                                                minuteWithStoppageTime
                                                playerName
                                                byHomeTeam
                                                description
                                              }
                                            }
                                          }
                                        }`;
                                        const detailsRes = await fetch('https://gql.sportomedia.se/graphql', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ query: detailsQuery })
                                        });
                                        const detailsData = await detailsRes.json();
                                        const events = detailsData?.data?.match?.match?.matchEvents || [];
                                        
                                        events.forEach(ev => {
                                            if (ev.type === 'GOAL') {
                                                const scorer = {
                                                    player: { name: ev.playerName },
                                                    time: Math.floor(ev.gameTime / 60),
                                                    minute: ev.minuteWithStoppageTime || String(Math.floor(ev.gameTime / 60)),
                                                    incidentClass: 'goal'
                                                };
                                                if (ev.byHomeTeam) homeScorers.push(scorer);
                                                else awayScorers.push(scorer);
                                            } else if (ev.type === 'YELLOW_CARD' || ev.type === 'RED_CARD') {
                                                bookings.push({
                                                    player: { name: ev.playerName },
                                                    minute: ev.minuteWithStoppageTime || String(Math.floor(ev.gameTime / 60)),
                                                    side: ev.byHomeTeam ? 'home' : 'away',
                                                    card: ev.type === 'YELLOW_CARD' ? 'yellow' : 'red'
                                                });
                                            }
                                        });
                                        
                                        const updateData = {
                                            score: `${liveMatch.homeTeamScore} - ${liveMatch.visitingTeamScore}`,
                                            status: (liveMatch.status === 'ONGOING' || liveMatch.status === 'HALF_TIME' || liveMatch.status === 'HALFTIME') ? 'live' : 'finished',
                                            liveCurrentTime: (liveMatch.status === 'HALF_TIME' || liveMatch.status === 'HALFTIME') ? 'HT' : (liveMatch.status === 'ONGOING' ? String(liveMatch.matchMinute) : 'FT'),
                                            scorers: {
                                                home: homeScorers,
                                                away: awayScorers
                                            },
                                            bookings: bookings
                                        };
                                        
                                        matches.matches[localMatchIndex] = {
                                            ...matches.matches[localMatchIndex],
                                            ...updateData
                                        };
                                        
                                        const cacheKey = `${matches.matches[localMatchIndex].home}-${matches.matches[localMatchIndex].away}`;
                                        liveCache[cacheKey] = updateData;
                                        cacheUpdated = true;
                                    }
                                }
                            }
                        }
                    }
                    
                    if (cacheUpdated && selectedSeason === 2026) {
                        localStorage.setItem('allsvenskan_live_cache', JSON.stringify({
                            timestamp: Date.now(),
                            liveData: liveCache
                        }));
                    }
                    setLiveError(null);
                } catch (liveErr) {
                    console.error("Failed to fetch live matches:", liveErr);
                    setLiveError(liveErr.message || liveErr.toString());
                }

                setMatchesData(matches);
                setLogosData(logos);
                setTableData(table);
                setMaratonData(maraton);
                if (squads) setSquadsData(squads);
                if (!isBackground) setLoading(false);
            } catch (error) {
                console.error(`Error fetching Allsvenskan data for season ${selectedSeason}:`, error);
                if (!isBackground) setLoading(false);
            }
        };

        fetchData();

        let intervalId;
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && selectedSeason === 2026) {
                fetchData(true);
            }
        };

        if (selectedSeason === 2026) {
            intervalId = setInterval(() => {
                fetchData(true);
            }, 60000);
            document.addEventListener('visibilitychange', handleVisibilityChange);
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [selectedSeason]);

    return {
        matchesData,
        logosData,
        tableData,
        maratonData,
        squadsData,
        loading,
        liveError,
        isPlaying,
        setIsPlaying
    };
};
