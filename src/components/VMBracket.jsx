import React, { useState, useEffect, useRef } from 'react';
import { getFlagCodes } from '../utils/flags';
import Card from './common/Card';
import FlagBadge from './common/FlagBadge';
import BoldSverige from './BoldSverige';

const TEAM_ABBR = {
    'Sverige': 'SWE', 'Mexiko': 'MEX', 'USA': 'USA', 'Kanada': 'CAN', 'Brasilien': 'BRA',
    'Bosnien och Hercegovina': 'BIH', 'Turkiet': 'TUR', 'Tjeckien': 'CZE', 'Nederländerna': 'NED',
    'Tyskland': 'GER', 'Spanien': 'ESP', 'Frankrike': 'FRA', 'Argentina': 'ARG',
    'England': 'ENG', 'Portugal': 'POR', 'Belgien': 'BEL', 'Italien': 'ITA',
    'Japan': 'JPN', 'Sydkorea': 'KOR', 'Ecuador': 'ECU', 'Uruguay': 'URU',
    'Senegal': 'SEN', 'Marocko': 'MAR', 'Schweiz': 'SUI', 'Österrike': 'AUT',
    'Kroatien': 'CRO', 'Colombia': 'COL', 'Norge': 'NOR', 'Danmark': 'DEN',
    'Saudiarabien': 'KSA', 'Egypten': 'EGY', 'Tunisien': 'TUN', 'Ghana': 'GHA',
    'Sydafrika': 'RSA', 'Australien': 'AUS', 'Haiti': 'HAI', 'Jamaika': 'JAM',
    'Bolivia': 'BOL', 'Panama': 'PAN', 'Curaçao': 'CUW', 'Uzbekistan': 'UZB',
    'Paraguay': 'PAR', 'Jordanien': 'JOR', 'Qatar': 'QAT', 'Skottland': 'SCO'
};

const getAbbr = (name) => TEAM_ABBR[name] || name?.substring(0, 3).toUpperCase();

