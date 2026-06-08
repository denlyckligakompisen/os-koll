import React, { useState, useEffect } from 'react';
import Card from './common/Card';
import { getFlagCodes } from '../utils/flags';
import FlagBadge from './common/FlagBadge';
import { cleanTeamNameForDisplay } from '../utils/teamUtils';

const TeamLogo = ({ logoUrl, teamName, size = 64, flags = [], onClick }) => {
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        setHasError(false);
    }, [logoUrl]);

    if (logoUrl && !hasError) {
        return (
            <img 
                src={logoUrl} 
                alt="" 
                onError={() => setHasError(true)}
                onClick={onClick}
                style={{ 
                    height: `${size}px`, 
                    width: `${size}px`, 
                    objectFit: 'contain',
                    transition: 'all 0.3s ease',
                    cursor: onClick ? 'pointer' : 'default'
                }} 
            />
        );
    }

    if (flags && flags.length > 0) {
        return <FlagBadge codes={flags} name={teamName} size={size} onClick={onClick} />;
    }

    const initials = teamName
        ? teamName.replace(/\b(IF|FF|BK|AIF|IK|IS|FK|SK|BoIS)\b/g, '').trim().substring(0, 2).toUpperCase()
        : 'T';

    const colors = [
        ['#4f46e5', '#3b82f6'],
        ['#059669', '#10b981'],
        ['#dc2626', '#f43f5e'],
        ['#b45309', '#d97706'],
        ['#7c3aed', '#8b5cf6'],
        ['#0891b2', '#06b6d4'],
        ['#2563eb', '#3b82f6'],
        ['#0284c7', '#0ea5e9'],
    ];
    let sum = 0;
    for (let i = 0; i < (teamName || '').length; i++) {
        sum += (teamName || '').charCodeAt(i);
    }
    const [color1, color2] = colors[sum % colors.length];

    return (
        <div 
            onClick={onClick}
            style={{
                width: `${size}px`,
                height: `${size}px`,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${color1}, ${color2})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontSize: `${Math.round(size * 0.38)}px`,
                letterSpacing: '0.02em',
                boxShadow: 'var(--shadow-sm)',
                border: '1.5px solid rgba(255, 255, 255, 0.7)',
                flexShrink: 0,
                textShadow: '0 1px 2px rgba(0,0,0,0.15)',
                userSelect: 'none',
                cursor: onClick ? 'pointer' : 'default',
                transition: 'all 0.2s ease'
            }}
        >
            {initials}
        </div>
    );
};




const getLastName = (name) => {
    if (!name || typeof name !== 'string') {
        if (name && typeof name === 'object' && name.name) {
            name = name.name;
        } else {
            return '';
        }
    }
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
        const timeStr = String(minStr || '0');
        const base = parseInt(timeStr.split('+')[0]);
        const extra = parseInt(timeStr.split('+')[1] || '0');
        return isNaN(base) ? 0 : base + (extra / 100);
    };

    return [...scorersList]
        .filter(s => s.incidentClass !== 'yellow-card')
        .sort((a, b) => parseMinute(a.minute || a.time) - parseMinute(b.minute || b.time));
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

