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
        let prefix = null;
        if (info.name && info.name.includes('\n')) {
            const parts = info.name.split('\n');
            prefix = parts[0];
        }

        const hasFlag = !!info.flagCodes || (name && !info.isPlaceholder);

        return (
            <div 
                onClick={(e) => !info.isPlaceholder && handleTeamClick(e, info.realName)}
                style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: isSelected ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
                    borderRadius: '50%', cursor: (!info.isPlaceholder && onCountryClick) ? 'pointer' : 'default',
                    transition: 'all 0.2s ease', margin: '0 auto'
                }}
                title={name}
            >
                {hasFlag ? (
                    <FlagBadge codes={info.flagCodes || getFlagCodes(name)} name={name} size={28} />
                ) : (
                    <FlagBadge size={28} />
                )}
            </div>
        );
    };

    return (
        <div style={{ position: 'relative', width: '50px', zIndex: 2, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {renderTeam(homeInfo, isHomeSelected)}
            {renderTeam(awayInfo, isAwaySelected)}
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

    const isTeamSecuredAtRank = (group, rank, team) => {
        if (!group || !group.teams) return false;
        if (group.teams.every(t => t.played === 3)) return true;
        const teamsWithMax = group.teams.map(t => ({
            ...t, maxPts: t.pts + ((3 - t.played) * 3)
        }));
        const teamMinPts = team.pts;
        const teamMaxPts = team.pts + ((3 - team.played) * 3);
        const sorted = [...group.teams].sort((a, b) => b.pts - a.pts || b.gd - a.gd || a.name.localeCompare(b.name, 'sv'));

        if (rank === 1) {
            const othersMax = Math.max(...teamsWithMax.filter(t => t.name !== team.name).map(t => t.maxPts));
            return teamMinPts > othersMax;
        } else if (rank === 2) {
            const currentFirst = sorted[0];
            if (!currentFirst) return false;
            if (teamMaxPts >= currentFirst.pts) return false; 
            const othersBelow = teamsWithMax.filter(t => t.name !== team.name && t.name !== currentFirst.name);
            const othersBelowMax = Math.max(0, ...othersBelow.map(t => t.maxPts));
            return teamMinPts > othersBelowMax;
        }
        return false;
    };

    const resolveTeamInfo = (label) => {
        if (!label || !groupsData?.groups) return { name: label || 'TBA', isPlaceholder: true };
        
        // If it's a known country name, it's not a placeholder
        const flagCode = getFlagCode(label);
        if (flagCode) {
            return { name: label, realName: label, isPlaceholder: false, flagCodes: [flagCode] };
        }

        const rankMatch = label.match(/^([12])([A-L])$/i);
        if (rankMatch) {
            const rank = parseInt(rankMatch[1]);
            const groupChar = rankMatch[2].toUpperCase();
            const groupIdx = groupChar.charCodeAt(0) - 65;
            const group = groupsData.groups[groupIdx];
            if (group) {
                const sorted = [...group.teams].sort((a, b) => b.pts - a.pts || b.gd - a.gd || a.name.localeCompare(b.name, 'sv'));
                const team = sorted[rank - 1];
                if (team) {
                    const isSecured = isTeamSecuredAtRank(group, rank, team);
                    return { 
                        name: isSecured ? team.name : `${label}\n${getAbbr(team.name)}`, 
                        realName: team.name, 
                        isPlaceholder: !isSecured 
                    };
                }
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

            const isAllGroupsFinished = groupsData?.groups ? groupsData.groups.every(g => g.teams.every(t => t.played === 3)) : false;

            return {
                name: `${label}\n${abbrs.join('/')}`,
                isPlaceholder: true,
                flagCodes: (isAllGroupsFinished && flagCodes.length > 0) ? flagCodes : undefined
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
    const CONNECTOR_WIDTH = 30;

    const renderConnector = (largeCount, direction) => {
        const svgHeight = 8 * ROW_HEIGHT;
        const slotsPerMatch = 8 / largeCount;
        const pairs = largeCount / 2;
        
        const lines = [];
        for (let i = 0; i < pairs; i++) {
            const y1 = ( (i * 2) * slotsPerMatch + slotsPerMatch / 2 ) * ROW_HEIGHT;
            const y2 = ( (i * 2 + 1) * slotsPerMatch + slotsPerMatch / 2 ) * ROW_HEIGHT;
            const yMid = (y1 + y2) / 2;
            
            if (direction === 'right') {
                lines.push(
                    <path key={i} d={`M 0 ${y1} L ${CONNECTOR_WIDTH/2} ${y1} L ${CONNECTOR_WIDTH/2} ${y2} L 0 ${y2} M ${CONNECTOR_WIDTH/2} ${yMid} L ${CONNECTOR_WIDTH} ${yMid}`} stroke="rgba(128,128,128,0.4)" strokeWidth="2" fill="none" />
                );
            } else {
                lines.push(
                    <path key={i} d={`M ${CONNECTOR_WIDTH} ${y1} L ${CONNECTOR_WIDTH/2} ${y1} L ${CONNECTOR_WIDTH/2} ${y2} L ${CONNECTOR_WIDTH} ${y2} M ${CONNECTOR_WIDTH/2} ${yMid} L 0 ${yMid}`} stroke="rgba(128,128,128,0.4)" strokeWidth="2" fill="none" />
                );
            }
        }
        
        return (
            <div style={{ width: `${CONNECTOR_WIDTH}px`, height: `${svgHeight}px`, flexShrink: 0 }}>
                <svg width={CONNECTOR_WIDTH} height={svgHeight}>
                    {lines}
                </svg>
            </div>
        );
    };

    const renderStraightConnector = () => {
        const svgHeight = 8 * ROW_HEIGHT;
        const yMid = 4 * ROW_HEIGHT;
        return (
            <div style={{ width: `${CONNECTOR_WIDTH}px`, height: `${svgHeight}px`, flexShrink: 0 }}>
                <svg width={CONNECTOR_WIDTH} height={svgHeight}>
                    <line x1="0" y1={yMid} x2={CONNECTOR_WIDTH} y2={yMid} stroke="rgba(128,128,128,0.4)" strokeWidth="2" />
                </svg>
            </div>
        );
    };

    const getNextMatchId = () => {
        if (!bracketData) return null;
        let nextId = null;
        for (const round of bracketData.rounds) {
            for (const match of round.matches) {
                if (match.status !== 'finished') {
                    if (nextId === null || match.id < nextId) {
                        nextId = match.id;
                    }
                }
            }
        }
        return nextId;
    };

    const nextMatchId = getNextMatchId();

    const isRoundActive = (ids) => {
        if (nextMatchId === null) return false;
        const allR32 = [...leftR32, ...rightR32];
        const allR16 = [...leftR16, ...rightR16];
        const allQF = [...leftQF, ...rightQF];
        const allSF = [...leftSF, ...rightSF];
        
        if (allR32.includes(nextMatchId) && allR32.some(id => ids.includes(id))) return true;
        if (allR16.includes(nextMatchId) && allR16.some(id => ids.includes(id))) return true;
        if (allQF.includes(nextMatchId) && allQF.some(id => ids.includes(id))) return true;
        if (allSF.includes(nextMatchId) && allSF.some(id => ids.includes(id))) return true;
        return ids.includes(nextMatchId);
    };

    const renderColumn = (ids, title) => {
        const numMatches = ids.length;
        const slotsPerMatch = 8 / numMatches;
        
        const firstCardTop = (slotsPerMatch / 2) * ROW_HEIGHT;
        const isActive = isRoundActive(ids);
        
        return (
            <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <div style={{ position: 'relative', height: `${8 * ROW_HEIGHT}px`, width: '50px' }}>
                    <div style={{ 
                        position: 'absolute',
                        top: `0px`,
                        left: '50%',
                        transform: 'translate(-50%, -100%)',
                        fontSize: '0.65rem', textAlign: 'center', 
                        color: isActive ? '#fff' : 'var(--color-text-muted)',
                        textTransform: 'uppercase', letterSpacing: '0.1em',
                        background: isActive ? 'var(--color-primary)' : 'var(--color-card-bg)',
                        padding: '4px 8px',
                        borderRadius: '8px',
                        whiteSpace: 'pre-line',
                        lineHeight: '1.2',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        border: isActive ? '1px solid var(--color-primary)' : 'var(--border)',
                        fontWeight: isActive ? 'bold' : 'normal',
                        zIndex: 10
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
                                {match ? <BracketMatch match={match} resolveTeamInfo={resolveTeamInfo} filterCountry={filterCountry} onCountryClick={onCountryClick} /> : <div style={{ width: '50px' }} />}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const finalIsActive = nextMatchId === finalId;
    const bronzeIsActive = nextMatchId === 103;

    return (
        <div 
            ref={scrollContainerRef}
            className="bracket-scroll-container"
            style={{ 
                width: '100%', 
                overflowX: 'auto', 
                overflowY: 'hidden',
                padding: '40px 0 24px 0', 
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
                display: 'flex', alignItems: 'flex-start', width: 'max-content',
                margin: '0 auto', padding: '0 40px'
            }}>
                {renderColumn(leftR32, "1/16-\nfinal")}
                {renderConnector(8, 'right')}
                {renderColumn(leftR16, "1/8-\nfinal")}
                {renderConnector(4, 'right')}
                {renderColumn(leftQF, "Kvarts-\nfinal")}
                {renderConnector(2, 'right')}
                {renderColumn(leftSF, "Semi-\nfinal")}

                {renderStraightConnector()}

                <div ref={el => matchRefs.current[finalId] = el} style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                    <div style={{ position: 'relative', height: `${8 * ROW_HEIGHT}px`, width: '50px' }}>

                        <div style={{ 
                            position: 'absolute',
                            top: `0px`,
                            left: '50%',
                            transform: 'translate(-50%, -100%)',
                            fontSize: '0.65rem', textAlign: 'center', 
                            color: finalIsActive ? '#fff' : 'var(--color-text-muted)',
                            textTransform: 'uppercase', letterSpacing: '0.1em',
                            background: finalIsActive ? 'var(--color-primary)' : 'var(--color-card-bg)',
                            padding: '4px 8px',
                            borderRadius: '8px',
                            whiteSpace: 'nowrap',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                            border: finalIsActive ? '1px solid var(--color-primary)' : 'var(--border)',
                            fontWeight: finalIsActive ? 'bold' : 'normal',
                            zIndex: 10
                        }}>Final</div>
                        
                        <div style={{ 
                            position: 'absolute', top: `${4 * ROW_HEIGHT}px`, left: '0', 
                            transform: 'translateY(-50%)', width: '100%',
                            display: 'flex', flexDirection: 'column', alignItems: 'center'
                        }}>
                            <BracketMatch match={getMatchById(finalId)} resolveTeamInfo={resolveTeamInfo} filterCountry={filterCountry} onCountryClick={onCountryClick} />
                        </div>

                        <div ref={el => matchRefs.current[103] = el} style={{ 
                            position: 'absolute', top: `${6.5 * ROW_HEIGHT}px`, left: '0', 
                            transform: 'translateY(-50%)', width: '100%',
                            display: 'flex', flexDirection: 'column', alignItems: 'center'
                        }}>
                            <div style={{ 
                                fontSize: '0.65rem', textAlign: 'center', 
                                color: bronzeIsActive ? '#fff' : 'var(--color-text-muted)', 
                                textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px',
                                background: bronzeIsActive ? 'var(--color-primary)' : 'var(--color-card-bg)',
                                padding: '4px 8px',
                                borderRadius: '8px',
                                whiteSpace: 'pre-line',
                                lineHeight: '1.2',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                border: bronzeIsActive ? '1px solid var(--color-primary)' : 'var(--border)',
                                fontWeight: bronzeIsActive ? 'bold' : 'normal',
                                zIndex: 10
                            }}>Brons-{"\n"}match</div>
                            <BracketMatch match={getMatchById(103)} resolveTeamInfo={resolveTeamInfo} filterCountry={filterCountry} onCountryClick={onCountryClick} />
                        </div>
                        
                    </div>
                </div>

                {renderStraightConnector()}

                {renderColumn(rightSF, "Semi-\nfinal")}
                {renderConnector(2, 'left')}
                {renderColumn(rightQF, "Kvarts-\nfinal")}
                {renderConnector(4, 'left')}
                {renderColumn(rightR16, "1/8-\nfinal")}
                {renderConnector(8, 'left')}
                {renderColumn(rightR32, "1/16-\nfinal")}
            </div>
        </div>
    );
};

export default VMBracket;