const BracketMatch = ({ match, resolveTeamInfo, filterCountry, onCountryClick }) => {
    const homeInfo = resolveTeamInfo(match.home);
    const awayInfo = resolveTeamInfo(match.away);
    const isHomeSelected = filterCountry && homeInfo.realName?.includes(filterCountry);
    const isAwaySelected = filterCountry && awayInfo.realName?.includes(filterCountry);

    const handleTeamClick = (e, name) => {
        if (!onCountryClick || !name || name.includes('Vinnare') || name.includes('/')) return;
        e.preventDefault();
        e.stopPropagation();
        onCountryClick(name);
    };

    const renderTeam = (info, isSelected) => {
        const name = info.realName || info.name;
        let display = info.realName ? getAbbr(info.realName) : info.name;
        if (info.realName && info.name.includes('(')) {
            const seed = info.name.split('(')[1].replace(')', '');
            display = `${display} (${seed})`;
        }
        return (
            <div 
                onClick={(e) => !info.isPlaceholder && handleTeamClick(e, info.realName)}
                style={{ 
                    display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px',
                    backgroundColor: isSelected ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
                    borderRadius: '6px', cursor: (!info.isPlaceholder && onCountryClick) ? 'pointer' : 'default',
                    transition: 'all 0.2s ease', minWidth: 0, flex: 1
                }}
            >
                <FlagBadge codes={getFlagCodes(name)} name={name} size={20} />
                <span style={{ 
                    fontSize: '0.75rem', fontWeight: isSelected ? '800' : '600',
                    color: info.isPlaceholder ? 'var(--color-text-muted)' : 'var(--color-text)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                }}>
                    {isSelected ? <BoldSverige text={display} /> : display}
                </span>
            </div>
        );
    };

    return (
        <div style={{ position: 'relative', width: '140px', zIndex: 2 }}>
            <Card padding="4px" style={{ 
                border: 'var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                background: 'var(--color-card-bg)', borderRadius: '10px',
                display: 'flex', flexDirection: 'column', gap: '2px'
            }}>
                {renderTeam(homeInfo, isHomeSelected)}
                <div style={{ height: '1px', background: 'var(--border)', margin: '0 4px' }} />
                {renderTeam(awayInfo, isAwaySelected)}
            </Card>
        </div>
    );
};

const VMBracket = ({ filterCountry, onCountryClick }) => {
    const [bracketData, setBracketData] = useState(null);
    const [groupsData, setGroupsData] = useState(null);
    const matchRefs = useRef({});
    const DATA_BASE_URL = 'https://raw.githubusercontent.com/denlyckligakompisen/os-koll/main/public/data';

    useEffect(() => {
        Promise.all([
            fetch(`${DATA_BASE_URL}/worldcup_2026_knockout.json`).then(res => res.json()),
            fetch(`${DATA_BASE_URL}/worldcup_2026_groups.json`).then(res => res.json())
        ])
        .then(([bData, gData]) => {
            setBracketData(bData);
            setGroupsData(gData);
        })
        .catch(console.error);
    }, []);

    const resolveTeamInfo = (label) => {
        if (!label || !groupsData?.groups) return { name: label || 'TBA', isPlaceholder: true };
        const rankMatch = label.match(/^([12])([A-L])$/i);
        if (rankMatch) {
            const rank = parseInt(rankMatch[1]);
            const groupChar = rankMatch[2].toUpperCase();
            const groupIdx = groupChar.charCodeAt(0) - 65;
            const group = groupsData.groups[groupIdx];
            if (group) {
                const sorted = [...group.teams].sort((a, b) => b.pts - a.pts || b.gd - a.gd || a.name.localeCompare(b.name, 'sv'));
                const team = sorted[rank - 1];
                if (team) return { name: `${team.name} (${label})`, realName: team.name, isPlaceholder: false };
            }
        }
        return { name: label, isPlaceholder: true };
    };

    const getMatchById = (id) => {
        if (!bracketData) return null;
        for (const round of bracketData.rounds) {
            const match = round.matches.find(m => m.id === id);
            if (match) return match;
        }
        return null;
    };

    useEffect(() => {
        if (filterCountry && bracketData && groupsData) {
            let targetId = null;
            for (const round of bracketData.rounds) {
                for (const match of round.matches) {
                    const home = resolveTeamInfo(match.home).realName;
                    const away = resolveTeamInfo(match.away).realName;
                    if ((home && home.includes(filterCountry)) || (away && away.includes(filterCountry))) {
                        targetId = match.id;
                        break;
                    }
                }
                if (targetId) break;
            }
            if (targetId && matchRefs.current[targetId]) {
                setTimeout(() => {
                    matchRefs.current[targetId].scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                }, 100);
            }
        }
    }, [filterCountry, bracketData, groupsData]);

    if (!bracketData || !groupsData) return <div style={{ padding: '80px 40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Laddar träd...</div>;

    const leftR32 = [74, 77, 73, 75, 76, 78, 79, 80];
    const leftR16 = [89, 90, 91, 92];
    const leftQF = [97, 98];
    const leftSF = [101];

    const rightR32 = [81, 82, 83, 84, 85, 86, 87, 88];
    const rightR16 = [93, 94, 95, 96];
    const rightQF = [99, 100];
    const rightSF = [102];

    const finalId = 104;

    const ROW_HEIGHT = 110; 
    const COLUMN_SPACING = 40; // Horizontal space between column contents

    const renderColumn = (ids, title) => {
        const numMatches = ids.length;
        const slotsPerMatch = 8 / numMatches;
        
        return (
            <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <div style={{ 
                    fontSize: '0.65rem', fontWeight: '900', textAlign: 'center', color: 'var(--color-text-muted)',
                    textTransform: 'uppercase', letterSpacing: '0.1em', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>{title}</div>
                <div style={{ position: 'relative', height: `${8 * ROW_HEIGHT}px`, width: '140px' }}>
                    {ids.map((id, idx) => {
                        const match = getMatchById(id);
                        const topPos = (idx * slotsPerMatch + slotsPerMatch / 2) * ROW_HEIGHT;
                        
                        return (
                            <div 
                                key={id} 
                                ref={el => matchRefs.current[id] = el} 
                                style={{ 
                                    position: 'absolute', 
                                    top: `${topPos}px`, 
                                    left: '0',
                                    transform: 'translateY(-50%)'
                                }}
                            >
                                {match ? <BracketMatch match={match} resolveTeamInfo={resolveTeamInfo} filterCountry={filterCountry} onCountryClick={onCountryClick} /> : <div style={{ width: '140px' }} />}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div 
            className="bracket-scroll-container"
            style={{ 
                width: '100%', 
                overflowX: 'auto', 
                overflowY: 'hidden',
                padding: '40px 0 80px 0', 
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'auto',
                msOverflowStyle: 'auto'
            }}
        >
            <style>{`
                .bracket-scroll-container::-webkit-scrollbar {
                    height: 8px;
                }
                .bracket-scroll-container::-webkit-scrollbar-track {
                    background: rgba(0,0,0,0.05);
                    border-radius: 4px;
                }
                .bracket-scroll-container::-webkit-scrollbar-thumb {
                    background: var(--color-primary);
                    border-radius: 4px;
                    opacity: 0.5;
                }
            `}</style>
            <div style={{ 
                display: 'flex', alignItems: 'flex-start', gap: `${COLUMN_SPACING}px`, minWidth: 'max-content',
                margin: '0 auto', padding: '0 40px'
            }}>
                {renderColumn(leftR32, "1/16-final")}
                {renderColumn(leftR16, "1/8-final")}
                {renderColumn(leftQF, "Kvartsfinal")}
                {renderColumn(leftSF, "Semifinal")}

                <div ref={el => matchRefs.current[finalId] = el} style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                    <div style={{ 
                        fontSize: '0.65rem', fontWeight: '900', textAlign: 'center', color: 'var(--color-text-muted)',
                        textTransform: 'uppercase', letterSpacing: '0.1em', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>FINAL</div>
                    <div style={{ position: 'relative', height: `${8 * ROW_HEIGHT}px`, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 20px' }}>
                        <div>
                            <BracketMatch match={getMatchById(finalId)} resolveTeamInfo={resolveTeamInfo} filterCountry={filterCountry} onCountryClick={onCountryClick} />
                        </div>
                    </div>
                </div>

                {renderColumn(rightSF, "Semifinal")}
                {renderColumn(rightQF, "Kvartsfinal")}
                {renderColumn(rightR16, "1/8-final")}
                {renderColumn(rightR32, "1/16-final")}
            </div>
        </div>
    );
};

export default VMBracket;
