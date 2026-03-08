import React, { useEffect, useState, useRef } from 'react';
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
    if (name.includes('Peru')) return 'PE';
    if (name.includes('Kamerun')) return 'CM';
    if (name.includes('Georgien')) return 'GE';
    if (name.includes('Grekland')) return 'GR';
    if (name.includes('Wales')) return 'GB-WLS';
    if (name.includes('Island')) return 'IS';
    return 'UN'; // Unknown
};

const getFlagCodes = (name) => {
    if (!name.includes('/')) return [getFlagCode(name)];
    return name.split('/').map(part => getFlagCode(part.trim()));
};

// Bolds "Sverige" within any string
const BoldSverige = ({ text }) => {
    if (!text) return null;
    let label = text;

    if (!label.includes('Sverige')) return label;
    const [before, after] = label.split('Sverige');
    return <>{before}<span style={{ color: '#000', fontWeight: '700' }}>Sverige</span>{after}</>;
};

const Countdown = () => {
    const getTimeLeft = () => {
        const diff = new Date('2026-06-11T21:00:00') - new Date();
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



const GROUP_TEAMS = [
    'Albanien/Polen/Ukraina/Sverige',
    'Japan',
    'Nederländerna',
    'Tunisien',
];

const SUBTABS = [
    { id: 'matcher', label: 'Matcher' },
    { id: 'gruppspel', label: 'Grupper' },
    { id: 'slutspel', label: 'Slutspel' },
    { id: 'statistik', label: 'Statistik' }
];

const VMKollen = () => {
    const [data, setData] = useState(null);
    const [groupsData, setGroupsData] = useState(null);
    const [matchesData, setMatchesData] = useState(null);
    const [activeTab, setActiveTab] = useState('matcher');
    const touchStart = useRef(null);
    const touchEnd = useRef(null);

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

    // Minimum distance for a swipe to be recognized
    const minSwipeDistance = 30;

    const onTouchStart = (e) => {
        if (!e.touches[0]) return;
        touchEnd.current = null;
        touchStart.current = e.touches[0].clientX;
    };

    const onTouchMove = (e) => {
        if (!e.touches[0]) return;
        touchEnd.current = e.touches[0].clientX;
    };

    const onTouchEnd = () => {
        if (touchStart.current === null || touchEnd.current === null) return;
        const distance = touchStart.current - touchEnd.current;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe || isRightSwipe) {
            const currentIndex = SUBTABS.findIndex(tab => tab.id === activeTab);
            if (isLeftSwipe && currentIndex < SUBTABS.length - 1) {
                setActiveTab(SUBTABS[currentIndex + 1].id);
            } else if (isRightSwipe && currentIndex > 0) {
                setActiveTab(SUBTABS[currentIndex - 1].id);
            }
        }
    };

    if (!data) return null;

    const renderMatchCard = (match, mIdx) => {
        const homeFlags = getFlagCodes(match.home);
        const awayFlags = getFlagCodes(match.away);

        const renderBadge = (codes, name) => (
            <div style={{
                width: '22px',
                height: '22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1px' }}>
                    {codes.map((code, fIdx) => (
                        code !== 'UN' ? (
                            <img key={fIdx} src={flagUrl(code)} alt={name} width={codes.length > 1 ? 14 : 22} height={codes.length > 1 ? 14 : 22} style={{ borderRadius: '50%', objectFit: 'cover', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                        ) : codes.length === 1 ? (
                            <div key={fIdx} style={{ width: '22px', height: '22px', borderRadius: '50%', border: '1px solid rgba(0,0,0,0.1)', backgroundColor: 'transparent' }} />
                        ) : null
                    ))}
                </div>
            </div>
        );

        const card = (
            <Card key={mIdx} padding="12px 14px" style={{
                border: 'var(--border)',
                boxShadow: 'none',
                backgroundColor: 'rgba(255,255,255,0.5)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
            }}>
                {renderBadge(homeFlags, match.home)}

                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '2px', height: '14px' }}>
                        <div>
                            {match.broadcast === 'SVT' ? (
                                <img
                                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/SVT_Play_logotyp.svg/1280px-SVT_Play_logotyp.svg.png"
                                    alt="SVT Play"
                                    style={{ height: '10px', width: 'auto' }}
                                />
                            ) : match.broadcast === 'TV4' ? (
                                <img
                                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/TV4_Play_logo_2023.svg/440px-TV4_Play_logo_2023.svg.png"
                                    alt="TV4 Play"
                                    style={{ height: '11px', width: 'auto' }}
                                />
                            ) : match.broadcast?.includes('Viaplay') ? (
                                <img
                                    src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Viaplay_logo.png"
                                    alt="Viaplay"
                                    style={{ height: '13px', width: 'auto' }}
                                />
                            ) : null}
                        </div>
                    </div>
                    <div style={{
                        fontSize: '0.9rem',
                        color: '#000',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        textAlign: 'center'
                    }}>
                        <span style={{ flex: 1, textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            <BoldSverige text={match.home} />
                        </span>
                        <span style={{
                            fontSize: '0.7rem',
                            color: 'var(--color-text-muted)',
                            fontWeight: '800',
                            flexShrink: 0,
                            backgroundColor: 'rgba(0,0,0,0.05)',
                            padding: '2px 6px',
                            borderRadius: '4px'
                        }}>
                            {match.time}
                        </span>
                        <span style={{ flex: 1, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            <BoldSverige text={match.away} />
                        </span>
                    </div>
                </div>

                {renderBadge(awayFlags, match.away)}
            </Card>
        );

        if (match.link) {
            return (
                <a key={mIdx} href={match.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
                    {card}
                </a>
            );
        }
        return card;
    };

    const getQualifiedThirds = () => {
        if (!groupsData?.groups) return [];

        const thirdPlacedTeams = groupsData.groups.map(group => {
            const sorted = [...group.teams].map(t => typeof t === 'string' ? { name: t, played: 0, gd: 0, pts: 0 } : t)
                .sort((a, b) => b.pts - a.pts || b.gd - a.gd || a.name.localeCompare(b.name, 'sv'));
            return sorted[2]; // Index 2 is rank 3
        });

        return thirdPlacedTeams
            .sort((a, b) => b.pts - a.pts || b.gd - a.gd || a.name.localeCompare(b.name, 'sv'))
            .slice(0, 8)
            .map(t => t.name);
    };

    const qualifiedThirds = getQualifiedThirds();

    const renderTable = (groupName, teams, displayName) => {
        const sortedTeams = [...teams].sort((a, b) => {
            const teamA = typeof a === 'string' ? { name: a, pts: 0, gd: 0 } : a;
            const teamB = typeof b === 'string' ? { name: b, pts: 0, gd: 0 } : b;
            return teamB.pts - teamA.pts || teamB.gd - teamA.gd || teamA.name.localeCompare(teamB.name, 'sv');
        });

        return (
            <div style={{ marginBottom: '16px' }}>
                <Card style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                        <BoldSverige text={displayName || groupName} />
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 2px', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '0.5px solid rgba(0,0,0,0.05)' }}>
                                {['', 'LAG', 'M', '+/-', 'P'].map((col, i) => (
                                    <th key={i} style={{
                                        textAlign: i === 0 || i === 1 ? 'left' : i === 4 ? 'right' : 'center',
                                        padding: '8px 4px',
                                        color: 'var(--color-text-muted)',
                                        fontWeight: '600'
                                    }}>{col}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {sortedTeams.map((teamData, idx) => {
                                const team = typeof teamData === 'string' ? { name: teamData, played: 0, gd: 0, pts: 0 } : teamData;
                                const flagCodes = getFlagCodes(team.name);
                                const rank = idx + 1;
                                const isSverige = team.name.includes('Sverige');
                                const isQualifiedThird = rank === 3 && qualifiedThirds.includes(team.name);

                                return (
                                    <tr key={team.name}>
                                        <td style={{ padding: '8px 4px' }}>
                                            <div style={{
                                                width: '28px',
                                                height: '28px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                borderRadius: '8px',
                                                fontWeight: '700',
                                                fontSize: '0.85rem',
                                                backgroundColor: (rank <= 2 || isQualifiedThird) ? 'rgba(52, 199, 89, 0.15)' : 'transparent',
                                                color: (rank <= 2 || isQualifiedThird) ? '#248a3d' : 'inherit'
                                            }}>
                                                {rank}
                                            </div>
                                        </td>
                                        <td style={{ padding: '11px 4px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                                    {flagCodes.map((code, fIdx) => (
                                                        code === 'UN' && flagCodes.length === 1 ? (
                                                            <div key={fIdx} style={{
                                                                width: '22px',
                                                                height: '22px',
                                                                borderRadius: '50%',
                                                                border: '1px solid rgba(0,0,0,0.1)',
                                                                backgroundColor: 'transparent',
                                                                flexShrink: 0
                                                            }} />
                                                        ) : code !== 'UN' ? (
                                                            <img
                                                                key={fIdx}
                                                                src={flagUrl(code)}
                                                                alt={team.name}
                                                                width={22}
                                                                height={22}
                                                                style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                                                            />
                                                        ) : null
                                                    ))}
                                                </div>
                                                <span style={{ fontWeight: isSverige ? '600' : '400' }}>
                                                    <BoldSverige text={team.name} />
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '11px 4px', textAlign: 'center' }}>{team.played}</td>
                                        <td style={{ padding: '11px 4px', textAlign: 'center', color: team.gd > 0 ? '#34c759' : team.gd < 0 ? '#ff3b30' : 'inherit' }}>
                                            {team.gd > 0 ? `+${team.gd}` : team.gd}
                                        </td>
                                        <td style={{ padding: '11px 4px', textAlign: 'right', fontWeight: '700' }}>{team.pts}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </Card>
            </div>
        );
    };

    const renderAllMatches = () => {
        if (!matchesData) return null;

        const parseDate = (dateStr, timeStr) => {
            const months = { 'juni': 5, 'juli': 6 }; // 0-indexed months
            const [day, monthName] = dateStr.split(' ');
            return new Date(2026, months[monthName], parseInt(day), ...timeStr.split(':').map(Number));
        };

        const sortedMatches = [...matchesData.matches].sort((a, b) =>
            parseDate(a.date, a.time) - parseDate(b.date, b.time)
        );

        const grouped = sortedMatches.reduce((acc, m) => {
            if (!acc[m.date]) acc[m.date] = [];
            acc[m.date].push(m);
            return acc;
        }, {});

        return (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {Object.entries(grouped).map(([date, matches]) => (
                    <div key={date} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#000', textTransform: 'uppercase', letterSpacing: '0.05em', paddingLeft: '4px' }}>
                            {date}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {matches.map((m, i) => renderMatchCard(m, i))}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderPlayoff = () => {
        if (!data?.rounds) return null;
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {data.rounds.map((round, rIdx) => (
                    <div key={rIdx} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#000', textTransform: 'uppercase', letterSpacing: '0.05em', paddingLeft: '4px' }}>
                            {(round.date || round.name).replace(/\s*202\d/, '')}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {round.matches.map((match, i) => renderMatchCard(match, `p${rIdx}-${i}`))}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderSubTab = () => {
        switch (activeTab) {
            case 'matcher':
                return (
                    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {renderPlayoff()}
                        <Countdown />
                        {renderAllMatches()}
                    </div>
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
        <div
            style={{
                padding: '0 10px',
                minHeight: 'calc(100vh - 120px)',
                width: '100%',
                touchAction: 'pan-y'
            }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
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

            <div key={activeTab} className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {renderSubTab()}
            </div>
        </div>
    );
};

export default VMKollen;
