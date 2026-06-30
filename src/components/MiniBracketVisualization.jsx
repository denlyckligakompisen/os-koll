import React from 'react';


const BRACKET_PAIRS = [
    { matches: [74, 77], next: 89 },
    { matches: [73, 75], next: 90 },
    { matches: [76, 78], next: 91 },
    { matches: [79, 80], next: 92 },
    { matches: [89, 90], next: 97 },
    { matches: [91, 92], next: 98 },
    { matches: [97, 98], next: 101 },
    { matches: [81, 82], next: 93 },
    { matches: [83, 84], next: 94 },
    { matches: [85, 86], next: 95 },
    { matches: [87, 88], next: 96 },
    { matches: [93, 94], next: 99 },
    { matches: [95, 96], next: 100 },
    { matches: [99, 100], next: 102 },
    { matches: [101, 102], next: 104 }
];

const resolveTeamRealName = (name) => {
    if (!name) return null;
    if (name.includes('Vinnare') || name.match(/^[1-3][A-Z]+$/) || name.includes('/')) return null;
    return name;
};

const renderTeamBadge = (name) => {
    const realName = resolveTeamRealName(name);
    if (!realName) return <FlagBadge size={32} shadow={true} />;
    const code = getFlagCode(realName);
    return <FlagBadge codes={code ? [code] : undefined} name={realName} size={32} shadow={true} />;
};

const MiniBracketVisualization = ({ match, combinedMatches }) => {
    if (!match || !match.id) return null;
    
    const pair = BRACKET_PAIRS.find(p => p.matches.includes(match.id));
    if (!pair) return null; // Not a knockout match with a pair
    
    const opponentMatchId = pair.matches.find(id => id !== match.id);
    const nextMatchId = pair.next;
    
    const opponentMatch = combinedMatches.find(m => m.id === opponentMatchId);
    const nextMatch = combinedMatches.find(m => m.id === nextMatchId);
    
    if (!opponentMatch) return null;
    
    const isTop = pair.matches[0] === match.id;
    const getTeamDisplay = (matchObj, side) => {
        if (!matchObj) return 'TBA';
        const realName = matchObj[side === 'home' ? 'realHome' : 'realAway'];
        if (realName) return realName;
        
        const name = matchObj[side];
        if (!name) return 'TBA';
        if (name.includes('\n')) return name.split('\n')[0];
        return name;
    };

    const oppHome = getTeamDisplay(opponentMatch, 'home');
    const oppAway = getTeamDisplay(opponentMatch, 'away');

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '4px', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textAlign: 'center', lineHeight: '1.4' }}>
                Möter vinnaren mellan <strong style={{ color: 'var(--color-text)' }}>{oppHome}</strong> och <strong style={{ color: 'var(--color-text)' }}>{oppAway}</strong>
            </span>
        </div>
    );
};

export default MiniBracketVisualization;
