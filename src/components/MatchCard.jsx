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
                    padding="28px"
                    className="clickable-card"
                    style={{
                        backgroundColor: 'var(--color-card-bg)',
                        border: 'var(--border)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        ...props.style
                    }}
                >
                    {match.group && !match.group.toLowerCase().includes('grupp') && (
                        <div style={{
                            textAlign: 'center',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            color: 'var(--color-text-muted)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            marginBottom: '-4px'
                        }}>
                            {match.group}
                        </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', width: '100%' }}>
                        <div
                            style={{
                                flex: 1,
                                textAlign: 'center',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            <TeamLogo
                                logoUrl={homeLogo}
                                teamName={match.home}
                                size={64}
                                flags={homeFlags}
                                onClick={(e) => handleTeamClick(e, match.home)}
                            />

                            <div style={{ fontSize: '1.1rem', }}>{renderTeamName(match.home, 'center', homeRank)}</div>

                            {/* Form badges under team name */}
                            {allMatches && homeForm.length > 0 && computedStatus !== 'live' && (
                                <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginTop: '4px' }}>
                                    {homeForm.map((f, i) => renderFormBadge(f, i))}
                                </div>
                            )}
                        </div>

                        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>

                            <div
                                style={{
                                    fontSize: '2rem',
                                    fontWeight: 'bold',
                                    color: outcomeTextColor || '#2c2c2e',
                                    fontVariantNumeric: 'tabular-nums',
                                    padding: outcomeBg ? '8px 20px' : '0 10px',
                                    borderRadius: outcomeBg ? '12px' : '0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    backgroundColor: outcomeBg || 'transparent',
                                    border: 'none'
                                }}
                            >
                                {computedStatus === 'finished' ? (computedScore || displayTime) :
                                    computedStatus === 'live' ? (computedScore || 'LIVE') :
                                        (isOverdue ? '00:00' : (isFiltered || filterTeam ? displayTime : (timeLeftStr || displayTime)))}
                            </div>
                            {computedStatus === 'live' && match.liveCurrentTime && formatLiveTime(match.liveCurrentTime, match.period) !== 'SLUT' && (
                                <div style={{ fontSize: '0.9rem', color: '#000000', fontWeight: 'bold', marginTop: '-4px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <span>{formatLiveTime(match.liveCurrentTime, match.period)}</span>
                                    <div className="live-timer-line" />
                                </div>
                            )}

                            {match.broadcast && !props.hideBroadcast && computedStatus !== 'live' && computedStatus !== 'finished' && (
                                <button
                                    onClick={handleBroadcastClick}
                                    disabled={!getBroadcasterUrl(match.broadcast)}
                                    style={{
                                        marginTop: '4px',
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
                                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-muted)' }}>
                                        {computedStatus === 'live' ? 'Se live på ' : 'Se live på '}
                                    </span>
                                    <BroadcasterLogo name={match.broadcast} size="small" />
                                </button>
                            )}

                            {!match.broadcast && !props.hideBroadcast && computedStatus !== 'live' && computedStatus !== 'finished' && (
                                <div style={{ marginTop: '4px', display: 'flex', justifyContent: 'center' }}>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>TBA</span>
                                </div>
                            )}


                        </div>

                        <div
                            style={{
                                flex: 1,
                                textAlign: 'center',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            <TeamLogo
                                logoUrl={awayLogo}
                                teamName={match.away}
                                size={64}
                                flags={awayFlags}
                                onClick={(e) => handleTeamClick(e, match.away)}
                            />

                            <div style={{ fontSize: '1.1rem', }}>{renderTeamName(match.away, 'center', awayRank)}</div>

                            {/* Form badges under team name */}
                            {allMatches && awayForm.length > 0 && computedStatus !== 'live' && (
                                <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginTop: '4px' }}>
                                    {awayForm.map((f, i) => renderFormBadge(f, i))}
                                </div>
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
                    {/* Match info footer moved outside expander since expander is removed */}
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

    const content = (
        <div
            className={`match-card list ${highlight ? 'highlight' : ''}`}
            style={{
                borderLeft: computedStatus === 'live' ? '4px solid var(--color-primary)' : 'none',
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
                padding={highlight ? "20px 14px 10px 14px" : "12px 14px 8px 14px"}
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
                        textAlign: 'center',
                        fontSize: '0.65rem',
                        fontWeight: '600',
                        color: 'var(--color-text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '-4px',
                        marginTop: '-4px'
                    }}>
                        {match.group}
                    </div>
                )}
                <div style={{ display: 'flex', width: '100%', alignItems: 'center', gap: highlight ? '20px' : '12px' }}>
                    <TeamLogo
                        logoUrl={homeLogo}
                        teamName={match.home}
                        size={highlight ? 80 : 48}
                        flags={homeFlags}
                        onClick={(e) => handleTeamClick(e, match.home)}
                    />
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
                            <div
                                style={{
                                    flex: 1,
                                    textAlign: 'right',
                                    whiteSpace: 'normal',
                                    lineHeight: '1.2',
                                    wordBreak: 'break-word',
                                    fontWeight: '400',
                                    display: 'flex',
                                    justifyContent: 'flex-end'
                                }}
                            >
                                {renderTeamName(match.home, 'right', homeRank)}
                            </div>
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

                                <span
                                    style={{
                                        fontSize: highlight ? '1rem' : '0.8rem',
                                        color: outcomeTextColor || 'var(--color-text)',
                                        flexShrink: 0,
                                        padding: highlight ? '4px 12px' : '2px 8px',
                                        borderRadius: '6px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        transition: 'all 0.3s ease',
                                        ...badgeStyle
                                    }}
                                >
                                    {computedStatus === 'finished' ? (computedScore || displayTime) :
                                        computedStatus === 'live' ? (computedScore || 'LIVE') :
                                            (isOverdue ? '00:00' : (isFiltered || filterTeam ? displayTime : (timeLeftStr || displayTime)))}
                                </span>
                                {computedStatus === 'live' && match.liveCurrentTime && formatLiveTime(match.liveCurrentTime, match.period) !== 'SLUT' && (
                                    <div style={{ fontSize: highlight ? '0.75rem' : '0.65rem', color: '#000000', fontWeight: 'bold', marginTop: '2px', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                                        <span>{formatLiveTime(match.liveCurrentTime, match.period)}</span>
                                        <div className="live-timer-line" style={{ width: '40px' }} />
                                    </div>
                                )}

                                {match.broadcast && !props.hideBroadcast && computedStatus !== 'live' && computedStatus !== 'finished' && (
                                    <div style={{ marginTop: '2px', display: 'flex', justifyContent: 'center' }}>
                                        <BroadcasterLogo name={match.broadcast} size={highlight ? 'large' : 'default'} />
                                    </div>
                                )}
                                {!match.broadcast && !props.hideBroadcast && computedStatus !== 'live' && computedStatus !== 'finished' && (
                                    <div style={{ marginTop: '2px', display: 'flex', justifyContent: 'center' }}>
                                        <span style={{ fontSize: highlight ? '0.75rem' : '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>TBA</span>
                                    </div>
                                )}
                                {computedStatus === 'finished' && !props.hideBroadcast && (
                                    <a
                                        href={`https://www.svtplay.se/sok?q=${encodeURIComponent('VM fotboll höjdpunkter ' + match.home + ' ' + match.away)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        title="Se höjdpunkter på SVT Play"
                                        style={{
                                            marginTop: '4px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'var(--color-text-muted)',
                                            transition: 'color 0.2s',
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
                                        onMouseOut={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'}
                                    >
                                        <Play size={highlight ? 22 : 18} fill="currentColor" />
                                    </a>
                                )}
                            </button>
                            <div
                                style={{
                                    flex: 1,
                                    textAlign: 'left',
                                    whiteSpace: 'normal',
                                    lineHeight: '1.2',
                                    wordBreak: 'break-word',
                                    fontWeight: '400',
                                    display: 'flex',
                                    justifyContent: 'flex-start'
                                }}
                            >
                                {renderTeamName(match.away, 'left', awayRank)}
                            </div>
                        </div>

                    </div>
                    <TeamLogo
                        logoUrl={awayLogo}
                        teamName={match.away}
                        size={highlight ? 80 : 48}
                        flags={awayFlags}
                        onClick={(e) => handleTeamClick(e, match.away)}
                    />
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