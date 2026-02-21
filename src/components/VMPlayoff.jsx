import React, { useEffect, useState } from 'react';

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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: match.home === 'Sverige' ? '700' : '500', fontSize: '0.95rem' }}>
                    {match.home === 'Sverige' ? '🇸🇪 ' : ''}{match.home}
                </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: match.away === 'Sverige' ? '700' : '500', fontSize: '0.95rem' }}>
                    {match.away === 'Sverige' ? '🇸🇪 ' : ''}{match.away}
                </span>
            </div>
        </div>

        {match.location && (
            <div style={{ marginTop: '8px', fontSize: '0.7rem', color: 'var(--color-text-muted)', borderTop: '0.5px solid rgba(0,0,0,0.05)', paddingTop: '6px' }}>
                📍 {match.location}
            </div>
        )}
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
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', textAlign: 'center', marginBottom: '4px', letterSpacing: '-0.02em' }}>{data.tournament}</h2>
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '24px' }}>Vägen till VM 2026</p>

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
