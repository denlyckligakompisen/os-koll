import React, { useState, useEffect } from 'react';
import Card from './common/Card';
import BoldSverige from './BoldSverige';
import { getFlagCodes } from '../utils/flags';
import FlagBadge from './common/FlagBadge';

export const cleanTeamNameForDisplay = (name) => {
    if (!name) return '';
    let cleaned = name.trim();
    
    // Explicit clean mapping for known teams
    if (cleaned === 'Djurgårdens IF') return 'Djurgården';
    if (cleaned === 'Hammarby IF') return 'Hammarby';
    if (cleaned === 'Malmö FF') return 'Malmö';
    if (cleaned === 'IK Sirius') return 'Sirius';
    if (cleaned === 'BK Häcken') return 'Häcken';
    if (cleaned === 'Halmstads BK') return 'Halmstad';
    if (cleaned === 'Kalmar FF') return 'Kalmar';
    if (cleaned === 'Mjällby AIF') return 'Mjällby';
    if (cleaned === 'Västerås SK') return 'Västerås';
    if (cleaned === 'IFK Göteborg') return 'Göteborg';
    if (cleaned === 'IFK Norrköping') return 'Norrköping';
    if (cleaned === 'IFK Värnamo') return 'Värnamo';
    if (cleaned === 'IF Elfsborg') return 'Elfsborg';
    if (cleaned === 'IF Brommapojkarna') return 'BP';
    if (cleaned === 'Degerfors IF') return 'Degerfors';
    if (cleaned === 'Örgryte IS') return 'Örgryte';
    if (cleaned === 'Varbergs BoIS') return 'Varberg';
    if (cleaned === 'Landskrona BoIS') return 'Landskrona';
    if (cleaned === 'Trelleborgs FF') return 'Trelleborg';
    if (cleaned === 'Gefle IF') return 'Gefle';
    if (cleaned === 'IK Oddevold') return 'Oddevold';
    if (cleaned === 'Östers IF') return 'Öster';
    if (cleaned === 'Örebro SK') return 'Örebro';
    if (cleaned === 'Helsingborgs IF') return 'Helsingborg';
    if (cleaned === 'GIF Sundsvall') return 'Sundsvall';
    
    // Generic regex fallbacks
    cleaned = cleaned.replace(/^IFK\s+/i, '');
    cleaned = cleaned.replace(/^(BK|IK)\s+/i, '');
    cleaned = cleaned.replace(/\s+(IF|FF|BK|BoIS|IS|FK|IK|AIF|SK)\b/gi, '');
    
    return cleaned;
};

export const getStadiumForTeam = (teamName) => {
    if (!teamName) return '';
    const clean = teamName.replace(/\b(IF|FF|BK|AIF)\b/g, '').replace(/\s+/g, ' ').trim();
    if (clean.includes('AIK')) return 'Strawberry Arena';
    if (clean.includes('Häcken')) return 'Bravida Arena';
    if (clean.includes('Djurgården')) return 'Tele2 Arena';
    if (clean.includes('GAIS')) return 'Gamla Ullevi';
    if (clean.includes('Halmstad')) return 'Örjans Vall';
    if (clean.includes('Hammarby')) return 'Tele2 Arena';
    if (clean.includes('Brommapojkarna') || clean === 'BP') return 'Grimsta IP';
    if (clean.includes('Elfsborg')) return 'Borås Arena';
    if (clean.includes('Göteborg')) return 'Gamla Ullevi';
    if (clean.includes('Sirius')) return 'Studenternas IP';
    if (clean.includes('Kalmar')) return 'Guldfågeln Arena';
    if (clean.includes('Malmö')) return 'Eleda Stadion';
    if (clean.includes('Mjällby')) return 'Strandvallen';
    if (clean.includes('Västerås')) return 'Hitachi Energy Arena';
    if (clean.includes('Degerfors')) return 'Stora Valla';
    if (clean.includes('Örgryte')) return 'Gamla Ullevi';
    return '';
};

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

const MONTH_MAP_LOCAL = { 
    'jan': 0, 'januari': 0,
    'feb': 1, 'februari': 1,
    'mar': 2, 'mars': 2,
    'apr': 3, 'april': 3,
    'maj': 4,
    'jun': 5, 'juni': 5,
    'jul': 6, 'juli': 6,
    'aug': 7, 'augusti': 7,
    'sep': 8, 'september': 8,
    'okt': 9, 'oktober': 9,
    'nov': 10, 'november': 10,
    'dec': 11, 'december': 11
};

