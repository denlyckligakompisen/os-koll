import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import Card from './common/Card';
import BoldSverige from './BoldSverige';
import MatchCard from './MatchCard';
import { getFlagCodes, getFlagCode } from '../utils/flags';
import FlagBadge from './common/FlagBadge';
import MatchCardSkeleton from './common/MatchCardSkeleton';
import { ChevronUp, ChevronDown, ArrowUp, Filter, X, Play, History, Trophy, Menu } from 'lucide-react';
import { getRelativeDateLabel, parseTournamentDate } from '../utils/dateUtils';

import { fetchFifaLiveMatches, mergeLiveData, hasActiveMatches } from '../utils/fifaLiveApi';





const CURRENT_YEAR = 2026;
const MONTH_MAP = {
    'jan': 0, 'januari': 0,
    'feb': 1, 'februari': 1,
    'mar': 2, 'mars': 2,
    'apr': 3, 'april': 3,
    'maj': 4,
    'jun': 5, 'juni': 5,
    'jul': 6, 'juli': 6,
    'aug': 7, 'augusti': 7,
    'sep': 8, 'september': 8,
    'okt': 9, 'oktober': 9,
    'nov': 10, 'november': 10,
    'dec': 11, 'december': 11
};
const GROUP_MONTH_MAP = { 'juni': 5, 'juli': 6 };
const DATA_BASE_URL = 'https://raw.githubusercontent.com/denlyckligakompisen/os-koll/main/public/data';



const COUNTRY_COLORS = {
    'Sverige': { bg: '#004B87', text: '#FFCD00', active: '#FFCD00' },
    'Mexiko': { bg: '#006341', text: '#FFFFFF', active: '#C8102E' },
    'USA': { bg: '#002868', text: '#FFFFFF', active: '#BF0A30' },
    'Kanada': { bg: '#D22630', text: '#FFFFFF', active: '#FFFFFF' },
    'Brasilien': { bg: '#009C3B', text: '#FFDF00', active: '#002776' },
    'Bosnien och Hercegovina': { bg: '#002F6C', text: '#FFCD00', active: '#FFCD00' },
    'Turkiet': { bg: '#E30A17', text: '#FFFFFF', active: '#FFFFFF' },
    'Tjeckien': { bg: '#11457E', text: '#FFFFFF', active: '#D7141A' },
    'Nederländerna': { bg: '#FF4F00', text: '#FFFFFF', active: '#21468B' },
    'Tyskland': { bg: '#000000', text: '#FFFFFF', active: '#FFCE00' },
    'Spanien': { bg: '#AA151B', text: '#F1BF00', active: '#F1BF00' },
    'Frankrike': { bg: '#002395', text: '#FFFFFF', active: '#ED2939' },
    'Argentina': { bg: '#43A1D5', text: '#FFFFFF', active: '#FFB81C' },
    'England': { bg: '#FFFFFF', text: '#CF0820', active: '#CF0820' },
    'Portugal': { bg: '#046A38', text: '#FFFFFF', active: '#DA291C' },
    'Belgien': { bg: '#E20613', text: '#FFD200', active: '#000000' },
    'Italien': { bg: '#0066B2', text: '#FFFFFF', active: '#FFFFFF' },
    'Japan': { bg: '#000555', text: '#FFFFFF', active: '#EE0000' },
    'Sydkorea': { bg: '#003478', text: '#FFFFFF', active: '#C60C30' },
    'Ecuador': { bg: '#FFDD00', text: '#00205B', active: '#ED1C24' },
    'Uruguay': { bg: '#0038A8', text: '#FFFFFF', active: '#FCD116' },
    'Senegal': { bg: '#00853F', text: '#FDEF42', active: '#E31B23' },
    'Marocko': { bg: '#C1272D', text: '#FFFFFF', active: '#006233' },
    'Schweiz': { bg: '#D52B1E', text: '#FFFFFF', active: '#FFFFFF' },
    'Österrike': { bg: '#ED2939', text: '#FFFFFF', active: '#FFFFFF' },
    'Kroatien': { bg: '#ED1C24', text: '#FFFFFF', active: '#0051BA' },
    'Colombia': { bg: '#FCD116', text: '#003893', active: '#CE1126' },
    'Norge': { bg: '#BA0C2F', text: '#FFFFFF', active: '#00205B' },
    'Danmark': { bg: '#C60C30', text: '#FFFFFF', active: '#FFFFFF' },
    'Saudiarabien': { bg: '#006C35', text: '#FFFFFF', active: '#FFFFFF' },
    'Egypten': { bg: '#CE1126', text: '#FFFFFF', active: '#000000' },
    'Tunisien': { bg: '#E70013', text: '#FFFFFF', active: '#FFFFFF' },
    'Ghana': { bg: '#006B3F', text: '#FCD116', active: '#CE1126' },
    'Sydafrika': { bg: '#007749', text: '#FFB81C', active: '#001489' },
    'Australien': { bg: '#008751', text: '#FFCD00', active: '#FFCD00' },
    'Haiti': { bg: '#00209F', text: '#FFFFFF', active: '#D21034' },
    'Jamaika': { bg: '#009B3A', text: '#FED100', active: '#000000' },
    'Bolivia': { bg: '#007A33', text: '#FFFFFF', active: '#EE3A43' },
    'Panama': { bg: '#DA291C', text: '#FFFFFF', active: '#00205B' },
    'Curaçao': { bg: '#002B7F', text: '#FED100', active: '#FED100' },
    'Uzbekistan': { bg: '#0099B5', text: '#FFFFFF', active: '#1EB53A' },
    'Paraguay': { bg: '#D52B1E', text: '#FFFFFF', active: '#0038A8' },
    'Jordanien': { bg: '#000000', text: '#FFFFFF', active: '#CE1126' },
    'Qatar': { bg: '#8A1538', text: '#FFFFFF', active: '#FFFFFF' },
    'Skottland': { bg: '#005EB8', text: '#FFFFFF', active: '#FFFFFF' }
};

const getVMHeaderStyle = (countryName) => {
    if (!countryName) {
        return {
            bg: 'var(--color-glass-bg)',
            text: 'var(--color-text)',
            inactiveText: 'var(--color-text-muted)',
            activeLine: 'var(--color-text)'
        };
    }
    const colors = COUNTRY_COLORS[countryName] || { bg: '#1c1c1e', text: '#ffffff', active: '#34c759' };
    return {
        bg: colors.bg,
        text: colors.text,
        inactiveText: 'rgba(255, 255, 255, 0.6)',
        activeLine: colors.active
    };
};

