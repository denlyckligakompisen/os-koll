import React, { useEffect, useState } from 'react';

const BoldSverige = ({ text }) => {
    if (!text || !text.includes('Sverige')) return text;
    const parts = text.split('Sverige');
    return (
        <>
            {parts[0]}
            <span style={{ fontWeight: '800' }}>Sverige</span>
            {parts[1]}
        </>
    );
};

const Countdown = () => {
    const calculateTimeLeft = () => {
        const targetDate = new Date('2026-06-11T00:00:00');
        const now = new Date();
        const difference = targetDate - now;

        if (difference <= 0) return null;

        return {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60)
        };
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    if (!timeLeft) return null;

    return (
        <div style={{
            marginTop: '10px',
            padding: '24px',
            backgroundColor: 'var(--color-card-bg)',
            backdropFilter: 'blur(16px)',
            borderRadius: '20px',
            border: 'var(--border)',
            boxShadow: 'var(--shadow-md)',
            textAlign: 'center',
            width: '100%',
            maxWidth: '320px'
        }}>
            <div style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: '#000000', letterSpacing: '0.1em', marginBottom: '16px', opacity: 0.6 }}>
                Fotbolls-VM 2026
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.8rem', fontWeight: '800', letterSpacing: '-0.02em' }}>{timeLeft.days}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', fontWeight: '600' }}>DAGAR</span>
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: '300', color: 'rgba(0,0,0,0.1)', marginTop: '-4px' }}>|</div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.8rem', fontWeight: '800', letterSpacing: '-0.02em' }}>{timeLeft.hours}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', fontWeight: '600' }}>TIMMAR</span>
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: '300', color: 'rgba(0,0,0,0.1)', marginTop: '-4px' }}>|</div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.8rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#000000' }}>{timeLeft.minutes}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', fontWeight: '600' }}>MINUTER</span>
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: '300', color: 'rgba(0,0,0,0.1)', marginTop: '-4px' }}>|</div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.8rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#000000' }}>{timeLeft.seconds}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', fontWeight: '600' }}>SEKUNDER</span>
                </div>
            </div>
            <div style={{ marginTop: '16px', fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: '500' }}>
                Premiär 11 juni 2026 • 🇲🇽 🇺🇸 🇨🇦
            </div>
        </div>
    );
};

const MatchCard = ({ match, isFinal, date }) => {
    const isClickable = !!match.link;
    const accentColor = isClickable ? '#ff005a' : 'var(--color-primary)';

    const content = (
        <div style={{
            backgroundColor: 'var(--color-card-bg)',
            backdropFilter: 'saturate(180%) blur(20px)',
            WebkitBackdropFilter: 'saturate(180%) blur(20px)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px',
            border: 'var(--border)',
            boxShadow: 'var(--shadow-sm)',
            width: '100%',
            maxWidth: '360px',
            margin: '10px 0',
            position: 'relative',
            cursor: isClickable ? 'pointer' : 'default',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            overflow: 'hidden'
        }}
            onMouseOver={(e) => {
                if (isClickable) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                }
            }}
            onMouseOut={(e) => {
                if (isClickable) {
                    e.currentTarget.style.backgroundColor = 'var(--color-card-bg)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                    e.currentTarget.style.transform = 'translateY(0)';
                }
            }}
        >
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                justifyContent: 'space-between'
            }}>
                <div style={{
                    backgroundColor: 'rgba(0, 122, 255, 0.1)',
                    padding: '6px 14px',
                    borderRadius: '10px',
                    textAlign: 'center',
                    minWidth: '85px'
                }}>
                    <div style={{
                        fontSize: '0.65rem',
                        fontWeight: '700',
                        color: 'var(--color-primary)',
                        textTransform: 'uppercase',
                        marginBottom: '1px'
                    }}>
                        {date}
                    </div>
                    <span style={{
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        color: 'var(--color-primary)',
                    }}>
                        {match.time}
                    </span>
                </div>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    flex: 1,
                    justifyContent: 'center',
                    paddingRight: '10px'
                }}>
                    <span style={{
                        fontWeight: '500',
                        fontSize: '1.05rem',
                        color: '#000000',
                        letterSpacing: '-0.01em'
                    }}>
                        <BoldSverige text={match.home} />
                    </span>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', fontWeight: '400' }}>–</span>
                    <span style={{
                        fontWeight: '500',
                        fontSize: '1.05rem',
                        color: '#000000',
                        letterSpacing: '-0.01em'
                    }}>
                        <BoldSverige text={match.away} />
                    </span>
                </div>
            </div>

            {isClickable && (
                <div style={{
                    marginTop: '12px',
                    paddingTop: '10px',
                    borderTop: 'var(--border)',
                    textAlign: 'center'
                }}>
                    <span style={{
                        fontSize: '0.85rem',
                        color: accentColor,
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                    }}>
                        Se matchen på Viaplay →
                    </span>
                </div>
            )}
        </div>
    );

    if (isClickable) {
        return (
            <a href={match.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', width: '100%', display: 'flex', justifyContent: 'center' }}>
                {content}
            </a>
        );
    }

    return content;
};

