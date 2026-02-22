import React, { useEffect, useState } from 'react';

const SiriusKollen = () => {
    const [matches, setMatches] = useState([]);
    const [standings, setStandings] = useState([]);
    const [activeComp, setActiveComp] = useState('cup');

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

    const formatMatchDate = (dateStr) => {
        if (!dateStr) return '';
        const matchDate = new Date(dateStr);
        const today = new Date('2026-02-22');

        const d1 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const d2 = new Date(matchDate.getFullYear(), matchDate.getMonth(), matchDate.getDate());

        const diffTime = d2.getTime() - d1.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Idag';
        if (diffDays === 1) return 'Imorgon';
        if (diffDays > 1 && diffDays < 8) {
            const weekdays = ['Söndag', 'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag'];
            return weekdays[matchDate.getDay()];
        }

        const months = ['januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli', 'augusti', 'september', 'oktober', 'november', 'december'];
        return `${matchDate.getDate()} ${months[matchDate.getMonth()]}`;
    };

    const getLogo = (teamName) => {
        const logos = {
            'IK Sirius': 'https://data-20ca4.kxcdn.com/teamImages%2FIKS%2Flo70q4e1-iks.png?width=100',
            'GIF Sundsvall': 'https://data-20ca4.kxcdn.com/teamImages%2FSUN%2Flps4uo4a-gif-logga.png?width=100',
            'Helsingborgs IF': 'https://data-20ca4.kxcdn.com/teamImages%2FHIF%2Flf89k8un-HIF_emblem.png?width=100',
            'IF Elfsborg': 'https://data-20ca4.kxcdn.com/teamImages%2FIFE%2Flo70p360-ife.png?width=100',
            'Malmö FF': 'https://data-20ca4.kxcdn.com/teamImages%2FMFF%2Flo70qypl-mff.png?width=100',
            'AIK': 'https://data-20ca4.kxcdn.com/teamImages%2FAIK%2Flo739j5e-aik.png?width=100',
            'Djurgården': 'https://data-20ca4.kxcdn.com/teamImages%2FDIF%2Flo70oyre-dif.png?width=100',
            'Hammarby': 'https://data-20ca4.kxcdn.com/teamImages%2FHAM%2Flo70p0y7-ham.png?width=100',
            'BK Häcken': 'https://data-20ca4.kxcdn.com/teamImages%2FBKH%2Flo70ljkw-bkh.png?width=100',
            'GAIS': 'https://data-20ca4.kxcdn.com/teamImages%2FGAI%2Flf89l5m3-GAIS_emblem.png?width=100',
            'IFK Göteborg': 'https://data-20ca4.kxcdn.com/teamImages%2FIFK%2Flo70p4u3-ifk.png?width=100',
            'Degerfors IF': 'https://data-20ca4.kxcdn.com/teamImages%2FDEIF%2Flo70mdul-deif.png?width=100',
            'Västerås SK': 'https://data-20ca4.kxcdn.com/teamImages%2FVSK%2Flf89m083-VSK_emblem.png?width=100',
            'Kalmar FF': 'https://data-20ca4.kxcdn.com/teamImages%2FKFF%2Flo70p880-kff.png?width=100'
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
                gap: '4px',
                marginBottom: '24px',
                textAlign: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
                    <img
                        src={getLogo('IK Sirius')}
                        alt="IK Sirius"
                        style={{
                            height: '32px',
                            width: 'auto',
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                        }}
                    />
                    <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '800', letterSpacing: '-0.04em', color: '#000000' }}>
                        Sirius-kollen
                    </h2>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: '500' }}>
                    Vägen till Europaspel 💙🖤
                </div>
            </div>

            {/* Competition Menu */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '28px',
                fontSize: '0.85rem',
                fontWeight: '700'
            }}>
                <button
                    onClick={() => setActiveComp('allsvenskan')}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: activeComp === 'allsvenskan' ? '#000' : 'var(--color-text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        padding: '8px 12px',
                        cursor: 'pointer',
                        transition: 'color 0.2s',
                        position: 'relative'
                    }}
                >
                    Allsvenskan
                    {activeComp === 'allsvenskan' && (
                        <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '20px', height: '2px', backgroundColor: '#003399', borderRadius: '2px' }} />
                    )}
                </button>
                <div style={{ color: 'var(--color-border)', fontWeight: '300' }}>|</div>
                <button
                    onClick={() => setActiveComp('cup')}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: activeComp === 'cup' ? '#000' : 'var(--color-text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        padding: '8px 12px',
                        cursor: 'pointer',
                        transition: 'color 0.2s',
                        position: 'relative'
                    }}
                >
                    Svenska Cupen
                    {activeComp === 'cup' && (
                        <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '20px', height: '2px', backgroundColor: '#003399', borderRadius: '2px' }} />
                    )}
                </button>
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

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                            <div style={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                <div style={{ height: '60px', display: 'flex', alignItems: 'center', justifyItems: 'center' }}>
                                    <img src={getLogo(nextMatch.home)} alt={nextMatch.home} style={{ height: '100%', width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 4px 12px rgba(255,255,255,0.2))' }} />
                                </div>
                                <div style={{ fontSize: '1rem', fontWeight: '800', marginTop: '4px' }}>{nextMatch.home}</div>
                            </div>

                            <div style={{ fontSize: '0.9rem', fontWeight: '400', opacity: 0.6, marginTop: '-20px' }}></div>

                            <div style={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                <div style={{ height: '60px', display: 'flex', alignItems: 'center', justifyItems: 'center' }}>
                                    <img src={getLogo(nextMatch.away)} alt={nextMatch.away} style={{ height: '100%', width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 4px 12px rgba(255,255,255,0.2))' }} />
                                </div>
                                <div style={{ fontSize: '1rem', fontWeight: '800', marginTop: '4px' }}>{nextMatch.away}</div>
                            </div>
                        </div>
                        <div style={{ textAlign: 'center', marginTop: '20px' }}>
                            <div style={{ fontSize: '1.4rem', fontWeight: '700', letterSpacing: '-0.02em' }}>
                                {formatMatchDate(nextMatch.date)} {nextMatch.time}
                            </div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '4px' }}>{nextMatch.venue || (nextMatch.home === 'IK Sirius' ? 'Studenternas IP' : 'Borta')}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Standings Table */}
            {standings.length > 0 && (
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
                        {activeComp === 'cup' ? 'GRUPP 8' : 'ALLSVENSKAN'}
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
                            {(() => {
                                const displayedTeams = activeComp === 'allsvenskan'
                                    ? standings.filter(t => t.rank <= 3 || t.team === 'IK Sirius')
                                    : standings;

                                return displayedTeams.map((team, idx) => {
                                    const isCupCutoff = activeComp === 'cup' && team.rank === 1;
                                    return (
                                        <tr key={team.team} style={{
                                            borderBottom: isCupCutoff
                                                ? '2px dashed rgba(0,0,0,0.15)'
                                                : (idx === displayedTeams.length - 1 ? 'none' : '0.5px solid rgba(0,0,0,0.05)'),
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
                                                    {team.team}
                                                </div>
                                            </td>
                                            <td style={{ padding: '12px 4px', textAlign: 'center' }}>{team.p}</td>
                                            <td style={{ padding: '12px 4px', textAlign: 'center', color: team.gd > 0 ? '#34c759' : team.gd < 0 ? '#ff3b30' : 'inherit' }}>
                                                {team.gd > 0 ? `+${team.gd}` : team.gd}
                                            </td>
                                            <td style={{ padding: '12px 4px', textAlign: 'right', fontWeight: '700' }}>{team.pts}</td>
                                        </tr>
                                    );
                                });
                            })()}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Champions League & Conference League Card (Only for Allsvenskan) */}
            {activeComp === 'allsvenskan' && (
                <div style={{
                    backgroundColor: 'var(--color-card-bg)',
                    backdropFilter: 'saturate(180%) blur(20px)',
                    WebkitBackdropFilter: 'saturate(180%) blur(20px)',
                    borderRadius: '24px',
                    padding: '30px',
                    border: 'var(--border)',
                    boxShadow: 'var(--shadow-sm)',
                    marginTop: '16px',
                    background: 'linear-gradient(to bottom right, rgba(255,255,255,0.9), rgba(245,250,255,0.9))',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px',
                    alignItems: 'center'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '48px' }}>
                        <div style={{ width: '90px' }}>
                            <img
                                src="https://upload.wikimedia.org/wikipedia/commons/f/f3/Logo_UEFA_Champions_League.png"
                                alt="UEFA Champions League"
                                style={{ width: '100%', height: 'auto', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))' }}
                            />
                        </div>
                        <div style={{ width: '100px' }}>
                            <img
                                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTNrFv0oLweCA6oSLIWMaA5_aQIufqZgVprsA&s"
                                alt="UEFA Conference League"
                                style={{ width: '100%', height: 'auto', mixBlendMode: 'multiply' }}
                            />
                        </div>
                    </div>
                    <div style={{
                        textAlign: 'center',
                        fontSize: '0.85rem',
                        color: 'var(--color-text-muted)',
                        lineHeight: '1.4',
                        maxWidth: '280px',
                        fontWeight: '500'
                    }}>
                        Vinnaren kvalar till <span style={{ color: '#000', fontWeight: '700' }}>Champions League</span>,<br />lag 2 och 3 kvalar till <span style={{ color: '#000', fontWeight: '700' }}>Conference League</span>
                    </div>
                </div>
            )}

            {/* Playoff/Europa Cards (Only for Cup) */}
            {activeComp === 'cup' && (
                <>
                    {/* Playoff Dates Card */}
                    <div style={{
                        backgroundColor: 'var(--color-card-bg)',
                        backdropFilter: 'saturate(180%) blur(20px)',
                        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
                        borderRadius: '24px',
                        padding: '20px',
                        border: 'var(--border)',
                        boxShadow: 'var(--shadow-sm)',
                        marginTop: '8px'
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
                                <span style={{ fontSize: '0.95rem', fontWeight: '800', color: '#000' }}>14 maj</span>
                            </div>
                        </div>
                    </div>

                    {/* Europa League Qualifiers Card */}
                    <div style={{
                        backgroundColor: 'var(--color-card-bg)',
                        backdropFilter: 'saturate(180%) blur(20px)',
                        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
                        borderRadius: '24px',
                        padding: '30px',
                        border: 'var(--border)',
                        boxShadow: 'var(--shadow-sm)',
                        marginTop: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '24px',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <div style={{ width: '100px' }}>
                            <img
                                src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/UEFA_Europa_League_logo_%282024_version%29.svg/1920px-UEFA_Europa_League_logo_%282024_version%29.svg.png"
                                alt="UEFA Europa League"
                                style={{ width: '100%', height: 'auto', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))' }}
                            />
                        </div>
                        <div style={{
                            textAlign: 'center',
                            fontSize: '0.85rem',
                            color: 'var(--color-text-muted)',
                            lineHeight: '1.4',
                            maxWidth: '280px',
                            fontWeight: '500'
                        }}>
                            Vinnaren kvalar till <span style={{ color: '#000', fontWeight: '700' }}>Europa League</span>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default SiriusKollen;