const TEAM_ABBR = {
    'Sverige': 'SWE', 'Mexiko': 'MEX', 'USA': 'USA', 'Kanada': 'CAN', 'Brasilien': 'BRA',
    'Bosnien och Hercegovina': 'BIH', 'Turkiet': 'TUR', 'Tjeckien': 'CZE', 'Nederländerna': 'NED',
    'Tyskland': 'GER', 'Spanien': 'ESP', 'Frankrike': 'FRA', 'Argentina': 'ARG',
    'England': 'ENG', 'Portugal': 'POR', 'Belgien': 'BEL', 'Italien': 'ITA',
    'Japan': 'JPN', 'Sydkorea': 'KOR', 'Ecuador': 'ECU', 'Uruguay': 'URU',
    'Senegal': 'SEN', 'Marocko': 'MAR', 'Schweiz': 'SUI', 'Österrike': 'AUT',
    'Kroatien': 'CRO', 'Colombia': 'COL', 'Norge': 'NOR', 'Danmark': 'DEN',
    'Saudiarabien': 'KSA', 'Egypten': 'EGY', 'Tunisien': 'TUN', 'Ghana': 'GHA',
    'Sydafrika': 'RSA', 'Australien': 'AUS', 'Haiti': 'HAI', 'Jamaika': 'JAM',
    'Bolivia': 'BOL', 'Panama': 'PAN', 'Curaçao': 'CUW', 'Uzbekistan': 'UZB',
    'Paraguay': 'PAR', 'Jordanien': 'JOR', 'Qatar': 'QAT', 'Skottland': 'SCO'
};

const getAbbr = (name) => TEAM_ABBR[name] || name?.substring(0, 3).toUpperCase();

const sortTeamsSimple = (teams) => {
    return [...teams].sort((a, b) => {
        const teamA = typeof a === 'string' ? { name: a, pts: 0, gd: 0, gf: 0, fairPlay: 0 } : a;
        const teamB = typeof b === 'string' ? { name: b, pts: 0, gd: 0, gf: 0, fairPlay: 0 } : b;
        return teamB.pts - teamA.pts || teamB.gd - teamA.gd || teamB.gf - teamA.gf || teamB.fairPlay - teamA.fairPlay || teamA.name.localeCompare(teamB.name, 'sv');
    });
};

const sortGroupTeams = (teams, groupMatches, rankingData) => {
    const getRank = (teamName) => {
        if (!rankingData?.rankings) return 999;
        const index = rankingData.rankings.findIndex(r => r.team === teamName || r.team.includes(teamName) || teamName.includes(r.team));
        return index !== -1 ? index : 999;
    };

    const sortSubset = (subsetTeams, subsetMatches) => {
        if (subsetTeams.length <= 1) return subsetTeams;

        const miniStats = {};
        subsetTeams.forEach(t => miniStats[t.name] = { pts: 0, gd: 0, gf: 0 });

        subsetMatches.forEach(m => {
            if ((m.status === 'finished' || m.status === 'live') && m.score && m.score.includes('-')) {
                const parts = m.score.split('-');
                const homeScore = parseInt(parts[0].trim(), 10);
                const awayScore = parseInt(parts[1].trim(), 10);
                if (isNaN(homeScore) || isNaN(awayScore)) return;

                if (miniStats[m.home] && miniStats[m.away]) {
                    miniStats[m.home].gf += homeScore;
                    miniStats[m.home].ga = (miniStats[m.home].ga || 0) + awayScore;
                    miniStats[m.home].gd = miniStats[m.home].gf - miniStats[m.home].ga;

                    miniStats[m.away].gf += awayScore;
                    miniStats[m.away].ga = (miniStats[m.away].ga || 0) + homeScore;
                    miniStats[m.away].gd = miniStats[m.away].gf - miniStats[m.away].ga;

                    if (homeScore > awayScore) miniStats[m.home].pts += 3;
                    else if (homeScore === awayScore) {
                        miniStats[m.home].pts += 1;
                        miniStats[m.away].pts += 1;
                    } else miniStats[m.away].pts += 3;
                }
            }
        });

        subsetTeams.sort((a, b) => {
            const stA = miniStats[a.name];
            const stB = miniStats[b.name];
            return stB.pts - stA.pts || stB.gd - stA.gd || stB.gf - stA.gf;
        });

        const clusters = [];
        let currentCluster = [];
        let lastSig = null;

        subsetTeams.forEach(t => {
            const st = miniStats[t.name];
            const sig = `${st.pts}_${st.gd}_${st.gf}`;
            if (sig !== lastSig) {
                if (currentCluster.length > 0) clusters.push(currentCluster);
                currentCluster = [t];
                lastSig = sig;
            } else {
                currentCluster.push(t);
            }
        });
        if (currentCluster.length > 0) clusters.push(currentCluster);

        if (clusters.length === 1 && clusters[0].length === subsetTeams.length) {
            return clusters[0].sort((a, b) => {
                if (b.gd !== a.gd) return b.gd - a.gd;
                if (b.gf !== a.gf) return b.gf - a.gf;
                if (b.fairPlay !== a.fairPlay) return b.fairPlay - a.fairPlay;
                return getRank(a.name) - getRank(b.name);
            });
        }

        const resolved = [];
        clusters.forEach(cluster => {
            if (cluster.length === 1) {
                resolved.push(cluster[0]);
            } else {
                const clusterNames = new Set(cluster.map(t => t.name));
                const subMatches = subsetMatches.filter(m => clusterNames.has(m.home) && clusterNames.has(m.away));
                resolved.push(...sortSubset(cluster, subMatches));
            }
        });

        return resolved;
    };

    const sortedTeams = [...teams].sort((a, b) => b.pts - a.pts);
    const pointClusters = [];
    let currentPtCluster = [];
    let lastPts = null;

    sortedTeams.forEach(t => {
        if (t.pts !== lastPts) {
            if (currentPtCluster.length > 0) pointClusters.push(currentPtCluster);
            currentPtCluster = [t];
            lastPts = t.pts;
        } else {
            currentPtCluster.push(t);
        }
    });
    if (currentPtCluster.length > 0) pointClusters.push(currentPtCluster);

    const finalRanking = [];
    pointClusters.forEach(cluster => {
        if (cluster.length === 1) {
            finalRanking.push(cluster[0]);
        } else {
            const clusterNames = new Set(cluster.map(t => t.name));
            const clusterMatches = groupMatches.filter(m => clusterNames.has(m.home) && clusterNames.has(m.away));
            finalRanking.push(...sortSubset(cluster, clusterMatches));
        }
    });

    return finalRanking;
};

