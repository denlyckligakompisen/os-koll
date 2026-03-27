import React, { useEffect, useState } from 'react';
import { getTeamLogo } from '../utils/assets';
import PageHeader from './common/PageHeader';
import Card from './common/Card';
import BoldSverige from './BoldSverige';
import MatchCard from './MatchCard';
import { getFlagCodes } from '../utils/flags';
import FlagBadge from './common/FlagBadge';

const SUBTABS = [
    { id: 'matcher', label: 'Matcher' },
    { id: 'gruppspel', label: 'Grupper' },
    { id: 'slutspel', label: 'Slutspel' },
    { id: 'statistik', label: 'Statistik' }
];

const CURRENT_YEAR = 2026;
const MONTH_MAP = { 'jan': 0, 'feb': 1, 'mar': 2, 'mars': 2, 'apr': 3, 'maj': 4, 'jun': 5, 'juni': 5, 'jul': 6, 'juli': 6, 'aug': 7, 'sep': 8, 'okt': 9, 'nov': 10, 'dec': 11 };
const GROUP_MONTH_MAP = { 'juni': 5, 'juli': 6 };

// Utility to parse dates from various JSON formats consistently
const parseTournamentDate = (dateStr, monthMap = MONTH_MAP) => {
    if (!dateStr) return new Date();
    const parts = dateStr.split(' ');
    const day = parseInt(parts[0]);
    const monthName = parts[1]?.toLowerCase();
    const year = parseInt(parts[2]) || CURRENT_YEAR;
    return new Date(year, monthMap[monthName] ?? 0, day);
};

