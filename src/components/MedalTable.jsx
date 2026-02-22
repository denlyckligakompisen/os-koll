import React from 'react';

const MedalTable = ({ data }) => {
    const medalData = data?.top10 || [];
    if (medalData.length === 0) return null;

    return (
        <div style={{
            display: 'block',
        }}>
            <div style={{
                margin: '0 16px 0 16px',
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
                    Vinter-OS i Milano Cortina 2026
                </h2>
                {/* Table Header */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '30px 1fr 35px 35px 35px 40px',
                    gap: '8px',
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    color: 'var(--color-text-muted)',
                    padding: '0 12px 8px 12px',
                    borderBottom: '1px solid var(--color-border-subtle)'
                }}>
                    <span style={{ textAlign: 'left' }}>#</span>
                    <span style={{ textAlign: 'left' }}>LAND</span>
                    <span style={{ textAlign: 'center' }}>🥇</span>
                    <span style={{ textAlign: 'center' }}>🥈</span>
                    <span style={{ textAlign: 'center' }}>🥉</span>
                    <span style={{ textAlign: 'right' }}>TOT</span>
                </div>

                {medalData.map((country) => {
                    const isSweden = country.code === 'SE' || country.country === 'Sverige';
                    return (
                        <div key={country.code} style={{
                            display: 'grid',
                            gridTemplateColumns: '30px 1fr 35px 35px 35px 40px',
                            gap: '8px',
                            alignItems: 'center',
                            fontSize: '0.9rem',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            position: 'relative',
                            background: isSweden ? 'rgba(0, 106, 167, 0.15)' : 'transparent',
                            margin: '0',
                            transition: 'all 0.2s ease',
                            border: isSweden ? '1px solid rgba(0, 106, 167, 0.2)' : '1px solid transparent'
                        }}>
                            <span style={{
                                fontWeight: '500',
                                color: isSweden ? '#004b77' : 'var(--color-text-muted)',
                                textAlign: 'left'
                            }}>
                                {country.rank}
                            </span>
                            <span style={{
                                fontWeight: '500',
                                color: isSweden ? '#004b77' : 'inherit',
                                textAlign: 'left',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                                {country.country}
                            </span>
                            <span style={{ textAlign: 'center', fontWeight: '400' }}>{country.gold}</span>
                            <span style={{ textAlign: 'center', fontWeight: '400' }}>{country.silver}</span>
                            <span style={{ textAlign: 'center', fontWeight: '400' }}>{country.bronze}</span>
                            <span style={{ textAlign: 'right', fontWeight: '500' }}>{country.gold + country.silver + country.bronze}</span>
                        </div>
                    );
                })}


            </div>
        </div>
    );
};

export default MedalTable;
