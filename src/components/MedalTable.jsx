import React from 'react';

const MedalTable = ({ data }) => {
    const medalData = data?.top10 || [];
    if (medalData.length === 0) return null;

    return (
        <div style={{
            margin: '0 16px 24px 16px',
            padding: '20px',
            backgroundColor: 'var(--color-card-bg)',
            backdropFilter: 'blur(16px)',
            borderRadius: 'var(--radius-lg)',
            border: 'var(--border)',
            boxShadow: 'var(--shadow-sm)'
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
                Milano Cortina 2026
            </h2>
            {/* Table Header */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(40px, auto) 1fr 40px 40px 40px 40px',
                gap: '8px',
                fontSize: '0.7rem',
                fontWeight: '700',
                color: 'var(--color-text-muted)',
                paddingBottom: '8px',
                borderBottom: '1px solid var(--color-border-subtle)',
                textAlign: 'center'
            }}>
                <span />
                <span />
                <span>🥇</span>
                <span>🥈</span>
                <span>🥉</span>
                <span>TOT</span>
            </div>

            {medalData.map((country) => {
                const isSweden = country.code === 'SE' || country.country === 'Sverige';
                return (
                    <div key={country.code} style={{
                        display: 'grid',
                        gridTemplateColumns: 'minmax(40px, auto) 1fr 40px 40px 40px 40px',
                        gap: '8px',
                        alignItems: 'center',
                        fontSize: '0.9rem',
                        padding: '8px 0',
                        borderRadius: '8px',
                        position: 'relative',
                        backgroundColor: isSweden ? 'rgba(251, 192, 45, 0.15)' : 'transparent',
                        margin: isSweden ? '0 -8px' : '0',
                        paddingLeft: isSweden ? '8px' : '0',
                        paddingRight: isSweden ? '8px' : '0',
                        transition: 'background-color 0.2s ease'
                    }}>
                        {isSweden && (
                            <div style={{
                                position: 'absolute',
                                left: 0,
                                top: '20%',
                                bottom: '20%',
                                width: '3px',
                                backgroundColor: '#fbc02d',
                                borderRadius: '0 4px 4px 0'
                            }} />
                        )}
                        <span style={{
                            fontWeight: '700',
                            color: isSweden ? 'var(--color-text-highlight)' : 'var(--color-text-muted)',
                            textAlign: 'center'
                        }}>
                            {country.rank}
                        </span>
                        <span style={{
                            fontWeight: isSweden ? '800' : '600',
                            color: isSweden ? 'var(--color-text-highlight)' : 'inherit'
                        }}>
                            {country.country}
                        </span>
                        <span style={{ textAlign: 'center', fontWeight: '600' }}>{country.gold}</span>
                        <span style={{ textAlign: 'center' }}>{country.silver}</span>
                        <span style={{ textAlign: 'center' }}>{country.bronze}</span>
                        <span style={{ textAlign: 'center', fontWeight: '800' }}>{country.gold + country.silver + country.bronze}</span>
                    </div>
                );
            })}

            {data?.eventProgress && (
                <div style={{
                    marginTop: '24px',
                    paddingTop: '16px',
                    borderTop: '1px solid var(--color-border-subtle)',
                    textAlign: 'center'
                }}>
                    <div style={{
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: 'var(--color-text-muted)',
                        marginBottom: '8px'
                    }}>
                        {data.eventProgress}
                    </div>
                    <div style={{
                        height: '6px',
                        backgroundColor: 'rgba(0,0,0,0.05)',
                        borderRadius: '3px',
                        overflow: 'hidden',
                        width: '100%',
                        maxWidth: '200px',
                        margin: '0 auto'
                    }}>
                        <div style={{
                            height: '100%',
                            width: '99%', // 115/116 is ~99%
                            backgroundColor: '#4caf50',
                            borderRadius: '3px'
                        }} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default MedalTable;
