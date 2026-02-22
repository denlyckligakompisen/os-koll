import React, { useEffect, useState } from 'react';

const SiriusKollen = () => {
    const [matches, setMatches] = useState([]);
    const [standings, setStandings] = useState([]);

    useEffect(() => {
        Promise.all([
            fetch('/data/sirius_matches.json').then(res => res.json()),
            fetch('/data/sirius_standings.json').then(res => res.json())
        ]).then(([matchesData, standingsData]) => {
            setMatches(matchesData);
            setStandings(standingsData);
        }).catch(err => console.error('Error fetching Sirius data:', err));
    }, []);

    const BoldSirius = ({ text }) => {
        if (!text || !text.includes('Sirius')) return text;
        const parts = text.split('Sirius');
        return (
            <>
                {parts[0]}
                <span style={{ fontWeight: '800' }}>Sirius</span>
                {parts[1]}
            </>
        );
    };

    const nextMatch = matches.find(m => !m.result);

    const getLogo = (teamName) => {
        const logos = {
            'IK Sirius': 'https://data-20ca4.kxcdn.com/teamImages%2FIKS%2Flo70q4e1-iks.png?width=100',
            'GIF Sundsvall': 'https://data-20ca4.kxcdn.com/teamImages%2FSUN%2Flps4uo4a-gif-logga.png?width=100',
            'Helsingborgs IF': 'https://data-20ca4.kxcdn.com/teamImages%2FHIF%2Flf89k8un-HIF_emblem.png?width=100',
            'IF Elfsborg': 'https://data-20ca4.kxcdn.com/teamImages%2FIFE%2Flo70p360-ife.png?width=100'
        };
        return logos[teamName] || null;
    };

    return (
        <div className="animate-fade-in" style={{ padding: '0 10px' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '24px',
                textAlign: 'center'
            }}>
                <div style={{
                    width: '100px',
                    height: '100px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '8px'
                }}>
                    <img
                        src={getLogo('IK Sirius')}
                        alt="IK Sirius Logo"
                        style={{ width: '90px', height: 'auto', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' }}
                    />
                </div>
                <h2 style={{ margin: 0, fontSize: '2.2rem', fontWeight: '800', letterSpacing: '-0.05em', color: '#000' }}>
                    Sirius-kollen
                </h2>
                <div style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)', fontWeight: '500', letterSpacing: '-0.01em' }}>
                    Vägen till Europaspel 💙🖤
                </div>
            </div>

            {/* Highlighted Next Match */}
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
                    {/* Subtle Stripe Pattern */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        opacity: 0.1,
                        background: 'repeating-linear-gradient(90deg, transparent, transparent 20px, #fff 20px, #fff 40px)'
                    }} />

                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.8, marginBottom: '20px', textAlign: 'center' }}>
                            NÄSTA MATCH
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                            <div style={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                <div style={{ height: '60px', display: 'flex', alignItems: 'center', justifyItems: 'center' }}>
                                    <img src={getLogo(nextMatch.home)} alt={nextMatch.home} style={{ height: '100%', width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 4px 12px rgba(255,255,255,0.2))' }} />
                                </div>
                                <div style={{ fontSize: '1rem', fontWeight: '800', marginTop: '4px' }}>{nextMatch.home}</div>
                            </div>

                            <div style={{ fontSize: '0.9rem', fontWeight: '400', opacity: 0.6, marginTop: '-20px' }}>mot</div>

                            <div style={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                <div style={{ height: '60px', display: 'flex', alignItems: 'center', justifyItems: 'center' }}>
                                    <img src={getLogo(nextMatch.away)} alt={nextMatch.away} style={{ height: '100%', width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 4px 12px rgba(255,255,255,0.2))' }} />
                                </div>
                                <div style={{ fontSize: '1rem', fontWeight: '800', marginTop: '4px' }}>{nextMatch.away}</div>
                            </div>
                        </div>
                        <div style={{ textAlign: 'center', marginTop: '20px' }}>
                            <div style={{ fontSize: '1.4rem', fontWeight: '700', letterSpacing: '-0.02em' }}>
                                {nextMatch.date === '2026-03-01' ? '1 mars' : nextMatch.date} {nextMatch.time}
                            </div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '4px' }}>Studenternas IP</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Standings Table */}
            <div style={{
                backgroundColor: 'var(--color-card-bg)',
                backdropFilter: 'saturate(180%) blur(20px)',
                WebkitBackdropFilter: 'saturate(180%) blur(20px)',
                borderRadius: '24px',
                padding: '20px',
                border: 'var(--border)',
                boxShadow: 'var(--shadow-sm)',
                marginBottom: '24px'
            }}>
                <div style={{
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    color: 'var(--color-text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '16px',
                    paddingLeft: '4px'
                }}>
                    GRUPP 8
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '0.5px solid rgba(0,0,0,0.05)' }}>
                            <th style={{ textAlign: 'left', padding: '8px 4px', color: 'var(--color-text-muted)', fontWeight: '600' }}>#</th>
                            <th style={{ textAlign: 'left', padding: '8px 4px', color: 'var(--color-text-muted)', fontWeight: '600' }}>LAG</th>
                            <th style={{ textAlign: 'center', padding: '8px 4px', color: 'var(--color-text-muted)', fontWeight: '600' }}>M</th>
                            <th style={{ textAlign: 'center', padding: '8px 4px', color: 'var(--color-text-muted)', fontWeight: '600' }}>+/-</th>
                            <th style={{ textAlign: 'right', padding: '8px 4px', color: 'var(--color-text-muted)', fontWeight: '600' }}>P</th>
                        </tr>
                    </thead>
                    <tbody>
                        {standings.map((team, idx) => (
                            <tr key={team.team} style={{
                                borderBottom: idx === standings.length - 1 ? 'none' : '0.5px solid rgba(0,0,0,0.05)',
                                backgroundColor: team.team === 'IK Sirius' ? 'rgba(0,51,153,0.05)' : 'transparent'
                            }}>
                                <td style={{ padding: '12px 4px', fontWeight: '500' }}>{team.rank}</td>
                                <td style={{ padding: '12px 4px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <img
                                            src={getLogo(team.team)}
                                            alt={team.team}
                                            style={{ width: '20px', height: '20px', objectFit: 'contain' }}
                                        />
                                        <BoldSirius text={team.team} />
                                    </div>
                                </td>
                                <td style={{ padding: '12px 4px', textAlign: 'center' }}>{team.p}</td>
                                <td style={{ padding: '12px 4px', textAlign: 'center', color: team.gd > 0 ? '#34c759' : team.gd < 0 ? '#ff3b30' : 'inherit' }}>
                                    {team.gd > 0 ? `+${team.gd}` : team.gd}
                                </td>
                                <td style={{ padding: '12px 4px', textAlign: 'right', fontWeight: '700' }}>{team.pts}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Playoff Dates Card */}
            <div style={{
                backgroundColor: 'var(--color-card-bg)',
                backdropFilter: 'saturate(180%) blur(20px)',
                WebkitBackdropFilter: 'saturate(180%) blur(20px)',
                borderRadius: '24px',
                padding: '20px',
                border: 'var(--border)',
                boxShadow: 'var(--shadow-sm)',
                marginTop: '8px',
                background: 'linear-gradient(to bottom right, rgba(255,255,255,0.8), rgba(240,248,255,0.8))'
            }}>
                <div style={{
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    color: 'var(--color-text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '16px',
                    paddingLeft: '4px'
                }}>
                    SLUTSPEL
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px' }}>
                        <span style={{ fontSize: '0.95rem', fontWeight: '500' }}>Kvartsfinal</span>
                        <span style={{ fontSize: '0.95rem', fontWeight: '700', color: '#000' }}>15 mars</span>
                    </div>
                    <div style={{ height: '0.5px', backgroundColor: 'rgba(0,0,0,0.05)' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px' }}>
                        <span style={{ fontSize: '0.95rem', fontWeight: '500' }}>Semifinal</span>
                        <span style={{ fontSize: '0.95rem', fontWeight: '700', color: '#000' }}>22 mars</span>
                    </div>
                    <div style={{ height: '0.5px', backgroundColor: 'rgba(0,0,0,0.05)' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px' }}>
                        <span style={{ fontSize: '0.95rem', fontWeight: '500' }}>Final</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '1.2rem' }}>🏆</span>
                            <span style={{ fontSize: '0.95rem', fontWeight: '800', color: '#000' }}>14 maj</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Europa League Qualifiers Card */}
            <div style={{
                backgroundColor: 'var(--color-card-bg)',
                backdropFilter: 'saturate(180%) blur(20px)',
                WebkitBackdropFilter: 'saturate(180%) blur(20px)',
                borderRadius: '24px',
                padding: '20px',
                border: 'var(--border)',
                boxShadow: 'var(--shadow-sm)',
                marginTop: '16px',
                background: 'linear-gradient(to bottom right, rgba(255,255,255,0.8), rgba(245,245,250,0.8))'
            }}>
                <div style={{
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    color: 'var(--color-text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '16px',
                    paddingLeft: '4px'
                }}>
                    EUROPA LEAGUE-KVAL
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '1.1rem' }}>🌍</span>
                            <span style={{ fontSize: '0.95rem', fontWeight: '500' }}>Kvalomgång 1</span>
                        </div>
                        <span style={{ fontSize: '0.95rem', fontWeight: '700', color: '#000' }}>Juli 2026</span>
                    </div>
                    <p style={{
                        margin: '8px 4px 0 4px',
                        fontSize: '0.85rem',
                        color: 'var(--color-text-muted)',
                        lineHeight: '1.4',
                        fontStyle: 'italic'
                    }}>
                        Vid vinst i Svenska Cupen säkras en plats i Europa League-kvalet.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SiriusKollen;