const VMKollen = () => {
    const navigate = useNavigate();
    const [initialGroupsData, setInitialGroupsData] = useState(null);
    const [matchesData, setMatchesData] = useState(null);
    const [knockoutData, setKnockoutData] = useState(null);
    const [rankingData, setRankingData] = useState(null);
    const [matchStatusFilter, setMatchStatusFilter] = useState('upcoming');
    const [loading, setLoading] = useState(true);
    const [filterCountries, setFilterCountries] = useState([]);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const filterRef = useRef(null);

    useEffect(() => {
        // Dropdown removed, no outside click listener needed.
    }, []);

    const [showScrollTop, setShowScrollTop] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    const groupsData = useMemo(() => {
        if (!initialGroupsData || !matchesData?.matches) return initialGroupsData;

        // Deep copy to avoid mutating state
        const newGroupsData = JSON.parse(JSON.stringify(initialGroupsData));

        // Reset stats
        newGroupsData.groups.forEach(g => {
            g.teams.forEach((t, i) => {
                if (typeof t === 'string') {
                    g.teams[i] = { name: t, played: 0, gd: 0, pts: 0, gf: 0, ga: 0, fairPlay: 0 };
                } else {
                    t.played = 0; t.gd = 0; t.pts = 0; t.gf = 0; t.ga = 0; t.fairPlay = 0;
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
                    if (homeScore > awayScore) homeTeam.pts += 3;
                    else if (homeScore === awayScore) homeTeam.pts += 1;
                }

                if (awayTeam) {
                    awayTeam.played += 1;
                    awayTeam.gf = (awayTeam.gf || 0) + awayScore;
                    awayTeam.ga = (awayTeam.ga || 0) + homeScore;
                    awayTeam.gd = awayTeam.gf - awayTeam.ga;
                    if (awayScore > homeScore) awayTeam.pts += 3;
                    else if (homeScore === awayScore) awayTeam.pts += 1;
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

        // Finally, sort the teams in each group using the full tie-breaker rules
        newGroupsData.groups.forEach(g => {
            const groupMatches = matchesData.matches.filter(m => g.teams.some(t => t.name === m.home) && g.teams.some(t => t.name === m.away));
            g.teams = sortGroupTeams(g.teams, groupMatches, rankingData);
        });

        return newGroupsData;
    }, [initialGroupsData, matchesData, rankingData]);
    const [expandedMatchId, setExpandedMatchId] = useState(null);
    const rankingRefs = React.useRef({});

    const tableRefs = React.useRef({});
    const headerStyle = useMemo(() => getVMHeaderStyle(filterCountries.length === 1 ? filterCountries[0] : null), [filterCountries]);

    // Auto-scroll in stats sub-tabs
    useEffect(() => {
        if (filterCountries.length === 0) return;

        setTimeout(() => {
            if (rankingData?.rankings) {
                const target = rankingData.rankings.find(r => filterCountries.some(fc => r.team.includes(fc)));
                if (target && rankingRefs.current[target.team]) {
                    rankingRefs.current[target.team].scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        }, 100);
    }, [filterCountries, rankingData]);

    const allCountries = useMemo(() => {
        if (!groupsData?.groups) return [];
        const teamsSet = new Set();
        groupsData.groups.forEach(group => {
            group.teams.forEach(t => teamsSet.add(typeof t === 'string' ? t : t.name));
        });
        const sorted = [...teamsSet].sort((a, b) => a.localeCompare(b, 'sv'));
        const swedeIdx = sorted.indexOf('Sverige');
        if (swedeIdx > -1) {
            sorted.splice(swedeIdx, 1);
            sorted.unshift('Sverige');
        }
        return sorted;
    }, [groupsData]);



    const tournamentTeams = React.useMemo(() => {
        if (!groupsData?.groups) return new Set();
        const teams = new Set();
        groupsData.groups.forEach(group => {
            group.teams.forEach(t => teams.add(typeof t === 'string' ? t : t.name));
        });
        return teams;
    }, [groupsData]);





    const handleCountryClick = (country) => {
        const cleanName = country.includes('Sverige') ? 'Sverige' : country;
        if (!tournamentTeams.has(cleanName)) return;
        setFilterCountries(prev => prev.includes(cleanName) ? [] : [cleanName]);
    };

    const fetchAllData = useCallback(async () => {
        const fetchFile = async (file) => {
            try {
                // Try relative path first (for local dev)
                const res = await fetch(`/data/${file}`);
                if (!res.ok) throw new Error();
                return await res.json();
            } catch (e) {
                // Fallback to GitHub URL
                return fetch(`${DATA_BASE_URL}/${file}`).then(res => res.json());
            }
        };

        try {
            const [gData, mData, kData, rData, liveData] = await Promise.all([
                fetchFile('worldcup_2026_groups.json'),
                fetchFile('worldcup_2026_matches.json'),
                fetchFile('worldcup_2026_knockout.json').catch(() => null),
                fetchFile('fifa_ranking.json').catch(() => null),
                fetchFifaLiveMatches().catch(() => null)
            ]);

            if (gData?.groups && rData?.rankings) {
                gData.groups.forEach(group => {
                    group.teams.forEach((team, index) => {
                        if (typeof team === 'object') {
                            const rankObj = rData.rankings.find(r => r.team === team.name);
                            team.ranking = rankObj ? rankObj.rank : null;
                        } else {
                            const rankObj = rData.rankings.find(r => r.team === team);
                            group.teams[index] = {
                                name: team,
                                ranking: rankObj ? rankObj.rank : null,
                                played: 0, gd: 0, pts: 0
                            };
                        }
                    });
                });
            }

            if (mData?.matches && liveData) {
                mData.matches = mergeLiveData(mData.matches, liveData);
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

    useEffect(() => {
        const saved = localStorage.getItem('os-koll-filter');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) setFilterCountries(parsed);
                else setFilterCountries([saved]);
            } catch {
                setFilterCountries([saved]);
            }
        }

        fetchAllData();
    }, [fetchAllData]);

    // FIFA Live API polling
    const liveTimerRef = useRef(null);
    const matchesDataRef = useRef(matchesData);
    matchesDataRef.current = matchesData;

    const pollFifaLive = useCallback(async () => {
        const currentMatches = matchesDataRef.current;
        if (!currentMatches?.matches) return;

        const liveData = await fetchFifaLiveMatches();
        if (!liveData) return;

        const updatedMatches = mergeLiveData(currentMatches.matches, liveData);

        // Only update state if something actually changed
        const hasChanges = updatedMatches.some((m, i) => {
            const orig = currentMatches.matches[i];
            return m.status !== orig.status ||
                m.score !== orig.score ||
                m.liveCurrentTime !== orig.liveCurrentTime ||
                (m.scorers?.home?.length || 0) !== (orig.scorers?.home?.length || 0) ||
                (m.scorers?.away?.length || 0) !== (orig.scorers?.away?.length || 0) ||
                (m.bookings?.length || 0) !== (orig.bookings?.length || 0) ||
                (m.substitutions?.length || 0) !== (orig.substitutions?.length || 0) ||
                (m.startingXI?.home?.length || 0) !== (orig.startingXI?.home?.length || 0);
        });

        if (hasChanges) {
            setMatchesData(prev => ({
                ...prev,
                matches: updatedMatches
            }));
        }
    }, []);

    useEffect(() => {
        if (!matchesData?.matches) return;

        // Always fetch once on load to catch matches finished since last JSON push
        pollFifaLive();

        // Re-fetch when user returns to the tab/app
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
    }, [matchesData?.matches?.length, pollFifaLive]);

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 400);
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const scrollToPlayoff = () => {
        const el = document.getElementById('playoff-start');
        if (el) {
            const y = el.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        if (filterCountries.length > 0) localStorage.setItem('os-koll-filter', JSON.stringify(filterCountries));
        else localStorage.removeItem('os-koll-filter');
    }, [filterCountries]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [filterCountries]);

    const filteredCountryStatusList = React.useMemo(() => {
        if (!groupsData?.groups || filterCountries.length === 0) return [];
        return filterCountries.map(fc => {
            const group = groupsData.groups.find(g =>
                g.teams.some(t => (typeof t === 'string' ? t : t.name).includes(fc))
            );
            if (!group) return null;

            const groupChar = group.name.split(' ')[1];
            const sorted = group.teams;
            const rank = sorted.findIndex(t => (typeof t === 'string' ? t : t.name).includes(fc)) + 1;

            return { groupChar, rank, country: fc };
        }).filter(Boolean);
    }, [groupsData, filterCountries]);

    const resolveTeamInfo = (label) => {
        if (!label || !groupsData?.groups) return { name: label || 'TBA', isPlaceholder: true };

        // Handle 1A, 2B, etc.
        const rankMatch = label.match(/^([12])([A-L])$/i);
        if (rankMatch) {
            const rank = parseInt(rankMatch[1]);
            const groupChar = rankMatch[2].toUpperCase();
            const groupIdx = groupChar.charCodeAt(0) - 65;

            const group = groupsData.groups[groupIdx];
            if (group) {
                const sorted = group.teams;
                const team = sorted[rank - 1];
                if (team) {
                    return {
                        name: `${label}\n${team.name}`,
                        realName: team.name,
                        isPlaceholder: false
                    };
                }
            }
        }

        // Handle 3rd place complex labels
        if (label.includes('/')) {
            const parts = label.split('/');
            const groupChars = [];
            const rank = parseInt(parts[0][0]);
            groupChars.push(parts[0][1]);
            for (let i = 1; i < parts.length; i++) groupChars.push(parts[i]);

            const abbrs = groupChars.map(char => {
                const idx = char.toUpperCase().charCodeAt(0) - 65;
                const group = groupsData.groups[idx];
                if (group) {
                    const sorted = group.teams;
                    const team = sorted[rank - 1];
                    return team ? getAbbr(team.name) : char;
                }
                return char;
            });

            const flagCodes = groupChars.map(char => {
                const idx = char.toUpperCase().charCodeAt(0) - 65;
                const group = groupsData.groups[idx];
                if (group) {
                    const sorted = group.teams;
                    const team = sorted[rank - 1];
                    if (team && team.name) {
                        return getFlagCode(team.name);
                    }
                }
                return null;
            }).filter(Boolean);

            return {
                name: `${label}\n${abbrs.join('/')}`,
                isPlaceholder: true,
                flagCodes: flagCodes.length > 1 ? flagCodes : undefined
            };
        }

        return { name: label, isPlaceholder: true };
    };

    const combinedMatches = React.useMemo(() => {
        const groupMatches = matchesData?.matches || [];
        const knockoutMatches = [];
        if (knockoutData?.rounds && groupsData) {
            knockoutData.rounds.forEach(round => {
                round.matches.forEach(m => {
                    const homeInfo = resolveTeamInfo(m.home);
                    const awayInfo = resolveTeamInfo(m.away);
                    knockoutMatches.push({
                        ...m,
                        home: homeInfo.name,
                        away: awayInfo.name,
                        homeFlags: homeInfo.flagCodes,
                        awayFlags: awayInfo.flagCodes,
                        realHome: homeInfo.realName || m.home,
                        realAway: awayInfo.realName || m.away,
                        isKnockout: true,
                        isPreliminary: true, // Always preliminary for knockout matches for now
                        roundName: round.name,
                        group: round.name
                    });
                });
            });
        }
        return [...groupMatches, ...knockoutMatches];
    }, [matchesData, knockoutData, groupsData]);

    const nextMatches = React.useMemo(() => {
        if (combinedMatches.length === 0) return [];

        let pool = combinedMatches.filter(m => {
            if (m.status !== 'finished') return true;
            const startMs = m.startTimestamp ? m.startTimestamp * 1000 : parseTournamentDate(m.date, m.time, GROUP_MONTH_MAP).getTime();
            const hideAfterMs = startMs + (140 * 60 * 1000); // 125 min match + 15 min delay
            return Date.now() <= hideAfterMs;
        });
        if (filterCountries.length > 0) {
            pool = pool.filter(m => filterCountries.some(fc => m.home.includes(fc) || m.away.includes(fc)));
        }

        if (pool.length === 0) return [];

        const withDates = pool.map(m => ({
            ...m,
            fullDate: parseTournamentDate(m.date, m.time, GROUP_MONTH_MAP).getTime()
        }));

        const sorted = [...withDates].sort((a, b) => a.fullDate - b.fullDate);
        const earliestTime = sorted[0].fullDate;

        return withDates.filter(m => m.fullDate === earliestTime);
    }, [matchesData, filterCountries]);

    const groupedMatches = React.useMemo(() => {
        if (combinedMatches.length === 0) return {};
        return combinedMatches.reduce((acc, m) => {
            const isMatchLiveOrRecentlyFinishedOrSoon = (m, isHeroMatch = false) => {
                if (isHeroMatch) return true;
                if (m.status === 'live') return true;
                if (m.status === 'finished') return true;
                const startMs = m.startTimestamp ? m.startTimestamp * 1000 : parseTournamentDate(m.date, m.time, GROUP_MONTH_MAP).getTime();
                if (m.status === 'upcoming') {
                    const timeUntilStart = startMs - Date.now();
                    if (timeUntilStart > 0) {
                        if (isHeroMatch && timeUntilStart <= 60 * 60 * 1000) return true;
                        if (!isHeroMatch && timeUntilStart <= 30 * 60 * 1000) return true;
                    }
                }
                return false;
            };

            const isCountryPlaceholder = (label, status) => {
                if (!label || !status.groupChar || !status.rank) return false;
                const target = `${status.rank}${status.groupChar}`;
                if (label.includes(target)) return true;
                if (status.rank === 3 && label.startsWith('3') && label.includes(status.groupChar)) return true;
                return false;
            };

            const isFilterCountryMatch = filterCountries.length > 0 ? filterCountries.some(fc => {
                const status = filteredCountryStatusList.find(s => s.country === fc);
                return (m.home?.includes(fc)) ||
                    (m.away?.includes(fc)) ||
                    (m.realHome?.includes(fc)) ||
                    (m.realAway?.includes(fc)) ||
                    (status && isCountryPlaceholder(m.home, status)) ||
                    (status && isCountryPlaceholder(m.away, status));
            }) : true;

            if (filterCountries.length > 0 && !isFilterCountryMatch) return acc;

            if (filterCountries.length === 0) {
                if (matchStatusFilter === 'upcoming' && m.status === 'finished') {
                    const startMs = m.startTimestamp ? m.startTimestamp * 1000 : parseTournamentDate(m.date, m.time, GROUP_MONTH_MAP).getTime();
                    const hideAfterMs = startMs + (140 * 60 * 1000); // 125 min match + 15 min delay
                    if (Date.now() > hideAfterMs) {
                        return acc;
                    }
                }

                if (matchStatusFilter === 'played' && m.status !== 'finished') return acc;
            }

            // We no longer skip nextMatches here because they are rendered inline with variant="hero"

            let groupKey = m.date;
            const label = getRelativeDateLabel(m.date, GROUP_MONTH_MAP);
            if (label === 'Imorgon' && m.time) {
                const hour = parseInt(m.time.split(':')[0], 10);
                if (hour >= 0 && hour <= 6) {
                    groupKey = m.date + '_night';
                }
            }

            if (!acc[groupKey]) acc[groupKey] = [];
            acc[groupKey].push(m);
            return acc;
        }, {});
    }, [combinedMatches, filterCountries, nextMatches, filteredCountryStatusList, matchStatusFilter]);

    const getTeamRank = (teamName) => {
        if (!rankingData?.rankings) return 999;
        const rankObj = rankingData.rankings.find(r => r.team === teamName);
        return rankObj ? parseInt(rankObj.rank, 10) : 999;
    };

    const handleCardClick = (matchId) => {
        // Tabellen visas inte längre vid klick
    };

    const renderInlineGroupTable = (matchId, groupName, homeTeam, awayTeam, isLive) => {
        if (!groupsData?.groups) return null;
        if (filterCountries.length > 0) return null;
        if (!isLive) return null;
        const group = groupsData.groups.find(g => g.name === groupName);
        if (!group) return null;
        const highlightTeams = [homeTeam, awayTeam].filter(Boolean).map(n => n.includes('\n') ? n.split('\n')[1] : n);
        return (
            <div style={{
                marginTop: '4px',
                marginBottom: '8px',
                animation: 'slideOutFromUnder 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards'
            }}>
                {renderTable(group.name, group.teams, null, 0, highlightTeams, true)}
            </div>
        );
    };


    const qualifiedThirds = React.useMemo(() => {
        if (!groupsData?.groups) return [];
        const thirdPlacedTeams = groupsData.groups.map(group => {
            return group.teams[2]; // Already sorted by sortGroupTeams
        });
        return thirdPlacedTeams
            .filter(Boolean)
            .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || b.fairPlay - a.fairPlay || a.name.localeCompare(b.name, 'sv'))
            .slice(0, 8)
            .map(t => t.name);
    }, [groupsData]);

    if (loading) {
        return (
            <div className="app-container">
                <div style={{ padding: '80px 16px', display: 'flex', flexDirection: 'column' }}>
                    <MatchCardSkeleton />
                    <MatchCardSkeleton />
                    <MatchCardSkeleton />
                    <MatchCardSkeleton />
                </div>
            </div>
        );
    }
    if (!groupsData) return null;

    const renderTable = (groupName, teams, displayName, idx = 0, highlightTeams = [], isInline = false) => {
        const sortedTeams = teams; // Already sorted by sortGroupTeams

        return (
            <div key={groupName} style={{ marginBottom: isInline ? '8px' : '32px' }}>
                {!isInline && (
                    <div style={{
                        fontSize: '0.8rem',
                        textTransform: 'uppercase',
                        paddingLeft: '4px',
                        marginBottom: '12px',
                        color: 'var(--color-text-muted)',
                        letterSpacing: '0.05em'
                    }}>
                        <BoldSverige text={displayName || groupName} />
                    </div>
                )}
                <Card
                    padding={isInline ? "16px 12px 16px 12px" : "4px 8px"}
                    style={{
                        marginBottom: '0',
                        marginTop: isInline ? '-32px' : '0',
                        backgroundColor: isInline ? 'rgba(255, 255, 255, 0.8)' : '#ffffff',
                        boxShadow: isInline ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                        borderTopLeftRadius: isInline ? '0' : undefined,
                        borderTopRightRadius: isInline ? '0' : undefined,
                        borderTop: isInline ? 'none' : undefined,
                        position: 'relative',
                        zIndex: 1,
                        width: isInline ? 'calc(100% - 32px)' : '100%',
                        margin: isInline ? '-32px auto 0 auto' : '0'
                    }}
                >
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 2px', fontSize: isInline ? '0.7rem' : '0.8rem' }}>
                        <caption style={{ position: 'absolute', width: '1px', height: '1px', padding: '0', margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', border: '0' }}>
                            Tabell för {displayName || groupName}
                        </caption>
                        <thead>
                            <tr style={{ borderBottom: 'var(--border)' }}>
                                <th scope="col" style={{ textAlign: 'left', padding: '4px 2px', color: 'var(--color-text-muted)', width: isInline ? '28px' : '36px' }} aria-label="Position"></th>
                                <th scope="col" style={{ textAlign: 'left', padding: '4px 2px', color: 'var(--color-text-muted)' }} aria-label="Land"></th>
                                <th scope="col" style={{ textAlign: 'center', padding: '4px 2px', color: 'var(--color-text-muted)' }}>M</th>
                                <th scope="col" style={{ textAlign: 'center', padding: '4px 2px', color: 'var(--color-text-muted)' }}>+/-</th>
                                <th scope="col" style={{ textAlign: 'right', padding: '4px 2px', color: 'var(--color-text-muted)' }}>P</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedTeams.map((teamData, tidx) => {
                                const team = typeof teamData === 'string' ? { name: teamData, played: 0, gd: 0, pts: 0 } : teamData;
                                const flagCodes = getFlagCodes(team.name);
                                const rank = tidx + 1;
                                const isQualifiedThird = rank === 3 && qualifiedThirds.includes(team.name);
                                const isFiltered = filterCountries.length > 0 && filterCountries.some(fc => team.name.includes(fc));
                                const isHighlighted = highlightTeams.some(ht => team.name.includes(ht)) || isFiltered;

                                const thirdPlaceTeam = sortedTeams[2];
                                const thirdPlaceTeamName = thirdPlaceTeam ? (typeof thirdPlaceTeam === 'string' ? thirdPlaceTeam : thirdPlaceTeam.name) : null;
                                const thirdPlaceQualifies = thirdPlaceTeamName ? qualifiedThirds.includes(thirdPlaceTeamName) : false;
                                const isLastQualifier = (rank === 2 && !thirdPlaceQualifies) || (rank === 3 && isQualifiedThird);

                                return (
                                    <React.Fragment key={team.name}>
                                        <tr
                                            ref={el => tableRefs.current[team.name] = el}
                                            style={{
                                                backgroundColor: isHighlighted ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
                                                transition: 'background-color 0.2s ease'
                                            }}
                                        >
                                            <td style={{
                                                padding: '6px 2px',
                                                borderTopLeftRadius: isHighlighted ? '10px' : '0',
                                                borderBottomLeftRadius: isHighlighted ? '10px' : '0'
                                            }}>
                                                <div style={{ width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', fontSize: '0.75rem', backgroundColor: 'transparent', color: 'inherit' }}>
                                                    {rank}
                                                </div>
                                            </td>
                                            <td style={{ padding: '6px 2px' }}>
                                                <button
                                                    onClick={() => handleCountryClick(team.name)}
                                                    aria-label={`Visa information om ${team.name}`}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        cursor: 'pointer',
                                                        background: 'none',
                                                        border: 'none',
                                                        padding: 0,
                                                        font: 'inherit',
                                                        color: 'inherit',
                                                        width: '100%',
                                                        textAlign: 'left'
                                                    }}
                                                >
                                                    <FlagBadge codes={flagCodes} name={team.name} size={isInline ? 16 : 20} />
                                                    <span style={{ whiteSpace: 'normal', lineHeight: '1.2' }}>
                                                        <BoldSverige text={team.name} />
                                                    </span>
                                                </button>
                                            </td>
                                            <td style={{ textAlign: 'center', padding: '6px 2px' }}>{team.played}</td>
                                            <td style={{ textAlign: 'center', padding: '6px 2px', color: team.gd > 0 ? '#34c759' : team.gd < 0 ? '#ff3b30' : 'inherit' }}>{team.gd > 0 ? `+${team.gd}` : team.gd}</td>
                                            <td style={{
                                                padding: '6px 2px',
                                                textAlign: 'right',
                                                fontWeight: 'bold',
                                                borderTopRightRadius: isHighlighted ? '10px' : '0',
                                                borderBottomRightRadius: isHighlighted ? '10px' : '0'
                                            }}>{team.pts}</td>
                                        </tr>
                                        {isLastQualifier && (
                                            <tr>
                                                <td colSpan="5" style={{ padding: 0 }}>
                                                    <div style={{ borderTop: '2px solid var(--color-text-muted)', opacity: 0.4, margin: '4px 0' }} />
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </Card>
            </div>
        );
    };

    const formatSwedishDate = (dateStr) => {
        if (!dateStr) return '';
        const match = dateStr.match(/^(\d{1,2})\s+([A-Za-z]+).*?(\(\d+\s+days\))?$/);
        if (!match) return dateStr;

        const day = parseInt(match[1]);
        const monthEng = match[2].toLowerCase();

        const engToSwe = {
            'january': 'januari', 'february': 'februari', 'march': 'mars', 'april': 'april',
            'may': 'maj', 'june': 'juni', 'july': 'juli', 'august': 'augusti',
            'september': 'september', 'october': 'oktober', 'november': 'november', 'december': 'december',
            'jan': 'januari', 'feb': 'februari', 'mar': 'mars', 'apr': 'april',
            'jun': 'juni', 'jul': 'juli', 'aug': 'augusti', 'sep': 'september',
            'oct': 'oktober', 'nov': 'november', 'dec': 'december'
        };

        const monthSwe = engToSwe[monthEng] || monthEng;
        return `${day} ${monthSwe}`;
    };


    const renderAllMatches = () => {
        if (!matchesData) return null;

        const isMatchLiveOrRecentlyFinishedOrSoon = (m, isHeroMatch = false) => {
            if (isHeroMatch) return true;
            if (m.status === 'live') return true;
            if (m.status === 'finished') return true;
            const startMs = m.startTimestamp ? m.startTimestamp * 1000 : parseTournamentDate(m.date, m.time, GROUP_MONTH_MAP).getTime();
            if (m.status === 'upcoming') {
                const timeUntilStart = startMs - Date.now();
                if (timeUntilStart > 0) {
                    if (isHeroMatch && timeUntilStart <= 60 * 60 * 1000) return true;
                    if (!isHeroMatch && timeUntilStart <= 30 * 60 * 1000) return true;
                }
            }
            return false;
        };


        let sortedDates = Object.keys(groupedMatches).sort((a, b) => {
            const dateA = a.replace('_night', '');
            const dateB = b.replace('_night', '');
            const diff = parseTournamentDate(dateA, '00:00', GROUP_MONTH_MAP) - parseTournamentDate(dateB, '00:00', GROUP_MONTH_MAP);
            if (diff !== 0) return diff;
            if (a.includes('_night') && !b.includes('_night')) return -1;
            if (!a.includes('_night') && b.includes('_night')) return 1;
            return 0;
        });

        if (matchStatusFilter === 'played') {
            sortedDates.reverse();
        }

        const ROUND_NAMES = {
            "1/16-final": "Sextondelsfinaler",
            "1/8-final": "Åttondelsfinaler",
            "Kvartsfinal": "Kvartsfinaler",
            "Semifinal": "Semifinaler",
            "Bronsmatch": "Bronsmatch",
            "Final": "Final"
        };

        const roundsData = [];
        let currentRound = null;
        let currentRoundDates = [];

        sortedDates.forEach((date) => {
            const matches = groupedMatches[date];
            const firstMatch = matches[0];
            let roundKey = "Gruppspel";

            if (firstMatch.isKnockout && firstMatch.roundName) {
                roundKey = firstMatch.roundName;
            }

            if (roundKey !== currentRound) {
                if (currentRound !== null) {
                    roundsData.push({ roundKey: currentRound, dates: currentRoundDates });
                }
                currentRound = roundKey;
                currentRoundDates = [date];
            } else {
                currentRoundDates.push(date);
            }
        });

        if (currentRound !== null) {
            roundsData.push({ roundKey: currentRound, dates: currentRoundDates });
        }

        const firstPlayoffIndex = roundsData.findIndex(r => r.roundKey !== "Gruppspel");

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {roundsData.map((roundObj, index) => {
                    const roundHeader = roundObj.roundKey === "Gruppspel" ? "Gruppspel" : (ROUND_NAMES[roundObj.roundKey] || roundObj.roundKey);
                    return (
                        <div key={roundObj.roundKey} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '24px' }}>

                            {roundObj.dates.map((date) => {
                                const matches = groupedMatches[date];
                                return (
                                    <React.Fragment key={date}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {(() => {
                                                let relativeLabel = getRelativeDateLabel(date.replace('_night', ''), GROUP_MONTH_MAP);
                                                if (date.includes('_night') && relativeLabel === 'Imorgon') {
                                                    relativeLabel = 'Inatt';
                                                }
                                                const hasHero = matches.some(m => nextMatches.some(nm => nm.home === m.home && nm.away === m.away && nm.date === m.date && nm.time === m.time));
                                                const isCountdownOrLive = matches.some(m => {
                                                    if (m.status === 'live' || m.status === 'finished') return true;
                                                    const startMs = m.startTimestamp ? m.startTimestamp * 1000 : parseTournamentDate(m.date, m.time, GROUP_MONTH_MAP).getTime();
                                                    return (startMs - Date.now()) <= 60 * 60 * 1000;
                                                });
                                                const hideHeader = (['idag', 'i kväll', 'inatt'].includes(relativeLabel.toLowerCase()) && matches.some(m => isMatchLiveOrRecentlyFinishedOrSoon(m))) || (filterCountries.length === 0 && hasHero && isCountdownOrLive);
                                                if (hideHeader) return null;
                                                return (
                                                    <div style={{
                                                        fontSize: '0.8rem',
                                                        textTransform: 'uppercase',
                                                        paddingLeft: '4px',
                                                        color: 'var(--color-text-muted)',
                                                        letterSpacing: '0.02em',
                                                        marginTop: '8px'
                                                    }}>{relativeLabel}</div>
                                                );
                                            })()}
                                            {(matchStatusFilter === 'played' ? [...matches].reverse() : matches).map((m, i) => {
                                                const matchKey = `${m.home}-${m.away}-${m.date}`;
                                                const isHero = filterCountries.length === 0 && nextMatches.some(nm => nm.home === m.home && nm.away === m.away && nm.date === m.date && nm.time === m.time);

                                                const hasHero = filterCountries.length === 0 && matches.some(mx => nextMatches.some(nm => nm.home === mx.home && nm.away === mx.away && nm.date === mx.date && nm.time === mx.time));
                                                const isFirstNonHero = hasHero && !isHero && i === matches.findIndex(mx => !nextMatches.some(nm => nm.home === mx.home && nm.away === mx.away && nm.date === mx.date && nm.time === mx.time));
                                                let relativeLabel = getRelativeDateLabel(date.replace('_night', ''), GROUP_MONTH_MAP);
                                                if (date.includes('_night') && relativeLabel === 'Imorgon') {
                                                    relativeLabel = 'Inatt';
                                                }

                                                const homeRankVal = getTeamRank(m.realHome || m.home);
                                                const awayRankVal = getTeamRank(m.realAway || m.away);
                                                const isTopMatch = (homeRankVal + awayRankVal) <= 30;
                                                const isBottomMatch = (homeRankVal + awayRankVal) >= 100;
                                                const isSwedenMatch = (m.realHome || m.home) === 'Sverige' || (m.realAway || m.away) === 'Sverige';

                                                let cardClass = '';
                                                let cardStyle = {};
                                                let badgeBg = '';
                                                let badgeText = '';
                                                let badgeColor = '#000';

                                                const showSwedenBadge = isSwedenMatch && filterCountries.length === 0;
                                                const showTopMatchBadge = isTopMatch;

                                                if (showSwedenBadge) {
                                                    cardClass = 'sweden-frame-animated';
                                                    badgeBg = 'linear-gradient(135deg, #005293, #006AA7)';
                                                    badgeColor = '#FECB00';
                                                    badgeText = 'Sverige spelar';
                                                } else if (showTopMatchBadge) {
                                                    cardClass = 'gold-frame-animated';
                                                    badgeBg = 'linear-gradient(135deg, #FFD700, #FDB931)';
                                                    badgeText = 'Supermatch';
                                                }

                                                const isCountdownOrLive2 = matches.some(mx => {
                                                    if (mx.status === 'live' || mx.status === 'finished') return true;
                                                    const startMs = mx.startTimestamp ? mx.startTimestamp * 1000 : parseTournamentDate(mx.date, mx.time, GROUP_MONTH_MAP).getTime();
                                                    return (startMs - Date.now()) <= 60 * 60 * 1000;
                                                });
                                                return (
                                                    <React.Fragment key={i}>
                                                        {filterCountries.length === 0 && isFirstNonHero && isCountdownOrLive2 && (
                                                            <div style={{
                                                                fontSize: '0.8rem',
                                                                textTransform: 'uppercase',
                                                                paddingLeft: '4px',
                                                                color: 'var(--color-text-muted)',
                                                                letterSpacing: '0.02em',
                                                                marginTop: '8px'
                                                            }}>{relativeLabel}</div>
                                                        )}
                                                        <div id={index === firstPlayoffIndex && date === roundObj.dates[0] && i === 0 ? 'playoff-start' : undefined} className={cardClass} style={{ ...cardStyle, position: 'relative', zIndex: 10 }}>
                                                            {badgeText && (
                                                                <div className={showTopMatchBadge ? 'topmatch-badge' : (showSwedenBadge ? 'sweden-badge' : '')} style={{
                                                                    position: 'absolute',
                                                                    top: '-8px',
                                                                    right: '12px',
                                                                    background: badgeBg,
                                                                    color: badgeColor,
                                                                    fontSize: '0.65rem',
                                                                    fontWeight: 'bold',
                                                                    padding: '2px 8px',
                                                                    borderRadius: '8px',
                                                                    zIndex: 10,
                                                                    textTransform: 'uppercase',
                                                                    letterSpacing: '0.05em'
                                                                }}>
                                                                    {badgeText}
                                                                </div>
                                                            )}
                                                            <MatchCard match={m} variant={isHero ? "hero" : undefined} idx={i} filterTeam={filterCountries.length === 1 ? filterCountries[0] : null} isFiltered={filterCountries.length > 0} onCountryClick={handleCountryClick} homeRank={getTeamRank(m.realHome || m.home)} awayRank={getTeamRank(m.realAway || m.away)} onGroupClick={() => handleCardClick(matchKey)} onCardClick={() => handleCardClick(matchKey)} />
                                                        </div>
                                                        {m.group && renderInlineGroupTable(matchKey, m.group, m.realHome || m.home, m.realAway || m.away, isMatchLiveOrRecentlyFinishedOrSoon(m, isHero))}
                                                    </React.Fragment>
                                                );
                                            })}
                                        </div>
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        );
    };



    return (
        <div
            style={{ minHeight: '100vh', paddingBottom: '100px' }}
        >
            {(() => {
                const hasPlayoff = combinedMatches.some(m => m.isKnockout);
                const isVisible = (showScrollTop || hasPlayoff) && filterCountries.length === 0;
                
                return (
                    <button
                        className={`scroll-to-top-btn ${isVisible ? 'visible' : ''}`}
                        onClick={showScrollTop ? scrollToTop : scrollToPlayoff}
                        aria-label={showScrollTop ? "Scrolla till toppen" : "Scrolla till slutspel"}
                    >
                        {showScrollTop ? <ArrowUp size={28} /> : <Trophy size={24} />}
                    </button>
                );
            })()}


            {/* Full-width Sticky Header */}
            <div className={`nav-container ${isScrolled ? 'scrolled' : ''}`} style={{
                backgroundColor: 'var(--color-glass-bg)',
                color: 'var(--color-text)',
                '--active-color': 'var(--color-primary)',
                transition: 'background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease',
                boxShadow: isScrolled ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                justifyContent: 'center'
            }}>
                <div style={{ maxWidth: '600px', width: '100%', display: 'flex', justifyContent: 'center', position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                        <button
                            className="header-logo"
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '8px'
                            }}
                            onClick={() => navigate('/allsvenskan')}
                            aria-label="Gå till Allsvenskan"
                        >
                            <img
                                src="https://upload.wikimedia.org/wikipedia/en/1/17/2026_FIFA_World_Cup_emblem.svg"
                                alt=""
                                aria-hidden="true"
                                style={{
                                    height: '32px',
                                    transition: 'height 0.3s ease'
                                }}
                            />
                            <span style={{
                                fontWeight: 'bold',
                                fontSize: 'clamp(0.9rem, 4vw, 1.2rem)',
                                color: 'var(--color-text)',
                                letterSpacing: '0.02em',
                                fontFamily: 'inherit',
                                whiteSpace: 'nowrap'
                            }}>
                                2026 FIFA World Cup
                            </span>
                        </button>
                    </div>
                    <div style={{
                        position: 'absolute',
                        right: '0',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>

                        {filterCountries.length > 0 && (
                            <div ref={filterRef} style={{ display: 'flex' }}>
                                <button
                                    type="button"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        background: 'transparent',
                                        color: 'inherit',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: '44px',
                                        height: '44px',
                                        padding: 0,
                                        transition: 'all 0.3s ease',
                                        WebkitTapHighlightColor: 'transparent'
                                    }}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setFilterCountries([]);
                                    }}
                                    aria-label="Filtrera länder"
                                    title="Filtrera länder"
                                >
                                    {filterCountries.length === 1 ? (
                                        <div style={{ pointerEvents: 'none', display: 'flex' }}>
                                            <FlagBadge codes={getFlagCodes(filterCountries[0])} name={filterCountries[0]} size={26} />
                                        </div>
                                    ) : filterCountries.length > 1 ? (
                                        <div style={{ position: 'relative', display: 'flex' }}>
                                            <Filter size={24} />
                                            <span style={{
                                                position: 'absolute',
                                                top: '-4px',
                                                right: '-8px',
                                                backgroundColor: 'var(--color-primary)',
                                                color: '#fff',
                                                fontSize: '0.65rem',
                                                fontWeight: 'bold',
                                                width: '16px',
                                                height: '16px',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: '0 0 0 2px var(--color-bg)'
                                            }}>
                                                {filterCountries.length}
                                            </span>
                                        </div>
                                    ) : (
                                        <Filter size={24} />
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>


                {/* Filter removed as per user request */}
            </div>


            {/* Centered Content Container */}
            <div style={{
                maxWidth: '600px',
                margin: '32px auto 0 auto',
                padding: '0 10px'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {/* Removed Upcoming/Played buttons as per request */}

                            {(() => {
                                if (filterCountries.length === 0 || !groupsData?.groups) return null;
                                // We can show tables for all filtered countries' groups, uniquely
                                const renderedGroupNames = new Set();
                                return filterCountries.map(fc => {
                                    const group = groupsData.groups.find(g =>
                                        g.teams.some(t => (typeof t === 'string' ? t : t.name).includes(fc))
                                    );
                                    if (!group || renderedGroupNames.has(group.name)) return null;
                                    renderedGroupNames.add(group.name);
                                    return renderTable(group.name, group.teams, null, 0, filterCountries);
                                }).filter(Boolean);
                            })()}
                            {renderAllMatches()}
                </div>
            </div>
        </div>
    );
};

export default VMKollen;
