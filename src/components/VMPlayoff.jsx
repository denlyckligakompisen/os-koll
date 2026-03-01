import React, { useEffect, useState } from 'react';
import { getTeamLogo } from '../utils/assets';
import PageHeader from './common/PageHeader';
import Card from './common/Card';
import { formatMatchDisplayDate } from '../utils/dateUtils';

// circle-flags CDN — free open-source circular SVG flags (github.com/HatScripts/circle-flags)
const flagUrl = (code) =>
    `https://hatscripts.github.io/circle-flags/flags/${code.toLowerCase()}.svg`;

const TEAM_FLAGS = {
    'Sverige': 'SE',
    'Japan': 'JP',
    'Nederländerna': 'NL',
    'Tunisien': 'TN',
    'Ukraina': 'UA',
    'Polen': 'PL',
    'Albanien': 'AL'
};

const getFlagCode = (name) => {
    if (name.includes('Sverige')) return 'SE';
    if (name.includes('Ukraina')) return 'UA';
    if (name.includes('Japan')) return 'JP';
    if (name.includes('Nederländerna')) return 'NL';
    if (name.includes('Tunisien')) return 'TN';
    if (name.includes('Polen')) return 'PL';
    if (name.includes('Albanien')) return 'AL';
    return 'UN'; // Unknown
};

const getFlagCodes = (name) => {
    if (!name.includes('/')) return [getFlagCode(name)];
    return name.split('/').map(part => getFlagCode(part.trim()));
};

// Bolds "Sverige" within any string
const BoldSverige = ({ text }) => {
    if (!text?.includes('Sverige')) return text;
    const [before, after] = text.split('Sverige');
    return <>{before}<span style={{ fontWeight: '400' }}>Sverige</span>{after}</>;
};

const Countdown = () => {
    const getTimeLeft = () => {
        const diff = new Date('2026-06-11T00:00:00') - new Date();
        if (diff <= 0) return null;
        return { days: Math.floor(diff / (1000 * 60 * 60 * 24)) };
    };

    const [timeLeft, setTimeLeft] = useState(getTimeLeft);

    useEffect(() => {
        const timer = setInterval(() => setTimeLeft(getTimeLeft()), 60_000);
        return () => clearInterval(timer);
    }, []);

    if (!timeLeft) return null;

    return (
        <Card style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '0.9rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                Fotbolls-VM 2026
            </h2>
            <div style={{ textAlign: 'center' }}>
                <div key={timeLeft.days} className="animate-fade-in" style={{ fontSize: '3.5rem', fontWeight: '900', color: 'var(--color-text)', lineHeight: 1 }}>
                    {timeLeft.days}
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginTop: '4px' }}>
                    dagar kvar
                </div>
            </div>
        </Card>
    );
};

