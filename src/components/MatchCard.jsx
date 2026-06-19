import React, { useState } from 'react';
import Card from './common/Card';
import { getFlagCodes } from '../utils/flags';
import FlagBadge from './common/FlagBadge';
import { cleanTeamNameForDisplay } from '../utils/teamUtils';
import { Play } from 'lucide-react';


import TeamLogo from './MatchCard/TeamLogo';
import BroadcasterLogo from './MatchCard/BroadcasterLogo';
import EventsTimeline from './MatchCard/EventsTimeline';
import MatchEvents from './MatchCard/MatchEvents';
import LineupsSection from './MatchCard/LineupsSection';
import { formatLiveTime, getTeamAbbr } from './MatchCard/utils.jsx';
import { useMatchStatus } from '../hooks/useMatchStatus';
import { useTeamForm } from '../hooks/useTeamForm';

const MatchCard = ({ match, idx, onCountryClick, onTeamClick, homeLogo, awayLogo, highlight, variant, filterTeam, isFiltered, allMatches, homeRank, awayRank, onCardClick, ...props }) => {
    const homeFlags = match.homeFlags || getFlagCodes(match.home);
    const awayFlags = match.awayFlags || getFlagCodes(match.away);

    const [showLineups, setShowLineups] = useState(false);
    
    const { computedStatus, isSoon, isOverdue, liveProgressPercent, timeLeftStr } = useMatchStatus(match, variant);
    const { homeForm, awayForm } = useTeamForm(match, allMatches);

    const getComputedScore = () => {
        if (match.score) return match.score;
        return '';
    };

    const computedScore = getComputedScore();

    const displayTime = match.time || 'TBA';

    const renderFormBadge = (result, key) => {
        let bg = '#8e8e93';
        if (result === 'V') bg = '#34c759'; // Green
        else if (result === 'F') bg = '#ff3b30'; // Red

        return (
            <span key={key} style={{
                width: '20px', height: '20px',
                borderRadius: '50%',
                backgroundColor: bg,
                color: 'white',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.85rem',
                lineHeight: 1
            }}>
                {result}
            </span>
        );
    };

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

    const bgVal = outcomeBg || 'var(--color-surface-subtle)';
    const badgeStyle = {
        backgroundColor: bgVal,
        border: 'none'
    };

    const handleTeamClick = (e, name) => {
        if (!onTeamClick && !onCountryClick) return;
        e.preventDefault();
        e.stopPropagation();

        const cleanName = name.includes('\n') ? name.split('\n')[1] : name;
        if (onTeamClick) {
            onTeamClick(cleanName);
        } else if (onCountryClick) {
            onCountryClick(cleanName);
        }
    };

    const renderTeamName = (name, align = 'center') => {
        if (!name) return null;
        let topText = null;
        let mainName = cleanTeamNameForDisplay(name);
        if (name.includes('\n')) {
            const parts = name.split('\n');
            topText = parts[0];
            mainName = cleanTeamNameForDisplay(parts[1]);
        }



        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: align === 'right' ? 'flex-end' : align === 'left' ? 'flex-start' : 'center', textAlign: align }}>
                {topText && <span style={{ fontSize: (variant === 'hero' || highlight) ? '0.75rem' : '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 'normal' }}>{topText}</span>}
                <span style={{
                    fontWeight: 'normal',
                    hyphens: 'auto',
                    WebkitHyphens: 'auto',
                    wordBreak: 'break-word',
                    textWrap: 'balance',
                    maxWidth: '100%'
                }}>{mainName}</span>
            </div>
        );
    };

    const getBroadcasterUrl = (broadcast) => {
        if (props.hideBroadcast) return null;
        if (match.link) return match.link;

        if (!broadcast) return null;
        const b = broadcast.toUpperCase();
        const slugify = (str) => {
            if (!str) return '';
            const name = str.includes('\n') ? str.split('\n').pop() : str;
            return name.toLowerCase()
                .replace(/å/g, 'a')
                .replace(/ä/g, 'a')
                .replace(/ö/g, 'o')
                .replace(/é/g, 'e')
                .replace(/ü/g, 'u')
                .replace(/ç/g, 'c')
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]/g, '');
        };
        if (b.includes('SVT')) {
            return 'https://www.svtplay.se/kategori/fotbolls-vm?tab=schedule';
        }
        if (b.includes('TV4')) {
            const home = slugify(match.home);
            const away = slugify(match.away);
            return `https://www.tv4play.se/program/e99c23f01724d859eba7/${home}-${away}`;
        }
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

    const handleCardKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (computedStatus === 'finished' && !props.hideBroadcast) {
                window.open(`https://www.svtplay.se/sok?q=${encodeURIComponent('VM fotboll höjdpunkter ' + match.home + ' ' + match.away)}`, '_blank', 'noopener,noreferrer');
            } else if (onCardClick) {
                onCardClick();
            }
        }
    };

    // Pre-compute scores for both hero and list variants
    let heroHomeScore = '';
    let heroAwayScore = '';
    if (computedScore && computedScore.includes('-')) {
        const parts = computedScore.split('-');
        heroHomeScore = parts[0].trim();
        heroAwayScore = parts[1].trim();
    } else if (computedScore) {
        heroHomeScore = computedScore;
        heroAwayScore = '';
    }

    const heroIsHomeWinner = heroHomeScore !== '' && heroAwayScore !== '' && parseInt(heroHomeScore) > parseInt(heroAwayScore);
    const heroIsAwayWinner = heroHomeScore !== '' && heroAwayScore !== '' && parseInt(heroAwayScore) > parseInt(heroHomeScore);

    if (variant === 'hero') {
        return (
            <div
                className={`match-card ${highlight ? 'highlight' : ''}`}
                onClick={() => {
                    if (onCardClick) {
                        onCardClick();
                    }
                }}
                role={onCardClick ? "button" : undefined}
                tabIndex={onCardClick ? 0 : undefined}
                onKeyDown={handleCardKeyDown}
                aria-label={`Match: ${match.home} mot ${match.away}, status: ${computedStatus === 'upcoming' ? 'Kommande' : computedStatus === 'live' ? 'Pågår' : 'Avslutad'}`}
            >
                <Card
                    padding="24px"
                    className="clickable-card"
                    style={{
                        backgroundColor: 'var(--color-card-bg)',
                        border: 'var(--border)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                        ...props.style
                    }}
                >
                    {match.group && !match.group.toLowerCase().includes('grupp') && (
                        <div style={{
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            color: 'var(--color-text-muted)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            marginBottom: '4px'
                        }}>
                            {match.group}
                        </div>
                    )}
                    <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', gap: '8px', position: 'relative' }}>
                        
                        {/* Home Team */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                            <TeamLogo logoUrl={homeLogo} teamName={match.home} size={64} flags={homeFlags} onClick={(e) => handleTeamClick(e, match.home)} />
                            <span 
                                onClick={(e) => handleTeamClick(e, match.home)}
                                style={{
                                fontWeight: '500',
                                fontSize: '1.25rem',
                                color: 'var(--color-text)',
                                wordBreak: 'break-word',
                                hyphens: 'auto',
                                cursor: (onTeamClick || onCountryClick) ? 'pointer' : 'default',
                                textAlign: 'center',
                                width: '100%'
                            }}>
                                <span className="team-name-desktop">{cleanTeamNameForDisplay(match.home)}</span>
                                <span className="team-name-mobile">{getTeamAbbr(match.home)}</span>
                            </span>
                            {/* Form badges */}
                            {allMatches && homeForm.length > 0 && computedStatus !== 'live' && (
                                <div style={{ display: 'flex', gap: '3px', justifyContent: 'center' }}>
                                    {homeForm.map((f, i) => renderFormBadge(f, i))}
                                </div>
                            )}
                        </div>

                        {/* Center Block: Score and Time */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '16px',
                            padding: '16px 24px',
                            backgroundColor: computedStatus === 'live' ? 'transparent' : (computedStatus === 'finished' ? 'var(--color-surface-subtle)' : 'var(--color-surface-subtle)'),
                            color: 'var(--color-text)',
                            minWidth: '120px',
                            flexShrink: 0,
                            boxShadow: computedStatus === 'live' ? 'none' : '0 4px 12px rgba(0,0,0,0.05)'
                        }}>
                            {/* Score or Time */}
                            {computedStatus !== 'upcoming' ? (
                                <div style={{ 
                                    fontSize: '2.5rem', 
                                    fontWeight: 'bold', 
                                    display: 'flex', 
                                    gap: '12px', 
                                    alignItems: 'center', 
                                    lineHeight: 1,
                                    backgroundColor: computedStatus === 'live' ? '#34c759' : 'transparent',
                                    color: computedStatus === 'live' ? '#ffffff' : 'inherit',
                                    padding: computedStatus === 'live' ? '8px 16px' : '0',
                                    borderRadius: computedStatus === 'live' ? '12px' : '0'
                                }}>
                                    <span>{heroHomeScore}</span>
                                    <span style={{ opacity: computedStatus === 'live' ? 1 : 0.5 }}>-</span>
                                    <span>{heroAwayScore}</span>
                                </div>
                            ) : (
                                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', lineHeight: 1 }}>
                                    {isOverdue ? '00:00' : (isFiltered || filterTeam ? displayTime : (timeLeftStr || displayTime))}
                                </div>
                            )}
                            
                            {/* Status text (only for finished/live) */}
                            {computedStatus !== 'upcoming' && (
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: '600',
                                    fontSize: computedStatus === 'live' ? '1.2rem' : '1.1rem',
                                    marginTop: '12px',
                                    color: 'var(--color-text)'
                                }}>
                                    <span>{computedStatus === 'finished' ? '' :
                                     (match.liveCurrentTime ? formatLiveTime(match.liveCurrentTime, match.period) : '')}</span>
                                    {computedStatus === 'live' && (
                                        <div style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '2px' }}>
                                            {(() => {
                                                const p = String(match.period);
                                                if (p === '1') return '1:a halvlek';
                                                if (p === '2' || p === '5') return '2:a halvlek';
                                                if (p === '4') return ''; // Halvtid
                                                if (p === 'Finished') return '';
                                                return ''; // Hide unknown raw numbers
                                            })()}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Broadcast Channel under time (for upcoming) */}
                            {computedStatus === 'upcoming' && match.broadcast && !props.hideBroadcast && (
                                <div style={{ marginTop: '12px' }}>
                                    <button
                                        onClick={handleBroadcastClick}
                                        disabled={!getBroadcasterUrl(match.broadcast)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '6px',
                                            padding: '4px',
                                            backgroundColor: 'transparent',
                                            border: 'none',
                                            cursor: getBroadcasterUrl(match.broadcast) ? 'pointer' : 'default',
                                            transition: 'opacity 0.2s, transform 0.2s',
                                            opacity: getBroadcasterUrl(match.broadcast) ? 1 : 0.6
                                        }}
                                        onMouseOver={(e) => { if (getBroadcasterUrl(match.broadcast)) e.currentTarget.style.transform = 'scale(1.05)' }}
                                        onMouseOut={(e) => { if (getBroadcasterUrl(match.broadcast)) e.currentTarget.style.transform = 'scale(1)' }}
                                        title={`Se på ${match.broadcast}`}
                                    >
                                        <BroadcasterLogo name={match.broadcast} size="small" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Away Team */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                            <TeamLogo logoUrl={awayLogo} teamName={match.away} size={64} flags={awayFlags} onClick={(e) => handleTeamClick(e, match.away)} />
                            <span 
                                onClick={(e) => handleTeamClick(e, match.away)}
                                style={{
                                fontWeight: '500',
                                fontSize: '1.25rem',
                                color: 'var(--color-text)',
                                wordBreak: 'break-word',
                                hyphens: 'auto',
                                cursor: (onTeamClick || onCountryClick) ? 'pointer' : 'default',
                                textAlign: 'center',
                                width: '100%'
                            }}>
                                <span className="team-name-desktop">{cleanTeamNameForDisplay(match.away)}</span>
                                <span className="team-name-mobile">{getTeamAbbr(match.away)}</span>
                            </span>
                            {/* Form badges */}
                            {allMatches && awayForm.length > 0 && computedStatus !== 'live' && (
                                <div style={{ display: 'flex', gap: '3px', justifyContent: 'center' }}>
                                    {awayForm.map((f, i) => renderFormBadge(f, i))}
                                </div>
                            )}
                        </div>
                        
                        {/* Broadcast/Highlights (Absolutely Positioned) */}
                        <div style={{ position: 'absolute', top: '-12px', right: '-12px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                            {computedStatus === 'finished' && !props.hideBroadcast && (
                                <a
                                    href={`https://www.svtplay.se/sok?q=${encodeURIComponent('VM fotboll höjdpunkter ' + match.home + ' ' + match.away)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    title="Se höjdpunkter på SVT Play"
                                    style={{
                                        color: '#00C800',
                                        transition: 'color 0.2s, transform 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        backgroundColor: 'var(--color-surface)',
                                        padding: '8px',
                                        borderRadius: '50%',
                                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    <Play size={22} fill="currentColor" />
                                </a>
                            )}
                        </div>
                    </div>


                    {/* Match info footer */}
                    {(computedStatus === 'live' || isSoon || computedStatus === 'finished') && (match.startingXI?.home?.length > 0 || match.startingXI?.away?.length > 0) && (
                        <div style={{ marginTop: '0px', paddingTop: '0px' }}>
                            <MatchEvents match={match} />
                            
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '4px',
                                marginTop: '0px'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginTop: '8px'
                                }}>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setShowLineups(!showLineups); }}
                                        style={{
                                            background: 'rgba(128, 128, 128, 0.1)',
                                            border: '1px solid rgba(128, 128, 128, 0.2)',
                                            padding: '6px 16px',
                                            borderRadius: '20px',
                                            color: 'var(--color-text)',
                                            fontSize: '0.8rem',
                                            fontWeight: '500',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            transition: 'background 0.2s ease'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(128, 128, 128, 0.2)'}
                                        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(128, 128, 128, 0.1)'}
                                    >
                                        {showLineups ? 'Dölj detaljer' : 'Visa detaljer'}
                                        <span style={{ fontSize: '0.7rem' }}>{showLineups ? '▲' : '▼'}</span>
                                    </button>
                                </div>
                            </div>
                            <div style={{
                                display: 'grid',
                                gridTemplateRows: showLineups ? '1fr' : '0fr',
                                transition: 'grid-template-rows 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease',
                                opacity: showLineups ? 1 : 0
                            }}>
                                <div style={{ overflow: 'hidden' }}>
                                    <LineupsSection match={match} />
                                </div>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        );
    }

    let homeScore = '';
    let awayScore = '';
    if (computedScore && computedScore.includes('-')) {
        const parts = computedScore.split('-');
        homeScore = parts[0].trim();
        awayScore = parts[1].trim();
    } else if (computedScore) {
        homeScore = computedScore;
        awayScore = '';
    }

    const isHomeWinner = homeScore !== '' && awayScore !== '' && parseInt(homeScore) > parseInt(awayScore);
    const isAwayWinner = homeScore !== '' && awayScore !== '' && parseInt(awayScore) > parseInt(homeScore);

    const content = (
        <div
            className={`match-card list ${highlight ? 'highlight' : ''}`}
            style={{
                opacity: computedStatus === 'finished' ? 0.85 : 1
            }}
            onClick={() => {
                if (computedStatus === 'finished' && !props.hideBroadcast) {
                    window.open(`https://www.svtplay.se/sok?q=${encodeURIComponent('VM fotboll höjdpunkter ' + match.home + ' ' + match.away)}`, '_blank', 'noopener,noreferrer');
                } else if (onCardClick) {
                    onCardClick();
                }
            }}
            role={onCardClick || (computedStatus === 'finished' && !props.hideBroadcast) ? "button" : undefined}
            tabIndex={onCardClick || (computedStatus === 'finished' && !props.hideBroadcast) ? 0 : undefined}
            onKeyDown={handleCardKeyDown}
            aria-label={`Match: ${match.home} mot ${match.away}, status: ${computedStatus === 'upcoming' ? 'Kommande' : computedStatus === 'live' ? 'Pågår' : 'Avslutad'}`}
        >
            <Card
                key={idx}
                padding="0px"
                className="clickable-card"
                style={{
                    border: 'var(--border)',
                    boxShadow: 'none',
                    backgroundColor: 'var(--color-card-bg)',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transform: highlight ? 'scale(1.02)' : 'none',
                    zIndex: highlight ? 2 : 1,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    ...props.style
                }}
            >
                {match.group && !match.group.toLowerCase().includes('grupp') && !isFiltered && (
                    <div style={{
                        fontSize: '0.65rem',
                        fontWeight: '600',
                        color: 'var(--color-text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        padding: '12px 12px 0 12px'
                    }}>
                        {match.group}
                    </div>
                )}
                <div style={{ display: 'flex', width: '100%', alignItems: 'stretch' }}>
                    
                    {/* Left Block: Time and Score */}
                    <div style={{
                        display: computedStatus === 'finished' ? 'none' : 'flex',
                        flexDirection: 'row',
                        width: '80px',
                        flexShrink: 0,
                        backgroundColor: computedStatus === 'live' ? '#34c759' : 'transparent',
                        minHeight: '60px'
                    }}>
                        {/* Time side */}
                        {computedStatus !== 'finished' && (
                            <div style={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '4px',
                                color: computedStatus === 'live' ? '#ffffff' : 'var(--color-text)',
                                fontWeight: '600',
                                fontSize: computedStatus === 'live' ? '1rem' : '0.85rem',
                                gap: '3px'
                            }}>
                                <span>{computedStatus === 'live' && match.liveCurrentTime ? formatLiveTime(match.liveCurrentTime, match.period) : 
                                 isOverdue ? '00:00' : 
                                 (isFiltered || filterTeam ? displayTime : (timeLeftStr || displayTime))}</span>
                                {computedStatus === 'live' && !isFiltered && (
                                    <div className="live-timer-line" style={{ width: '80%', height: '2px', borderRadius: '1px' }} />
                                )}
                            </div>
                        )}
                        {/* Score side (only for live matches) */}
                        {computedStatus === 'live' && (
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                width: '32px',
                                backgroundColor: 'rgba(0,0,0,0.15)',
                                color: '#ffffff',
                                fontWeight: 'bold',
                                fontSize: '1.1rem',
                                padding: '12px 0',
                                gap: '6px'
                            }}>
                                <span style={{ display: 'flex', alignItems: 'center', height: '20px' }}>{homeScore}</span>
                                <span style={{ display: 'flex', alignItems: 'center', height: '20px' }}>{awayScore}</span>
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center', gap: '6px', padding: '12px', paddingLeft: computedStatus === 'finished' ? '24px' : '12px' }}>
                        {/* Home */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {computedStatus === 'finished' && (
                                <span style={{ width: '20px', fontWeight: 'bold', fontSize: '1.1rem', textAlign: 'center' }}>{homeScore}</span>
                            )}
                            <TeamLogo logoUrl={homeLogo} teamName={match.home} size={20} flags={homeFlags} onClick={(e) => handleTeamClick(e, match.home)} />
                            <span 
                                onClick={(e) => handleTeamClick(e, match.home)}
                                style={{ 
                                fontWeight: '400', 
                                fontSize: '1rem', 
                                color: 'var(--color-text)',
                                wordBreak: 'break-word',
                                hyphens: 'auto',
                                cursor: (onTeamClick || onCountryClick) ? 'pointer' : 'default',
                                lineHeight: '1.2'
                            }}>
                                {cleanTeamNameForDisplay(match.home)}
                            </span>
                        </div>

                        {/* Away */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {computedStatus === 'finished' && (
                                <span style={{ width: '20px', fontWeight: 'bold', fontSize: '1.1rem', textAlign: 'center' }}>{awayScore}</span>
                            )}
                            <TeamLogo logoUrl={awayLogo} teamName={match.away} size={20} flags={awayFlags} onClick={(e) => handleTeamClick(e, match.away)} />
                            <span 
                                onClick={(e) => handleTeamClick(e, match.away)}
                                style={{ 
                                fontWeight: '400', 
                                fontSize: '1rem', 
                                color: 'var(--color-text)',
                                wordBreak: 'break-word',
                                hyphens: 'auto',
                                cursor: (onTeamClick || onCountryClick) ? 'pointer' : 'default',
                                lineHeight: '1.2'
                            }}>
                                {cleanTeamNameForDisplay(match.away)}
                            </span>
                        </div>
                    </div>
                    
                    {/* Far Right: Broadcast/Highlights (optional) */}
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'stretch' }}>
                        {match.broadcast && !props.hideBroadcast && computedStatus !== 'live' && computedStatus !== 'finished' && !isFiltered && (
                            <div
                                role="button"
                                tabIndex={0}
                                onClick={!getBroadcasterUrl(match.broadcast) ? undefined : handleBroadcastClick}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '0 12px',
                                    margin: 0,
                                    width: '100%',
                                    flex: 1,
                                    backgroundColor: (match.broadcast.toUpperCase().includes('SVT')) ? '#00C800' :
                                                     (match.broadcast.toUpperCase().includes('TV4')) ? '#E3000B' :
                                                     'transparent',
                                    minHeight: '60px',
                                    cursor: getBroadcasterUrl(match.broadcast) ? 'pointer' : 'default',
                                    transition: 'opacity 0.2s, transform 0.2s',
                                    opacity: getBroadcasterUrl(match.broadcast) ? 1 : 0.6
                                }}
                                onMouseOver={(e) => { if (getBroadcasterUrl(match.broadcast)) e.currentTarget.style.transform = 'scale(1.05)' }}
                                onMouseOut={(e) => { if (getBroadcasterUrl(match.broadcast)) e.currentTarget.style.transform = 'scale(1)' }}
                                title={`Se på ${match.broadcast}`}
                            >
                                <BroadcasterLogo name={match.broadcast} customHeight="0.85rem" transparentMode={true} />
                            </div>
                        )}
                        {computedStatus === 'finished' && !props.hideBroadcast && !isFiltered && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, minHeight: '44px', padding: '0 12px', backgroundColor: 'transparent' }}>
                                <a
                                    href={`https://www.svtplay.se/sok?q=${encodeURIComponent('VM fotboll höjdpunkter ' + match.home + ' ' + match.away)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    title="Se höjdpunkter på SVT Play"
                                    style={{
                                        color: '#00C800',
                                        transition: 'color 0.2s, transform 0.2s',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    <Play size={18} fill="currentColor" />
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                {/* Live match events: yellow cards, match info */}
                {!isFiltered && (computedStatus === 'live' || isSoon || (computedStatus === 'finished' && (match.scorers?.home?.length > 0 || match.scorers?.away?.length > 0 || match.bookings?.length > 0 || match.tactics || match.stadium || match.referee))) && (
                    <div style={{
                        marginTop: '6px',
                        display: 'flex',
                        flexDirection: 'column',
                        padding: '0 12px 12px 12px'
                    }}>

                        {/* Match info footer */}
                        {(match.startingXI?.home?.length > 0 || match.startingXI?.away?.length > 0) && (
                            <div style={{ marginTop: '0px', paddingTop: '0px' }}>
                                <MatchEvents match={match} />
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '4px',
                                    marginTop: '0px'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginTop: '8px'
                                    }}>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setShowLineups(!showLineups); }}
                                            style={{
                                                background: 'rgba(128, 128, 128, 0.1)',
                                                border: '1px solid rgba(128, 128, 128, 0.2)',
                                                padding: '4px 14px',
                                                borderRadius: '20px',
                                                color: 'var(--color-text)',
                                                fontSize: '0.75rem',
                                                fontWeight: '500',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                transition: 'background 0.2s ease'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(128, 128, 128, 0.2)'}
                                            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(128, 128, 128, 0.1)'}
                                        >
                                            {showLineups ? 'Dölj detaljer' : 'Visa detaljer'}
                                            <span style={{ fontSize: '0.65rem' }}>{showLineups ? '▲' : '▼'}</span>
                                        </button>
                                    </div>
                                </div>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateRows: showLineups ? '1fr' : '0fr',
                                    transition: 'grid-template-rows 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease',
                                    opacity: showLineups ? 1 : 0
                                }}>
                                    <div style={{ overflow: 'hidden' }}>
                                        <LineupsSection match={match} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Card>
        </div>
    );

    return content;
};

export default MatchCard;