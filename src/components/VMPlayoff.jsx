import React, { useEffect, useState } from 'react';

const Countdown = () => {
    const calculateTimeLeft = () => {
        const targetDate = new Date('2026-06-11T00:00:00');
        const now = new Date();
        const difference = targetDate - now;

        if (difference <= 0) return null;

        return {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60)
        };
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    if (!timeLeft) return null;

    return (
        <div style={{
            marginTop: '48px',
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
            <div style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-primary)', letterSpacing: '0.1em', marginBottom: '16px' }}>
                Nedräkning till VM 2026
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
                    <span style={{ fontSize: '1.8rem', fontWeight: '800', letterSpacing: '-0.02em' }}>{timeLeft.minutes}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', fontWeight: '600' }}>MIN</span>
                </div>
            </div>
            <div style={{ marginTop: '16px', fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: '500' }}>
                Premiär 11 juni 2026 • 🇲🇽 🇺🇸 🇨🇦
            </div>
        </div>
    );
};

const MatchCard = ({ match, isFinal }) => {
    const isClickable = !!match.link;
    const content = (
        <div style={{
            backgroundColor: 'var(--color-card-bg)',
            borderRadius: '12px',
            padding: '12px',
            border: isClickable ? '1px solid rgba(255, 0, 90, 0.3)' : 'var(--border)',
            boxShadow: isClickable ? '0 4px 12px rgba(255, 0, 90, 0.1)' : 'var(--shadow-sm)',
            width: '100%',
            maxWidth: '280px',
            margin: '10px 0',
            position: 'relative',
            cursor: isClickable ? 'pointer' : 'default',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            textDecoration: 'none',
            color: 'inherit',
            display: 'block'
        }}
            className={isClickable ? 'clickable-card' : ''}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: '600' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {isClickable && <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#ff005a',
                        display: 'inline-block'
                    }} />}
                    {match.time}
                </span>
                {match.broadcast && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {isClickable && (
                            <img
                                src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Viaplay_logo.svg/200px-Viaplay_logo.svg.png"
                                alt="Viaplay"
                                style={{ height: '10px', width: 'auto' }}
                            />
                        )}
                        <span style={{ color: isClickable ? '#ff005a' : '#007aff' }}>{match.broadcast}</span>
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', padding: '4px 0' }}>
                <span style={{ fontWeight: match.home.includes('Sverige') ? '700' : '500', fontSize: '0.95rem' }}>
                    {match.home}
                </span>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>–</span>
                <span style={{ fontWeight: match.away.includes('Sverige') ? '700' : '500', fontSize: '0.95rem' }}>
                    {match.away}
                </span>
            </div>

            {isClickable && (
                <div style={{
                    marginTop: '8px',
                    fontSize: '0.7rem',
                    color: '#ff005a',
                    fontWeight: '700',
                    textAlign: 'center',
                    borderTop: '0.5px solid rgba(255, 0, 90, 0.1)',
                    paddingTop: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                }}>
                    Se matchen på Viaplay →
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
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0, letterSpacing: '-0.02em', color: 'var(--color-text)' }}>
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
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                        {data.rounds[0].matches.map(match => (
                            <MatchCard key={match.id} match={match} />
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

                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        {data.rounds[1].matches.map(match => (
                            <MatchCard key={match.id} match={match} isFinal={true} />
                        ))}
                    </div>
                </div>

                <Countdown />
            </div>
        </div>
    );
};

export default VMPlayoff;
