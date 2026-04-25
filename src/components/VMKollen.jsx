import React, { useEffect, useState } from 'react';
import { getTeamLogo } from '../utils/assets';
import PageHeader from './common/PageHeader';
import Card from './common/Card';
import BoldSverige from './BoldSverige';
import MatchCard from './MatchCard';
import { getFlagCodes } from '../utils/flags';
import FlagBadge from './common/FlagBadge';
import VMBracket from './VMBracket';
import { Calendar, List, Trophy, BarChart3 } from 'lucide-react';

const SUBTABS = [
    { id: 'matcher', label: 'Matcher', icon: Calendar },
    { id: 'gruppspel', label: 'Grupper', icon: List },
    { id: 'slutspel', label: 'Slutspel', icon: Trophy },
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
    const [activeTab, setActiveTab] = useState('matcher');
    const [loading, setLoading] = useState(true);
    const [filterCountry, setFilterCountry] = useState(null);

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
        Promise.all([
            fetch(`${DATA_BASE_URL}/worldcup_2026_groups.json`).then(res => res.json()),
            fetch(`${DATA_BASE_URL}/worldcup_2026_matches.json`).then(res => res.json())
        ])
        .then(([gData, mData]) => {
            setGroupsData(gData);
            setMatchesData(mData);
            setLoading(false);
        })
        .catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, []);

    const nextMatches = React.useMemo(() => {
        if (!matchesData?.matches) return [];
        
        let pool = matchesData.matches;
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
        if (!matchesData?.matches) return {};
        return matchesData.matches.reduce((acc, m) => {
            if (filterCountry && !m.home.includes(filterCountry) && !m.away.includes(filterCountry)) return acc;
            
            // Skip the matches shown in the "Next Match" cards
            const isHighlighted = nextMatches.some(nm => 
                nm.home === m.home && nm.away === m.away && nm.date === m.date && nm.time === m.time
            );
            if (isHighlighted) return acc;

            if (!acc[m.date]) acc[m.date] = [];
            acc[m.date].push(m);
            return acc;
        }, {});
    }, [matchesData, filterCountry, nextMatches]);

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
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {Object.entries(groupedMatches).map(([date, matches], groupIdx) => (
                    <div key={date} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ 
                            fontSize: '0.8rem', 
                            fontWeight: '800', 
                            textTransform: 'uppercase', 
                            paddingLeft: '4px',
                            color: 'var(--color-text-muted)',
                            letterSpacing: '0.02em'
                        }}>{date}</div>
                        {matches.map((m, i) => (
                            <MatchCard key={i} match={m} idx={i} onCountryClick={handleCountryClick} />
                        ))}
                    </div>
                ))}
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
                                        style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: getBroadcasterUrl(next.broadcast) ? 'pointer' : 'default' }}
                                    >
                                        {next.broadcast && (
                                            <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                {next.broadcast}
                                            </div>
                                        )}
                                        <div style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--color-text)', backgroundColor: 'var(--color-surface-subtle)', padding: '6px 14px', borderRadius: '8px', letterSpacing: '-0.02em' }}>
                                            {next.time}
                                        </div>
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
            style={{ padding: '0 10px', minHeight: '100vh', maxWidth: '600px', margin: '0 auto', paddingBottom: '100px' }}
        >
            <PageHeader title="VM-kollen" logoSrc={getTeamLogo('FIFA World Cup')} />

            {/* Fynda-style Segmented Control */}
            <div className="nav-container">
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
                    <FlagBadge codes={filterCountry ? getFlagCodes(filterCountry) : ['SE']} size={28} shadow={false} />
                </button>
            </div>

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
                    <VMBracket filterCountry={filterCountry} onCountryClick={handleCountryClick} />
                )}
                {activeTab === 'statistik' && (
                    <Card style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '60px 40px' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '8px', color: 'var(--color-text)' }}>Kommer snart</div>
                        <div style={{ fontSize: '0.9rem' }}>Vi uppdaterar med data inför mästerskapet.</div>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default VMKollen;
