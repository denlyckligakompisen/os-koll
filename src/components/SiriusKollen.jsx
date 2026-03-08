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
    const [playoffs, setPlayoffs] = useState(null);
    const [activeComp, setActiveComp] = useState('allsvenskan');

    useEffect(() => {
        const matchesFile = activeComp === 'cup' ? '/data/sirius_matches.json' : '/data/allsvenskan_matches.json';
        const standingsFile = activeComp === 'cup' ? '/data/sirius_standings.json' : '/data/allsvenskan_standings.json';
        const playoffFile = '/data/cup_playoffs.json';

        const fetches = [
            fetch(matchesFile).then(res => res.json()),
            fetch(standingsFile).then(res => res.json())
        ];

        if (activeComp === 'cup') {
            fetches.push(fetch(playoffFile).then(res => res.json()));
        }

        Promise.all(fetches).then(([matchesData, standingsData, playoffData]) => {
            setMatches(matchesData);
            setStandings(standingsData);
            if (playoffData) setPlayoffs(playoffData);
        }).catch(err => console.error('Error fetching Sirius data:', err));
    }, [activeComp]);

    const isCup = activeComp === 'cup';
    let nextMatch = matches.find(m => !m.result);

    // If Cup mode, check for drawn playoff matches or show placeholder
    if (isCup) {
        // First priority: A drawn playoff match from cup_playoffs.json
        const drawnPlayoffMatch = playoffs?.matches?.find(m =>
            (m.home === 'IK Sirius' || m.away === 'IK Sirius') && !m.result
        );

        if (drawnPlayoffMatch) {
            const dateObj = new Date(drawnPlayoffMatch.date);
            nextMatch = {
                home: drawnPlayoffMatch.home,
                away: drawnPlayoffMatch.away,
                date: dateObj.toISOString().split('T')[0],
                time: dateObj.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' }),
                competition: `Svenska Cupen - ${drawnPlayoffMatch.round || 'Slutspel'}`
            };
        } else {
            const today = new Date();
            const kvartsfinalDate = new Date('2026-03-15');

            // If no upcoming drawn matches and group stage matches are finished, show placeholder
            if (!nextMatch || nextMatch.competition.includes('Grp')) {
                if (today < kvartsfinalDate) {
                    nextMatch = {
                        home: 'IK Sirius',
                        away: 'Ej lottat',
                        date: '2026-03-15',
                        time: '17:00 (Tid ej fastställd)',
                        competition: 'Svenska Cupen - Kvartsfinal'
                    };
                }
            }
        }
    }

    let displayedTeams = standings;
    if (activeComp === 'allsvenskan') {
        let processedStandings = [...standings];
        const hasStarted = processedStandings.some(t => t.p > 0);

        if (!hasStarted) {
            processedStandings.sort((a, b) => a.team.localeCompare(b.team, 'sv'));
            processedStandings = processedStandings.map((t, idx) => ({ ...t, rank: idx + 1 }));
        }

        displayedTeams = processedStandings.filter(t => t.rank <= 3 || t.team === 'IK Sirius');
    }
    return (
        <div className="animate-fade-in" style={{ padding: '0 10px' }}>
            <PageHeader
                title="Sirius-kollen"
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

            <div key={activeComp} className="animate-fade-in">
                {/* Next Match Card */}
                {nextMatch && (
                    <Card style={{
                        background: 'linear-gradient(135deg, #003399 0%, #000000 100%)',
                        color: 'white',
                        marginBottom: '24px',
                        boxShadow: '0 10px 25px rgba(0, 51, 153, 0.25)',
                        position: 'relative',
                        overflow: 'hidden',
                        border: 'none'
                    }} padding="24px">
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
                            </div>
                        </div>
                    </Card>
                )}

                {/* Standings Table (Only for Allsvenskan) */}
                {activeComp === 'allsvenskan' && standings.length > 0 && (
                    <Card style={{ marginBottom: '16px' }}>
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
                                            <td style={{ padding: '8px 4px', fontWeight: '500', ...siriusStyle, borderRadius: isSirius ? '10px 0 0 10px' : undefined }}>
                                                <div style={{
                                                    width: '28px',
                                                    height: '28px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    borderRadius: '8px',
                                                    fontWeight: '700',
                                                    fontSize: '0.85rem',
                                                    backgroundColor: (activeComp === 'cup' && idx === 0) ? 'rgba(52, 199, 89, 0.15)' : 'transparent',
                                                    color: (activeComp === 'cup' && idx === 0) ? '#108030' : 'inherit'
                                                }}>
                                                    {team.rank}
                                                </div>
                                            </td>
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
                    }} padding="30px">
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

                {/* Cup Playoff Card */}
                {activeComp === 'cup' && playoffs && (
                    <Card style={{ marginTop: '16px' }} padding="20px">
                        <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '16px', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Kvartsfinaler
                        </h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            {playoffs.groupWinners
                                ?.filter(w => w.isDefinite)
                                .map(winner => (
                                    <div key={winner.team} style={{
                                        display: 'flex', alignItems: 'center', gap: '8px', padding: '10px',
                                        backgroundColor: '#f8f9fa', borderRadius: '8px', fontSize: '0.85rem'
                                    }}>
                                        <img src={getTeamLogo(winner.team)} alt={winner.team} style={{ width: '18px', height: '18px' }} />
                                        <span style={{ fontWeight: '500' }}>{winner.team}</span>
                                    </div>
                                ))}
                        </div>
                    </Card>
                )}

                {/* Cup Schedule & Europa Card */}
                {activeComp === 'cup' && (
                    <>
                        <Card style={{ marginTop: '16px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {CUP_SCHEDULE.map((item, i) => (
                                    <React.Fragment key={item.label}>
                                        {i > 0 && <div style={{ height: '1px', backgroundColor: 'rgba(0,0,0,0.05)' }} />}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px' }}>
                                            <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{item.label}</span>
                                            <span style={{ fontSize: '0.9rem', fontWeight: '400', color: '#666' }}>{item.date}</span>
                                        </div>
                                    </React.Fragment>
                                ))}
                            </div>
                        </Card>

                        <Card style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '20px', justifyContent: 'center', alignItems: 'center' }} padding="30px">
                            <img src={getTeamLogo('Europa League')} alt="UEFA Europa League" style={{ width: '80px', height: 'auto', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))' }} />
                            <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: '1.4', maxWidth: '280px', fontWeight: '500' }}>
                                Vinnaren kvalar till <span style={{ color: '#000', fontWeight: '700' }}>Europa League</span>
                            </div>
                        </Card>
                    </>
                )}
            </div>
        </div>
    );
};

export default SiriusKollen;
