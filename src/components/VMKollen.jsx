import React, { useEffect, useState } from 'react';
import { getTeamLogo } from '../utils/assets';
import PageHeader from './common/PageHeader';
import Card from './common/Card';
import { formatMatchDisplayDate } from '../utils/dateUtils';

// circle-flags CDN — free open-source circular SVG flags (github.com/HatScripts/circle-flags)
const flagUrl = (code) =>
    `https://hatscripts.github.io/circle-flags/flags/${code.toLowerCase()}.svg`;

const getFlagCode = (name) => {
    if (name.includes('Sverige')) return 'SE';
    if (name.includes('Ukraina')) return 'UA';
    if (name.includes('Japan')) return 'JP';
    if (name.includes('Nederländerna')) return 'NL';
    if (name.includes('Tunisien')) return 'TN';
    if (name.includes('Polen')) return 'PL';
    if (name.includes('Albanien')) return 'AL';
    if (name.includes('Mexiko')) return 'MX';
    if (name.includes('Sydafrika')) return 'ZA';
    if (name.includes('Sydkorea')) return 'KR';
    if (name.includes('Kanada')) return 'CA';
    if (name.includes('Qatar')) return 'QA';
    if (name.includes('Schweiz')) return 'CH';
    if (name.includes('Brasilien')) return 'BR';
    if (name.includes('Marocko')) return 'MA';
    if (name.includes('Haiti')) return 'HT';
    if (name.includes('Skottland')) return 'GB-SCT';
    if (name.includes('USA')) return 'US';
    if (name.includes('Paraguay')) return 'PY';
    if (name.includes('Australien')) return 'AU';
    if (name.includes('Tyskland')) return 'DE';
    if (name.includes('Curaçao')) return 'CW';
    if (name.includes('Elfenbenskusten')) return 'CI';
    if (name.includes('Ecuador')) return 'EC';
    if (name.includes('Belgien')) return 'BE';
    if (name.includes('Egypten')) return 'EG';
    if (name.includes('Iran')) return 'IR';
    if (name.includes('Nya Zeeland')) return 'NZ';
    if (name.includes('Spanien')) return 'ES';
    if (name.includes('Kap Verde')) return 'CV';
    if (name.includes('Saudiarabien')) return 'SA';
    if (name.includes('Uruguay')) return 'UY';
    if (name.includes('Frankrike')) return 'FR';
    if (name.includes('Senegal')) return 'SN';
    if (name.includes('Norge')) return 'NO';
    if (name.includes('Argentina')) return 'AR';
    if (name.includes('Algeriet')) return 'DZ';
    if (name.includes('Österrike')) return 'AT';
    if (name.includes('Jordanien')) return 'JO';
    if (name.includes('Portugal')) return 'PT';
    if (name.includes('Uzbekistan')) return 'UZ';
    if (name.includes('Colombia')) return 'CO';
    if (name.includes('England')) return 'GB-ENG';
    if (name.includes('Kroatien')) return 'HR';
    if (name.includes('Ghana')) return 'GH';
    if (name.includes('Panama')) return 'PA';
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
    return <>{before}<span style={{ fontWeight: '800', color: 'var(--color-primary)' }}>Sverige</span>{after}</>;
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
        <Card style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', overflow: 'hidden' }} animate={false}>
            <h2 style={{ margin: '0', fontSize: '0.9rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                Fotbolls-VM 2026
            </h2>
            <img
                src={getTeamLogo('FIFA World Cup')}
                alt="FIFA World Cup 2026"
                style={{ height: '100px', width: 'auto', marginBottom: '8px' }}
            />
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

const NextMatchCard = ({ match, date }) => {
    const isClickable = !!match.link;

    const content = (
        <div className={isClickable ? "premium-card-hover" : ""} style={{
            background: '#ffffff',
            borderRadius: '24px',
            padding: '24px',
            color: 'black',
            marginBottom: '24px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            position: 'relative',
            overflow: 'hidden',
            border: 'var(--border)'
        }}>

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
        </div>
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

const GROUP_TEAMS = [
    'Albanien/Polen/Ukraina/Sverige',
    'Japan',
    'Nederländerna',
    'Tunisien',
];

const SUBTABS = [
    { id: 'sverige', label: 'Sverige' },
    { id: 'gruppspel', label: 'Gruppspel' },
    { id: 'slutspel', label: 'Slutspel' },
    { id: 'statistik', label: 'Statistik' }
];

const VMKollen = () => {
    const [data, setData] = useState(null);
    const [groupsData, setGroupsData] = useState(null);
    const [matchesData, setMatchesData] = useState(null);
    const [activeTab, setActiveTab] = useState('sverige');

    useEffect(() => {
        fetch('/data/vm_playoff.json')
            .then(res => res.json())
            .then(setData)
            .catch(console.error);

        fetch('/data/worldcup_2026_groups.json')
            .then(res => res.json())
            .then(setGroupsData)
            .catch(console.error);

        fetch('/data/worldcup_2026_matches.json')
            .then(res => res.json())
            .then(setMatchesData)
            .catch(console.error);
    }, []);

    if (!data) return null;

    const renderTable = (groupName, teams, displayName) => {
        // Sort alphabetically if we assume 0 matches played (as requested)
        const sortedTeams = [...teams].sort((a, b) => a.localeCompare(b, 'sv'));
        const groupMatches = matchesData?.matches.filter(m => m.group === groupName) || [];

        return (
            <div style={{ marginBottom: '40px' }}>
                <Card style={{ marginBottom: '16px' }} animate={false}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                        <BoldSverige text={displayName || groupName} />
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
                            {sortedTeams.map((name, idx) => {
                                const flagCodes = getFlagCodes(name);
                                return (
                                    <tr key={name}>
                                        <td style={{ padding: '11px 4px', fontWeight: '500' }}>{idx + 1}</td>
                                        <td style={{ padding: '11px 4px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                                    {flagCodes.map((code, fIdx) => (
                                                        code === 'UN' && flagCodes.length === 1 ? (
                                                            <div key={fIdx} style={{
                                                                width: '22px',
                                                                height: '22px',
                                                                borderRadius: '50%',
                                                                border: '1px solid var(--border)',
                                                                backgroundColor: 'transparent',
                                                                flexShrink: 0
                                                            }} />
                                                        ) : code !== 'UN' ? (
                                                            <img
                                                                key={fIdx}
                                                                src={flagUrl(code)}
                                                                alt={name}
                                                                width={22}
                                                                height={22}
                                                                style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                                                            />
                                                        ) : null
                                                    ))}
                                                </div>
                                                <span style={{ fontWeight: '400' }}>
                                                    <BoldSverige text={name} />
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '11px 4px', textAlign: 'center' }}>0</td>
                                        <td style={{ padding: '11px 4px', textAlign: 'center' }}>0</td>
                                        <td style={{ padding: '11px 4px', textAlign: 'right', fontWeight: '700' }}>0</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </Card>

                {/* Group Matches */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {groupMatches.map((match, mIdx) => {
                        const homeFlags = getFlagCodes(match.home);
                        const awayFlags = getFlagCodes(match.away);

                        return (
                            <Card key={mIdx} padding="12px 16px" animate={false} style={{
                                border: 'var(--border)',
                                boxShadow: 'none',
                                backgroundColor: 'rgba(255,255,255,0.5)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                                        <div style={{ fontSize: '0.65rem', fontWeight: '800', color: '#000', textTransform: 'uppercase' }}>
                                            {match.date} {match.time}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <div style={{ fontSize: '0.9rem', fontWeight: '500', color: '#000' }}>
                                                <BoldSverige text={match.home} /> – <BoldSverige text={match.away} />
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right', marginLeft: '12px' }}>
                                        {match.broadcast === 'SVT' ? (
                                            <img
                                                src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/SVT_Play_logotyp.svg/1280px-SVT_Play_logotyp.svg.png"
                                                alt="SVT Play"
                                                style={{ height: '11px', width: 'auto' }}
                                            />
                                        ) : match.broadcast === 'TV4' ? (
                                            <img
                                                src="https://www.koping.net/images/Galleri/TV4-Play_Logotype_RGB_Red.png"
                                                alt="TV4 Play"
                                                style={{ height: '14px', width: 'auto' }}
                                            />
                                        ) : null}
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderPlayoff = () => (
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
        </div>
    );

    const renderSubTab = () => {
        switch (activeTab) {
            case 'sverige':
                return (
                    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {renderPlayoff()}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            margin: '-8px 0 16px 0'
                        }}>
                            <svg className="animate-arrow-bounce" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8, color: 'var(--color-text-muted)' }}>
                                <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
                            </svg>
                        </div>
                        <Countdown />
                    </div >
                );
            case 'gruppspel':
                return (
                    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {groupsData?.groups.map(group => (
                            <React.Fragment key={group.name}>
                                {renderTable(group.name, group.teams)}
                            </React.Fragment>
                        ))}
                    </div>
                );
            case 'slutspel':
                return (
                    <div className="animate-fade-in">
                        <Card padding="40px" style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
                            Kommer snart
                        </Card>
                    </div>
                );
            case 'statistik':
                return (
                    <div className="animate-fade-in">
                        <Card padding="40px" style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
                            Kommer snart
                        </Card>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div style={{ padding: '0 10px' }}>
            <PageHeader
                title={data.tournament}
                logoSrc={getTeamLogo('FIFA World Cup')}
            />

            {/* Submenu */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '28px',
                fontSize: '0.8rem',
                fontWeight: '700'
            }}>
                {SUBTABS.map((tab, i) => (
                    <React.Fragment key={tab.id}>
                        <button
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: activeTab === tab.id ? '#000' : 'var(--color-text-muted)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                padding: '8px 8px',
                                cursor: 'pointer',
                                transition: 'color 0.2s',
                                position: 'relative',
                                minWidth: '70px'
                            }}
                        >
                            {tab.label}
                            <div style={{
                                position: 'absolute', bottom: 0, left: '50%',
                                transform: `translateX(-50%) scaleX(${activeTab === tab.id ? 1 : 0})`,
                                transition: 'transform 0.25s ease',
                                width: '16px', height: '2px',
                                backgroundColor: '#000000', borderRadius: '2px'
                            }} />
                        </button>
                    </React.Fragment>
                ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {renderSubTab()}
            </div>
        </div>
    );
};

export default VMKollen;
