import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import Card from './common/Card';
import BoldSverige from './BoldSverige';
import MatchCard from './MatchCard';
import VMBracket from './VMBracket';
import { getFlagCodes } from '../utils/flags';
import FlagBadge from './common/FlagBadge';
import MatchCardSkeleton from './common/MatchCardSkeleton';
import { ChevronUp, ChevronDown, ArrowUp } from 'lucide-react';
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

const sortTeams = (teams) => {
    return [...teams].sort((a, b) => {
        const teamA = typeof a === 'string' ? { name: a, pts: 0, gd: 0 } : a;
        const teamB = typeof b === 'string' ? { name: b, pts: 0, gd: 0 } : b;
        return teamB.pts - teamA.pts || teamB.gd - teamA.gd || teamA.name.localeCompare(teamB.name, 'sv');
    });
};

const VMKollen = () => {
    const navigate = useNavigate();
    const [initialGroupsData, setInitialGroupsData] = useState(null);
    const [matchesData, setMatchesData] = useState(null);
    const [knockoutData, setKnockoutData] = useState(null);
    const [rankingData, setRankingData] = useState(null);
    const [activeTab, setActiveTab] = useState('matcher');
    const [loading, setLoading] = useState(true);
    const [filterCountry, setFilterCountry] = useState(null);

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
                    g.teams[i] = { name: t, played: 0, gd: 0, pts: 0, gf: 0, ga: 0 };
                } else {
                    t.played = 0; t.gd = 0; t.pts = 0; t.gf = 0; t.ga = 0;
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
            }
        });
        
        return newGroupsData;
    }, [initialGroupsData, matchesData]);
    const [expandedMatchId, setExpandedMatchId] = useState(null);
    const rankingRefs = React.useRef({});
    
    const tableRefs = React.useRef({});
    const headerStyle = useMemo(() => getVMHeaderStyle(filterCountry), [filterCountry]);

    // Auto-scroll in stats sub-tabs
    useEffect(() => {
        if (!filterCountry) return;

        setTimeout(() => {
            if (rankingData?.rankings) {
                const target = rankingData.rankings.find(r => r.team.includes(filterCountry));
                if (target && rankingRefs.current[target.team]) {
                    rankingRefs.current[target.team].scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        }, 100);
    }, [filterCountry, rankingData]);

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
        if (filterCountry === cleanName) {
            setFilterCountry(null);
            localStorage.removeItem('os-koll-filter');
        } else {
            setFilterCountry(cleanName);
            localStorage.setItem('os-koll-filter', cleanName);
        }
    };

    useEffect(() => {
        const saved = localStorage.getItem('os-koll-filter');
        if (saved) setFilterCountry(saved);

        const fetchData = async (file) => {
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

        Promise.all([
            fetchData('worldcup_2026_groups.json'),
            fetchData('worldcup_2026_matches.json'),
            fetchData('worldcup_2026_knockout.json').catch(() => null),
            fetchData('fifa_ranking.json').catch(() => null)
        ])
            .then(([gData, mData, kData, rData]) => {
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

                setInitialGroupsData(gData);
                setMatchesData(mData);
                setKnockoutData(kData);
                setRankingData(rData);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });

    }, []);

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
            return m.status !== orig.status || m.score !== orig.score || m.liveCurrentTime !== orig.liveCurrentTime;
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
                pollFifaLive();
            }
        };
        document.addEventListener('visibilitychange', handleVisibility);

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

    useEffect(() => {
        if (filterCountry) localStorage.setItem('os-koll-filter', filterCountry);
        else localStorage.removeItem('os-koll-filter');
    }, [filterCountry]);

    useEffect(() => {
        if (activeTab === 'statistik' && filterCountry && rankingRefs.current[filterCountry]) {
            setTimeout(() => {
                rankingRefs.current[filterCountry].scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        } else if (activeTab === 'gruppspel' && filterCountry && tableRefs.current[filterCountry]) {
            setTimeout(() => {
                tableRefs.current[filterCountry].scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [activeTab, filterCountry]);

    const filteredCountryStatus = React.useMemo(() => {
        if (!groupsData?.groups || !filterCountry) return { groupChar: null, rank: null };
        const group = groupsData.groups.find(g =>
            g.teams.some(t => (typeof t === 'string' ? t : t.name).includes(filterCountry))
        );
        if (!group) return { groupChar: null, rank: null };

        const groupChar = group.name.split(' ')[1];
        const sorted = sortTeams(group.teams);
        const rank = sorted.findIndex(t => (typeof t === 'string' ? t : t.name).includes(filterCountry)) + 1;

        return { groupChar, rank };
    }, [groupsData, filterCountry]);

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
                const sorted = sortTeams(group.teams);
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
                    const sorted = sortTeams(group.teams);
                    const team = sorted[rank - 1];
                    return team ? getAbbr(team.name) : char;
                }
                return char;
            });

            return {
                name: `${label}\n(${abbrs.join('/')})`,
                isPlaceholder: true
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

        let pool = combinedMatches.filter(m => m.status !== 'finished');
        if (filterCountry) {
            pool = pool.filter(m => m.home.includes(filterCountry) || m.away.includes(filterCountry));
        }

        if (pool.length === 0) return [];

        const withDates = pool.map(m => ({
            ...m,
            fullDate: parseTournamentDate(m.date, m.time, GROUP_MONTH_MAP).getTime()
        }));

        const sorted = [...withDates].sort((a, b) => a.fullDate - b.fullDate);
        const earliestTime = sorted[0].fullDate;

        return withDates.filter(m => m.fullDate === earliestTime);
    }, [matchesData, filterCountry]);

    const groupedMatches = React.useMemo(() => {
        if (combinedMatches.length === 0) return {};
        return combinedMatches.reduce((acc, m) => {
            const isCountryPlaceholder = (label) => {
                if (!label || !filteredCountryStatus.groupChar || !filteredCountryStatus.rank) return false;
                const target = `${filteredCountryStatus.rank}${filteredCountryStatus.groupChar}`;
                if (label.includes(target)) return true;
                if (filteredCountryStatus.rank === 3 && label.startsWith('3') && label.includes(filteredCountryStatus.groupChar)) return true;
                return false;
            };

            const isFilterCountryMatch = filterCountry ? (
                (m.home?.includes(filterCountry)) ||
                (m.away?.includes(filterCountry)) ||
                (m.realHome?.includes(filterCountry)) ||
                (m.realAway?.includes(filterCountry)) ||
                isCountryPlaceholder(m.home) ||
                isCountryPlaceholder(m.away)
            ) : true;

            if (filterCountry && !isFilterCountryMatch) return acc;
            
            // Dölj avslutade matcher om inget landfilter är aktivt
            if (!filterCountry && m.status === 'finished') return acc;

            // We no longer skip nextMatches here because they are rendered inline with variant="hero"

            if (!acc[m.date]) acc[m.date] = [];
            acc[m.date].push(m);
            return acc;
        }, {});
    }, [combinedMatches, filterCountry, nextMatches, filteredCountryStatus]);

    const getTeamRank = (teamName) => {
        if (!rankingData?.rankings) return 999;
        const rankObj = rankingData.rankings.find(r => r.team === teamName);
        return rankObj ? parseInt(rankObj.rank, 10) : 999;
    };

    const handleCardClick = (matchId) => {
        setExpandedMatchId(prev => prev === matchId ? null : matchId);
    };

    const renderInlineGroupTable = (matchId, groupName, homeTeam, awayTeam, isLive) => {
        if (!groupsData?.groups) return null;
        if (expandedMatchId !== matchId && !isLive) return null;
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
            const sorted = sortTeams(group.teams);
            return sorted[2];
        });
        return thirdPlacedTeams
            .filter(Boolean)
            .sort((a, b) => b.pts - a.pts || b.gd - a.gd || a.name.localeCompare(b.name, 'sv'))
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
        const sortedTeams = sortTeams(teams);

        return (
            <div key={groupName} style={{ marginBottom: isInline ? '8px' : '32px' }}>
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
                <Card
                    padding="4px 8px"
                    style={{
                        marginBottom: '0',
                        backgroundColor: '#ffffff',
                        boxShadow: 'none'
                    }}
                >
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 2px', fontSize: '0.8rem' }}>
                        <caption style={{ position: 'absolute', width: '1px', height: '1px', padding: '0', margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', border: '0' }}>
                            Tabell för {displayName || groupName}
                        </caption>
                        <thead>
                            <tr style={{ borderBottom: 'var(--border)' }}>
                                <th scope="col" style={{ textAlign: 'left', padding: '4px 2px', color: 'var(--color-text-muted)', width: '36px' }} aria-label="Position"></th>
                                <th scope="col" style={{ textAlign: 'left', padding: '4px 2px', color: 'var(--color-text-muted)', }}>LAND</th>
                                <th scope="col" style={{ textAlign: 'center', padding: '4px 2px', color: 'var(--color-text-muted)', }}>M</th>
                                <th scope="col" style={{ textAlign: 'center', padding: '4px 2px', color: 'var(--color-text-muted)', }}>+/-</th>
                                <th scope="col" style={{ textAlign: 'right', padding: '4px 2px', color: 'var(--color-text-muted)', }}>P</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedTeams.map((teamData, tidx) => {
                                const team = typeof teamData === 'string' ? { name: teamData, played: 0, gd: 0, pts: 0 } : teamData;
                                const flagCodes = getFlagCodes(team.name);
                                const rank = tidx + 1;
                                const isQualifiedThird = rank === 3 && qualifiedThirds.includes(team.name);
                                const isFiltered = filterCountry && team.name.includes(filterCountry);
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
                                                    <FlagBadge codes={flagCodes} name={team.name} size={20} />
                                                    <span style={{ whiteSpace: 'normal', lineHeight: '1.2', fontWeight: isFiltered ? 600 : 'normal' }}>
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

        const sortedDates = Object.keys(groupedMatches).sort((a, b) => {
            return parseTournamentDate(a, '00:00', GROUP_MONTH_MAP) - parseTournamentDate(b, '00:00', GROUP_MONTH_MAP);
        });

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

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {roundsData.map((roundObj) => {
                    const roundHeader = roundObj.roundKey === "Gruppspel" ? "Gruppspel" : (ROUND_NAMES[roundObj.roundKey] || roundObj.roundKey);
                    return (
                        <div key={roundObj.roundKey} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {roundHeader !== "Gruppspel" && (
                                <h2 style={{
                                    position: 'sticky',
                                    top: '63px',
                                    zIndex: 20,
                                    backgroundColor: 'var(--color-bg)',
                                    marginTop: '8px',
                                    marginBottom: '-16px',
                                    padding: '8px 4px',
                                    fontSize: '1.4rem',
                                    fontWeight: '800',
                                    color: 'var(--color-text)',
                                    boxShadow: '0 4px 10px var(--color-bg)'
                                }}>{roundHeader}</h2>
                            )}
                            
                            {roundObj.dates.map((date) => {
                                const matches = groupedMatches[date];
                                return (
                                    <React.Fragment key={date}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {(() => {
                                                const relativeLabel = getRelativeDateLabel(date, GROUP_MONTH_MAP);
                                                const hideHeader = relativeLabel.toLowerCase() === 'idag' && matches.some(m => m.status === 'live');
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
                                            {matches.map((m, i) => {
                                                const matchKey = `${m.home}-${m.away}-${m.date}`;
                                                const isHero = nextMatches.some(nm => nm.home === m.home && nm.away === m.away && nm.date === m.date && nm.time === m.time);
                                                
                                                const homeRankVal = getTeamRank(m.realHome || m.home);
                                                const awayRankVal = getTeamRank(m.realAway || m.away);
                                                const isTopMatch = (homeRankVal + awayRankVal) <= 30;
                                                const isBottomMatch = (homeRankVal + awayRankVal) >= 100;

                                                let cardClass = '';
                                                let cardStyle = {};
                                                let badgeBg = '';
                                                let badgeText = '';
                                                let badgeColor = '#000';

                                                if (isTopMatch && !isHero) {
                                                    cardClass = 'gold-frame-animated';
                                                    badgeBg = 'linear-gradient(135deg, #FFD700, #FDB931)';
                                                    badgeText = 'Toppmatch';
                                                }

                                                return (
                                                    <React.Fragment key={i}>
                                                        <div className={cardClass} style={cardStyle}>
                                                            {badgeText && (
                                                                <div className={isTopMatch && !isHero ? 'topmatch-badge' : ''} style={{
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
                                                            <MatchCard match={m} variant={isHero ? "hero" : undefined} idx={i} filterTeam={filterCountry} onCountryClick={handleCountryClick} homeRank={getTeamRank(m.realHome || m.home)} awayRank={getTeamRank(m.realAway || m.away)} onGroupClick={() => handleCardClick(matchKey)} onCardClick={() => handleCardClick(matchKey)} />
                                                        </div>
                                                        {m.group && renderInlineGroupTable(matchKey, m.group, m.realHome || m.home, m.realAway || m.away, m.status === 'live')}
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
            <button
                className={`scroll-to-top-btn ${showScrollTop ? 'visible' : ''}`}
                onClick={scrollToTop}
                aria-label="Scrolla till toppen"
            >
                <ArrowUp size={28} />
            </button>


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
                    <button
                        className="header-logo"
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'center',
                            padding: 0
                        }}
                        onClick={() => navigate('/allsvenskan')}
                        aria-label="Gå till Allsvenskan"
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <img 
                                    src="https://upload.wikimedia.org/wikipedia/en/1/17/2026_FIFA_World_Cup_emblem.svg" 
                                    alt="" 
                                    aria-hidden="true"
                                    style={{ 
                                        height: isScrolled ? '24px' : '32px',
                                        transition: 'height 0.3s ease'
                                    }} 
                                />
                                <h1 style={{ 
                                    fontSize: isScrolled ? '1rem' : '1.2rem', 
                                    fontWeight: '800', 
                                    letterSpacing: '-0.02em', 
                                    whiteSpace: 'nowrap',
                                    transition: 'font-size 0.3s ease',
                                    margin: 0
                                }}>2026 FIFA World Cup</h1>
                            </div>
                        </div>
                    </button>
                    {filterCountry && (
                        <button
                            type="button"
                            style={{ 
                                position: 'absolute', 
                                right: '10px', 
                                top: '50%', 
                                transform: 'translateY(-50%)', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                cursor: 'pointer', 
                                background: 'transparent', 
                                border: 'none',
                                borderRadius: '50%',
                                width: isScrolled ? '36px' : '44px',
                                height: isScrolled ? '36px' : '44px',
                                padding: 0,
                                transition: 'all 0.3s ease',
                                zIndex: 10,
                                WebkitTapHighlightColor: 'transparent'
                            }}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setFilterCountry(null);
                                localStorage.removeItem('os-koll-filter');
                            }}
                            aria-label="Rensa filter"
                            title="Rensa filter"
                        >
                            <div style={{ pointerEvents: 'none', display: 'flex' }}>
                                <FlagBadge codes={getFlagCodes(filterCountry)} name={filterCountry} size={isScrolled ? 20 : 26} />
                            </div>
                        </button>
                    )}
                </div>


                {/* Filter removed as per user request */}
            </div>


            {/* Centered Content Container */}
            <div style={{
                maxWidth: activeTab === 'slutspel' ? '100%' : '600px',
                margin: '32px auto 0 auto',
                padding: activeTab === 'slutspel' ? '0' : '0 10px'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {activeTab === 'matcher' && (
                        <>
                            {(() => {
                                if (!filterCountry || !groupsData?.groups) return null;
                                const group = groupsData.groups.find(g =>
                                    g.teams.some(t => (typeof t === 'string' ? t : t.name).includes(filterCountry))
                                );
                                if (!group) return null;
                                return renderTable(group.name, group.teams, null, 0, [filterCountry]);
                            })()}
                            {renderAllMatches()}
                        </>
                    )}
                    {activeTab === 'gruppspel' && (
                        <>
                            {groupsData?.groups.map((g, i) => renderTable(g.name, g.teams, null, i))}
                        </>
                    )}
                    {activeTab === 'slutspel' && (
                        <VMBracket
                            filterCountry={filterCountry}
                            onCountryClick={handleCountryClick}
                            liveGroupsData={groupsData}
                        />
                    )}
                    {activeTab === 'statistik' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{
                                fontSize: '0.95rem',
                                textTransform: 'uppercase',
                                paddingLeft: '4px',
                                marginBottom: '4px',
                                color: 'var(--color-text-muted)',
                                letterSpacing: '0.05em'
                            }}>
                                FIFAs världsranking
                            </div>

                            {/* Ranking Sub-page */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {(rankingData?.lastUpdate || rankingData?.nextUpdate) && (
                                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textAlign: 'left', paddingLeft: '4px', display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '8px' }}>
                                        {rankingData.lastUpdate && <div>Senast uppdaterad: {formatSwedishDate(rankingData.lastUpdate)}</div>}
                                        {rankingData.nextUpdate && <div>Nästa uppdatering: {formatSwedishDate(rankingData.nextUpdate)}</div>}
                                    </div>
                                )}
                                <Card style={{ marginBottom: '0' }}>
                                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 2px', fontSize: '0.9rem' }}>
                                        <caption style={{ position: 'absolute', width: '1px', height: '1px', padding: '0', margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', border: '0' }}>
                                            FIFA:s världsranking
                                        </caption>
                                        <thead>
                                            <tr style={{ borderBottom: 'var(--border)' }}>
                                                <th scope="col" style={{ textAlign: 'left', padding: '8px 4px', color: 'var(--color-text-muted)', width: '40px' }} aria-label="Rank">#</th>
                                                <th scope="col" style={{ textAlign: 'left', padding: '8px 4px', color: 'var(--color-text-muted)', }}>LAG</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {rankingData?.rankings?.map((r, i) => {
                                                const isTournamentTeam = tournamentTeams.has(r.team);
                                                const isSelected = filterCountry && r.team.includes(filterCountry);
                                                return (
                                                    <tr
                                                        key={i}
                                                        ref={el => rankingRefs.current[r.team] = el}
                                                        style={{
                                                            backgroundColor: isSelected ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
                                                            opacity: isTournamentTeam ? 1 : 0.6,
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                    >
                                                        <td style={{
                                                            padding: '8px 4px',
                                                            borderTopLeftRadius: isSelected ? '12px' : '0',
                                                            borderBottomLeftRadius: isSelected ? '12px' : '0'
                                                        }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                <div style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', fontSize: '0.85rem' }}>
                                                                    {r.rank}
                                                                </div>
                                                                {r.change !== 0 && (
                                                                    <span style={{
                                                                        fontSize: '0.7rem',
                                                                        color: r.change > 0 ? '#34c759' : '#ff3b30',
                                                                        backgroundColor: r.change > 0 ? 'rgba(52, 199, 89, 0.1)' : 'rgba(255, 59, 48, 0.1)',
                                                                        padding: '2px 5px',
                                                                        borderRadius: '4px',
                                                                        display: 'inline-flex',
                                                                        alignItems: 'center',
                                                                        gap: '1px'
                                                                    }}>
                                                                        {r.change > 0 ? <ChevronUp size={12} strokeWidth={3} /> : <ChevronDown size={12} strokeWidth={3} />}
                                                                        {Math.abs(r.change)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td style={{
                                                            padding: '11px 4px',
                                                            borderTopRightRadius: isSelected ? '12px' : '0',
                                                            borderBottomRightRadius: isSelected ? '12px' : '0'
                                                        }}>
                                                            <button
                                                                aria-label={isTournamentTeam ? `Visa information om ${r.team}` : r.team}
                                                                disabled={!isTournamentTeam}
                                                                style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '8px',
                                                                    cursor: isTournamentTeam ? 'pointer' : 'default',
                                                                    background: 'none',
                                                                    border: 'none',
                                                                    padding: 0,
                                                                    font: 'inherit',
                                                                    color: 'inherit',
                                                                    width: '100%',
                                                                    textAlign: 'left'
                                                                }}
                                                                onClick={() => isTournamentTeam && handleCountryClick(r.team)}
                                                            >
                                                                <FlagBadge codes={getFlagCodes(r.team)} name={r.team} size={26} />
                                                                <span style={{ fontWeight: isSelected ? 600 : 'normal' }}><BoldSverige text={r.team} /></span>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </Card>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default VMKollen;
