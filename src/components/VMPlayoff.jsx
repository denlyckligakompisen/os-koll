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
            margin: '0',
            padding: '20px',
            backgroundColor: 'var(--color-card-bg)',
            backdropFilter: 'blur(16px)',
            borderRadius: 'var(--radius-lg)',
            border: 'var(--border)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            width: '280px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <h2 style={{
                margin: '0 0 16px 0',
                fontSize: '0.9rem',
                fontWeight: '800',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--color-text-muted)',
                textAlign: 'center'
            }}>
                Fotbolls-VM 2026 i Nordamerika
            </h2>
            <div style={{ textAlign: 'center' }}>
                <div key={timeLeft.days} className="animate-fade-in" style={{ fontSize: '3.5rem', fontWeight: '900', color: 'var(--color-text)', lineHeight: 1 }}>{timeLeft.days}</div>
                <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginTop: '4px' }}>dagar kvar</div>
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
            width: '280px',
            margin: '0',
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
                    flexDirection: isFinal ? 'column' : 'row',
                    alignItems: 'center',
                    gap: isFinal ? '2px' : '8px',
                    flex: 1,
                    justifyContent: 'center',
                    paddingRight: '10px'
                }}>
                    <span style={{
                        fontWeight: '500',
                        fontSize: isFinal ? '1.05rem' : '1.1rem',
                        color: '#000000',
                        letterSpacing: '-0.01em'
                    }}>
                        <BoldSverige text={match.home} />
                    </span>
                    <span style={{
                        color: 'var(--color-text-muted)',
                        fontSize: '0.9rem',
                        fontWeight: '400',
                        margin: isFinal ? '-2px 0' : '0'
                    }}>–</span>
                    <span style={{
                        fontWeight: '500',
                        fontSize: isFinal ? '1.05rem' : '1.1rem',
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
                        color: '#000000',
                        fontWeight: '500',
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
                        src="https://upload.wikimedia.org/wikipedia/en/1/17/2026_FIFA_World_Cup_emblem.svg"
                        alt="VM 2026"
                        style={{
                            height: '32px',
                            width: 'auto',
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                        }}
                    />
                    <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '800', letterSpacing: '-0.04em', color: '#000000' }}>
                        {data.tournament}
                    </h2>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: '500' }}>
                    Sveriges väg till Fotbolls-VM 2026
                </div>
            </div>

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
                position: 'relative',
                alignItems: 'center',
                paddingBottom: '100px'
            }}>
                {/* Semifinals */}
                <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
                        {data.rounds[0].matches.map(match => (
                            <MatchCard key={match.id} match={match} date="26 mars" />
                        ))}
                    </div>
                </div>

                {/* Final */}
                <div style={{ width: '100%', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        {data.rounds[1].matches.map(match => (
                            <MatchCard key={match.id} match={match} isFinal={true} date="31 mars" />
                        ))}
                    </div>
                </div>

                <Countdown />

                <div style={{
                    backgroundColor: 'var(--color-card-bg)',
                    backdropFilter: 'saturate(180%) blur(20px)',
                    WebkitBackdropFilter: 'saturate(180%) blur(20px)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '16px',
                    border: 'var(--border)',
                    boxShadow: 'var(--shadow-sm)',
                    width: '280px',
                    textAlign: 'left',
                    marginTop: '0px'
                }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#000000', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', opacity: 0.6 }}>
                        Grupp F
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {[
                            { name: 'Albanien/Polen/Ukraina/Sverige' },
                            { name: 'Japan' },
                            { name: 'Nederländerna' },
                            { name: 'Tunisien' }
                        ].map((team, idx) => (
                            <div key={idx} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '4px 0'
                            }}>
                                <span style={{
                                    fontSize: '0.95rem',
                                    fontWeight: '500',
                                    color: '#000000'
                                }}>
                                    <BoldSverige text={team.name} />
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VMPlayoff;
