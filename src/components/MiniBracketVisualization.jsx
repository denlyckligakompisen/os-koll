import React from 'react';
import FlagBadge from './common/FlagBadge';
import { getFlagCode } from '../utils/flags';

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
    const topMatch = isTop ? match : opponentMatch;
    const bottomMatch = isTop ? opponentMatch : match;
    
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '16px', marginBottom: '8px', gap: '8px' }}>
            {/* Left Column: The two matches */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', opacity: isTop ? 1 : 0.6, transform: isTop ? 'scale(1.05)' : 'scale(1)', transition: 'all 0.3s' }}>
                    {renderTeamBadge(topMatch.home)}
                    {renderTeamBadge(topMatch.away)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', opacity: !isTop ? 1 : 0.6, transform: !isTop ? 'scale(1.05)' : 'scale(1)', transition: 'all 0.3s' }}>
                    {renderTeamBadge(bottomMatch.home)}
                    {renderTeamBadge(bottomMatch.away)}
                </div>
            </div>
            
            {/* Middle Column: SVG Connector */}
            <div style={{ width: '40px', height: '96px', flexShrink: 0 }}>
                <svg width="40" height="96" viewBox="0 0 40 96">
                    <path d="M 0 20 L 20 20 L 20 76 L 0 76 M 20 48 L 40 48" stroke="rgba(128,128,128,0.4)" strokeWidth="2" fill="none" />
                </svg>
            </div>
            
            {/* Right Column: Next match placeholder */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {nextMatch ? (
                    <>
                        {renderTeamBadge(nextMatch.home)}
                        {renderTeamBadge(nextMatch.away)}
                    </>
                ) : (
                    <>
                        <FlagBadge size={32} shadow={true} />
                        <FlagBadge size={32} shadow={true} />
                    </>
                )}
            </div>
        </div>
    );
};

export default MiniBracketVisualization;
