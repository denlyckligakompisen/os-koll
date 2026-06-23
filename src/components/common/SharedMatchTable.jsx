import React from 'react';
import Card from './Card';
import TeamLogo from '../MatchCard/TeamLogo';
import BoldSverige from '../BoldSverige';

const SharedMatchTable = ({ 
    title, 
    teams,
    isInline = false, 
    onTeamClick,
    hideRank = false,
    dividerIndex
}) => {
    if (!teams || teams.length === 0) return null;

    return (
        <div style={{ 
            marginBottom: isInline ? '8px' : '32px',
            animation: isInline ? 'slideOutFromUnder 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards' : 'none'
        }}>
            {!isInline && title && (
                <div style={{
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    paddingLeft: '4px',
                    marginBottom: '12px',
                    color: 'var(--color-text-muted)',
                    letterSpacing: '0.05em'
                }}>
                    <BoldSverige text={title} />
                </div>
            )}
            <Card
                padding={isInline ? "32px 12px 16px 12px" : "4px 8px"}
                style={{
                    marginBottom: '0',
                    marginTop: isInline ? '-32px' : '0',
                    backgroundColor: isInline ? 'rgba(255, 255, 255, 0.8)' : '#ffffff',
                    boxShadow: isInline ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                    borderRadius: isInline ? '0 0 16px 16px' : '16px',
                    borderTop: isInline ? 'none' : undefined,
                    position: 'relative',
                    zIndex: 1,
                    width: isInline ? 'calc(100% - 32px)' : '100%',
                    margin: isInline ? '-32px auto 0 auto' : '0',
                    overflow: 'hidden'
                }}
            >
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 2px', fontSize: isInline ? '0.7rem' : '0.8rem' }}>
                    {title && (
                        <caption style={{ position: 'absolute', width: '1px', height: '1px', padding: '0', margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', border: '0' }}>
                            Tabell för {title}
                        </caption>
                    )}
                    <thead>
                        <tr style={{ borderBottom: 'var(--border)' }}>
                            {!hideRank && <th scope="col" style={{ textAlign: 'left', padding: '4px 2px', color: 'var(--color-text-muted)', width: isInline ? '28px' : '36px' }} aria-label="Position"></th>}
                            <th scope="col" style={{ textAlign: 'left', padding: '4px 2px', color: 'var(--color-text-muted)' }} aria-label="Lag"></th>
                            <th scope="col" style={{ textAlign: 'center', padding: '4px 2px', color: 'var(--color-text-muted)', width: '20px' }}>M</th>
                            <th scope="col" style={{ textAlign: 'center', padding: '4px 2px', color: 'var(--color-text-muted)', width: '32px' }}>+/-</th>
                            <th scope="col" style={{ textAlign: 'right', padding: '4px 2px', color: 'var(--color-text-muted)', width: '24px' }}>P</th>
                        </tr>
                    </thead>
                    <tbody>
                        {teams.map((team, idx) => (
                            <React.Fragment key={idx}>
                                {dividerIndex !== undefined && idx === dividerIndex && (
                                    <tr>
                                        <td colSpan={hideRank ? "4" : "5"} style={{ padding: '0 8px' }}>
                                            <div style={{ 
                                                height: '2px', 
                                                backgroundColor: 'rgba(0,0,0,0.08)', 
                                                margin: '4px 0',
                                                borderStyle: 'dashed',
                                                borderWidth: '1px 0 0 0',
                                                borderColor: 'rgba(0,0,0,0.2)'
                                            }} />
                                        </td>
                                    </tr>
                                )}
                            <tr style={{ 
                                backgroundColor: team.rowBgColor || 'transparent',
                                transition: 'background-color 0.2s ease'
                            }}>
                                {!hideRank && (
                                    <td style={{ 
                                        padding: '6px 2px', 
                                        width: isInline ? '28px' : '36px', 
                                        textAlign: 'center', 
                                        color: 'var(--color-text-muted)',
                                        borderTopLeftRadius: team.rowBgColor && team.rowBgColor !== 'transparent' ? '10px' : '0',
                                        borderBottomLeftRadius: team.rowBgColor && team.rowBgColor !== 'transparent' ? '10px' : '0'
                                    }}>
                                        <div style={{ width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', fontSize: '0.75rem', backgroundColor: 'transparent', color: 'inherit', margin: '0 auto' }}>
                                            {team.rank}
                                        </div>
                                    </td>
                                )}
                                <td style={{ 
                                    padding: '6px 2px',
                                    borderTopLeftRadius: hideRank && team.rowBgColor && team.rowBgColor !== 'transparent' ? '10px' : '0',
                                    borderBottomLeftRadius: hideRank && team.rowBgColor && team.rowBgColor !== 'transparent' ? '10px' : '0'
                                }}>
                                    <div 
                                        className={onTeamClick ? "clickable-item" : ""}
                                        onClick={onTeamClick ? () => onTeamClick(team.teamName) : undefined}
                                        style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: '8px',
                                            cursor: onTeamClick ? 'pointer' : 'default'
                                        }}
                                    >
                                        <TeamLogo logoUrl={team.logoUrl} flags={team.flags} teamName={team.teamName} size={isInline ? 16 : 20} />
                                        <span style={{ fontWeight: '400', whiteSpace: 'normal', lineHeight: '1.2' }}>
                                            <BoldSverige text={team.displayName || team.teamName} />
                                        </span>
                                    </div>
                                </td>
                                <td style={{ padding: '6px 2px', textAlign: 'center', color: 'var(--color-text-muted)' }}>{team.played}</td>
                                <td style={{ padding: '6px 2px', textAlign: 'center', color: (!String(team.gd).startsWith('-') && String(team.gd) !== '0') ? '#34c759' : (String(team.gd).startsWith('-') ? '#ff3b30' : 'var(--color-text-muted)') }}>{(!String(team.gd).startsWith('-') && String(team.gd) !== '0') ? `+${team.gd}` : team.gd}</td>
                                <td style={{ 
                                    padding: '6px 2px', 
                                    textAlign: 'right', 
                                    fontWeight: '600',
                                    borderTopRightRadius: team.rowBgColor && team.rowBgColor !== 'transparent' ? '10px' : '0',
                                    borderBottomRightRadius: team.rowBgColor && team.rowBgColor !== 'transparent' ? '10px' : '0'
                                }}>{team.points}</td>
                            </tr>
                            {team.bottomDivider && (
                                <tr>
                                    <td colSpan="5" style={{ padding: 0 }}>
                                        <div style={{
                                            height: '1px',
                                            backgroundColor: 'rgba(0,0,0,0.1)',
                                            margin: '4px 0',
                                            borderBottom: '1px dashed rgba(0,0,0,0.1)'
                                        }} />
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
};

export default SharedMatchTable;
