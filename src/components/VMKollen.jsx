import React, { useEffect, useState } from 'react';
import { getTeamLogo } from '../utils/assets';
import PageHeader from './common/PageHeader';
import Card from './common/Card';
import BoldSverige from './BoldSverige';
import MatchCard from './MatchCard';
import { getFlagCodes } from '../utils/flags';
import FlagBadge from './common/FlagBadge';
import { Calendar, List, BarChart3 } from 'lucide-react';

const SUBTABS = [
    { id: 'matcher', label: 'Matcher', icon: Calendar },
    { id: 'gruppspel', label: 'Grupper', icon: List },
    { id: 'statistik', label: 'Statistik', icon: BarChart3 }
];

const CURRENT_YEAR = 2026;
const MONTH_MAP = { 'jan': 0, 'feb': 1, 'mar': 2, 'mars': 2, 'apr': 3, 'maj': 4, 'jun': 5, 'juni': 5, 'jul': 6, 'juli': 6, 'aug': 7, 'sep': 8, 'okt': 9, 'nov': 10, 'dec': 11 };
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

const getCountryColor = (name) => {
    return '#000000';
};

const TEAM_ABBR = {
    'Sverige': 'SWE', 'Mexiko': 'MEX', 'USA': 'USA', 'Kanada': 'CAN', 'Brasilien': 'BRA',
    'Bosnien och Hercegovina': 'BIH', 'Grekland': 'GRE', 'Tjeckien': 'CZE', 'Nederländerna': 'NED',
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
    const [groupsData, setGroupsData] = useState(null);
    const [matchesData, setMatchesData] = useState(null);
    const [knockoutData, setKnockoutData] = useState(null);
    const [rankingData, setRankingData] = useState(null);
    const [activeTab, setActiveTab] = useState('matcher');
    const [loading, setLoading] = useState(true);
    const [filterCountry, setFilterCountry] = useState(null);
    const rankingRefs = React.useRef({});

    // Swipe navigation logic
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    const minSwipeDistance = 50;

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe || isRightSwipe) {
            const currentIndex = SUBTABS.findIndex(t => t.id === activeTab);
            let nextIndex = currentIndex;
            if (isLeftSwipe && currentIndex < SUBTABS.length - 1) {
                nextIndex = currentIndex + 1;
            } else if (isRightSwipe && currentIndex > 0) {
                nextIndex = currentIndex - 1;
            }
            if (nextIndex !== currentIndex) {
                setActiveTab(SUBTABS[nextIndex].id);
            }
        }
    };

    const handleCountryClick = (country) => {
        // Handle "Sverige" specifically if it's part of a string but we want the clear name
        const cleanName = country.includes('Sverige') ? 'Sverige' : country;
        setFilterCountry(prev => prev === cleanName ? null : cleanName);
    };

    useEffect(() => {
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
        if (activeTab === 'statistik' && filterCountry && rankingRefs.current[filterCountry]) {
            setTimeout(() => {
                rankingRefs.current[filterCountry].scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
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
                        isPreliminary: homeInfo.isPlaceholder || awayInfo.isPlaceholder,
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
        const hasFilterCountry = filterCountry ? sortedTeams.some(t => (typeof t === 'string' ? t : t.name).includes(filterCountry)) : true;
        
        if (filterCountry && !hasFilterCountry) return null;

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
                    <thead>
                        <tr style={{ borderBottom: 'var(--border)' }}>
                            {['#', 'LAG', 'M', '+/-', 'P'].map((col, i) => (
                                <th key={i} style={{ textAlign: i === 0 || i === 1 ? 'left' : i === 4 ? 'right' : 'center', padding: '8px 4px', color: 'var(--color-text-muted)', fontWeight: '600' }}>{col}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {sortedTeams.map((teamData, tidx) => {
                            const team = typeof teamData === 'string' ? { name: teamData, played: 0, gd: 0, pts: 0 } : teamData;
                            const flagCodes = getFlagCodes(team.name);
                            const rank = tidx + 1;
                            const isQualifiedThird = rank === 3 && qualifiedThirds.includes(team.name);
                            const isSverige = team.name.includes('Sverige');

                            return (
                                <tr key={team.name} style={{ backgroundColor: isSverige ? 'var(--color-highlight-sverige)' : 'transparent' }}>
                                    <td style={{ padding: '8px 4px' }}>
                                        <div style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', fontWeight: '700', fontSize: '0.85rem', backgroundColor: (rank <= 2 || isQualifiedThird) ? 'rgba(52, 199, 89, 0.15)' : 'transparent', color: (rank <= 2 || isQualifiedThird) ? '#34c759' : 'inherit' }}>
                                            {rank}
                                        </div>
                                    </td>
                                    <td style={{ padding: '11px 4px' }}>
                                        <div 
                                            onClick={() => handleCountryClick(team.name)}
                                            style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                                        >
                                            <FlagBadge codes={flagCodes} name={team.name} size={26} />
                                            <span style={{ fontWeight: '500' }}><BoldSverige text={team.name} /></span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '11px 4px', textAlign: 'center' }}>{team.played}</td>
                                    <td style={{ padding: '11px 4px', textAlign: 'center', color: team.gd > 0 ? '#34c759' : team.gd < 0 ? '#ff3b30' : 'inherit', fontWeight: '600' }}>{team.gd > 0 ? `+${team.gd}` : team.gd}</td>
                                    <td style={{ padding: '11px 4px', textAlign: 'right', fontWeight: '800' }}>{team.pts}</td>
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
                                }}>{date}</div>
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
                        displayDate: m.date.toUpperCase(), 
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
                                        <FlagBadge codes={homeFlags} name={next.home} size={72} shadow={true} />
                                        <div style={{ fontSize: '1rem', fontWeight: '500' }}><BoldSverige text={next.home} /></div>
                                    </div>
                                    <div 
                                        onClick={handleBroadcastClick}
                                        style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: getBroadcasterUrl(next.broadcast) ? 'pointer' : 'default' }}
                                    >
                                        {next.broadcast && (
                                            <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                {next.broadcast}
                                            </div>
                                        )}
                                        <div style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--color-text)', backgroundColor: 'var(--color-surface-subtle)', padding: '6px 14px', borderRadius: '8px', letterSpacing: '-0.02em' }}>
                                            {next.time}
                                        </div>
                                        {next.group && (
                                            <div style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.02em', marginTop: '4px' }}>
                                                {next.group}
                                                {next.isPreliminary && ' (prel.)'}
                                            </div>
                                        )}
                                    </div>
                                    <div 
                                        onClick={() => handleCountryClick(next.away)}
                                        style={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                                    >
                                        <FlagBadge codes={awayFlags} name={next.away} size={72} shadow={true} />
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

    return (
        <div 
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            style={{ minHeight: '100vh', paddingBottom: '100px' }}
        >
            {/* Full-width Sticky Header */}
            <div className="nav-container" style={{ '--active-color': getCountryColor(filterCountry) }}>
                <a 
                    href="https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="header-logo"
                >
                    <img src={getTeamLogo('FIFA World Cup')} alt="VM 2026" />
                </a>

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
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <tab.icon size={18} className="tab-icon" />
                            <span className="tab-label">{tab.label}</span>
                        </button>
                    ))}
                </div>

                <button 
                    onClick={() => {
                        if (filterCountry) setFilterCountry(null);
                        else handleCountryClick('Sverige');
                    }}
                    className={`sverige-toggle ${filterCountry ? 'active' : ''}`}
                    aria-label={filterCountry ? `Rensa filter för ${filterCountry}` : "Visa endast Sverige"}
                >
                    <FlagBadge codes={filterCountry ? getFlagCodes(filterCountry) : ['SE']} size={24} shadow={false} />
                </button>
            </div>

            {/* Centered Content Container */}
            <div style={{ maxWidth: '600px', margin: '32px auto 0 auto', padding: '0 10px' }}>
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
                    {activeTab === 'statistik' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', paddingLeft: '4px', marginBottom: '4px', color: 'var(--color-text-muted)', letterSpacing: '0.05em' }}>
                                FIFA Världsranking
                            </div>
                            <Card style={{ padding: '0', overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                    <thead style={{ backgroundColor: 'rgba(0,0,0,0.02)', borderBottom: 'var(--border)' }}>
                                        <tr>
                                            <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--color-text-muted)', fontWeight: '600', width: '60px' }}>RANK</th>
                                            <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--color-text-muted)', fontWeight: '600' }}>LAG</th>
                                            <th style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--color-text-muted)', fontWeight: '600' }}>POÄNG</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rankingData?.rankings?.map((r, i) => {
                                            const isSelected = filterCountry && r.team.includes(filterCountry);
                                            return (
                                                <tr 
                                                    key={i} 
                                                    ref={el => rankingRefs.current[r.team] = el}
                                                    style={{ 
                                                        borderBottom: 'var(--border)', 
                                                        backgroundColor: isSelected ? 'rgba(0, 122, 255, 0.1)' : 'transparent',
                                                        transition: 'background-color 0.3s ease'
                                                    }}
                                                >
                                                    <td style={{ padding: '12px 16px', fontWeight: '700', color: isSelected ? 'var(--color-primary)' : 'inherit' }}>{r.rank}</td>
                                                    <td style={{ padding: '12px 16px' }}>
                                                        <div 
                                                            style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                                                            onClick={() => handleCountryClick(r.team)}
                                                        >
                                                            <FlagBadge codes={getFlagCodes(r.team)} name={r.team} size={20} />
                                                            <span style={{ fontWeight: isSelected ? '700' : '500' }}>
                                                                <BoldSverige text={r.team} />
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--color-text-muted)', fontVariantNumeric: 'tabular-nums' }}>{r.points}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </Card>
                            {rankingData?.lastUpdated && (
                                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '8px' }}>
                                    Senast uppdaterad: {new Date(rankingData.lastUpdated).toLocaleDateString('sv-SE')}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VMKollen;
