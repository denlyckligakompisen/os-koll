import React, { useState } from 'react';
import Card from './common/Card';
import { getFlagCode, getFlagCodes } from '../utils/flags';
import { COUNTRY_COLORS } from '../utils/vmUtils';
import FlagBadge from './common/FlagBadge';
import { cleanTeamNameForDisplay } from '../utils/teamUtils';
import { Play } from 'lucide-react';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';


import TeamLogo from './MatchCard/TeamLogo';
import BroadcasterLogo from './MatchCard/BroadcasterLogo';
import EventsTimeline from './MatchCard/EventsTimeline';
import MatchEvents from './MatchCard/MatchEvents';
import LineupsSection from './MatchCard/LineupsSection';
import { formatLiveTime, getTeamAbbr } from './MatchCard/utils.jsx';
import { useMatchStatus } from '../hooks/useMatchStatus';
import { useTeamForm } from '../hooks/useTeamForm';

const MatchCard = ({ match, idx, onCountryClick, onTeamClick, homeLogo, awayLogo, highlight, variant, filterTeam, isFiltered, allMatches, homeRank, awayRank, onCardClick, isAllsvenskan, ...props }) => {
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

    const displayTime = (isAllsvenskan && match.time === '00:00') ? 'TBA' : (match.time || 'TBA');

    const renderFormBadge = (result, key) => {
        let bg = '#8e8e93';
        if (result === 'V') bg = '#28a745'; // Darker Green for a11y
        else if (result === 'F') bg = '#e53935'; // Darker Red for a11y

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
                fontWeight: '600',
                lineHeight: 1
            }}>
                {result}
            </span>
        );
    };

    let outcomeBg = null;
    let outcomeTextColor = null;

    const clean = (n) => n ? n.replace(' IF', '').replace(' FF', '').replace(' BK', '').trim() : '';
    const cleanFilter = filterTeam ? clean(filterTeam) : '';
    const isFilteredHome = filterTeam && clean(match.home).includes(cleanFilter);
    const isFilteredAway = filterTeam && clean(match.away).includes(cleanFilter);

    if (filterTeam && match.status === 'finished' && match.score && match.score.includes('-')) {
        const parts = match.score.split('-').map(s => parseInt(s.trim()));
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            const homeScore = parts[0];
            const awayScore = parts[1];

            if (isFilteredHome || isFilteredAway) {
                if (homeScore === awayScore) {
                    outcomeBg = '#8e8e93'; // Grey
                    outcomeTextColor = '#ffffff';
                } else if ((isFilteredHome && homeScore > awayScore) || (isFilteredAway && awayScore > homeScore)) {
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

    const renderTeamName = (name, align = 'center', rank = null) => {
        if (!name) return null;
        let topText = null;
        let mainName = cleanTeamNameForDisplay(name);
        if (name.includes('\n')) {
            const parts = name.split('\n');
            topText = parts[0];
            mainName = cleanTeamNameForDisplay(parts[1]);
        }



        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: align === 'right' ? 'flex-end' : align === 'left' ? 'flex-start' : 'center', textAlign: align, minWidth: 0, width: '100%' }}>
                {topText && <span style={{ fontSize: (variant === 'hero' || highlight) ? '0.75rem' : '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 'normal', letterSpacing: '0.06em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{topText}</span>}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', justifyContent: align === 'center' ? 'center' : (align === 'right' ? 'flex-end' : 'flex-start'), maxWidth: '100%' }}>
                    <span style={{
                        fontWeight: 'inherit',
                        hyphens: align === 'center' ? 'auto' : 'none',
                        WebkitHyphens: align === 'center' ? 'auto' : 'none',
                        wordBreak: align === 'center' ? 'break-word' : 'normal',
                        textWrap: align === 'center' ? 'balance' : 'nowrap',
                        maxWidth: '100%',
                        whiteSpace: align === 'center' ? 'normal' : 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}>{mainName}</span>
                    {rank && <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: '400', opacity: 0.6 }}>#{rank}</span>}
                </div>
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

    const homeColor = match.home && COUNTRY_COLORS[match.home] ? COUNTRY_COLORS[match.home].bg : null;
    const awayColor = match.away && COUNTRY_COLORS[match.away] ? COUNTRY_COLORS[match.away].bg : null;

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
                        position: 'relative',
                        zIndex: 2,
                        gap: '16px',
                        overflow: 'hidden',
                        ...props.style
                    }}
                >

                    <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', gap: '8px', position: 'relative' }}>

                        {/* Home Team */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0, position: 'relative', zIndex: 3 }}>
                            {homeColor && (
                                <div style={{
                                    position: 'absolute',
                                    left: '50%',
                                    top: '32px',
                                    width: '180px',
                                    height: '180px',
                                    background: `radial-gradient(circle, ${homeColor}22 0%, transparent 70%)`,
                                    transform: 'translate(-50%, -50%)',
                                    zIndex: -1,
                                    pointerEvents: 'none'
                                }} />
                            )}
                            <TeamLogo logoUrl={homeLogo} teamName={match.home} size={64} flags={homeFlags} onClick={(e) => handleTeamClick(e, match.home)} />
                            <div
                                onClick={(e) => handleTeamClick(e, match.home)}
                                style={{
                                    fontWeight: isFilteredHome ? 'bold' : '500',
                                    fontSize: '1rem',
                                    color: 'var(--color-text)',
                                    cursor: (onTeamClick || onCountryClick) ? 'pointer' : 'default',
                                    width: '100%'
                                }}>
                                {renderTeamName(match.home, 'center', homeRank)}
                            </div>
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
                            minWidth: '120px',
                            flexShrink: 0,
                            color: 'var(--color-text)'
                        }}>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '16px',
                                padding: computedStatus === 'upcoming' ? '12px 24px' : '16px 24px',
                                backgroundColor: computedStatus === 'live' ? 'transparent' : 'var(--color-surface-subtle)',
                                boxShadow: computedStatus === 'live' ? 'none' : '0 4px 12px rgba(0,0,0,0.05)'
                            }}>
                                {/* Score or Time */}
                                {computedStatus !== 'upcoming' ? (
                                    <div style={{
                                        fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
                                        fontWeight: 'bold',
                                        fontVariantNumeric: 'tabular-nums',
                                        letterSpacing: '-0.03em',
                                        fontFamily: 'system-ui, -apple-system, sans-serif',
                                        display: 'flex',
                                        gap: '12px',
                                        alignItems: 'center',
                                        lineHeight: 1,
                                        backgroundColor: computedStatus === 'live' ? '#34c759' : 'transparent',
                                        color: computedStatus === 'live' ? '#ffffff' : 'inherit',
                                        padding: computedStatus === 'live' ? '4px 12px' : '0',
                                        borderRadius: computedStatus === 'live' ? '8px' : '0'
                                    }}>
                                        <span>{heroHomeScore}</span>
                                        <span>-</span>
                                        <span>{heroAwayScore}</span>
                                    </div>
                                ) : (
                                    <div style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 'bold', lineHeight: 1 }}>
                                        {isOverdue ? (displayTime === 'TBA' ? 'TBA' : '00:00') : (isFiltered || filterTeam ? displayTime : (timeLeftStr || displayTime))}
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
                                        fontSize: '1rem', // Match the country text size
                                        marginTop: '0',
                                        color: 'var(--color-text)'
                                    }}>
                                        {computedStatus === 'finished' ? (
                                            <span></span>
                                        ) : (
                                            match.liveCurrentTime ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '6px' }}>
                                                    <div key={match.liveCurrentTime} className="live-minute-spinner" style={{
                                                        width: '36px',
                                                        height: '36px',
                                                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                                        color: 'var(--color-text)',
                                                        fontSize: '0.85rem',
                                                        zIndex: 2
                                                    }}>
                                                        <div className="live-minute-spinner-inner">
                                                            {match.liveCurrentTime && match.liveCurrentTime !== 'HT' && match.liveCurrentTime !== 'FT'
                                                                ? (String(match.liveCurrentTime).includes("'") ? match.liveCurrentTime : `${match.liveCurrentTime}'`)
                                                                : match.liveCurrentTime}
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : <span></span>
                                        )}
                                        {computedStatus === 'live' && (
                                            <div style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '4px', marginBottom: '2px', zIndex: 2, position: 'relative' }}>
                                                {(() => {
                                                    const p = String(match.period);
                                                    if (p === '1' || p === '3') return '1:a halvlek';
                                                    if (p === '4') return 'Halvtid';
                                                    if (p === '2' || p === '5') return '2:a halvlek';
                                                    if (p === '6') return 'Inför förlängning';
                                                    if (p === '7') return 'Förlängning (1:a)';
                                                    if (p === '8') return 'Paus';
                                                    if (p === '9') return 'Förlängning (2:a)';
                                                    if (p === '10') return 'Inför straffar';
                                                    if (p === '11') return 'Straffläggning';
                                                    if (p === 'Finished' || p === '0') return '';
                                                    return '';
                                                })()}
                                            </div>
                                        )}
                                        {/* Vertical line connecting the text towards the timeline */}
                                        {computedStatus === 'live' && match.liveCurrentTime && (
                                            <div style={{
                                                width: '2px',
                                                height: '36px',
                                                backgroundColor: 'rgba(128,128,128,0.3)',
                                                marginBottom: '-36px',
                                                zIndex: 1
                                            }} />
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Broadcast Channel under time (for upcoming) */}
                            {computedStatus === 'upcoming' && match.broadcast && !props.hideBroadcast && (
                                <div style={{ marginTop: '18px', marginBottom: '4px' }}>
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
                                        <BroadcasterLogo name={match.broadcast} size="large" customHeight={22} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Away Team */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0, position: 'relative', zIndex: 3 }}>
                            {awayColor && (
                                <div style={{
                                    position: 'absolute',
                                    left: '50%',
                                    top: '32px',
                                    width: '180px',
                                    height: '180px',
                                    background: `radial-gradient(circle, ${awayColor}22 0%, transparent 70%)`,
                                    transform: 'translate(-50%, -50%)',
                                    zIndex: -1,
                                    pointerEvents: 'none'
                                }} />
                            )}
                            <TeamLogo logoUrl={awayLogo} teamName={match.away} size={64} flags={awayFlags} onClick={(e) => handleTeamClick(e, match.away)} />
                            <div
                                onClick={(e) => handleTeamClick(e, match.away)}
                                style={{
                                    fontWeight: isFilteredAway ? 'bold' : '500',
                                    fontSize: '1rem',
                                    color: 'var(--color-text)',
                                    cursor: (onTeamClick || onCountryClick) ? 'pointer' : 'default',
                                    width: '100%'
                                }}>
                                {renderTeamName(match.away, 'center', awayRank)}
                            </div>
                            {/* Form badges */}
                            {allMatches && awayForm.length > 0 && computedStatus !== 'live' && (
                                <div style={{ display: 'flex', gap: '3px', justifyContent: 'center' }}>
                                    {awayForm.map((f, i) => renderFormBadge(f, i))}
                                </div>
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
                                        {showLineups ? 'Dölj laguppställningar' : 'Visa laguppställningar'}
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
                if (onCardClick) {
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
                {computedStatus === 'finished' && !props.hideBroadcast && !onCardClick && (
                    <a
                        href={`https://www.svtplay.se/sok?q=${encodeURIComponent('VM fotboll höjdpunkter ' + match.home + ' ' + match.away)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Se höjdpunkter på SVT Play"
                        style={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0, bottom: 0,
                            zIndex: 2
                        }}
                    >
                        <span className="sr-only">Se höjdpunkter på SVT Play</span>
                    </a>
                )}

                <div style={{ display: 'flex', width: '100%', alignItems: 'stretch' }}>

                    {/* Left Block: Time and Score */}
                    <div style={{
                        display: (computedStatus === 'finished' || computedStatus === 'live') ? 'none' : 'flex',
                        flexDirection: 'row',
                        width: '72px',
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
                                color: (computedStatus === 'live' && !props.isTableView) ? '#ffffff' : 'var(--color-text)',
                                fontWeight: '600',
                                fontSize: (computedStatus === 'live' && !props.isTableView) ? '1rem' : '0.85rem',
                                gap: '3px'
                            }}>
                                <span>{props.isTableView ? displayTime : (computedStatus === 'live' ? formatLiveTime(match.liveCurrentTime, match.period) :
                                    isOverdue ? (displayTime === 'TBA' ? 'TBA' : '00:00') :
                                        (isFiltered || filterTeam ? displayTime : (timeLeftStr || displayTime)))}</span>
                                {computedStatus === 'live' && !isFiltered && !props.isTableView && (
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
                                fontWeight: '700',
                                fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
                                padding: '12px 0',
                                gap: '6px',
                                fontVariantNumeric: 'tabular-nums',
                                letterSpacing: '-0.02em'
                            }}>
                                <span style={{ display: 'flex', alignItems: 'center', height: '20px' }}>{homeScore}</span>
                                <span style={{ display: 'flex', alignItems: 'center', height: '20px' }}>{awayScore}</span>
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center', gap: '12px', padding: '16px', paddingLeft: (computedStatus === 'live' || computedStatus === 'finished') ? '16px' : '0px', minWidth: 0 }}>
                        {/* Home */}
                        <div style={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
                            {(computedStatus === 'finished' || computedStatus === 'live') && (
                                <div style={{ width: '52px', flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
                                    <span style={{ fontWeight: '600', fontSize: '0.85rem', fontVariantNumeric: 'tabular-nums' }}>{homeScore}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0, flex: 1, position: 'relative', zIndex: 3 }}>
                                <TeamLogo logoUrl={homeLogo} teamName={match.home} size={20} flags={homeFlags} onClick={(e) => handleTeamClick(e, match.home)} />
                                <div
                                    onClick={(e) => handleTeamClick(e, match.home)}
                                    style={{
                                        fontWeight: isFilteredHome ? 'bold' : '400',
                                        fontSize: '1rem',
                                        color: 'var(--color-text)',
                                        cursor: (onTeamClick || onCountryClick) ? 'pointer' : 'default',
                                        lineHeight: '1.2',
                                        minWidth: 0,
                                        flex: 1
                                    }}>
                                    {renderTeamName(match.home, 'left', homeRank)}
                                </div>
                            </div>
                        </div>

                        {/* Away */}
                        <div style={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
                            {(computedStatus === 'finished' || computedStatus === 'live') && (
                                <div style={{ width: '52px', flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
                                    <span style={{ fontWeight: '600', fontSize: '0.85rem', fontVariantNumeric: 'tabular-nums' }}>{awayScore}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0, flex: 1, position: 'relative', zIndex: 3 }}>
                                <TeamLogo logoUrl={awayLogo} teamName={match.away} size={20} flags={awayFlags} onClick={(e) => handleTeamClick(e, match.away)} />
                                <div
                                    onClick={(e) => handleTeamClick(e, match.away)}
                                    style={{
                                        fontWeight: isFilteredAway ? 'bold' : '400',
                                        fontSize: '1rem',
                                        color: 'var(--color-text)',
                                        cursor: (onTeamClick || onCountryClick) ? 'pointer' : 'default',
                                        lineHeight: '1.2',
                                        minWidth: 0,
                                        flex: 1
                                    }}>
                                    {renderTeamName(match.away, 'left', awayRank)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Far Right: Broadcast/Highlights (optional) */}
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'stretch', width: '72px', flexShrink: 0 }}>
                        {match.broadcast && !props.hideBroadcast && computedStatus !== 'live' && computedStatus !== 'finished' && !isFiltered && (
                            <div
                                role="button"
                                tabIndex={0}
                                onClick={!getBroadcasterUrl(match.broadcast) ? undefined : handleBroadcastClick}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '0',
                                    margin: 0,
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
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, minHeight: '44px', padding: '0', backgroundColor: 'transparent' }}>
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
                        {computedStatus === 'live' && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, minHeight: '44px', padding: '0' }}>
                                <ChevronRightIcon style={{ color: 'var(--color-text)', fontSize: '1.4rem' }} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Horizontal events timeline for live matches in list view */}
                {computedStatus === 'live' && (
                    <div style={{
                        padding: '8px 16px 12px 16px',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <EventsTimeline match={match} progress={liveProgressPercent} compact showEmptyTimeline={true} />
                    </div>
                )}
            </Card>
        </div>
    );

    return content;
};

export default MatchCard;