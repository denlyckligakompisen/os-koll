import React, { useState, useEffect, useMemo } from 'react';
import { getFlagCodes } from '../utils/flags';
import MatchCard from './MatchCard';
import Card from './common/Card';

const VMBracket = ({ filterCountry, onCountryClick }) => {
    const [bracketData, setBracketData] = useState(null);
    const [groupsData, setGroupsData] = useState(null);
    const [activeRoundIdx, setActiveRoundIdx] = useState(0);
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

    const filteredCountryStatus = useMemo(() => {
        if (!groupsData?.groups || !filterCountry) return { groupChar: null, rank: null };
        const group = groupsData.groups.find(g => 
            g.teams.some(t => (typeof t === 'string' ? t : t.name).includes(filterCountry))
        );
        if (!group) return { groupChar: null, rank: null };
        
        const groupChar = group.name.split(' ')[1];
        const sorted = [...group.teams].sort((a, b) => b.pts - a.pts || b.gd - a.gd || a.name.localeCompare(b.name, 'sv'));
        const rank = sorted.findIndex(t => (typeof t === 'string' ? t : t.name).includes(filterCountry)) + 1;
        
        return { groupChar, rank };
    }, [groupsData, filterCountry]);

    const TEAM_ABBR = {
        'Sverige': 'SWE', 'Mexiko': 'MEX', 'USA': 'USA', 'Kanada': 'CAN', 'Brasilien': 'BRA',
        'Bosnien': 'BIH', 'Grekland': 'GRE', 'Tjeckien': 'CZE', 'Nederländerna': 'NED',
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

    const resolveTeamInfo = (label) => {
        if (!label || !groupsData?.groups) return { name: label || 'TBA', isPlaceholder: true };

        // Handle 1A, 2B, etc.
        const rankMatch = label.match(/^([12])([A-L])$/i);
        if (rankMatch) {
            const rank = parseInt(rankMatch[1]);
            const groupChar = rankMatch[2].toUpperCase();
            const groupIdx = groupChar.charCodeAt(0) - 65; // A=0, B=1...
            
            const group = groupsData.groups[groupIdx];
            if (group) {
                const sorted = [...group.teams].sort((a, b) => b.pts - a.pts || b.gd - a.gd || a.name.localeCompare(b.name, 'sv'));
                const team = sorted[rank - 1];
                if (team) {
                    return { 
                        name: `${label}\n${team.name}`, 
                        realName: team.name,
                        isPlaceholder: false 
                    };
                }
            }
        }

        // Handle 3A/B/C/D etc.
        if (label.includes('/')) {
            const parts = label.split('/'); // ["3A", "B", "C", "D"]
            const groupChars = [];
            const rank = parseInt(parts[0][0]); // usually 3
            groupChars.push(parts[0][1]);
            for (let i = 1; i < parts.length; i++) groupChars.push(parts[i]);

            const abbrs = groupChars.map(char => {
                const idx = char.toUpperCase().charCodeAt(0) - 65;
                const group = groupsData.groups[idx];
                if (group) {
                    const sorted = [...group.teams].sort((a, b) => b.pts - a.pts || b.gd - a.gd || a.name.localeCompare(b.name, 'sv'));
                    const team = sorted[rank - 1];
                    return team ? getAbbr(team.name) : char;
                }
                return char;
            });

            return {
                name: `${label}\n(${abbrs.join('/')})`,
                isPlaceholder: true // Still a placeholder until the specific 3rd place is locked
            };
        }

        return { name: label, isPlaceholder: true };
    };

    const groupedMatches = useMemo(() => {
        if (!bracketData?.rounds || !groupsData) return {};
        const currentRound = bracketData.rounds[activeRoundIdx];
        if (!currentRound) return {};

        return currentRound.matches.reduce((acc, m) => {
            const homeInfo = resolveTeamInfo(m.home);
            const awayInfo = resolveTeamInfo(m.away);
            
            const isCountryPlaceholder = (label) => {
                if (!label || !filteredCountryStatus.groupChar || !filteredCountryStatus.rank) return false;
                const target = `${filteredCountryStatus.rank}${filteredCountryStatus.groupChar}`;
                
                // Direct match like "1F" or "2F"
                if (label.includes(target)) return true;
                
                // Handle 3rd place complex labels like "3A/B/C/F"
                if (filteredCountryStatus.rank === 3 && label.startsWith('3') && label.includes(filteredCountryStatus.groupChar)) {
                    return true;
                }
                
                return false;
            };

            const isFilterCountryMatch = filterCountry ? (
                (homeInfo.realName?.includes(filterCountry)) || 
                (awayInfo.realName?.includes(filterCountry)) ||
                (m.home?.includes(filterCountry)) ||
                (m.away?.includes(filterCountry)) ||
                isCountryPlaceholder(m.home) ||
                isCountryPlaceholder(m.away)
            ) : true;

            if (filterCountry && !isFilterCountryMatch) return acc;

            const resolved = {
                ...m,
                home: homeInfo.name,
                away: awayInfo.name,
                isPreliminary: homeInfo.isPlaceholder || awayInfo.isPlaceholder
            };
            if (!acc[resolved.date]) acc[resolved.date] = [];
            acc[resolved.date].push(resolved);
            return acc;
        }, {});
    }, [bracketData, groupsData, activeRoundIdx, filterCountry, filteredCountryStatus]);

    if (!bracketData || !groupsData) return (
        <div style={{ padding: '80px 40px', textAlign: 'center', color: 'var(--color-text-muted)', fontWeight: '600' }}>
            Laddar slutspel...
        </div>
    );

    const rounds = bracketData.rounds || [];

    return (
        <div>
            {/* Rounds Selector (Premium Segmented Style) */}
            <div style={{ 
                display: 'flex', 
                overflowX: 'auto', 
                gap: '8px', 
                padding: '4px', 
                marginBottom: '24px',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
            }}>
                {rounds.map((round, idx) => (
                    <button
                        key={round.id}
                        onClick={() => setActiveRoundIdx(idx)}
                        style={{
                            whiteSpace: 'nowrap',
                            padding: '10px 18px',
                            borderRadius: '12px',
                            border: 'none',
                            backgroundColor: activeRoundIdx === idx ? 'var(--color-primary)' : 'var(--color-surface-subtle)',
                            color: activeRoundIdx === idx ? '#ffffff' : 'var(--color-text-muted)',
                            fontSize: '0.8rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                        }}
                    >
                        {round.name}
                    </button>
                ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '40px' }}>
                {Object.entries(groupedMatches).map(([date, matches], groupIdx) => (
                    <div key={date} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ 
                            fontSize: '0.8rem', 
                            fontWeight: '800', 
                            textTransform: 'uppercase', 
                            paddingLeft: '4px',
                            color: 'var(--color-text-muted)',
                            letterSpacing: '0.02em'
                        }}>{date}</div>
                        {matches.map((m, i) => (
                            <MatchCard 
                                key={m.id || i} 
                                match={m} 
                                idx={i} 
                                onCountryClick={onCountryClick}
                                style={m.isPreliminary ? { opacity: 0.85 } : {}}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VMBracket;
