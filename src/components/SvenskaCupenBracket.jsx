import React, { useState, useEffect, useRef } from 'react';
import Card from './common/Card';
import BoldSverige from './BoldSverige';

const BracketMatch = ({ match, filterTeam, onTeamClick, getTeamLogo }) => {
    const isHomeSelected = filterTeam && match.home?.includes(filterTeam);
    const isAwaySelected = filterTeam && match.away?.includes(filterTeam);

    const handleTeamClick = (e, name) => {
        if (!onTeamClick || !name || name.includes('Vinnare')) return;
        e.preventDefault();
        e.stopPropagation();
        onTeamClick(name);
    };

    const renderTeam = (name, isSelected, score, isWinner) => {
        const isPlaceholder = !name || name.includes('Vinnare');
        return (
            <div 
                onClick={(e) => !isPlaceholder && handleTeamClick(e, name)}
                style={{ 
                    display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px',
                    backgroundColor: isSelected ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
                    borderRadius: '8px', cursor: (!isPlaceholder) ? 'pointer' : 'default',
                    transition: 'all 0.2s ease', minWidth: 0, flex: 1
                }}
            >
                {getTeamLogo && getTeamLogo(name) && (
                    <img src={getTeamLogo(name)} alt="" style={{ width: '20px', height: '20px', objectFit: 'contain', opacity: isPlaceholder ? 0.3 : 1 }} />
                )}
                <span style={{ 
                    fontSize: '0.8rem', fontWeight: isSelected ? '800' : (isWinner ? '700' : '500'),
                    color: isPlaceholder ? 'var(--color-text-muted)' : 'var(--color-text)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    flex: 1
                }}>
                    {isSelected ? <BoldSverige text={name} /> : name}
                </span>
                {score !== null && score !== undefined && (
                    <span style={{ fontSize: '0.8rem', fontWeight: '800', color: isWinner ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>{score}</span>
                )}
            </div>
        );
    };

    return (
        <div style={{ position: 'relative', width: '180px', zIndex: 2 }}>
            <Card padding="4px" style={{ 
                border: 'var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                background: 'var(--color-card-bg)', borderRadius: '12px',
                display: 'flex', flexDirection: 'column', gap: '2px'
            }}>
                {renderTeam(match.home, isHomeSelected, match.homeScore, match.homeScore > match.awayScore || match.winner === 'home')}
                <div style={{ height: '1px', background: 'var(--border)', margin: '0 4px' }} />
                {renderTeam(match.away, isAwaySelected, match.awayScore, match.awayScore > match.homeScore || match.winner === 'away')}
            </Card>
        </div>
    );
};

const SvenskaCupenBracket = ({ filterTeam, onTeamClick, getTeamLogo }) => {
    const [bracketData] = useState({
        rounds: [
            {
                title: "Kvartsfinal",
                matches: [
                    { id: 1, home: "Mjällby AIF", away: "Malmö FF", homeScore: 4, awayScore: 0, winner: 'home' },
                    { id: 2, home: "GAIS", away: "AIK", homeScore: 3, awayScore: 2, winner: 'home' },
                    { id: 3, home: "Hammarby IF", away: "Djurgårdens IF", homeScore: 1, awayScore: 0, winner: 'home' },
                    { id: 4, home: "IK Sirius", away: "IFK Göteborg", homeScore: 1, awayScore: 0, winner: 'home' }
                ]
            },
            {
                title: "Semifinal",
                matches: [
                    { id: 5, home: "Mjällby AIF", away: "GAIS", homeScore: 3, awayScore: 0, winner: 'home' },
                    { id: 6, home: "Hammarby IF", away: "IK Sirius", homeScore: 3, awayScore: 3, winner: 'home', info: '7-5 e.str' }
                ]
            },
            {
                title: "Final",
                matches: [
                    { id: 7, home: "Hammarby IF", away: "Mjällby AIF", homeScore: null, awayScore: null, date: '14 maj' }
                ]
            }
        ]
    });

    const ROW_HEIGHT = 120;
    const COLUMN_SPACING = 60;

    const renderColumn = (round, roundIdx) => {
        const numMatches = round.matches.length;
        const totalHeight = 4 * ROW_HEIGHT;
        const spacing = totalHeight / numMatches;

        return (
            <div key={roundIdx} style={{ display: 'flex', flexDirection: 'column', width: '180px' }}>
                <div style={{ 
                    fontSize: '0.7rem', fontWeight: '900', textAlign: 'center', color: 'var(--color-text-muted)',
                    textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '20px'
                }}>
                    {round.title}
                </div>
                <div style={{ position: 'relative', height: `${totalHeight}px` }}>
                    {round.matches.map((match, idx) => {
                        const topPos = (idx * spacing) + (spacing / 2);
                        return (
                            <div 
                                key={match.id}
                                style={{ 
                                    position: 'absolute',
                                    top: `${topPos}px`,
                                    left: 0,
                                    transform: 'translateY(-50%)'
                                }}
                            >
                                <BracketMatch 
                                    match={match} 
                                    filterTeam={filterTeam} 
                                    onTeamClick={onTeamClick} 
                                    getTeamLogo={getTeamLogo}
                                />
                                {match.date && (
                                    <div style={{ 
                                        position: 'absolute', bottom: '-20px', left: '50%', transform: 'translateX(-50%)',
                                        fontSize: '0.65rem', color: 'var(--color-text-muted)', fontWeight: '600'
                                    }}>
                                        {match.date}
                                    </div>
                                )}
                                {match.info && (
                                    <div style={{ 
                                        position: 'absolute', top: '-18px', left: '50%', transform: 'translateX(-50%)',
                                        fontSize: '0.65rem', color: 'var(--color-text-muted)', fontWeight: '600', whiteSpace: 'nowrap'
                                    }}>
                                        {match.info}
                                    </div>
                                )}
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
                display: 'flex', gap: `${COLUMN_SPACING}px`, minWidth: 'max-content',
                margin: '0 auto', padding: '0 40px'
            }}>
                {bracketData.rounds.map((round, idx) => renderColumn(round, idx))}
            </div>
        </div>
    );
};

export default SvenskaCupenBracket;
