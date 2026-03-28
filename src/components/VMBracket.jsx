import React, { useState, useEffect, useMemo } from 'react';
import { getFlagCodes } from '../utils/flags';
import MatchCard from './MatchCard';
import Card from './common/Card';

const VMBracket = () => {
    const [bracketData, setBracketData] = useState(null);
    const [groupsData, setGroupsData] = useState(null);
    const [activeRoundIdx, setActiveRoundIdx] = useState(0);

    useEffect(() => {
        Promise.all([
            fetch('https://raw.githubusercontent.com/denlyckligakompisen/os-koll/main/public/data/worldcup_2026_knockout.json').then(res => res.json()),
            fetch('https://raw.githubusercontent.com/denlyckligakompisen/os-koll/main/public/data/worldcup_2026_groups.json').then(res => res.json())
        ])
        .then(([bData, gData]) => {
            setBracketData(bData);
            setGroupsData(gData);
        })
        .catch(console.error);
    }, []);

    const resolveTeamInfo = (label) => {
        if (!label) return { name: 'TBA', isPreliminary: true };
        
        // Show the raw labels from the JSON as requested.
        // We still mark them as preliminary if they are placeholders.
        const isPlaceholder = label.match(/^([1-3][A-L])|(\d[A-L]\/.+)|(Vinnare \d+)|(TBA)/i);
        
        return { 
            name: label, 
            isPreliminary: !!isPlaceholder 
        };
    };

    const groupedMatches = useMemo(() => {
        if (!bracketData?.rounds || !groupsData) return {};
        const currentRound = bracketData.rounds[activeRoundIdx];
        if (!currentRound) return {};

        return currentRound.matches.reduce((acc, m) => {
            const homeInfo = resolveTeamInfo(m.home);
            const awayInfo = resolveTeamInfo(m.away);
            
            const resolved = {
                ...m,
                home: homeInfo.name,
                away: awayInfo.name,
                isPreliminary: homeInfo.isPreliminary || awayInfo.isPreliminary
            };
            if (!acc[resolved.date]) acc[resolved.date] = [];
            acc[resolved.date].push(resolved);
            return acc;
        }, {});
    }, [bracketData, groupsData, activeRoundIdx]);

    if (!bracketData || !groupsData) return (
        <div style={{ padding: '80px 40px', textAlign: 'center', color: 'var(--color-text-muted)', fontWeight: '600' }}>
            Laddar slutspel...
        </div>
    );

    const rounds = bracketData.rounds || [];
    const isAnyPreliminary = Object.values(groupedMatches).flat().some(m => m.isPreliminary);

    return (
        <div>
            {/* Preliminary Notice Banner */}
            {isAnyPreliminary && (
                <div style={{ 
                    marginBottom: '20px', 
                    padding: '10px 14px', 
                    backgroundColor: 'rgba(0, 122, 255, 0.05)', 
                    borderRadius: '10px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px',
                    border: '0.5px solid rgba(0, 122, 255, 0.1)'
                }}>
                    <div style={{ width: '6px', height: '6px', backgroundColor: 'var(--color-primary)', borderRadius: '50%' }} />
                    <span style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--color-primary)', letterSpacing: '0.01em' }}>
                        PRELIMINÄRT TRÄD BASERAT PÅ TABELLÄGET
                    </span>
                </div>
            )}

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
