import React, { useEffect, useState } from 'react';

const getFlag = (team) => {
    const flags = {
        'Sverige': '🇸🇪',
        'Ukraina': '🇺🇦',
        'Polen': '🇵🇱',
        'Albanien': '🇦🇱'
    };
    return flags[team] || '⚔️';
};

const MatchCard = ({ match, isFinal }) => (
    <div style={{
        backgroundColor: 'var(--color-card-bg)',
        borderRadius: '12px',
        padding: '12px',
        border: 'var(--border)',
        boxShadow: 'var(--shadow-sm)',
        width: '100%',
        maxWidth: '280px',
        margin: '10px 0',
        position: 'relative'
    }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: '600' }}>
            <span>{match.time}</span>
            {match.broadcast && <span style={{ color: '#007aff' }}>{match.broadcast}</span>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
            <span style={{ fontWeight: match.home === 'Sverige' ? '700' : '500', fontSize: '0.95rem' }}>
                {getFlag(match.home)} {match.home}
            </span>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>–</span>
            <span style={{ fontWeight: match.away === 'Sverige' ? '700' : '500', fontSize: '0.95rem' }}>
                {getFlag(match.away)} {match.away}
            </span>
        </div>

    </div>
);

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
                    <div style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '12px', textAlign: 'center' }}>
                        Semifinaler • 26 Mars
                    </div>
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

                    <div style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '12px', textAlign: 'center' }}>
                        Final • 31 Mars
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        {data.rounds[1].matches.map(match => (
                            <MatchCard key={match.id} match={match} isFinal={true} />
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default VMPlayoff;
