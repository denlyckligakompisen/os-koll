import React, { useEffect, useState } from 'react';
import { getTeamLogo } from '../utils/assets';
import { formatMatchDisplayDate } from '../utils/dateUtils';
import PageHeader from './common/PageHeader';
import Card from './common/Card';

const COMPETITION_TABS = [
    { id: 'allsvenskan', label: 'Allsvenskan' },
    { id: 'cup', label: 'Svenska Cupen' },
];

const CUP_SCHEDULE = [
    { label: 'Kvartsfinal', date: '15 mars' },
    { label: 'Semifinal', date: '22 mars' },
    { label: 'Final', date: '14 maj' },
];

const EU_QUALIFICATIONS = {
    allsvenskan: {
        logo: 'Champions League',
        logo2: 'Conference League',
        description: <>Vinnaren kvalar till <strong>Champions League</strong>,<br />tvåan och trean kvalar till <strong>Conference League</strong></>
    },
    cup: {
        logo: 'Europa League',
        description: <>Vinnaren kvalar till <strong>Europa League</strong></>
    }
};

const SiriusKollen = () => {
    const [matches, setMatches] = useState([]);
    const [standings, setStandings] = useState([]);
    const [activeComp, setActiveComp] = useState('allsvenskan');

    useEffect(() => {
        const matchesFile = activeComp === 'cup' ? '/data/sirius_matches.json' : '/data/allsvenskan_matches.json';
        const standingsFile = activeComp === 'cup' ? '/data/sirius_standings.json' : '/data/allsvenskan_standings.json';

        Promise.all([
            fetch(matchesFile).then(res => res.json()),
            fetch(standingsFile).then(res => res.json())
        ]).then(([matchesData, standingsData]) => {
            setMatches(matchesData);
            setStandings(standingsData);
        }).catch(err => console.error('Error fetching Sirius data:', err));
    }, [activeComp]);

    const nextMatch = matches.find(m => !m.result);

    const displayedTeams = activeComp === 'allsvenskan'
        ? standings.filter(t => t.rank <= 3 || t.team === 'IK Sirius')
        : standings;

    return (
        <div className="animate-fade-in" style={{ padding: '0 10px' }}>
            <PageHeader
                title="Sirius-kollen"
                subtitle="Vägen till Europa 💙🖤"
                logoSrc={getTeamLogo('IK Sirius')}
            />

            {/* Competition Tabs */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '28px',
                fontSize: '0.85rem',
                fontWeight: '700'
            }}>
                {COMPETITION_TABS.map((tab, i) => (
                    <React.Fragment key={tab.id}>
                        {i > 0 && <div style={{ width: '1px', height: '14px', backgroundColor: 'rgba(0,0,0,0.2)', alignSelf: 'center', flexShrink: 0 }} />}
                        <button
                            onClick={() => setActiveComp(tab.id)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: activeComp === tab.id ? '#000' : 'var(--color-text-muted)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                padding: '8px 12px',
                                cursor: 'pointer',
                                transition: 'color 0.2s',
                                position: 'relative'
                            }}
                        >
                            {tab.label}
                            <div style={{
                                position: 'absolute', bottom: 0, left: '50%',
                                transform: `translateX(-50%) scaleX(${activeComp === tab.id ? 1 : 0})`,
                                transition: 'transform 0.25s ease',
                                width: '20px', height: '2px',
                                backgroundColor: '#003399', borderRadius: '2px'
                            }} />
                        </button>
                    </React.Fragment>
                ))}
            </div>

            {/* Next Match Card */}
            {nextMatch && (
                <div style={{
                    background: 'linear-gradient(135deg, #003399 0%, #000000 100%)',
                    borderRadius: '24px',
                    padding: '24px',
                    color: 'white',
                    marginBottom: '24px',
                    boxShadow: '0 10px 25px rgba(0, 51, 153, 0.25)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Subtle stripe pattern */}
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        opacity: 0.1,
                        background: 'repeating-linear-gradient(90deg, transparent, transparent 20px, #fff 20px, #fff 40px)'
                    }} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                            {[nextMatch.home, nextMatch.away].map(team => (
                                <div key={team} style={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ height: '60px', display: 'flex', alignItems: 'center' }}>
                                        <img src={getTeamLogo(team)} alt={team} style={{ height: '100%', width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 4px 12px rgba(255,255,255,0.2))' }} />
                                    </div>
                                    <div style={{ fontSize: '1rem', fontWeight: '800', marginTop: '4px' }}>{team}</div>
                                </div>
                            ))}
                        </div>
                        <div style={{ textAlign: 'center', marginTop: '20px' }}>
                            <div style={{ fontSize: '1.4rem', fontWeight: '700', letterSpacing: '-0.02em' }}>
                                {formatMatchDisplayDate(nextMatch.date)} {nextMatch.time}
                            </div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '4px' }}>
                                {nextMatch.venue || (nextMatch.home === 'IK Sirius' ? 'Studenternas IP' : 'Borta')}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Standings Table */}
            {standings.length > 0 && (
                <Card style={{ marginBottom: '24px' }} animate={false}>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 2px', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '0.5px solid rgba(0,0,0,0.05)' }}>
                                {['#', 'LAG', 'M', '+/-', 'P'].map((col, i) => (
                                    <th key={col} style={{
                                        textAlign: i === 0 || i === 1 ? 'left' : i === 4 ? 'right' : 'center',
                                        padding: '8px 4px',
                                        color: 'var(--color-text-muted)',
                                        fontWeight: '600'
                                    }}>{col}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {displayedTeams.map((team, idx) => {
                                const isSirius = team.team === 'IK Sirius';
                                const siriusStyle = isSirius ? { backgroundColor: 'rgba(0,51,153,0.06)' } : {};
                                return (
                                    <tr key={team.team}>
                                        <td style={{ padding: '11px 4px', fontWeight: '500', ...siriusStyle, borderRadius: isSirius ? '10px 0 0 10px' : undefined }}>{team.rank}</td>
                                        <td style={{ padding: '11px 4px', ...siriusStyle }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <img src={getTeamLogo(team.team)} alt={team.team} style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                                                {team.team}
                                            </div>
                                        </td>
                                        <td style={{ padding: '11px 4px', textAlign: 'center', ...siriusStyle }}>{team.p}</td>
                                        <td style={{ padding: '11px 4px', textAlign: 'center', ...siriusStyle, color: team.gd > 0 ? '#34c759' : team.gd < 0 ? '#ff3b30' : 'inherit' }}>
                                            {team.gd > 0 ? `+${team.gd}` : team.gd}
                                        </td>
                                        <td style={{ padding: '11px 4px', textAlign: 'right', fontWeight: '700', ...siriusStyle, borderRadius: isSirius ? '0 10px 10px 0' : undefined }}>{team.pts}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </Card>
            )}

            {/* European Competition Card */}
            {activeComp === 'allsvenskan' && (
                <Card style={{
                    background: 'linear-gradient(to bottom right, rgba(255,255,255,0.9), rgba(245,250,255,0.9))',
                    display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center'
                }} padding="30px" animate={false}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '48px' }}>
                        <img src={getTeamLogo('Champions League')} alt="UEFA Champions League" style={{ width: '90px', height: 'auto', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))' }} />
                        <img src={getTeamLogo('Conference League')} alt="UEFA Conference League" style={{ width: '100px', height: 'auto', mixBlendMode: 'multiply' }} />
                    </div>
                    <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: '1.4', maxWidth: '280px', fontWeight: '500' }}>
                        Vinnaren kvalar till <span style={{ color: '#000', fontWeight: '700' }}>Champions League</span>,<br />
                        tvåan och trean kvalar till <span style={{ color: '#000', fontWeight: '700' }}>Conference League</span>
                    </div>
                </Card>
            )}

            {/* Cup Playoff & Europa Card */}
            {activeComp === 'cup' && (
                <>
                    <Card style={{ marginTop: '8px' }} animate={false}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {CUP_SCHEDULE.map((item, i) => (
                                <React.Fragment key={item.label}>
                                    {i > 0 && <div style={{ height: '0.5px', backgroundColor: 'rgba(0,0,0,0.05)' }} />}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px' }}>
                                        <span style={{ fontSize: '0.95rem', fontWeight: '500' }}>{item.label}</span>
                                        <span style={{ fontSize: '0.95rem', fontWeight: '400', color: '#000' }}>{item.date}</span>
                                    </div>
                                </React.Fragment>
                            ))}
                        </div>
                    </Card>

                    <Card style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '24px', justifyContent: 'center', alignItems: 'center' }} padding="30px" animate={false}>
                        <img src={getTeamLogo('Europa League')} alt="UEFA Europa League" style={{ width: '100px', height: 'auto', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))' }} />
                        <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: '1.4', maxWidth: '280px', fontWeight: '500' }}>
                            Vinnaren kvalar till <span style={{ color: '#000', fontWeight: '700' }}>Europa League</span>
                        </div>
                    </Card>
                </>
            )}
        </div>
    );
};

export default SiriusKollen;
