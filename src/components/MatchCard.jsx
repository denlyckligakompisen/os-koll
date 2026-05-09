import React from 'react';
import Card from './common/Card';
import BoldSverige from './BoldSverige';
import { getFlagCodes } from '../utils/flags';
import FlagBadge from './common/FlagBadge';

const getLastName = (name) => {
    if (!name) return '';
    const parts = name.trim().split(/\s+/);
    if (parts.length <= 1) return name;
    
    // Check if the last part is a common suffix like "Jr.", "Sr.", "III", "II"
    const lastPart = parts[parts.length - 1];
    const lowerLast = lastPart.toLowerCase().replace(/\./g, '');
    if ((lowerLast === 'jr' || lowerLast === 'sr' || lowerLast === 'ii' || lowerLast === 'iii') && parts.length > 2) {
        return parts[parts.length - 2] + ' ' + lastPart;
    }
    return lastPart;
};

const getSortedScorers = (scorersList) => {
    if (!scorersList || !Array.isArray(scorersList)) return [];
    
    const parseMinute = (minStr) => {
        if (!minStr) return 0;
        const base = parseInt(minStr.split('+')[0]);
        const extra = parseInt(minStr.split('+')[1] || '0');
        return isNaN(base) ? 0 : base + (extra / 100);
    };

    return [...scorersList].sort((a, b) => parseMinute(a.minute) - parseMinute(b.minute));
};

const getCombinedScorers = (homeScorers = [], awayScorers = []) => {
    const parseMinute = (minStr) => {
        if (!minStr) return 0;
        const base = parseInt(minStr.split('+')[0]);
        const extra = parseInt(minStr.split('+')[1] || '0');
        return isNaN(base) ? 0 : base + (extra / 100);
    };

    const homeWithTeam = (homeScorers || []).map(s => ({ ...s, team: 'home', minVal: parseMinute(s.minute) }));
    const awayWithTeam = (awayScorers || []).map(s => ({ ...s, team: 'away', minVal: parseMinute(s.minute) }));

    return [...homeWithTeam, ...awayWithTeam].sort((a, b) => a.minVal - b.minVal);
};

