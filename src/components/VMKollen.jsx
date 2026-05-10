import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTeamLogo } from '../utils/assets';
import PageHeader from './common/PageHeader';
import Card from './common/Card';
import BoldSverige from './BoldSverige';
import MatchCard from './MatchCard';
import VMBracket from './VMBracket';
import { getFlagCodes } from '../utils/flags';
import FlagBadge from './common/FlagBadge';
import { Calendar, List, BarChart3, Trophy, ChevronUp, ChevronDown, X, Globe, ArrowLeftRight, ArrowUp } from 'lucide-react';
import MuiMenu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';




const SUBTABS = [
    { id: 'matcher', label: 'Matcher', icon: Calendar },
    { id: 'gruppspel', label: 'Grupper', icon: List },
    { id: 'slutspel', label: 'Slutspel', icon: Trophy },
    { id: 'statistik', label: 'Statistik', icon: BarChart3 }
];

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

const parseTournamentDate = (dateStr, timeStr, monthMap = MONTH_MAP) => {
    if (!dateStr) return new Date();
    const parts = dateStr.split(' ');
    const day = parseInt(parts[0]);
    const monthName = parts[1]?.toLowerCase();
    const year = parseInt(parts[2]) || CURRENT_YEAR;

    let hour = 0, minute = 0;
    if (timeStr && timeStr.includes(':')) {
        const [h, m] = timeStr.split(':').map(Number);
        hour = h;
        minute = m;
    }

    return new Date(year, monthMap[monthName] ?? 0, day, hour, minute);
};

const getRelativeDateLabel = (dateStr) => {
    if (!dateStr) return '';
    try {
        const matchDate = parseTournamentDate(dateStr, "12:00", GROUP_MONTH_MAP);
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);
        
        matchDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        tomorrow.setHours(0, 0, 0, 0);
        
        if (matchDate.getTime() === today.getTime()) {
            return "Idag";
        }
        if (matchDate.getTime() === tomorrow.getTime()) {
            return "Imorgon";
        }
    } catch (e) {
        // Fallback
    }
    return dateStr;
};