const MatchCard = ({ match, isFinal, date }) => {
    const isClickable = !!match.link;

    const card = (
        <Card
            style={{
                cursor: isClickable ? 'pointer' : 'default',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                overflow: 'hidden'
            }}
            padding="16px"

        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'space-between' }}>
                {/* Date/time badge */}
                <div style={{ backgroundColor: 'rgba(0, 122, 255, 0.1)', padding: '6px 14px', borderRadius: '10px', textAlign: 'center', minWidth: '85px' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--color-primary)', textTransform: 'uppercase', marginBottom: '1px' }}>{date}</div>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-primary)' }}>{match.time}</span>
                </div>

                {/* Teams */}
                <div style={{ display: 'flex', flexDirection: isFinal ? 'column' : 'row', alignItems: 'center', gap: isFinal ? '2px' : '8px', flex: 1, justifyContent: 'center', paddingRight: '10px' }}>
                    {[match.home, match.away].map((team, i) => (
                        <React.Fragment key={team}>
                            {i === 1 && <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', fontWeight: '400', margin: isFinal ? '-2px 0' : '0' }}>–</span>}
                            <span style={{ fontWeight: '500', fontSize: isFinal ? '1.05rem' : '1.1rem', color: '#000000', letterSpacing: '-0.01em' }}>
                                <BoldSverige text={team} />
                            </span>
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {isClickable && (
                <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: 'var(--border)', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: '#000000', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        Se matchen på <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Viaplay_logo.png" alt="Viaplay" style={{ height: '16px', width: 'auto', display: 'inline-block', verticalAlign: 'middle' }} /> →
                    </span>
                </div>
            )}
        </Card>
    );

    if (isClickable) {
        return (
            <a href={match.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
                {card}
            </a>
        );
    }
    return card;
};

const GROUP_TEAMS = [
    'Albanien/Polen/Ukraina/Sverige',
    'Japan',
    'Nederländerna',
    'Tunisien',
];

const NextMatchCard = ({ match, date }) => {
    const isClickable = !!match.link;

    const content = (
        <Card
            style={{
                cursor: isClickable ? 'pointer' : 'default',
                background: '#ffffff',
                marginBottom: '24px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                position: 'relative',
                overflow: 'hidden',
                border: 'var(--border)'
            }}
            padding="24px"
        >

            <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                    {[match.home, match.away].map(team => (
                        <div key={team} style={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                            <div style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                {getFlagCodes(team).map((code, idx) => (
                                    <img
                                        key={`${team}-${idx}`}
                                        src={flagUrl(code)}
                                        alt={team}
                                        style={{
                                            height: '100%',
                                            width: 'auto',
                                            maxHeight: '48px',
                                            objectFit: 'contain',
                                            borderRadius: '50%',
                                            filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))'
                                        }}
                                    />
                                ))}
                            </div>
                            <div style={{ fontSize: '1rem', fontWeight: '800', marginTop: '4px' }}>{team}</div>
                        </div>
                    ))}
                </div>
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: '700', letterSpacing: '-0.02em' }}>
                        {date} {match.time}
                    </div>
                </div>

                {isClickable && (
                    <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(0,0,0,0.1)', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.85rem', color: 'black', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            Se matchen på <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Viaplay_logo.png" alt="Viaplay" style={{ height: '16px', width: 'auto', display: 'inline-block', verticalAlign: 'middle' }} /> →
                        </span>
                    </div>
                )}
            </div>
        </Card>
    );

    if (isClickable) {
        return (
            <a href={match.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
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
            <PageHeader
                title={data.tournament}
                subtitle="Vägen till Fotbolls-VM 💙💛"
                logoSrc={getTeamLogo('FIFA World Cup')}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Semifinals */}
                {data.rounds[0].matches.map(match => (
                    <NextMatchCard key={match.id} match={match} date="26 mars" />
                ))}

                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    margin: '-8px 0 16px 0',
                    color: 'var(--color-text-muted)',
                    opacity: 0.4
                }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
                    </svg>
                </div>

                {/* Final */}
                {data.rounds[1].matches.map(match => (
                    <NextMatchCard key={match.id} match={match} date="31 mars" />
                ))}

                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    margin: '-8px 0 16px 0',
                    color: 'var(--color-text-muted)',
                    opacity: 0.4
                }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
                    </svg>
                </div>

                <Countdown />

                <Card style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                        Grupp F
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 2px', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '0.5px solid rgba(0,0,0,0.05)' }}>
                                {['#', 'LAG', 'M', '+/-', 'P'].map((col, i) => (
                                    <th key={col} style={{
                                        textAlign: i === 0 || i === 1 ? 'left' : i === 4 ? 'right' : 'center',
                                        padding: '8px 4px',
                                        color: 'var(--color-text-muted)',
                                        fontWeight: '600'
                                    }}>{col}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {GROUP_TEAMS.map((name, idx) => {
                                const isSverige = name.includes('Sverige');
                                const rowStyle = isSverige ? { backgroundColor: 'rgba(0,122,255,0.06)' } : {};
                                return (
                                    <tr key={name}>
                                        <td style={{ padding: '11px 4px', fontWeight: '500', ...rowStyle, borderRadius: isSverige ? '10px 0 0 10px' : undefined }}>{idx + 1}</td>
                                        <td style={{ padding: '11px 4px', ...rowStyle }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {isSverige ? (
                                                    <div style={{
                                                        width: '22px',
                                                        height: '22px',
                                                        borderRadius: '50%',
                                                        border: '1px solid var(--border)',
                                                        backgroundColor: 'transparent',
                                                        flexShrink: 0
                                                    }} />
                                                ) : (
                                                    <img
                                                        src={flagUrl(getFlagCode(name))}
                                                        alt={name}
                                                        width={22}
                                                        height={22}
                                                        style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                                                    />
                                                )}
                                                <span style={{ fontWeight: '400' }}>
                                                    <BoldSverige text={name} />
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '11px 4px', textAlign: 'center', ...rowStyle }}>0</td>
                                        <td style={{ padding: '11px 4px', textAlign: 'center', ...rowStyle }}>0</td>
                                        <td style={{ padding: '11px 4px', textAlign: 'right', fontWeight: '700', ...rowStyle, borderRadius: isSverige ? '0 10px 10px 0' : undefined }}>0</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </Card>
            </div>
        </div>
    );
};

export default VMPlayoff;