const parseMatchDateLocal = (dateStr, timeStr) => {
    if (!dateStr) return new Date();
    const parts = dateStr.split(' ');
    if (parts.length < 3) return new Date();
    
    const day = parseInt(parts[1]);
    const monthName = parts[2]?.toLowerCase();
    const year = parseInt(parts[3]) || 2026;

    let hour = 0, minute = 0;
    if (timeStr && timeStr.includes(':')) {
        const [h, m] = timeStr.split(':').map(Number);
        hour = h;
        minute = m;
    }

    return new Date(year, MONTH_MAP_LOCAL[monthName] ?? 0, day, hour, minute);
};

const cleanTeamName = (n) => {
    if (!n) return '';
    return n.replace(/\b(IF|FF|BK|AIF)\b/g, '').replace(/\s+/g, ' ').trim();
};

const MatchCard = ({ match, idx, onCountryClick, onTeamClick, homeLogo, awayLogo, highlight, variant, filterTeam, allMatches, ...props }) => {
    const homeFlags = getFlagCodes(match.home);
    const awayFlags = getFlagCodes(match.away);

    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
        if (match.status !== 'upcoming' || !match.startTimestamp) {
            setTimeLeft(null);
            return;
        }

        const targetTime = match.startTimestamp * 1000;

        const updateTimer = () => {
            const now = Date.now();
            const diff = targetTime - now;

            if (diff > 0 && diff <= 60 * 60 * 1000) {
                const totalSecs = Math.floor(diff / 1000);
                const mins = String(Math.floor(totalSecs / 60)).padStart(2, '0');
                const secs = String(totalSecs % 60).padStart(2, '0');
                setTimeLeft(`${mins}:${secs}`);
            } else {
                setTimeLeft(null);
            }
        };

        // Run once immediately
        updateTimer();

        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [match.status, match.startTimestamp]);

    // Calculate Form
    const getTeamForm = (teamName) => {
        const cleanTeam = cleanTeamName(teamName);
        const teamFinished = (allMatches || [])
            .filter(m => m.status === 'finished' && m.score)
            .filter(m => cleanTeamName(m.home) === cleanTeam || cleanTeamName(m.away) === cleanTeam);

        const sorted = [...teamFinished].sort((a, b) => {
            return parseMatchDateLocal(b.date, b.time) - parseMatchDateLocal(a.date, a.time);
        });

        const last5 = sorted.slice(0, 5).reverse();

        return last5.map(m => {
            const parts = m.score.split('-').map(s => parseInt(s.trim()));
            if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                const homeScore = parts[0];
                const awayScore = parts[1];
                const isHome = cleanTeamName(m.home) === cleanTeam;
                if (homeScore === awayScore) return 'O'; // Draw
                if ((isHome && homeScore > awayScore) || (!isHome && awayScore > homeScore)) return 'V'; // Win
                return 'F'; // Loss
            }
            return null;
        }).filter(Boolean);
    };

    const homeForm = getTeamForm(match.home);
    const awayForm = getTeamForm(match.away).reverse();

    const renderFormBadge = (result, key) => {
        let bg = '#8e8e93';
        if (result === 'V') bg = '#34c759'; // Green
        else if (result === 'F') bg = '#ff3b30'; // Red
        
        return (
            <span key={key} style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: bg,
                color: 'white',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.62rem',
                fontWeight: '800',
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

    const renderTeamName = (name) => {
        if (!name) return null;
        if (name.includes('\n')) {
            const [rank, teamName] = name.split('\n');
            const cleanedTeam = cleanTeamNameForDisplay(teamName);
            return (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: (variant === 'hero' || highlight) ? '0.75rem' : '0.65rem', color: 'var(--color-text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>{rank}</span>
                    <BoldSverige text={cleanedTeam} />
                </div>
            );
        }
        return <BoldSverige text={cleanTeamNameForDisplay(name)} />;
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
                className={props.onClick ? "clickable-card" : ""}
                style={{
                    backgroundColor: 'var(--color-card-bg)',
                    border: 'var(--border)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                    ...props.style
                }}
                onClick={props.onClick}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div
                        onClick={(e) => handleTeamClick(e, match.home)}
                        style={{ 
                            flex: 1, 
                            textAlign: 'center', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            gap: '12px',
                            cursor: (onTeamClick || onCountryClick) ? 'pointer' : 'default'
                        }}
                    >
                        {homeLogo ? (
                            <img src={homeLogo} alt="" style={{ height: '64px', width: '64px', objectFit: 'contain' }} />
                        ) : (
                            homeFlags.length > 0 && <FlagBadge codes={homeFlags} name={match.home} size={64} />
                        )}

                        <div style={{ fontSize: '1.1rem', fontWeight: '700' }}>{renderTeamName(match.home)}</div>

                        {/* Form badges under team name */}
                        {allMatches && homeForm.length > 0 && (
                            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginTop: '-4px' }}>
                                {homeForm.map((f, i) => renderFormBadge(f, i))}
                            </div>
                        )}

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
                        {match.round ? (
                            <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>
                                Omgång {match.round}
                            </div>
                        ) : match.group ? (
                            <div style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {match.group}
                            </div>
                        ) : null}
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
                             (timeLeft || match.time)}
                        </button>

                        {(match.venue || getStadiumForTeam(match.home)) && (
                            <div style={{ 
                                fontSize: '0.7rem', 
                                fontWeight: '600', 
                                color: 'var(--color-text-muted)', 
                                marginTop: '2px'
                            }}>
                                {match.venue || getStadiumForTeam(match.home)}
                            </div>
                        )}
                        {match.h2h && (
                            <div style={{ 
                                fontSize: '0.65rem', 
                                fontWeight: '700', 
                                color: 'var(--color-text-muted)', 
                                marginTop: '2px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em'
                            }}>
                                {match.h2h.homeWins}-{match.h2h.draws}-{match.h2h.awayWins}
                            </div>
                        )}
                    </div>

                    <div
                        onClick={(e) => handleTeamClick(e, match.away)}
                        style={{ 
                            flex: 1, 
                            textAlign: 'center', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            gap: '12px',
                            cursor: (onTeamClick || onCountryClick) ? 'pointer' : 'default'
                        }}
                    >
                        {awayLogo ? (
                            <img src={awayLogo} alt="" style={{ height: '64px', width: '64px', objectFit: 'contain' }} />
                        ) : (
                            awayFlags.length > 0 && <FlagBadge codes={awayFlags} name={match.away} size={64} />
                        )}

                        <div style={{ fontSize: '1.1rem', fontWeight: '700' }}>{renderTeamName(match.away)}</div>

                        {/* Form badges under team name */}
                        {allMatches && awayForm.length > 0 && (
                            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginTop: '-4px' }}>
                                {awayForm.map((f, i) => renderFormBadge(f, i))}
                            </div>
                        )}

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
            className={props.onClick ? "clickable-card" : ""}
            style={{
                border: 'var(--border)', 
                boxShadow: 'none', 
                backgroundColor: 'var(--color-card-bg)', 
                display: 'flex', 
                alignItems: match.status === 'upcoming' ? 'center' : 'flex-start', 
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
                <img 
                    src={homeLogo} 
                    alt="" 
                    onClick={(e) => handleTeamClick(e, match.home)}
                    style={{ 
                        height: highlight ? '64px' : '32px', 
                        width: highlight ? '64px' : '32px', 
                        objectFit: 'contain', 
                        transition: 'all 0.3s ease',
                        cursor: (onTeamClick || onCountryClick) ? 'pointer' : 'default'
                    }} 
                />
            ) : (
                homeFlags.length > 0 && <FlagBadge codes={homeFlags} name={match.home} size={highlight ? 64 : 32} onClick={(e) => handleTeamClick(e, match.home)} />
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
                        onClick={(e) => handleTeamClick(e, match.home)}
                        style={{
                            flex: 1,
                            textAlign: 'right',
                            whiteSpace: 'normal',
                            lineHeight: '1.2',
                            wordBreak: 'break-word',
                            fontWeight: highlight ? '700' : '500',
                            cursor: (onTeamClick || onCountryClick) ? 'pointer' : 'default'
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
                             (timeLeft || match.time)}
                        </span>
                        {match.broadcast && (
                            <div style={{ fontSize: highlight ? '0.85rem' : '0.75rem', fontWeight: '800', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>
                                {match.broadcast}
                            </div>
                        )}
                    </button>
                    <span
                        onClick={(e) => handleTeamClick(e, match.away)}
                        style={{
                            flex: 1,
                            textAlign: 'left',
                            whiteSpace: 'normal',
                            lineHeight: '1.2',
                            wordBreak: 'break-word',
                            fontWeight: highlight ? '700' : '500',
                            cursor: (onTeamClick || onCountryClick) ? 'pointer' : 'default'
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
                <img 
                    src={awayLogo} 
                    alt="" 
                    onClick={(e) => handleTeamClick(e, match.away)}
                    style={{ 
                        height: highlight ? '64px' : '32px', 
                        width: highlight ? '64px' : '32px', 
                        objectFit: 'contain', 
                        transition: 'all 0.3s ease',
                        cursor: (onTeamClick || onCountryClick) ? 'pointer' : 'default'
                    }} 
                />
            ) : (
                awayFlags.length > 0 && <FlagBadge codes={awayFlags} name={match.away} size={highlight ? 64 : 32} onClick={(e) => handleTeamClick(e, match.away)} />
            )}
        </Card>
    );

    return content;
};

export default MatchCard;
