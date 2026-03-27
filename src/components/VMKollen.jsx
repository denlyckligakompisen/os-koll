import React, { useEffect, useState } from 'react';
import { getTeamLogo } from '../utils/assets';
import PageHeader from './common/PageHeader';
import Card from './common/Card';
import BoldSverige from './BoldSverige';
import Countdown from './Countdown';
import MatchCard from './MatchCard';
import { getFlagCodes, flagUrl } from '../utils/flags';

const SUBTABS = [
    { id: 'matcher', label: 'Matcher' },
    { id: 'gruppspel', label: 'Grupper' },
    { id: 'slutspel', label: 'Slutspel' },
    { id: 'statistik', label: 'Statistik' }
];

const VMKollen = () => {
    const [data, setData] = useState(null);
    const [groupsData, setGroupsData] = useState(null);
    const [matchesData, setMatchesData] = useState(null);
    const [activeTab, setActiveTab] = useState('matcher');

    useEffect(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        // Utility to parse dates from the various JSON formats
        const parseTournamentDate = (dateStr, monthMap) => {
            const parts = dateStr.split(' ');
            const day = parseInt(parts[0]);
            const monthName = parts[1]?.toLowerCase();
            const year = parseInt(parts[2]) || 2026;
            return new Date(year, monthMap[monthName] ?? 0, day);
        };

        const playoffMonthMap = { 'jan': 0, 'feb': 1, 'mar': 2, 'mars': 2, 'apr': 3, 'maj': 4, 'jun': 5, 'juni': 5, 'jul': 6, 'juli': 6, 'aug': 7, 'sep': 8, 'okt': 9, 'nov': 10, 'dec': 11 };
        const groupMonthMap = { 'juni': 5, 'juli': 6 };

        // 1. Fetch Playoff Data
        fetch('/data/vm_playoff.json')
            .then(res => res.json())
            .then(pData => {
                const filteredRounds = pData.rounds.map(round => ({
                    ...round,
                    matches: round.matches.filter(m => {
                        const mDateStr = m.date || round.date;
                        if (!mDateStr) return true;
                        return parseTournamentDate(mDateStr, playoffMonthMap) >= now;
                    })
                })).filter(round => round.matches.length > 0);
                setData({ ...pData, rounds: filteredRounds });
            })
            .catch(console.error);

        // 2. Fetch Groups Data
        fetch('/data/worldcup_2026_groups.json')
            .then(res => res.json())
            .then(setGroupsData)
            .catch(console.error);

        // 3. Fetch Matches Data
        fetch('/data/worldcup_2026_matches.json')
            .then(res => res.json())
            .then(mData => {
                const filteredMatches = mData.matches.filter(m => 
                    parseTournamentDate(m.date, groupMonthMap) >= now
                );
                setMatchesData({ ...mData, matches: filteredMatches });
            })
            .catch(console.error);
    }, []);

    if (!data) return <div style={{ padding: '40px', textAlign: 'center' }}>Laddar...</div>;

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

    const renderTable = (groupName, teams, displayName) => {
        const sortedTeams = [...teams].sort((a, b) => {
            const teamA = typeof a === 'string' ? { name: a, pts: 0, gd: 0 } : a;
            const teamB = typeof b === 'string' ? { name: b, pts: 0, gd: 0 } : b;
            return teamB.pts - teamA.pts || teamB.gd - teamA.gd || teamA.name.localeCompare(teamB.name, 'sv');
        });

        return (
            <Card key={groupName} style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                    <BoldSverige text={displayName || groupName} />
                </div>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 2px', fontSize: '0.9rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '0.5px solid rgba(0,0,0,0.05)' }}>
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
                                <tr key={team.name} style={{ backgroundColor: team.name.includes('Sverige') ? 'rgba(254, 204, 0, 0.05)' : 'transparent' }}>
                                    <td style={{ padding: '8px 4px' }}>
                                        <div style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', fontWeight: '700', fontSize: '0.85rem', backgroundColor: (rank <= 2 || isQualifiedThird) ? 'rgba(52, 199, 89, 0.15)' : 'transparent', color: (rank <= 2 || isQualifiedThird) ? '#248a3d' : 'inherit' }}>
                                            {rank}
                                        </div>
                                    </td>
                                    <td style={{ padding: '11px 4px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                                {flagCodes.map((code, fIdx) => (
                                                    <img key={fIdx} src={flagUrl(code)} alt="" width={22} height={22} style={{ borderRadius: '50%', objectFit: 'cover', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                                                ))}
                                            </div>
                                            <span style={{ fontWeight: team.name.includes('Sverige') ? '600' : '400' }}><BoldSverige text={team.name} /></span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '11px 4px', textAlign: 'center' }}>{team.played}</td>
                                    <td style={{ padding: '11px 4px', textAlign: 'center', color: team.gd > 0 ? '#34c759' : team.gd < 0 ? '#ff3b30' : 'inherit' }}>{team.gd > 0 ? `+${team.gd}` : team.gd}</td>
                                    <td style={{ padding: '11px 4px', textAlign: 'right', fontWeight: '700' }}>{team.pts}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </Card>
        );
    };

    const renderAllMatches = () => {
        if (!matchesData) return null;
        const grouped = matchesData.matches.reduce((acc, m) => {
            if (!acc[m.date]) acc[m.date] = [];
            acc[m.date].push(m);
            return acc;
        }, {});

        return (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {Object.entries(grouped).map(([date, matches]) => (
                    <div key={date} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', paddingLeft: '4px' }}>{date}</div>
                        {matches.map((m, i) => <MatchCard key={i} match={m} idx={i} />)}
                    </div>
                ))}
            </div>
        );
    };

    const renderSwedenNextMatch = () => {
        const allMatches = [];
        const playoffMonthMap = { 'mars': 2, 'juni': 5 };
        const groupMonthMap = { 'juni': 5, 'juli': 6 };

        if (data?.rounds) {
            data.rounds.forEach(r => {
                r.matches.forEach(m => {
                    if (m.home.includes('Sverige') || m.away.includes('Sverige')) {
                        const mDateStr = m.date || r.date;
                        const [day, mName] = mDateStr.split(' ');
                        allMatches.push({ ...m, fullDate: new Date(2026, playoffMonthMap[mName.toLowerCase()] || 2, parseInt(day)), displayDate: mDateStr.toUpperCase(), type: `VM-kval · ${r.name}` });
                    }
                });
            });
        }

        if (matchesData?.matches) {
            matchesData.matches.forEach(m => {
                if (m.home.includes('Sverige') || m.away.includes('Sverige')) {
                    const [day, mName] = m.date.split(' ');
                    allMatches.push({ ...m, fullDate: new Date(2026, groupMonthMap[mName.toLowerCase()] || 5, parseInt(day)), displayDate: m.date.toUpperCase(), type: `VM · ${m.group}` });
                }
            });
        }

        const next = allMatches
            .filter(m => m.fullDate >= new Date().setHours(0,0,0,0))
            .sort((a,b) => a.fullDate - b.fullDate)[0];

        if (!next) return null;

        const homeFlags = getFlagCodes(next.home);
        const awayFlags = getFlagCodes(next.away);

        return (
            <div style={{ marginBottom: '32px' }}>
                <Card style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)', border: '2px solid #fecc00' }} padding="28px">
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#005293', backgroundColor: 'rgba(0, 82, 147, 0.05)', padding: '4px 10px', borderRadius: '20px' }}>
                            {next.type} — {next.displayDate.replace(/\s*202\d/, '')}
                        </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                            <div style={{ display: 'flex', gap: '4px' }}>
                                {homeFlags.map((c, i) => <img key={i} src={flagUrl(c)} alt="" style={{ width: homeFlags.length > 1 ? '40px' : '64px', height: homeFlags.length > 1 ? '40px' : '64px', borderRadius: '50%', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />)}
                            </div>
                            <div style={{ fontSize: '1rem', fontWeight: '900' }}><BoldSverige text={next.home} /></div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: '900', background: '#fecc00', padding: '4px 12px', borderRadius: '8px' }}>{next.time}</div>
                        </div>
                        <div style={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                            <div style={{ display: 'flex', gap: '4px' }}>
                                {awayFlags.map((c, i) => <img key={i} src={flagUrl(c)} alt="" style={{ width: awayFlags.length > 1 ? '40px' : '64px', height: awayFlags.length > 1 ? '40px' : '64px', borderRadius: '50%', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />)}
                            </div>
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
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '28px', fontSize: '0.8rem', fontWeight: '700' }}>
                {SUBTABS.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                        background: 'none', border: 'none', color: activeTab === tab.id ? '#000' : 'var(--color-text-muted)',
                        textTransform: 'uppercase', padding: '8px', cursor: 'pointer', transition: 'color 0.2s', position: 'relative'
                    }}>
                        {tab.label}
                        <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: `translateX(-50%) scaleX(${activeTab === tab.id ? 1 : 0})`, transition: 'transform 0.25s', width: '16px', height: '2px', backgroundColor: '#000' }} />
                    </button>
                ))}
            </div>

            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {activeTab === 'matcher' && (
                    <>
                        {renderSwedenNextMatch()}
                        <Countdown />
                        {renderAllMatches()}
                    </>
                )}
                {activeTab === 'gruppspel' && groupsData?.groups.map(g => renderTable(g.name, g.teams))}
                {(activeTab === 'slutspel' || activeTab === 'statistik') && (
                    <Card style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '40px' }}>Kommer snart</Card>
                )}
            </div>
        </div>
    );
};

export default VMKollen;