const BroadcasterLogo = ({ name, size = 'default' }) => {
    if (!name) return null;
    const b = name.toUpperCase().trim();
    const isLarge = size === 'large';
    const height = isLarge ? 18 : 14;

    if (b.includes('SVT')) {
        return (
            <svg viewBox="0 0 120 40" height={height} aria-label="SVT" style={{ display: 'block' }}>
                <rect width="120" height="40" rx="6" fill="#1B6E1F" />
                <text x="60" y="29" textAnchor="middle" fill="#ffffff" fontFamily="'Inter', Arial, sans-serif" fontSize="24" fontWeight="700" letterSpacing="2">SVT</text>
            </svg>
        );
    }

    if (b.includes('TV4')) {
        return (
            <svg viewBox="0 0 120 40" height={height} aria-label="TV4" style={{ display: 'block' }}>
                <rect width="120" height="40" rx="6" fill="#E3000B" />
                <text x="60" y="29" textAnchor="middle" fill="#ffffff" fontFamily="'Inter', Arial, sans-serif" fontSize="24" fontWeight="700" letterSpacing="2">TV4</text>
            </svg>
        );
    }

    if (b.includes('MAX')) {
        return (
            <img src="/max_logo.svg" alt="Max" style={{ height: `${height}px`, objectFit: 'contain', display: 'block' }} />
        );
    }

    // Fallback: plain text for unknown broadcasters
    return (
        <span style={{ fontSize: isLarge ? '0.8rem' : '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>
            {name}
        </span>
    );
};

const MatchCard = ({ match, idx, onCountryClick, onTeamClick, homeLogo, awayLogo, highlight, variant, filterTeam, allMatches, homeRank, awayRank, onGroupClick, onCardClick, ...props }) => {
    const homeFlags = getFlagCodes(match.home);
    const awayFlags = getFlagCodes(match.away);


    const getComputedStatus = () => {
        if (match.status === 'finished') return 'finished';
        if (match.status === 'postponed') return 'postponed';
        if (match.status === 'live') return 'live';

        if (match.status === 'upcoming' && match.startTimestamp) {
            const startMs = match.startTimestamp * 1000;
            const now = Date.now();
            if (now >= startMs) {
                const durationMs = 125 * 60 * 1000; // 125 mins
                if (now >= startMs + durationMs) {
                    return 'finished';
                }
            }
        }
        return 'upcoming';
    };

    const computedStatus = getComputedStatus();

    const getComputedScore = (status) => {
        if (match.score) return match.score;
        return '';
    };

    const computedScore = getComputedScore(computedStatus);

    const displayTime = match.time || 'TBA';

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

    const renderTeamName = (name, align = 'center', rankVal) => {
        if (!name) return null;
        let topText = null;
        let mainName = cleanTeamNameForDisplay(name);
        if (name.includes('\n')) {
            const parts = name.split('\n');
            topText = parts[0];
            mainName = cleanTeamNameForDisplay(parts[1]);
        }
        
        const isFiltered = filterTeam && (mainName.includes(filterTeam) || (topText && topText.includes(filterTeam)));
        
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: align === 'right' ? 'flex-end' : align === 'left' ? 'flex-start' : 'center' }}>
                {topText && <span style={{ fontSize: (variant === 'hero' || highlight) ? '0.75rem' : '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: isFiltered ? 600 : 'normal' }}>{topText}</span>}
                <span style={{ fontWeight: isFiltered ? 600 : 'normal' }}>{mainName}</span>
            </div>
        );
    };

    const getBroadcasterUrl = (broadcast) => {
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
                .replace(/[^a-z0-9\-]/g, '');
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


    if (variant === 'hero') {


        return (
            <Card 
                key={idx} 
                padding="28px"
                className="clickable-card"
                style={{
                    backgroundColor: 'var(--color-card-bg)',
                    border: 'var(--border)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    cursor: 'pointer',
                    ...props.style
                }}
                onClick={() => onCardClick && onCardClick()}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', width: '100%' }}>
                    <div
                        style={{ 
                            flex: 1, 
                            textAlign: 'center', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            gap: '12px'
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
                            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginTop: '-4px' }}>
                                {homeForm.map((f, i) => renderFormBadge(f, i))}
                            </div>
                        )}

                        {match.scorers?.home?.length > 0 && getSortedScorers(match.scorers.home).length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                                {getSortedScorers(match.scorers.home).map((s, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        {s.incidentClass === 'red-card' && (
                                            <div style={{ width: '8px', height: '12px', backgroundColor: '#e53935', borderRadius: '2px' }} title="Rött kort" />
                                        )}
                                        <span>{getLastName(s.player?.name || s.player)} {s.minute || s.time}'{s.suffix || ''}</span>
                                    </div>
                                ))}
                            </div>
                        )}


                    </div>

                    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                        
                        <button
                            onClick={handleBroadcastClick}
                            disabled={!getBroadcasterUrl(match.broadcast)}
                            style={{
                                fontSize: '1.4rem',
                                color: outcomeTextColor || 'var(--color-text)',
                                backgroundColor: outcomeBg || 'var(--color-surface-subtle)',
                                padding: '8px 20px',
                                borderRadius: '12px',
                                border: 'none',
                                cursor: getBroadcasterUrl(match.broadcast) ? 'pointer' : 'default',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            {computedStatus === 'finished' ? (computedScore || displayTime) : 
                             computedStatus === 'live' ? (computedScore || 'LIVE') : 
                             displayTime}
                        </button>
                        {match.broadcast && (
                            <div 
                                onClick={handleBroadcastClick}
                                style={{ marginTop: '4px', display: 'flex', justifyContent: 'center', cursor: getBroadcasterUrl(match.broadcast) ? 'pointer' : 'default' }}
                            >
                                <BroadcasterLogo name={match.broadcast} size="large" />
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
                            gap: '12px'
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
                            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginTop: '-4px' }}>
                                {awayForm.map((f, i) => renderFormBadge(f, i))}
                            </div>
                        )}

                        {match.scorers?.away?.length > 0 && getSortedScorers(match.scorers.away).length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                                {getSortedScorers(match.scorers.away).map((s, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <span>{getLastName(s.player?.name || s.player)} {s.minute || s.time}'{s.suffix || ''}</span>
                                        {s.incidentClass === 'red-card' && (
                                            <div style={{ width: '8px', height: '12px', backgroundColor: '#e53935', borderRadius: '2px' }} title="Rött kort" />
                                        )}
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
            onClick={() => onCardClick && onCardClick()}
        >
            <div style={{ display: 'flex', width: '100%', alignItems: computedStatus === 'upcoming' ? 'center' : 'flex-start', gap: highlight ? '20px' : '12px' }}>
            <TeamLogo 
                logoUrl={homeLogo} 
                teamName={match.home} 
                size={highlight ? 76 : 52} 
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
                        
                        <span style={{
                            fontSize: highlight ? '1rem' : '0.8rem',
                            color: outcomeTextColor || 'var(--color-text)',
                            flexShrink: 0,
                            backgroundColor: outcomeBg || 'var(--color-surface-subtle)',
                            padding: highlight ? '4px 12px' : '2px 8px',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.3s ease'
                        }}>
                            {computedStatus === 'finished' ? (computedScore || displayTime) : 
                             computedStatus === 'live' ? (computedScore || 'LIVE') : 
                             displayTime}
                        </span>
                        {computedStatus === 'live' && (
                            <span style={{
                                fontSize: highlight ? '0.75rem' : '0.68rem',
                                fontWeight: '400',
                                color: 'var(--color-text-muted)',
                                marginTop: '2px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.03em'
                            }}>
                                {match.liveCurrentTime ? (isNaN(match.liveCurrentTime) ? match.liveCurrentTime : `${match.liveCurrentTime}'`) : 'LIVE'}
                            </span>
                        )}
                        {match.broadcast && (
                            <div style={{ marginTop: '2px', display: 'flex', justifyContent: 'center' }}>
                                <BroadcasterLogo name={match.broadcast} size={highlight ? 'large' : 'default'} />
                            </div>
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
                                            paddingRight: '8px',
                                            display: 'flex',
                                            justifyContent: 'flex-end',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}>
                                            {homeScorer ? (
                                                <>
                                                    {homeScorer.incidentClass === 'red-card' && (
                                                        <div style={{ width: '6px', height: '9px', backgroundColor: '#e53935', borderRadius: '1px' }} title="Rött kort" />
                                                    )}
                                                    <span>{getLastName(homeScorer.player?.name || homeScorer.player)} {homeScorer.minute || homeScorer.time}'{homeScorer.suffix || ''}</span>
                                                </>
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
                                            paddingLeft: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}>
                                            {awayScorer ? (
                                                <>
                                                    <span>{getLastName(awayScorer.player?.name || awayScorer.player)} {awayScorer.minute || awayScorer.time}'{awayScorer.suffix || ''}</span>
                                                    {awayScorer.incidentClass === 'red-card' && (
                                                        <div style={{ width: '6px', height: '9px', backgroundColor: '#e53935', borderRadius: '1px' }} title="Rött kort" />
                                                    )}
                                                </>
                                            ) : ''}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    );
                })()}

            </div>
            <TeamLogo 
                logoUrl={awayLogo} 
                teamName={match.away} 
                size={highlight ? 76 : 52} 
                flags={awayFlags} 
                onClick={(e) => handleTeamClick(e, match.away)}
            />
            </div>
        </Card>
    );

    return content;
};

export default MatchCard;