import React, { useState, useEffect, useRef } from 'react';
import { getFlagCodes, getFlagCode } from '../utils/flags';
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
                <FlagBadge codes={info.flagCodes || getFlagCodes(name)} name={name} size={20} />
                <span style={{ 
                    fontSize: '0.75rem', fontWeight: '400',
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

const VMBracket = ({ filterCountry, onCountryClick, liveGroupsData }) => {
    const [bracketData, setBracketData] = useState(null);
    const [fetchedGroupsData, setFetchedGroupsData] = useState(null);
    const groupsData = liveGroupsData || fetchedGroupsData;
    const matchRefs = useRef({});
    const scrollContainerRef = useRef(null);

    useEffect(() => {
        import('../utils/fifaLiveApi').then(m => m.fetchAllFifaData()).then(data => {
            if (data) {
                setBracketData(data.knockoutData);
                setFetchedGroupsData({ groups: data.groupsData });
            }
        }).catch(console.error);
    }, []);

    useEffect(() => {
        if (bracketData && scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            // Timeout to allow rendering of children first
            setTimeout(() => {
                container.scrollLeft = (container.scrollWidth - container.clientWidth) / 2;
            }, 10);
        }
    }, [bracketData]);

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
                if (team) return { name: team.name, realName: team.name, isPlaceholder: false };
            }
        }

        if (label.includes('/')) {
            const parts = label.split('/');
            const groupChars = [];
            const rank = parseInt(parts[0][0]);
            groupChars.push(parts[0][1]);
            for (let i = 1; i < parts.length; i++) groupChars.push(parts[i]);

            const top8ThirdsNames = new Set();
            if (groupsData?.groups) {
                const thirds = groupsData.groups.map(g => {
                    const sorted = [...g.teams].sort((a, b) => b.pts - a.pts || b.gd - a.gd || a.name.localeCompare(b.name, 'sv'));
                    return sorted[2];
                }).filter(Boolean);
                thirds.sort((a, b) => (b.pts - a.pts) || (b.gd - a.gd) || (a.name.localeCompare(b.name, 'sv')));
                thirds.slice(0, 8).forEach(t => top8ThirdsNames.add(t.name));
            }

            const validIndices = [];
            groupChars.forEach((char, i) => {
                const idx = char.toUpperCase().charCodeAt(0) - 65;
                const group = groupsData.groups[idx];
                if (group) {
                    const sorted = [...group.teams].sort((a, b) => b.pts - a.pts || b.gd - a.gd || a.name.localeCompare(b.name, 'sv'));
                    const team = sorted[rank - 1];
                    if (team && top8ThirdsNames.has(team.name)) {
                        validIndices.push(i);
                    }
                }
            });

            const indicesToUse = (rank === 3 && validIndices.length > 0) ? validIndices : groupChars.map((_, i) => i);

            const abbrs = indicesToUse.map(i => {
                const char = groupChars[i];
                const idx = char.toUpperCase().charCodeAt(0) - 65;
                const group = groupsData.groups[idx];
                if (group) {
                    const sorted = [...group.teams].sort((a, b) => b.pts - a.pts || b.gd - a.gd || a.name.localeCompare(b.name, 'sv'));
                    const team = sorted[rank - 1];
                    return team ? getAbbr(team.name) : char;
                }
                return char;
            });

            const flagCodes = indicesToUse.map(i => {
                const char = groupChars[i];
                const idx = char.toUpperCase().charCodeAt(0) - 65;
                const group = groupsData.groups[idx];
                if (group) {
                    const sorted = [...group.teams].sort((a, b) => b.pts - a.pts || b.gd - a.gd || a.name.localeCompare(b.name, 'sv'));
                    const team = sorted[rank - 1];
                    if (team && team.name) return getFlagCode(team.name);
                }
                return null;
            }).filter(Boolean);

            return {
                name: `${label}\n${abbrs.join('/')}`,
                isPlaceholder: true,
                flagCodes: flagCodes.length > 0 ? flagCodes : undefined
            };
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
        
        const firstCardTop = (slotsPerMatch / 2) * ROW_HEIGHT;
        
        return (
            <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <div style={{ position: 'relative', height: `${8 * ROW_HEIGHT}px`, width: '140px' }}>
                    <div style={{ 
                        position: 'absolute',
                        top: `${firstCardTop - 40}px`,
                        left: '0',
                        width: '100%',
                        fontSize: '0.65rem', textAlign: 'center', color: 'var(--color-text-muted)',
                        textTransform: 'uppercase', letterSpacing: '0.1em',
                        transform: 'translateY(-100%)'
                    }}>{title}</div>
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
            ref={scrollContainerRef}
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
                display: 'flex', alignItems: 'flex-start', gap: `${COLUMN_SPACING}px`, width: 'max-content',
                margin: '0 auto', padding: '0 40px'
            }}>
                {renderColumn(leftR32, "1/16-final")}
                {renderColumn(leftR16, "1/8-final")}
                {renderColumn(leftQF, "Kvartsfinal")}
                {renderColumn(leftSF, "Semifinal")}

                <div ref={el => matchRefs.current[finalId] = el} style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                    <div style={{ position: 'relative', height: `${8 * ROW_HEIGHT}px`, width: '180px' }}>
                        
                        <div style={{ 
                            position: 'absolute', top: '50%', left: '20px', transform: 'translateY(-50%)', 
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px', width: '100%' 
                        }}>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%' }}>
                                <div style={{ 
                                    fontSize: '0.65rem', textAlign: 'center', color: 'var(--color-text-muted)',
                                    textTransform: 'uppercase', letterSpacing: '0.1em'
                                }}>FINAL</div>
                                <BracketMatch match={getMatchById(finalId)} resolveTeamInfo={resolveTeamInfo} filterCountry={filterCountry} onCountryClick={onCountryClick} />
                            </div>

                            <div ref={el => matchRefs.current[103] = el} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%' }}>
                                <div style={{ 
                                    fontSize: '0.65rem', textAlign: 'center', color: 'var(--color-text-muted)', 
                                    textTransform: 'uppercase', letterSpacing: '0.1em' 
                                }}>Bronsmatch</div>
                                <BracketMatch match={getMatchById(103)} resolveTeamInfo={resolveTeamInfo} filterCountry={filterCountry} onCountryClick={onCountryClick} />
                            </div>

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