const VMKollen = () => {
    const [data, setData] = useState(null);
    const [groupsData, setGroupsData] = useState(null);
    const [matchesData, setMatchesData] = useState(null);
    const [activeTab, setActiveTab] = useState('matcher');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        Promise.all([
            fetch('/data/vm_playoff.json').then(res => res.json()),
            fetch('/data/worldcup_2026_groups.json').then(res => res.json()),
            fetch('/data/worldcup_2026_matches.json').then(res => res.json())
        ])
        .then(([pData, gData, mData]) => {
            const filteredRounds = pData.rounds.map(round => ({
                ...round,
                matches: round.matches.filter(m => {
                    const mDateStr = m.date || round.date;
                    return parseTournamentDate(mDateStr, MONTH_MAP) >= now;
                })
            })).filter(round => round.matches.length > 0);
            
            const updatedMatches = mData.matches.map((m, idx) => ({ ...m, status: idx === 0 ? 'live' : 'upcoming' }));
            
            const filteredMatches = updatedMatches.filter(m => 
                parseTournamentDate(m.date, GROUP_MONTH_MAP) >= now
            );

            setData({ ...pData, rounds: filteredRounds });
            setGroupsData(gData);
            setMatchesData({ ...mData, matches: filteredMatches });
            setLoading(false);
        })
        .catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, []);

    const groupedMatches = React.useMemo(() => {
        if (!matchesData?.matches) return {};
        return matchesData.matches.reduce((acc, m) => {
            if (!acc[m.date]) acc[m.date] = [];
            acc[m.date].push(m);
            return acc;
        }, {});
    }, [matchesData]);

    if (loading) return <div className="animate-fade-in" style={{ padding: '80px 40px', textAlign: 'center', color: 'var(--color-text-muted)', fontWeight: '600' }}>Laddar...</div>;
    if (!data) return null;

    // Helper: Identify top 8 third-placed teams
    const getQualifiedThirds = () => {
        if (!groupsData?.groups) return [];
        const thirdPlacedTeams = groupsData.groups.map(group => {
            const sorted = [...group.teams].map(t => typeof t === 'string' ? { name: t, played: 0, gd: 0, pts: 0 } : t)
                .sort((a, b) => b.pts - a.pts || b.gd - a.gd || a.name.localeCompare(b.name, 'sv'));
            return sorted[2];
        });
        return thirdPlacedTeams
            .sort((a, b) => b.pts - a.pts || b.gd - a.gd || a.name.localeCompare(b.name, 'sv'))
            .slice(0, 8)
            .map(t => t.name);
    };

    const qualifiedThirds = getQualifiedThirds();

    const renderTable = (groupName, teams, displayName, idx = 0) => {
        const sortedTeams = [...teams].sort((a, b) => {
            const teamA = typeof a === 'string' ? { name: a, pts: 0, gd: 0 } : a;
            const teamB = typeof b === 'string' ? { name: b, pts: 0, gd: 0 } : b;
            return teamB.pts - teamA.pts || teamB.gd - teamA.gd || teamA.name.localeCompare(teamB.name, 'sv');
        });

        return (
            <div key={groupName} style={{ marginBottom: '32px' }}>
                <div className="animate-fade-in" style={{ 
                    fontSize: '0.8rem', 
                    fontWeight: '800', 
                    textTransform: 'uppercase', 
                    paddingLeft: '4px', 
                    marginBottom: '12px', 
                    color: 'var(--color-text-muted)', 
                    letterSpacing: '0.05em',
                    animationDelay: `${idx * 100}ms`,
                    animationFillMode: 'forwards'
                }}>
                    <BoldSverige text={displayName || groupName} />
                </div>
                <Card delay={idx * 100} style={{ marginBottom: '0' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 2px', fontSize: '0.9rem' }}>
                    <thead>
                        <tr style={{ borderBottom: 'var(--border)' }}>
                            {['', 'LAG', 'M', '+/-', 'P'].map((col, i) => (
                                <th key={i} style={{ textAlign: i === 0 || i === 1 ? 'left' : i === 4 ? 'right' : 'center', padding: '8px 4px', color: 'var(--color-text-muted)', fontWeight: '600' }}>{col}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {sortedTeams.map((teamData, idx) => {
                            const team = typeof teamData === 'string' ? { name: teamData, played: 0, gd: 0, pts: 0 } : teamData;
                            const flagCodes = getFlagCodes(team.name);
                            const rank = idx + 1;
                            const isQualifiedThird = rank === 3 && qualifiedThirds.includes(team.name);

                            return (
                                <tr key={team.name} style={{ backgroundColor: team.name.includes('Sverige') ? 'var(--color-highlight-sverige)' : 'transparent' }}>
                                    <td style={{ padding: '8px 4px' }}>
                                        <div style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', fontWeight: '700', fontSize: '0.85rem', backgroundColor: (rank <= 2 || isQualifiedThird) ? 'rgba(52, 199, 89, 0.15)' : 'transparent', color: (rank <= 2 || isQualifiedThird) ? '#34c759' : 'inherit' }}>
                                            {rank}
                                        </div>
                                    </td>
                                    <td style={{ padding: '11px 4px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <FlagBadge codes={flagCodes} name={team.name} size={26} />
                                            <span style={{ fontWeight: team.name.includes('Sverige') ? '600' : '400' }}><BoldSverige text={team.name} /></span>
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

        let matchCount = 0;
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
                        {matches.map((m, i) => {
                            const delay = (matchCount++) * 60 + (groupIdx * 100);
                            return <MatchCard key={i} match={m} idx={i} delay={delay} />;
                        })}
                    </div>
                ))}
            </div>
        );
    };

    const renderSwedenNextMatch = () => {
        const allMatches = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (data?.rounds) {
            data.rounds.forEach(r => {
                r.matches.forEach(m => {
                    if (m.home.includes('Sverige') || m.away.includes('Sverige')) {
                        const mDateStr = m.date || r.date;
                        const cleanDate = mDateStr.replace(/\s*202\d/, '');
                        allMatches.push({ 
                            ...m, 
                            fullDate: parseTournamentDate(mDateStr, MONTH_MAP), 
                            displayDate: cleanDate.toUpperCase(), 
                            type: `${r.name} · ${cleanDate}` 
                        });
                    }
                });
            });
        }

        if (matchesData?.matches) {
            matchesData.matches.forEach(m => {
                if (m.home.includes('Sverige') || m.away.includes('Sverige')) {
                    allMatches.push({ 
                        ...m, 
                        fullDate: parseTournamentDate(m.date, GROUP_MONTH_MAP), 
                        displayDate: m.date.toUpperCase(), 
                        type: `VM · ${m.group}` 
                    });
                }
            });
        }

        const next = allMatches
            .filter(m => m.fullDate >= today)
            .sort((a,b) => a.fullDate - b.fullDate)[0];

        if (!next) return null;

        const homeFlags = getFlagCodes(next.home);
        const awayFlags = getFlagCodes(next.away);

        return (
            <div style={{ marginBottom: '40px' }}>
                <div className="animate-fade-in" style={{ 
                    fontSize: '0.8rem', 
                    fontWeight: '800', 
                    textTransform: 'uppercase', 
                    paddingLeft: '4px', 
                    marginBottom: '12px', 
                    color: 'var(--color-text-muted)', 
                    letterSpacing: '0.05em' 
                }}>
                    {next.displayDate}
                </div>
                <Card delay={80} style={{ position: 'relative', overflow: 'hidden', background: 'var(--color-card-bg-elevated)', border: 'var(--border)' }} padding="28px">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                        <div style={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                            <FlagBadge codes={homeFlags} name={next.home} size={72} shadow={true} />
                            <div style={{ fontSize: '1rem', fontWeight: '900' }}><BoldSverige text={next.home} /></div>
                        </div>
                        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                            {next.broadcast && (
                                <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    {next.broadcast}
                                </div>
                            )}
                            <div style={{ 
                                fontSize: '1.25rem', 
                                fontWeight: '900', 
                                color: 'var(--color-text)', 
                                backgroundColor: 'var(--color-surface-subtle)', 
                                padding: '6px 14px', 
                                borderRadius: '8px',
                                letterSpacing: '-0.02em'
                            }}>
                                {next.time}
                            </div>
                        </div>
                        <div style={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                            <FlagBadge codes={awayFlags} name={next.away} size={72} shadow={true} />
                            <div style={{ fontSize: '1rem', fontWeight: '900' }}><BoldSverige text={next.away} /></div>
                        </div>
                    </div>
                </Card>
            </div>
        );
    };

    return (
        <div style={{ padding: '0 10px', minHeight: '100vh', maxWidth: '600px', margin: '0 auto' }}>
            <PageHeader title={data.tournament} logoSrc={getTeamLogo('FIFA World Cup')} />

            {/* Submenu */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '32px', fontSize: '0.85rem', fontWeight: '700' }}>
                {SUBTABS.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                        background: 'none', border: 'none', color: activeTab === tab.id ? 'var(--color-text)' : 'var(--color-text-muted)',
                        textTransform: 'uppercase', padding: '10px 4px', cursor: 'pointer', transition: 'color 0.2s', position: 'relative',
                        letterSpacing: '0.02em'
                    }}>
                        {tab.label}
                        <div style={{ position: 'absolute', bottom: 0, left: '0', right: '0', transform: `scaleX(${activeTab === tab.id ? 1 : 0})`, transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)', height: '2px', backgroundColor: 'var(--color-text)', borderRadius: '2px' }} />
                    </button>
                ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {activeTab === 'matcher' && (
                    <>
                        {renderSwedenNextMatch()}
                        {renderAllMatches()}
                    </>
                )}
                {activeTab === 'gruppspel' && groupsData?.groups.map((g, i) => renderTable(g.name, g.teams, null, i))}
                {(activeTab === 'slutspel' || activeTab === 'statistik') && (
                    <Card animate={true} delay={50} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '60px 40px' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '8px', color: 'var(--color-text)' }}>Kommer snart</div>
                        <div style={{ fontSize: '0.9rem' }}>Vi uppdaterar med data inför mästerskapet.</div>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default VMKollen;
