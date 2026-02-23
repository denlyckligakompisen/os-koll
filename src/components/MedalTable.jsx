import React from 'react';
import Card from './common/Card';

// circle-flags CDN — free open-source circular SVG flags (github.com/HatScripts/circle-flags)
// Country codes must be lowercase ISO 3166-1 alpha-2
const FLAG_OVERRIDES = {
    'US': 'us',
};
const flagUrl = (code) =>
    `https://hatscripts.github.io/circle-flags/flags/${(FLAG_OVERRIDES[code] || code).toLowerCase()}.svg`;

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

            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 2px', fontSize: '0.9rem' }}>
                <thead>
                    <tr style={{ borderBottom: '0.5px solid rgba(0,0,0,0.05)' }}>
                        {['#', 'LAND', '🥇', '🥈', '🥉', 'TOT'].map((col, i) => (
                            <th key={col} style={{
                                textAlign: i === 0 || i === 1 ? 'left' : i === 5 ? 'right' : 'center',
                                padding: '8px 4px',
                                color: 'var(--color-text-muted)',
                                fontWeight: '600'
                            }}>{col}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {medalData.map((country) => {
                        const isSwe = country.code === 'SE' || country.country === 'Sverige';
                        const sweStyle = isSwe ? { backgroundColor: 'rgba(0, 106, 167, 0.06)' } : {};
                        return (
                            <tr key={country.code}>
                                <td style={{ padding: '11px 4px', fontWeight: '500', ...sweStyle, borderRadius: isSwe ? '10px 0 0 10px' : undefined }}>
                                    {country.rank}
                                </td>
                                <td style={{ padding: '11px 4px', fontWeight: isSwe ? '700' : '400', ...sweStyle }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <img
                                            src={flagUrl(country.code)}
                                            alt={country.country}
                                            width={22}
                                            height={22}
                                            style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                                        />
                                        {country.country}
                                    </div>
                                </td>
                                <td style={{ padding: '11px 4px', textAlign: 'center', fontWeight: '700', ...sweStyle }}>
                                    {country.gold}
                                </td>
                                <td style={{ padding: '11px 4px', textAlign: 'center', fontWeight: '400', ...sweStyle }}>
                                    {country.silver}
                                </td>
                                <td style={{ padding: '11px 4px', textAlign: 'center', fontWeight: '400', ...sweStyle }}>
                                    {country.bronze}
                                </td>
                                <td style={{ padding: '11px 4px', textAlign: 'right', fontWeight: '400', ...sweStyle, borderRadius: isSwe ? '0 10px 10px 0' : undefined }}>
                                    {country.gold + country.silver + country.bronze}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </Card>
    );
};

export default MedalTable;
