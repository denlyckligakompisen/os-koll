import React, { useState } from 'react';
import Card from './common/Card';
import { getFlagCodes } from '../utils/flags';
import FlagBadge from './common/FlagBadge';
import { cleanTeamNameForDisplay } from '../utils/teamUtils';
import { Play } from 'lucide-react';


import TeamLogo from './MatchCard/TeamLogo';
import BroadcasterLogo from './MatchCard/BroadcasterLogo';
import EventsTimeline from './MatchCard/EventsTimeline';
import LineupsSection from './MatchCard/LineupsSection';
import { formatLiveTime } from './MatchCard/utils.jsx';
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
                    <div style={{ display: 'flex', width: '100%', alignItems: 'stretch', gap: '16px' }}>

                        {/* Left Block: Time and Score */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'row',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            width: '110px',
                            flexShrink: 0,
                            backgroundColor: computedStatus === 'live' ? '#34c759' : (computedStatus === 'finished' ? '#2c2c2e' : 'var(--color-surface-subtle)'),
                            minHeight: '80px'
                        }}>
                            {/* Time side */}
                            <div style={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '8px',
                                color: (computedStatus === 'live' || computedStatus === 'finished') ? '#ffffff' : 'var(--color-text)',
                                fontWeight: '600',
                                fontSize: computedStatus === 'live' ? '1.2rem' : '1rem',
                                gap: '4px'
                            }}>
                                <span>{computedStatus === 'finished' ? 'FT' :
                                 computedStatus === 'live' && match.liveCurrentTime ? formatLiveTime(match.liveCurrentTime, match.period) :
                                 isOverdue ? '00:00' :
                                 (isFiltered || filterTeam ? displayTime : (timeLeftStr || displayTime))}</span>
                                {computedStatus === 'live' && (
                                    <div className="live-timer-line" style={{ width: '80%', height: '2px', borderRadius: '1px' }} />
                                )}
                            </div>
                            {/* Score side */}
                            {computedStatus !== 'upcoming' && (
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    width: '40px',
                                    backgroundColor: 'rgba(0,0,0,0.15)',
                                    color: '#ffffff',
                                    fontWeight: 'bold',
                                    fontSize: '1.4rem',
                                    padding: '6px 0'
                                }}>
                                    <span style={{ flex: 1, display: 'flex', alignItems: 'center' }}>{heroHomeScore}</span>
                                    <span style={{ flex: 1, display: 'flex', alignItems: 'center' }}>{heroAwayScore}</span>
                                </div>
                            )}
                        </div>

                        {/* Right Block: Teams */}
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center', gap: '8px' }}>
                            {/* Home */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: (onTeamClick || onCountryClick) ? 'pointer' : 'default' }} onClick={(e) => handleTeamClick(e, match.home)}>
                                <TeamLogo logoUrl={homeLogo} teamName={match.home} size={28} flags={homeFlags} onClick={(e) => handleTeamClick(e, match.home)} />
                                <span style={{
                                    fontWeight: '400',
                                    fontSize: '1.15rem',
                                    color: 'var(--color-text)',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}>
                                    {cleanTeamNameForDisplay(match.home)}
                                </span>
                                {/* Form badges */}
                                {allMatches && homeForm.length > 0 && computedStatus !== 'live' && (
                                    <div style={{ display: 'flex', gap: '3px', marginLeft: 'auto' }}>
                                        {homeForm.map((f, i) => renderFormBadge(f, i))}
                                    </div>
                                )}
                            </div>

                            {/* Away */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: (onTeamClick || onCountryClick) ? 'pointer' : 'default' }} onClick={(e) => handleTeamClick(e, match.away)}>
                                <TeamLogo logoUrl={awayLogo} teamName={match.away} size={28} flags={awayFlags} onClick={(e) => handleTeamClick(e, match.away)} />
                                <span style={{
                                    fontWeight: '400',
                                    fontSize: '1.15rem',
                                    color: 'var(--color-text)',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}>
                                    {cleanTeamNameForDisplay(match.away)}
                                </span>
                                {/* Form badges */}
                                {allMatches && awayForm.length > 0 && computedStatus !== 'live' && (
                                    <div style={{ display: 'flex', gap: '3px', marginLeft: 'auto' }}>
                                        {awayForm.map((f, i) => renderFormBadge(f, i))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Far Right: Broadcast/Highlights */}
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end', gap: '4px' }}>
                            {match.broadcast && !props.hideBroadcast && computedStatus !== 'live' && computedStatus !== 'finished' && (
                                <button
                                    onClick={handleBroadcastClick}
                                    disabled={!getBroadcasterUrl(match.broadcast)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px',
                                        padding: '6px 12px',
                                        backgroundColor: 'var(--color-surface-subtle)',
                                        border: 'none',
                                        borderRadius: '20px',
                                        cursor: getBroadcasterUrl(match.broadcast) ? 'pointer' : 'default',
                                        transition: 'background 0.2s',
                                        opacity: getBroadcasterUrl(match.broadcast) ? 1 : 0.6
                                    }}
                                    onMouseOver={(e) => { if (getBroadcasterUrl(match.broadcast)) e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.08)' }}
                                    onMouseOut={(e) => { if (getBroadcasterUrl(match.broadcast)) e.currentTarget.style.backgroundColor = 'var(--color-surface-subtle)' }}
                                    title={`Se på ${match.broadcast}`}
                                >
                                    <Play size={14} fill="currentColor" color="var(--color-text-muted)" />
                                    <BroadcasterLogo name={match.broadcast} size="small" />
                                </button>
                            )}
                            {computedStatus === 'finished' && !props.hideBroadcast && (
                                <a
                                    href={`https://www.svtplay.se/sok?q=${encodeURIComponent('VM fotboll höjdpunkter ' + match.home + ' ' + match.away)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    title="Se höjdpunkter på SVT Play"
                                    style={{
                                        color: 'var(--color-text-muted)',
                                        transition: 'color 0.2s',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
                                    onMouseOut={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'}
                                >
                                    <Play size={22} fill="currentColor" />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Live match events: yellow cards, match info */}
                    {(computedStatus === 'live' || isSoon || (computedStatus === 'finished' && (match.scorers?.home?.length > 0 || match.scorers?.away?.length > 0 || match.bookings?.length > 0 || match.tactics || match.stadium || match.referee))) && (
                        <div style={{
                            marginTop: '8px',
                            display: 'flex',
                            flexDirection: 'column',
                            width: '100%'
                        }}>
                            <EventsTimeline match={match} progress={liveProgressPercent} showEmptyTimeline={match.status === 'live'} />
                        </div>
                    )}
                    {/* Match info footer */}
                    {(computedStatus === 'live' || isSoon || computedStatus === 'finished') && (match.startingXI?.home?.length > 0 || match.startingXI?.away?.length > 0) && (
                        <div style={{ marginTop: '0px', paddingTop: '0px' }}>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '4px',
                                marginTop: '4px'
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
                padding={highlight ? "16px" : "12px"}
                className="clickable-card"
                style={{
                    border: 'var(--border)',
                    boxShadow: 'none',
                    backgroundColor: 'var(--color-card-bg)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    cursor: 'pointer',
                    transform: highlight ? 'scale(1.02)' : 'none',
                    zIndex: highlight ? 2 : 1,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    ...props.style
                }}
            >
                {match.group && !match.group.toLowerCase().includes('grupp') && (
                    <div style={{
                        fontSize: '0.65rem',
                        fontWeight: '600',
                        color: 'var(--color-text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '4px'
                    }}>
                        {match.group}
                    </div>
                )}
                <div style={{ display: 'flex', width: '100%', alignItems: 'stretch', gap: '12px' }}>
                    
                    {/* Left Block: Time and Score */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        width: '80px',
                        flexShrink: 0,
                        backgroundColor: computedStatus === 'live' ? '#34c759' : (computedStatus === 'finished' ? '#2c2c2e' : 'var(--color-surface-subtle)'),
                        minHeight: '60px'
                    }}>
                        {/* Time side */}
                        <div style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '4px',
                            color: (computedStatus === 'live' || computedStatus === 'finished') ? '#ffffff' : 'var(--color-text)',
                            fontWeight: '600',
                            fontSize: computedStatus === 'live' ? '1rem' : '0.85rem',
                            gap: '3px'
                        }}>
                            <span>{computedStatus === 'finished' ? 'FT' : 
                             computedStatus === 'live' && match.liveCurrentTime ? formatLiveTime(match.liveCurrentTime, match.period) : 
                             isOverdue ? '00:00' : 
                             (isFiltered || filterTeam ? displayTime : (timeLeftStr || displayTime))}</span>
                            {computedStatus === 'live' && (
                                <div className="live-timer-line" style={{ width: '80%', height: '2px', borderRadius: '1px' }} />
                            )}
                        </div>
                        {/* Score side */}
                        {computedStatus !== 'upcoming' && (
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
                                padding: '4px 0'
                            }}>
                                <span style={{ flex: 1, display: 'flex', alignItems: 'center' }}>{homeScore}</span>
                                <span style={{ flex: 1, display: 'flex', alignItems: 'center' }}>{awayScore}</span>
                            </div>
                        )}
                    </div>

                    {/* Right Block: Teams */}
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center', gap: '6px' }}>
                        {/* Home */}
                        <div 
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: (onTeamClick || onCountryClick) ? 'pointer' : 'default' }}
                            onClick={(e) => handleTeamClick(e, match.home)}
                        >
                            <TeamLogo logoUrl={homeLogo} teamName={match.home} size={20} flags={homeFlags} />
                            <span style={{ 
                                fontWeight: '400', 
                                fontSize: '1rem', 
                                color: 'var(--color-text)',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                                {cleanTeamNameForDisplay(match.home)}
                            </span>
                        </div>

                        {/* Away */}
                        <div 
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: (onTeamClick || onCountryClick) ? 'pointer' : 'default' }}
                            onClick={(e) => handleTeamClick(e, match.away)}
                        >
                            <TeamLogo logoUrl={awayLogo} teamName={match.away} size={20} flags={awayFlags} />
                            <span style={{ 
                                fontWeight: '400', 
                                fontSize: '1rem', 
                                color: 'var(--color-text)',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                                {cleanTeamNameForDisplay(match.away)}
                            </span>
                        </div>
                    </div>
                    
                    {/* Far Right: Broadcast/Highlights (optional) */}
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end', gap: '4px' }}>
                        {match.broadcast && !props.hideBroadcast && computedStatus !== 'live' && computedStatus !== 'finished' && (
                            <BroadcasterLogo name={match.broadcast} size="small" />
                        )}
                        {computedStatus === 'finished' && !props.hideBroadcast && (
                            <a
                                href={`https://www.svtplay.se/sok?q=${encodeURIComponent('VM fotboll höjdpunkter ' + match.home + ' ' + match.away)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                title="Se höjdpunkter på SVT Play"
                                style={{
                                    color: 'var(--color-text-muted)',
                                    transition: 'color 0.2s',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
                                onMouseOut={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'}
                            >
                                <Play size={18} fill="currentColor" />
                            </a>
                        )}
                    </div>
                </div>

                {/* Live match events: yellow cards, match info */}
                {(computedStatus === 'live' || isSoon || (computedStatus === 'finished' && (match.scorers?.home?.length > 0 || match.scorers?.away?.length > 0 || match.bookings?.length > 0 || match.tactics || match.stadium || match.referee))) && (
                    <div style={{
                        marginTop: '6px',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <EventsTimeline match={match} progress={liveProgressPercent} showEmptyTimeline={match.status === 'live'} />
                        {/* Match info footer */}
                        {(match.startingXI?.home?.length > 0 || match.startingXI?.away?.length > 0) && (
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '4px',
                                marginTop: '12px'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginTop: '4px'
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
                        )}
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

    return content;
};

export default MatchCard;