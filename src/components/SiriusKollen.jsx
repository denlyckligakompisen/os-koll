import React, { useEffect, useState, useRef } from 'react';
import { getTeamLogo } from '../utils/assets';
import { formatMatchDisplayDate } from '../utils/dateUtils';
import PageHeader from './common/PageHeader';
import Card from './common/Card';

const COMPETITION_TABS = [
    { id: 'allsvenskan', label: 'Allsvenskan' },
    { id: 'cup', label: 'Svenska Cupen' },
    { id: 'statistik', label: 'Statistik' },
];

const CUP_SCHEDULE = [
    { label: 'Kvartsfinaler', date: '15 mars' },
    { label: 'Semifinaler', date: '22 mars' },
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
    const [activeComp, setActiveComp] = useState('cup');
    const touchStart = useRef(null);
    const touchEnd = useRef(null);

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
    // Minimum distance for a swipe to be recognized
    const minSwipeDistance = 50;

    const onTouchStart = (e) => {
        if (!e.touches[0]) return;
        touchEnd.current = null;
        touchStart.current = e.touches[0].clientX;
    };

    const onTouchMove = (e) => {
        if (!e.touches[0]) return;
        touchEnd.current = e.touches[0].clientX;
    };

    const onTouchEnd = () => {
        if (touchStart.current === null || touchEnd.current === null) return;
        const distance = touchStart.current - touchEnd.current;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe || isRightSwipe) {
            const currentIndex = COMPETITION_TABS.findIndex(tab => tab.id === activeComp);
            if (isLeftSwipe && currentIndex < COMPETITION_TABS.length - 1) {
                setActiveComp(COMPETITION_TABS[currentIndex + 1].id);
            } else if (isRightSwipe && currentIndex > 0) {
                setActiveComp(COMPETITION_TABS[currentIndex - 1].id);
            }
        }
    };

    return (
        <div
            className="animate-fade-in"
            style={{ padding: '0 10px', minHeight: 'calc(100vh - 120px)', touchAction: 'pan-y' }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
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
                {nextMatch && activeComp !== 'statistik' && (
                    <>
                        <div style={{ 
                            fontSize: '0.8rem', 
                            fontWeight: '700', 
                            color: 'var(--color-text-muted)', 
                            marginBottom: '10px', 
                            paddingLeft: '4px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.02em'
                        }}>
                            {formatMatchDisplayDate(nextMatch.date)}
                        </div>
                        <Card style={{
                            marginBottom: '16px',
                            position: 'relative',
                            overflow: 'hidden',
                        }} padding="24px">
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                                    {/* Home Team */}
                                    <div style={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ height: '56px', display: 'flex', alignItems: 'center' }}>
                                            <img src={getTeamLogo(nextMatch.home)} alt={nextMatch.home} style={{ height: '100%', width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }} />
                                        </div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--color-text)' }}>{nextMatch.home}</div>
                                    </div>

                                    {/* Match Time */}
                                    <div style={{ 
                                        padding: '0 10px',
                                        textAlign: 'center',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <div style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
                                            {nextMatch.time && nextMatch.time !== '00:00' ? nextMatch.time : '--:--'}
                                        </div>
                                    </div>

                                    {/* Away Team */}
                                    <div style={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ height: '56px', display: 'flex', alignItems: 'center' }}>
                                            <img src={getTeamLogo(nextMatch.away)} alt={nextMatch.away} style={{ height: '100%', width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }} />
                                        </div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--color-text)' }}>{nextMatch.away}</div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Potential Semi-final Card */}
                        {activeComp === 'cup' && (
                            <div style={{ marginBottom: '16px' }}>
                                <div style={{ 
                                    fontSize: '0.8rem', 
                                    fontWeight: '700', 
                                    color: 'var(--color-text-muted)', 
                                    marginBottom: '10px', 
                                    paddingLeft: '4px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.02em'
                                }}>
                                    SÖNDAG 22 MARS
                                </div>
                                <Card style={{
                                    position: 'relative',
                                    overflow: 'hidden',
                                    backgroundColor: 'rgba(255,255,255,0.7)',
                                    opacity: 0.8
                                }} padding="24px">
                                    <div style={{ position: 'relative', zIndex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                                            {/* Hammarby/DIF */}
                                            <div style={{ flex: 1, textAlign: 'center' }}>
                                                <div style={{ height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                    <img src={getTeamLogo('Hammarby IF')} alt="Hammarby" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
                                                    <img src={getTeamLogo('Djurgårdens IF')} alt="Djurgården" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
                                                </div>
                                                <div style={{ fontSize: '0.75rem', fontWeight: '700', marginTop: '8px', color: 'var(--color-text)' }}>Hammarby / DIF</div>
                                            </div>

                                            {/* Match Time (Placeholder for Semi) */}
                                            <div style={{ 
                                                padding: '0 10px',
                                                textAlign: 'center'
                                            }}>
                                                <div style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--color-text)', opacity: 0.5 }}>
                                                    --:--
                                                </div>
                                            </div>

                                            {/* Sirius/Göteborg */}
                                            <div style={{ flex: 1, textAlign: 'center' }}>
                                                <div style={{ height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                    <img src={getTeamLogo('IK Sirius')} alt="Sirius" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
                                                    <img src={getTeamLogo('IFK Göteborg')} alt="Göteborg" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
                                                </div>
                                                <div style={{ fontSize: '0.75rem', fontWeight: '800', marginTop: '8px', color: 'var(--color-text)' }}>Sirius / Göteborg</div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        )}
                    </>
                )}

                {/* Standings Table (Only for Allsvenskan) */}
                {activeComp === 'allsvenskan' && standings.length > 0 && (
                    <Card style={{ marginBottom: '16px' }} padding="24px">
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 2px', fontSize: '0.9rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '0.5px solid rgba(0,0,0,0.05)' }}>
                                    {['', 'LAG', 'M', '+/-', 'P'].map((col, i) => (
                                        <th key={i} style={{
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
                                            <td style={{ padding: '8px 4px', width: '24px', ...siriusStyle, borderRadius: isSirius ? '10px 0 0 10px' : undefined }}>
                                                <div style={{
                                                    fontSize: '0.85rem',
                                                    fontWeight: '700',
                                                    color: 'var(--color-text-muted)',
                                                    textAlign: 'center'
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


                {/* Cup Schedule & Europa Card */}
                {activeComp === 'cup' && (
                    <>
                        <div style={{ 
                            fontSize: '0.8rem', 
                            fontWeight: '700', 
                            color: 'var(--color-text-muted)', 
                            marginTop: '24px',
                            marginBottom: '10px', 
                            paddingLeft: '4px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.02em'
                        }}>
                            TORSDAG 14 MAJ
                        </div>
                        <Card style={{ marginBottom: '16px' }} padding="20px">
                            <div style={{ textAlign: 'center', fontSize: '0.95rem', fontWeight: '800', color: 'var(--color-text)', letterSpacing: '0.05em' }}>
                                FINAL
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
                {activeComp === 'statistik' && (
                    <div className="animate-fade-in">
                        <Card style={{ marginBottom: '16px' }} padding="24px">
                            <div style={{
                                textAlign: 'center',
                                color: 'var(--color-text-muted)',
                                fontSize: '0.9rem',
                                padding: '20px 0'
                            }}>
                                Kommer snart
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SiriusKollen;
