import React from 'react';
import Card from './common/Card';

const getFlagEmoji = (code) => {
    if (!code || code.length !== 2) return '';
    return code.toUpperCase().replace(/./g, c => String.fromCodePoint(c.charCodeAt(0) + 127397));
};

const MedalTable = ({ data }) => {
    const medalData = data?.top10 || [];
    if (medalData.length === 0) return null;

    return (
        <Card animate={false}>
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
                        borderRadius: isSweden ? '10px' : '0',
                        background: isSweden ? 'rgba(0, 106, 167, 0.06)' : 'transparent',
                        transition: 'background 0.2s ease'
                    }}>
                        <span style={{ fontWeight: '500', color: isSweden ? '#004b77' : 'var(--color-text-muted)', textAlign: 'left' }}>
                            {country.rank}
                        </span>
                        <span style={{ fontWeight: '500', color: isSweden ? '#004b77' : 'inherit', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                            <span style={{ fontSize: '1rem', lineHeight: 1, flexShrink: 0 }}>{getFlagEmoji(country.code)}</span>
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{country.country}</span>
                        </span>
                        <span style={{ textAlign: 'center', fontWeight: '400' }}>{country.gold}</span>
                        <span style={{ textAlign: 'center', fontWeight: '400' }}>{country.silver}</span>
                        <span style={{ textAlign: 'center', fontWeight: '400' }}>{country.bronze}</span>
                        <span style={{ textAlign: 'right', fontWeight: '500' }}>{country.gold + country.silver + country.bronze}</span>
                    </div>
                );
            })}
        </Card>
    );
};

export default MedalTable;
