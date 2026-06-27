import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { sortGroupTeams } from '../utils/vmUtils';
import { hasActiveMatches } from '../utils/fifaLiveApi';

const DATA_BASE_URL = 'https://raw.githubusercontent.com/denlyckligakompisen/os-koll/main/public/data';

export const useVMData = () => {
    const [initialGroupsData, setInitialGroupsData] = useState(null);
    const [matchesData, setMatchesData] = useState(null);
    const [knockoutData, setKnockoutData] = useState(null);
    const [rankingData, setRankingData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchAllData = useCallback(async () => {
        const fetchFile = async (file) => {
            try {
                const res = await fetch(`/data/${file}`);
                if (!res.ok) throw new Error();
                return await res.json();
            } catch (e) {
                return fetch(`${DATA_BASE_URL}/${file}`).then(res => res.json());
            }
        };

        try {
            const [rData, fifaData] = await Promise.all([
                fetchFile('fifa_ranking.json').catch(() => null),
                import('../utils/fifaLiveApi').then(m => m.fetchAllFifaData()).catch(() => null)
            ]);

            if (!fifaData) {
                setLoading(false);
                return;
            }

            let gData = { groups: fifaData.groupsData };
            let mData = { matches: fifaData.matchesData };
            let kData = fifaData.knockoutData;

            if (gData?.groups && rData?.rankings) {
                gData.groups.forEach(group => {
                    group.teams.forEach((team, index) => {
                        const teamName = typeof team === 'object' ? team.name : team;
                        const rankObj = rData.rankings.find(r => r.team === teamName);
                        group.teams[index] = {
                            name: teamName,
                            ranking: rankObj ? rankObj.rank : null,
                            played: 0, gd: 0, pts: 0
                        };
                    });
                });
            }

            setInitialGroupsData(gData);
            setMatchesData(mData);
            setKnockoutData(kData);
            setRankingData(rData);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    }, []);

    const pollFifaLive = useCallback(async () => {
        const fifaData = await import('../utils/fifaLiveApi').then(m => m.fetchAllFifaData());
        if (!fifaData) return;

        setMatchesData({ matches: fifaData.matchesData });
        setKnockoutData(fifaData.knockoutData);
    }, []);

    useEffect(() => {
        fetchAllData();

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                fetchAllData();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [fetchAllData]);

    const liveTimerRef = useRef(null);
    const matchesDataRef = useRef(matchesData);
    matchesDataRef.current = matchesData;

    useEffect(() => {
        if (!matchesData?.matches) return;

        const handleVisibility = () => {
            if (document.visibilityState === 'visible') {
                fetchAllData();
                pollFifaLive();
            }
        };
        const handleFocus = () => {
            fetchAllData();
            pollFifaLive();
        };
        document.addEventListener('visibilitychange', handleVisibility);
        window.addEventListener('focus', handleFocus);

        const scheduleNextPoll = () => {
            const isActive = hasActiveMatches(matchesDataRef.current?.matches);
            const interval = isActive ? 30_000 : 300_000; // 30s or 5min

            liveTimerRef.current = setTimeout(async () => {
                const currentlyActive = hasActiveMatches(matchesDataRef.current?.matches);
                if (currentlyActive) {
                    await pollFifaLive();
                }
                scheduleNextPoll();
            }, interval);
        };

        scheduleNextPoll();

        return () => {
            if (liveTimerRef.current) clearTimeout(liveTimerRef.current);
            document.removeEventListener('visibilitychange', handleVisibility);
            window.removeEventListener('focus', handleFocus);
        };
    }, [matchesData?.matches, fetchAllData, pollFifaLive]);

    const groupsData = useMemo(() => {
        if (!initialGroupsData || !matchesData?.matches) return initialGroupsData;

        const newGroupsData = JSON.parse(JSON.stringify(initialGroupsData));

        newGroupsData.groups.forEach(g => {
            g.teams.forEach((t, i) => {
                if (typeof t === 'string') {
                    g.teams[i] = { name: t, played: 0, gd: 0, pts: 0, gf: 0, ga: 0, fairPlay: 0, won: 0, drawn: 0, lost: 0 };
                } else {
                    t.played = 0; t.gd = 0; t.pts = 0; t.gf = 0; t.ga = 0; t.fairPlay = 0; t.won = 0; t.drawn = 0; t.lost = 0;
                }
            });
        });

        const cleanTeam = (name) => name ? name.replace(/\b(IF|FF|BK|AIF)\b/g, '').replace(/\s+/g, ' ').trim() : '';

        const findTeam = (name) => {
            const cName = cleanTeam(name);
            for (const g of newGroupsData.groups) {
                const team = g.teams.find(t => cleanTeam(t.name) === cName);
                if (team) return team;
            }
            return null;
        };

        matchesData.matches.forEach(m => {
            if ((m.status === 'finished' || m.status === 'live') && m.score && m.score.includes('-')) {
                const parts = m.score.split('-');
                const homeScore = parseInt(parts[0].trim(), 10);
                const awayScore = parseInt(parts[1].trim(), 10);

                if (isNaN(homeScore) || isNaN(awayScore)) return;

                const homeTeam = findTeam(m.home);
                const awayTeam = findTeam(m.away);

                if (homeTeam) {
                    homeTeam.played += 1;
                    homeTeam.gf = (homeTeam.gf || 0) + homeScore;
                    homeTeam.ga = (homeTeam.ga || 0) + awayScore;
                    homeTeam.gd = homeTeam.gf - homeTeam.ga;
                    if (homeScore > awayScore) { homeTeam.pts += 3; homeTeam.won += 1; }
                    else if (homeScore === awayScore) { homeTeam.pts += 1; homeTeam.drawn += 1; }
                    else { homeTeam.lost += 1; }
                }

                if (awayTeam) {
                    awayTeam.played += 1;
                    awayTeam.gf = (awayTeam.gf || 0) + awayScore;
                    awayTeam.ga = (awayTeam.ga || 0) + homeScore;
                    awayTeam.gd = awayTeam.gf - awayTeam.ga;
                    if (awayScore > homeScore) { awayTeam.pts += 3; awayTeam.won += 1; }
                    else if (awayScore === homeScore) { awayTeam.pts += 1; awayTeam.drawn += 1; }
                    else { awayTeam.lost += 1; }
                }

                if (m.bookings) {
                    m.bookings.forEach(b => {
                        const team = b.side === 'home' ? homeTeam : awayTeam;
                        if (team) {
                            if (b.card === 'red') team.fairPlay -= 4;
                            else if (b.card === 'yellow') team.fairPlay -= 1;
                        }
                    });
                }
            }
        });

        newGroupsData.groups.forEach(g => {
            const groupMatches = matchesData.matches.filter(m => g.teams.some(t => t.name === m.home) && g.teams.some(t => t.name === m.away));
            g.teams = sortGroupTeams(g.teams, groupMatches, rankingData);
        });

        return newGroupsData;
    }, [initialGroupsData, matchesData, rankingData]);

    return { groupsData, matchesData, knockoutData, rankingData, loading, fetchAllData };
};