const MatchCard = ({ match, idx, onCountryClick, homeLogo, awayLogo, highlight, variant, filterTeam, ...props }) => {
    const homeFlags = getFlagCodes(match.home);
    const awayFlags = getFlagCodes(match.away);

    let outcomeBg = null;
    let outcomeTextColor = null;

    if (filterTeam && match.status === 'finished' && match.score && match.score.includes('-')) {
        const parts = match.score.split('-').map(s => parseInt(s.trim()));
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            const homeScore = parts[0];
            const awayScore = parts[1];
            
            const clean = (n) => n.replace(' IF', '').replace(' FF', '').replace(' BK', '').trim();
            const cleanFilter = clean(filterTeam);
            const isHome = clean(match.home).includes(cleanFilter);
            const isAway = clean(match.away).includes(cleanFilter);
            
            if (isHome || isAway) {
                if (homeScore === awayScore) {
                    outcomeBg = '#8e8e93'; // Grey
                    outcomeTextColor = '#ffffff';
                } else if ((isHome && homeScore > awayScore) || (isAway && awayScore > homeScore)) {
                    outcomeBg = '#34c759'; // Green
                    outcomeTextColor = '#ffffff';
                } else {
                    outcomeBg = '#ff3b30'; // Red
                    outcomeTextColor = '#ffffff';
                }
            }
        }
    }

    const handleTeamClick = (e, name) => {
        if (!onCountryClick) return;
        e.preventDefault();
        e.stopPropagation();

        const country = name.includes('\n') ? name.split('\n')[1] : name;
        onCountryClick(country);
    };

    const renderTeamName = (name) => {
        if (!name) return null;
        if (name.includes('\n')) {
            const [rank, teamName] = name.split('\n');
            return (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: (variant === 'hero' || highlight) ? '0.75rem' : '0.65rem', color: 'var(--color-text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>{rank}</span>
                    <BoldSverige text={teamName} />
                </div>
            );
        }
        return <BoldSverige text={name} />;
    };

    const getBroadcasterUrl = (broadcast) => {
        if (!broadcast) return null;
        const b = broadcast.toUpperCase();
        if (b.includes('SVT')) return 'https://www.svtplay.se/kategori/fotbolls-vm';
        if (b.includes('TV4')) return 'https://www.tv4play.se/kategorier/fifa-fotbolls-vm-2026';
        return null;
    };

    const handleBroadcastClick = (e) => {
        const url = getBroadcasterUrl(match.broadcast);
        if (url) {
            e.preventDefault();
            e.stopPropagation();
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

    if (variant === 'hero') {
        return (
            <Card 
                key={idx} 
                padding="28px"
                style={{
                    background: 'var(--color-card-bg-elevated)',
                    border: 'var(--border)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                    ...props.style
                }}
                onClick={props.onClick}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div
                        style={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}
                    >
                        {homeLogo ? (
                            <img src={homeLogo} alt="" style={{ height: '72px', width: '72px', objectFit: 'contain' }} />
                        ) : (
                            homeFlags.length > 0 && <FlagBadge codes={homeFlags} name={match.home} size={72} />
                        )}
                        <div style={{ fontSize: '1.1rem', fontWeight: '700' }}>{renderTeamName(match.home)}</div>
                        {match.scorers?.home?.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                                {getSortedScorers(match.scorers.home).map((s, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <span>{getLastName(s.player)} {s.minute}'{s.suffix || ''}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                        {match.group && (
                            <div style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {match.group}
                            </div>
                        )}
                        <button
                            onClick={handleBroadcastClick}
                            disabled={!getBroadcasterUrl(match.broadcast)}
                            style={{
                                fontSize: '1.4rem',
                                fontWeight: '900',
                                color: outcomeTextColor || ((match.status === 'live' || match.status === 'LIVE') ? '#ff3b30' : 'var(--color-text)'),
                                backgroundColor: outcomeBg || ((match.status === 'live' || match.status === 'LIVE') ? 'rgba(255, 59, 48, 0.1)' : 'var(--color-surface-subtle)'),
                                padding: '8px 20px',
                                borderRadius: '12px',
                                border: 'none',
                                cursor: getBroadcasterUrl(match.broadcast) ? 'pointer' : 'default',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            {(match.status === 'live' || match.status === 'LIVE') && <span className="live-indicator-pulse" style={{ width: '10px', height: '10px', backgroundColor: '#ff3b30', borderRadius: '50%' }} />}
                            {match.status === 'finished' ? (match.score || match.time) : 
                             (match.status === 'live' || match.status === 'LIVE') ? (match.score || 'LIVE') : 
                             match.time}
                        </button>
                        {match.broadcast && (
                            <div style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {match.broadcast}
                            </div>
                        )}
                    </div>

                    <div
                        style={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}
                    >
                        {awayLogo ? (
                            <img src={awayLogo} alt="" style={{ height: '72px', width: '72px', objectFit: 'contain' }} />
                        ) : (
                            awayFlags.length > 0 && <FlagBadge codes={awayFlags} name={match.away} size={72} />
                        )}
                        <div style={{ fontSize: '1.1rem', fontWeight: '700' }}>{renderTeamName(match.away)}</div>
                        {match.scorers?.away?.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                                {getSortedScorers(match.scorers.away).map((s, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <span>{getLastName(s.player)} {s.minute}'{s.suffix || ''}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        );
    }

    const content = (
        <Card 
            key={idx} 
            padding={highlight ? "20px 14px" : "12px 14px"} 
            style={{
                border: 'var(--border)', 
                boxShadow: 'none', 
                backgroundColor: 'var(--color-card-bg)', 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: highlight ? '20px' : '12px', 
                cursor: props.onClick ? 'pointer' : 'default',
                transform: highlight ? 'scale(1.02)' : 'none',
                zIndex: highlight ? 2 : 1,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                ...props.style
            }} 
            onClick={props.onClick}
        >
            {homeLogo ? (
                <img src={homeLogo} alt="" style={{ height: highlight ? '42px' : '28px', width: highlight ? '42px' : '28px', objectFit: 'contain', transition: 'all 0.3s ease' }} />
            ) : (
                homeFlags.length > 0 && <FlagBadge codes={homeFlags} name={match.home} size={highlight ? 42 : 28} onClick={(e) => handleTeamClick(e, match.home)} />
            )}
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, justifyContent: 'center' }}>
                <div style={{ 
                    fontSize: highlight ? '1.05rem' : '0.9rem', 
                    color: 'var(--color-text)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: highlight ? '12px' : '8px', 
                    textAlign: 'center',
                    transition: 'all 0.3s ease'
                }}>
                    <span
                        style={{
                            flex: 1,
                            textAlign: 'right',
                            whiteSpace: 'normal',
                            lineHeight: '1.2',
                            wordBreak: 'break-word',
                            fontWeight: highlight ? '700' : '500'
                        }}
                    >
                        {renderTeamName(match.home)}
                    </span>
                    <button
                        onClick={handleBroadcastClick}
                        aria-label={match.broadcast ? `Gå till sändning på ${match.broadcast}` : 'Matchinformation'}
                        disabled={!getBroadcasterUrl(match.broadcast)}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                            minWidth: highlight ? '90px' : '70px',
                            flexShrink: 0,
                            cursor: getBroadcasterUrl(match.broadcast) ? 'pointer' : 'default',
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            font: 'inherit',
                            color: 'inherit'
                        }}
                    >
                        {match.group && (
                            <div style={{ fontSize: highlight ? '0.7rem' : '0.6rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: '2px' }}>
                                {match.group}
                                {match.isPreliminary && ' (prel.)'}
                            </div>
                        )}
                        <span style={{
                            fontSize: highlight ? '1rem' : '0.8rem',
                            color: outcomeTextColor || ((match.status === 'live' || match.status === 'LIVE') ? '#ff3b30' : 'var(--color-text)'),
                            fontWeight: '800',
                            flexShrink: 0,
                            backgroundColor: outcomeBg || ((match.status === 'live' || match.status === 'LIVE') ? 'rgba(255, 59, 48, 0.1)' : 'var(--color-surface-subtle)'),
                            padding: highlight ? '4px 12px' : '2px 8px',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.3s ease'
                        }}>
                            {(match.status === 'live' || match.status === 'LIVE') && <span className="live-indicator-pulse" aria-hidden="true" style={{ width: highlight ? '8px' : '6px', height: highlight ? '8px' : '6px', backgroundColor: '#ff3b30', borderRadius: '50%' }} />}
                            {match.status === 'finished' ? (match.score || match.time) : 
                             (match.status === 'live' || match.status === 'LIVE') ? (match.score || 'LIVE') : 
                             match.time}
                        </span>
                        {match.broadcast && (
                            <div style={{ fontSize: highlight ? '0.85rem' : '0.75rem', fontWeight: '800', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>
                                {match.broadcast}
                            </div>
                        )}
                    </button>
                    <span
                        style={{
                            flex: 1,
                            textAlign: 'left',
                            whiteSpace: 'normal',
                            lineHeight: '1.2',
                            wordBreak: 'break-word',
                            fontWeight: highlight ? '700' : '500'
                        }}
                    >
                        {renderTeamName(match.away)}
                    </span>
                </div>
                {match.scorers && (match.scorers.home?.length > 0 || match.scorers.away?.length > 0) && (() => {
                    const sortedHome = getSortedScorers(match.scorers.home);
                    const sortedAway = getSortedScorers(match.scorers.away);
                    const rowCount = Math.max(sortedHome.length, sortedAway.length);
                    const rows = Array.from({ length: rowCount });
                    
                    return (
                        <div style={{ 
                            display: 'flex', 
                            flexDirection: 'column',
                            fontSize: '0.72rem', 
                            color: 'var(--color-text-muted)', 
                            marginTop: '6px',
                            lineHeight: '1.4',
                            transition: 'all 0.3s ease',
                            width: '100%'
                        }}>
                            {rows.map((_, i) => {
                                const homeScorer = sortedHome[i];
                                const awayScorer = sortedAway[i];
                                return (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                                        {/* Left: Home scorer */}
                                        <div style={{ 
                                            flex: 1, 
                                            textAlign: 'right', 
                                            paddingRight: '8px'
                                        }}>
                                            {homeScorer ? (
                                                <span>{getLastName(homeScorer.player)} {homeScorer.minute}'{homeScorer.suffix || ''}</span>
                                            ) : ''}
                                        </div>

                                        {/* Middle: Spacer */}
                                        <div style={{ 
                                            minWidth: highlight ? '90px' : '70px', 
                                            flexShrink: 0
                                        }} />

                                        {/* Right: Away scorer */}
                                        <div style={{ 
                                            flex: 1, 
                                            textAlign: 'left', 
                                            paddingLeft: '8px'
                                        }}>
                                            {awayScorer ? (
                                                <span>{getLastName(awayScorer.player)} {awayScorer.minute}'{awayScorer.suffix || ''}</span>
                                            ) : ''}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    );
                })()}
            </div>
            {awayLogo ? (
                <img src={awayLogo} alt="" style={{ height: highlight ? '42px' : '28px', width: highlight ? '42px' : '28px', objectFit: 'contain', transition: 'all 0.3s ease' }} />
            ) : (
                awayFlags.length > 0 && <FlagBadge codes={awayFlags} name={match.away} size={highlight ? 42 : 28} onClick={(e) => handleTeamClick(e, match.away)} />
            )}
        </Card>
    );

    return content;
};

export default MatchCard;