const getCountryColor = (name) => {
    return '#000000';
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
    const [groupsData, setGroupsData] = useState(null);
    const [matchesData, setMatchesData] = useState(null);
    const [knockoutData, setKnockoutData] = useState(null);
    const [rankingData, setRankingData] = useState(null);
    const [activeTab, setActiveTab] = useState('matcher');
    const [loading, setLoading] = useState(true);
    const [filterCountry, setFilterCountry] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const rankingRefs = React.useRef({});
    const tableRefs = React.useRef({});

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

    const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    const tournamentTeams = React.useMemo(() => {
        if (!groupsData?.groups) return new Set();
        const teams = new Set();
        groupsData.groups.forEach(group => {
            group.teams.forEach(t => teams.add(typeof t === 'string' ? t : t.name));
        });
        return teams;
    }, [groupsData]);



    const handleReset = () => {
        setFilterCountry(null);
        setActiveTab('matcher');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCountryClick = (country) => {
        const cleanName = country.includes('Sverige') ? 'Sverige' : country;
        if (!tournamentTeams.has(cleanName)) return;
        setFilterCountry(prev => prev === cleanName ? null : cleanName);
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
                setGroupsData(gData);
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

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 400);
        };
        window.addEventListener('scroll', handleScroll);
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

        let pool = combinedMatches;
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

            // Skip the matches shown in the "Next Match" cards
            const isHighlighted = nextMatches.some(nm =>
                nm.home === m.home && nm.away === m.away && nm.date === m.date && nm.time === m.time
            );
            if (isHighlighted) return acc;

            if (!acc[m.date]) acc[m.date] = [];
            acc[m.date].push(m);
            return acc;
        }, {});
    }, [combinedMatches, filterCountry, nextMatches, filteredCountryStatus]);

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

    if (loading) return <div style={{ padding: '80px 40px', textAlign: 'center', color: 'var(--color-text-muted)', fontWeight: '600' }}>Laddar...</div>;
    if (!groupsData) return null;

    const renderTable = (groupName, teams, displayName, idx = 0) => {
        const sortedTeams = sortTeams(teams);

        return (
            <div key={groupName} style={{ marginBottom: '32px' }}>
                <div style={{
                    fontSize: '0.8rem',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    paddingLeft: '4px',
                    marginBottom: '12px',
                    color: 'var(--color-text-muted)',
                    letterSpacing: '0.05em'
                }}>
                    <BoldSverige text={displayName || groupName} />
                </div>
                <Card style={{ marginBottom: '0' }}>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 2px', fontSize: '0.9rem' }}>
                        <caption style={{ position: 'absolute', width: '1px', height: '1px', padding: '0', margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', border: '0' }}>
                            Tabell för {displayName || groupName}
                        </caption>
                        <thead>
                            <tr style={{ borderBottom: 'var(--border)' }}>
                                <th scope="col" style={{ textAlign: 'left', padding: '8px 4px', color: 'var(--color-text-muted)', fontWeight: '600', width: '36px' }} aria-label="Position">#</th>
                                <th scope="col" style={{ textAlign: 'left', padding: '8px 4px', color: 'var(--color-text-muted)', fontWeight: '600' }}>LAG</th>
                                <th scope="col" style={{ textAlign: 'center', padding: '8px 4px', color: 'var(--color-text-muted)', fontWeight: '600' }}>M</th>
                                <th scope="col" style={{ textAlign: 'center', padding: '8px 4px', color: 'var(--color-text-muted)', fontWeight: '600' }}>+/-</th>
                                <th scope="col" style={{ textAlign: 'right', padding: '8px 4px', color: 'var(--color-text-muted)', fontWeight: '600' }}>P</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedTeams.map((teamData, tidx) => {
                                const team = typeof teamData === 'string' ? { name: teamData, played: 0, gd: 0, pts: 0 } : teamData;
                                const flagCodes = getFlagCodes(team.name);
                                const rank = tidx + 1;
                                const isQualifiedThird = rank === 3 && qualifiedThirds.includes(team.name);
                                const isFiltered = filterCountry && team.name.includes(filterCountry);

                                return (
                                    <tr
                                        key={team.name}
                                        ref={el => tableRefs.current[team.name] = el}
                                        style={{
                                            backgroundColor: isFiltered ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
                                            transition: 'background-color 0.2s ease'
                                        }}
                                    >
                                    <td style={{ 
                                        padding: '8px 4px',
                                        borderTopLeftRadius: isFiltered ? '10px' : '0',
                                        borderBottomLeftRadius: isFiltered ? '10px' : '0'
                                    }}>
                                        <div style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', fontWeight: '700', fontSize: '0.85rem', backgroundColor: (rank <= 2 || isQualifiedThird) ? 'rgba(52, 199, 89, 0.15)' : 'transparent', color: (rank <= 2 || isQualifiedThird) ? '#34c759' : 'inherit' }}>
                                            {rank}
                                        </div>
                                    </td>
                                    <td style={{ padding: '11px 4px' }}>
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
                                            <FlagBadge codes={flagCodes} name={team.name} size={26} />
                                            <span style={{ fontWeight: '500', whiteSpace: 'normal', lineHeight: '1.2' }}>
                                                <BoldSverige text={team.name} />
                                            </span>
                                        </button>
                                    </td>
                                        <td style={{ padding: '11px 4px', textAlign: 'center' }}>{team.played}</td>
                                        <td style={{ padding: '11px 4px', textAlign: 'center', color: team.gd > 0 ? '#34c759' : team.gd < 0 ? '#ff3b30' : 'inherit' }}>{team.gd > 0 ? `+${team.gd}` : team.gd}</td>
                                        <td style={{
                                            padding: '11px 4px',
                                            textAlign: 'right',
                                            fontWeight: '800',
                                            borderTopRightRadius: isFiltered ? '10px' : '0',
                                            borderBottomRightRadius: isFiltered ? '10px' : '0'
                                        }}>{team.pts}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </Card>
            </div>
        );
    };

    const renderAllMatches = () => {
        if (!matchesData) return null;

        const sortedDates = Object.keys(groupedMatches).sort((a, b) => {
            return parseTournamentDate(a, '00:00', GROUP_MONTH_MAP) - parseTournamentDate(b, '00:00', GROUP_MONTH_MAP);
        });

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {sortedDates.map((date) => {
                    const matches = groupedMatches[date];
                    return (
                        <div key={date} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {(!nextMatches.length || date !== nextMatches[0].date) && (
                                <div style={{
                                    fontSize: '0.8rem',
                                    fontWeight: '800',
                                    textTransform: 'uppercase',
                                    paddingLeft: '4px',
                                    color: 'var(--color-text-muted)',
                                    letterSpacing: '0.02em'
                                }}>{getRelativeDateLabel(date)}</div>
                            )}
                            {matches.map((m, i) => (
                                <MatchCard key={i} match={m} idx={i} onCountryClick={handleCountryClick} />
                            ))}
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderNextMatches = () => {
        if (nextMatches.length === 0) return null;

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
                {nextMatches.map((m, idx) => {
                    const next = {
                        ...m,
                        displayDate: getRelativeDateLabel(m.date).toUpperCase(),
                        type: `VM · ${m.group}`
                    };
                    const homeFlags = getFlagCodes(next.home);
                    const awayFlags = getFlagCodes(next.away);

                    const getBroadcasterUrl = (broadcast) => {
                        if (!broadcast) return null;
                        const b = broadcast.toUpperCase();
                        if (b.includes('SVT')) return 'https://www.svtplay.se/kategori/fotbolls-vm';
                        if (b.includes('TV4')) return 'https://www.tv4play.se/kategorier/fifa-fotbolls-vm-2026';
                        return null;
                    };

                    const handleBroadcastClick = (e) => {
                        const url = getBroadcasterUrl(next.broadcast);
                        if (url) {
                            e.preventDefault();
                            e.stopPropagation();
                            window.open(url, '_blank', 'noopener,noreferrer');
                        }
                    };

                    return (
                        <div key={idx}>
                            <div style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', paddingLeft: '4px', marginBottom: '12px', color: 'var(--color-text-muted)', letterSpacing: '0.05em' }}>
                                {next.displayDate}
                            </div>
                            <Card style={{ position: 'relative', overflow: 'hidden', background: 'var(--color-card-bg-elevated)', border: 'var(--border)' }} padding="28px">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                                    <div
                                        onClick={() => handleCountryClick(next.home)}
                                        style={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                                    >
                                        <FlagBadge codes={homeFlags} name={next.home} size={64} shadow={true} />
                                        <div style={{ fontSize: '1rem', fontWeight: '500' }}><BoldSverige text={next.home} /></div>
                                    </div>
                                    <div
                                        onClick={handleBroadcastClick}
                                        style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: getBroadcasterUrl(next.broadcast) ? 'pointer' : 'default' }}
                                    >
                                        {next.group && (
                                            <div style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: '4px' }}>
                                                {next.group}
                                                {next.isPreliminary && ' (prel.)'}
                                            </div>
                                        )}
                                        <div style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--color-text)', backgroundColor: 'var(--color-surface-subtle)', padding: '6px 14px', borderRadius: '8px', letterSpacing: '-0.02em' }}>
                                            {next.time}
                                        </div>
                                        {next.broadcast && (
                                            <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>
                                                {next.broadcast}
                                            </div>
                                        )}
                                    </div>
                                    <div
                                        onClick={() => handleCountryClick(next.away)}
                                        style={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                                    >
                                        <FlagBadge codes={awayFlags} name={next.away} size={64} shadow={true} />
                                        <div style={{ fontSize: '1rem', fontWeight: '500' }}><BoldSverige text={next.away} /></div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    );
                })}
            </div>
        );
    };

    const formatSwedishDate = (dateStr) => {
        if (!dateStr) return '';
        // Handle "10 June 2026 (46 days)" -> "10 juni (46 dagar)"
        const match = dateStr.match(/^(\d{1,2})\s+([A-Za-z]+).*?(\(\d+\s+days\))?$/);
        if (!match) return dateStr;
        
        const day = parseInt(match[1]);
        const monthEng = match[2].toLowerCase();
        const daysLeft = match[3] ? match[3].replace('days', 'dagar') : '';
        
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
            <div className="nav-container" style={{ '--active-color': getCountryColor(filterCountry) }}>
                <div
                    className="header-logo"
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                    onClick={() => navigate('/allsvenskan')}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src="https://upload.wikimedia.org/wikipedia/en/1/17/2026_FIFA_World_Cup_emblem.svg" alt="VM 2026" style={{ height: '32px' }} />
                        <ArrowLeftRight size={18} color="#aeafb4" />
                    </div>
                </div>

                <div className="segmented-control">
                    <div className="segmented-pill" style={{
                        left: 'var(--pill-padding)',
                        width: `calc((100% - (var(--pill-padding) * 2)) / ${SUBTABS.length})`,
                        transform: `translateX(${SUBTABS.findIndex(t => t.id === activeTab) * 100}%)`
                    }} />
                    {SUBTABS.map(tab => (
                        <button
                            key={tab.id}
                            className={`segmented-button ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => {
                                setActiveTab(tab.id);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                        >
                            <tab.icon size={22} className="tab-icon" />
                            <span className="tab-label">{tab.label}</span>
                        </button>
                    ))}
                </div>

                <div style={{ justifySelf: 'end', display: 'flex', alignItems: 'center' }}>
                    <button
                        onClick={handleMenuClick}
                        className={`sverige-toggle ${filterCountry ? 'active' : ''}`}
                        aria-label="Välj land att filtrera"
                        style={{ height: '100%' }}
                    >
                        {filterCountry ? (
                            <FlagBadge codes={getFlagCodes(filterCountry)} size={24} shadow={false} />
                        ) : (
                            <Globe size={24} color="#8e8e93" strokeWidth={1.5} />
                        )}
                    </button>
                </div>
            </div>
                <MuiMenu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    slotProps={{
                        paper: {
                            style: {
                                maxHeight: 400,
                                width: '280px',
                                borderRadius: '16px',
                                marginTop: '8px',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                                border: '0.5px solid rgba(0,0,0,0.08)',
                                padding: '8px 0'
                            }
                        }
                    }}
                >
                    {filterCountry && (
                        <>
                            <MenuItem 
                                onClick={() => {
                                    setFilterCountry(null);
                                    handleMenuClose();
                                }}
                                style={{ 
                                    fontSize: '0.9rem', 
                                    fontWeight: 700, 
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '12px 16px',
                                    borderRadius: '8px',
                                    margin: '2px 8px',
                                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
                                    color: 'var(--color-text)',
                                    whiteSpace: 'normal',
                                    lineHeight: '1.2'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <FlagBadge codes={getFlagCodes(filterCountry)} size={22} shadow={false} />
                                    <span style={{ flex: 1 }}>{filterCountry}</span>
                                </div>
                                <X size={18} strokeWidth={2.5} />
                            </MenuItem>
                        </>
                    )}
                    {allCountries
                        .filter(c => c !== filterCountry)
                        .map((country) => (
                        <MenuItem 
                            key={country}
                            onClick={() => {
                                handleCountryClick(country);
                                handleMenuClose();
                            }}
                            selected={filterCountry === country}
                            style={{ 
                                fontSize: '0.9rem', 
                                fontWeight: 500,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px 16px',
                                borderRadius: '8px',
                                margin: '2px 8px',
                                whiteSpace: 'normal',
                                lineHeight: '1.2'
                            }}
                        >
                            <FlagBadge codes={getFlagCodes(country)} size={22} shadow={false} />
                            <span style={{ flex: 1 }}>{country}</span>
                        </MenuItem>
                    ))}
                </MuiMenu>



            {/* Centered Content Container */}
            <div style={{ 
                maxWidth: activeTab === 'slutspel' ? '100%' : '600px', 
                margin: '32px auto 0 auto', 
                padding: activeTab === 'slutspel' ? '0' : '0 10px' 
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {activeTab === 'matcher' && (
                        <>
                            {renderNextMatches()}
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
                        />
                    )}
                    {activeTab === 'statistik' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{
                                fontSize: '0.95rem',
                                fontWeight: '800',
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
                                                    <th scope="col" style={{ textAlign: 'left', padding: '8px 4px', color: 'var(--color-text-muted)', fontWeight: '600', width: '40px' }} aria-label="Rank">#</th>
                                                    <th scope="col" style={{ textAlign: 'left', padding: '8px 4px', color: 'var(--color-text-muted)', fontWeight: '600' }}>LAG</th>
                                                    <th scope="col" style={{ textAlign: 'right', padding: '8px 4px', color: 'var(--color-text-muted)', fontWeight: '600' }}>POÄNG</th>
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
                                                                        <div style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', fontWeight: '700', fontSize: '0.85rem' }}>
                                                                            {r.rank}
                                                                        </div>
                                                                        {r.change !== 0 && (
                                                                            <span style={{ 
                                                                                fontSize: '0.7rem', 
                                                                                fontWeight: '800',
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
                                                                <td style={{ padding: '11px 4px' }}>
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
                                                                        <span style={{ fontWeight: '500' }}><BoldSverige text={r.team} /></span>
                                                                    </button>
                                                                </td>
                                                            <td style={{ 
                                                                padding: '11px 4px', 
                                                                textAlign: 'right', 
                                                                fontWeight: '800',
                                                                borderTopRightRadius: isSelected ? '12px' : '0',
                                                                borderBottomRightRadius: isSelected ? '12px' : '0'
                                                            }}>
                                                                {r.points}
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