const VMPlayoff = () => {
    const [data, setData] = useState(null);

    useEffect(() => {
        fetch('/data/vm_playoff.json')
            .then(res => res.json())
            .then(setData)
            .catch(console.error);
    }, []);

    if (!data) return null;

    return (
        <div style={{ padding: '0 10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '8px' }}>
                <img
                    src="https://upload.wikimedia.org/wikipedia/en/1/17/2026_FIFA_World_Cup_emblem.svg"
                    alt="FIFA World Cup 2026"
                    style={{
                        height: '40px',
                        width: 'auto',
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                    }}
                />
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0, letterSpacing: '-0.02em', color: '#000000' }}>
                    {data.tournament}
                </h2>
            </div>
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '24px', marginTop: '-4px' }}>Vägen till VM 2026</p>

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '40px',
                position: 'relative',
                alignItems: 'center'
            }}>
                {/* Semifinals */}
                <div style={{ width: '100%' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: 'rgba(0,0,0,0.5)', marginBottom: '12px', textAlign: 'center' }}>
                        Torsdag 26 mars
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                        {data.rounds[0].matches.map(match => (
                            <MatchCard key={match.id} match={match} date="26 mars" />
                        ))}
                    </div>
                </div>

                {/* Final */}
                <div style={{ width: '100%', position: 'relative' }}>
                    <div style={{
                        position: 'absolute',
                        top: '-30px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '2px',
                        height: '30px',
                        backgroundColor: 'rgba(0,0,0,0.1)'
                    }} />

                    <div style={{
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        color: 'rgba(0,0,0,0.5)',
                        marginBottom: '12px',
                        textAlign: 'center',
                        marginTop: '10px'
                    }}>
                        Tisdag 31 mars
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        {data.rounds[1].matches.map(match => (
                            <MatchCard key={match.id} match={match} isFinal={true} date="31 mars" />
                        ))}
                    </div>
                </div>

                <div style={{
                    width: '2px',
                    height: '40px',
                    backgroundColor: 'rgba(0,0,0,0.1)',
                    marginTop: '-40px',
                    marginBottom: '-10px',
                    position: 'relative',
                    zIndex: 0
                }} />

                <Countdown />

                <div style={{
                    backgroundColor: 'var(--color-card-bg)',
                    backdropFilter: 'saturate(180%) blur(20px)',
                    WebkitBackdropFilter: 'saturate(180%) blur(20px)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '16px',
                    border: 'var(--border)',
                    boxShadow: 'var(--shadow-sm)',
                    width: '100%',
                    maxWidth: '320px',
                    textAlign: 'left',
                    marginTop: '0px'
                }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#000000', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', opacity: 0.6 }}>
                        Grupp F
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {[
                            { name: 'Japan' },
                            { name: 'Nederländerna' },
                            { name: 'Tunisien' }
                        ].map((team, idx) => (
                            <div key={idx} style={{
                                display: 'flex',
                                justifyContent: 'flex-start',
                                alignItems: 'center',
                                padding: '8px 12px',
                                backgroundColor: 'rgba(0,0,0,0.02)',
                                borderRadius: '8px'
                            }}>
                                <span style={{ fontSize: '1rem', fontWeight: '500', color: '#000000' }}>
                                    {team.name}
                                </span>
                            </div>
                        ))}

                        {/* Playoff winner row */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                            padding: '10px 14px',
                            backgroundColor: 'rgba(255, 0, 90, 0.05)',
                            borderRadius: '10px',
                            border: '0.5px solid rgba(255, 0, 90, 0.1)',
                            marginTop: '4px'
                        }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#000000' }}>
                                <BoldSverige text="Albanien/Polen/Ukraina/Sverige" />
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VMPlayoff;
