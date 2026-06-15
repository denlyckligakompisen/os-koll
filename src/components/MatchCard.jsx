import React, { useState, useEffect } from 'react';
import Card from './common/Card';
import { getFlagCodes } from '../utils/flags';
import FlagBadge from './common/FlagBadge';
import { cleanTeamNameForDisplay } from '../utils/teamUtils';
import { Play } from 'lucide-react';

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

    let day, monthName, year;

    if (parts.length === 2) {
        day = parseInt(parts[0]);
        monthName = parts[1]?.toLowerCase();
        year = 2026;
    } else if (parts.length >= 3) {
        day = parseInt(parts[1]);
        monthName = parts[2]?.toLowerCase();
        year = parseInt(parts[3]) || 2026;
    } else {
        return new Date();
    }

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

const getPlayerEvents = (match, p, isHome) => {
    const events = [];
    if (!match || !p) return events;
    const sideStr = isHome ? 'home' : 'away';

    const teamScorers = match.scorers?.[sideStr] || [];
    const goals = teamScorers.filter(g => g.player?.name === p.name && (g.incidentClass === 'goal' || g.incidentClass === 'penalty-goal'));
    goals.forEach(() => events.push('⚽'));

    const teamBookings = match.bookings?.filter(b => b.side === sideStr) || [];
    const cards = teamBookings.filter(b => b.player?.name === p.name);
    cards.forEach(c => {
        if (c.card === 'yellow') events.push('🟨');
        if (c.card === 'red') events.push('🟥');
    });

    const teamSubs = match.substitutions?.filter(s => s.side === sideStr) || [];
    if (teamSubs.find(s => s.playerOff === p.name)) {
        events.push(
            <div aria-hidden="true" style={{ backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: '50%', padding: '1px', display: 'flex' }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#e53935" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <polyline points="19 12 12 19 5 12"></polyline>
                </svg>
            </div>
        );
    }
    if (teamSubs.find(s => s.playerOn === p.name)) {
        events.push(
            <div aria-hidden="true" style={{ backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: '50%', padding: '1px', display: 'flex' }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="19" x2="12" y2="5"></line>
                    <polyline points="5 12 12 5 19 12"></polyline>
                </svg>
            </div>
        );
    }

    return events;
};

const PitchLineup = ({ match }) => {
    const groupPlayers = (players) => {
        const groups = { 0: [], 1: [], 2: [], 3: [] };
        if (!players) return groups;
        players.forEach(p => {
            const pos = p.position !== undefined ? p.position : 0;
            if (groups[pos]) groups[pos].push(p);
            else groups[0].push(p);
        });
        return groups;
    };

    const homeGroups = groupPlayers(match.startingXI?.home);
    const awayGroups = groupPlayers(match.startingXI?.away);

    const renderPlayerNode = (p, isHome) => {
        const hasPhoto = p.photo && p.photo.trim() !== '';
        const initials = p.name ? p.name.substring(0, 1).toUpperCase() : '?';
        const events = getPlayerEvents(match, p, isHome);
        return (
            <div key={p.number || p.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '20%', flexShrink: 0, position: 'relative' }}>
                <div style={{ position: 'relative', width: '32px', height: '32px' }}>
                    {events.length > 0 && (
                        <div style={{ position: 'absolute', top: '-6px', left: '-12px', zIndex: 4, display: 'flex', gap: '2px', fontSize: '0.8rem', whiteSpace: 'nowrap', filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.8))' }}>
                            {events.map((e, i) => <span key={i}>{e}</span>)}
                        </div>
                    )}
                    <div style={{
                        width: '100%', height: '100%', borderRadius: '50%',
                        backgroundColor: isHome ? 'var(--color-primary)' : 'var(--color-surface-subtle)',
                        color: isHome ? 'white' : 'var(--color-text)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.8rem', fontWeight: 'bold', border: '2px solid rgba(255,255,255,0.8)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                        overflow: 'hidden'
                    }}>
                        {hasPhoto && (
                            <img
                                src={p.photo}
                                alt={p.name}
                                style={{ 
                                    width: '100%', 
                                    height: '100%', 
                                    objectFit: 'cover', 
                                    objectPosition: 'top',
                                    transform: 'scale(4.0) translateY(30%)'
                                }}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    if (e.target.nextElementSibling) {
                                        e.target.nextElementSibling.style.display = 'block';
                                    }
                                }}
                            />
                        )}
                        <span style={{ display: hasPhoto ? 'none' : 'block' }}>
                            {p.number || initials}
                        </span>
                    </div>

                    {p.captain && (
                        <div style={{ position: 'absolute', top: '-4px', right: '-8px', zIndex: 2, backgroundColor: '#ffd600', color: '#000', borderRadius: '3px', fontSize: '0.8rem', padding: '1px 3px', fontWeight: 'bold', border: '1px solid rgba(0,0,0,0.2)' }}>C</div>
                    )}
                </div>

                <div style={{
                    fontSize: '0.75rem', color: 'white', marginTop: '4px',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.9), -1px -1px 2px rgba(0,0,0,0.9), 0px 0px 4px rgba(0,0,0,0.9)',
                    textAlign: 'center', width: '90px',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    fontWeight: 'bold', zIndex: 2, letterSpacing: '-0.02em'
                }}>
                    {p.number ? `${p.number}. ` : ''}{getLastName(p.name)}
                </div>
            </div>
        );
    };

    const renderRow = (players, isHome) => {
        if (!players || players.length === 0) return null;
        return (
            <div style={{ display: 'flex', justifyContent: 'space-evenly', width: '100%', margin: '4px 0' }}>
                {players.map(p => renderPlayerNode(p, isHome))}
            </div>
        );
    };

    return (
        <div style={{
            position: 'relative', width: '100%', maxWidth: '400px', margin: '16px auto',
            backgroundColor: '#2e7d32',
            borderRadius: '8px', overflow: 'hidden', padding: '16px 0',
            border: '2px solid rgba(255,255,255,0.5)',
            display: 'flex', flexDirection: 'column',
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.05) 40px, rgba(255,255,255,0.05) 80px)'
        }}>
            {/* CSS Pitch Lines */}
            <div style={{ position: 'absolute', top: '50%', left: 0, width: '100%', height: '2px', backgroundColor: 'rgba(255,255,255,0.4)', transform: 'translateY(-50%)' }} />
            <div style={{ position: 'absolute', top: '50%', left: '50%', width: '80px', height: '80px', border: '2px solid rgba(255,255,255,0.4)', borderRadius: '50%', transform: 'translate(-50%, -50%)' }} />
            <div style={{ position: 'absolute', top: '-2px', left: '20%', width: '60%', height: '15%', border: '2px solid rgba(255,255,255,0.4)' }} />
            <div style={{ position: 'absolute', bottom: '-2px', left: '20%', width: '60%', height: '15%', border: '2px solid rgba(255,255,255,0.4)' }} />
            <div style={{ position: 'absolute', top: '-2px', left: '35%', width: '30%', height: '6%', border: '2px solid rgba(255,255,255,0.4)' }} />
            <div style={{ position: 'absolute', bottom: '-2px', left: '35%', width: '30%', height: '6%', border: '2px solid rgba(255,255,255,0.4)' }} />

            {/* Home Team (Top to Bottom: GK=0, DEF=1, MID=2, FWD=3) */}
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, zIndex: 1, paddingBottom: '20px', justifyContent: 'space-between' }}>
                {renderRow(homeGroups[0], true)}
                {renderRow(homeGroups[1], true)}
                {renderRow(homeGroups[2], true)}
                {renderRow(homeGroups[3], true)}
            </div>

            {/* Away Team (Bottom to Top: FWD=3, MID=2, DEF=1, GK=0) */}
            <div style={{ display: 'flex', flexDirection: 'column-reverse', flex: 1, zIndex: 1, paddingTop: '20px', justifyContent: 'space-between' }}>
                {renderRow(awayGroups[0], false)}
                {renderRow(awayGroups[1], false)}
                {renderRow(awayGroups[2], false)}
                {renderRow(awayGroups[3], false)}
            </div>
        </div>
    );
};

const LineupsSection = ({ match }) => {
    if (!match.startingXI?.home?.length && !match.startingXI?.away?.length) return null;

    const renderSub = (p, isHome) => {
        const events = getPlayerEvents(match, p, isHome);
        return (
            <div key={p.number || p.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', marginBottom: '4px', flexDirection: isHome ? 'row' : 'row-reverse' }}>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', width: '20px', textAlign: 'center', backgroundColor: 'rgba(128,128,128,0.1)', borderRadius: '3px', padding: '1px', flexShrink: 0 }}>{p.number}</span>
                <span style={{ color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.name}
                </span>
                {events.length > 0 && (
                    <div style={{ display: 'flex', gap: '2px', fontSize: '0.8rem', flexShrink: 0 }}>
                        {events.map((e, i) => <span key={i}>{e}</span>)}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(128,128,128,0.1)' }}>


            <PitchLineup match={match} />

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginTop: '16px' }}>
                {/* Home Subs */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    {match.subs?.home?.length > 0 && (
                        <div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>Avbytare</div>
                            {match.subs.home.map(p => renderSub(p, true))}
                        </div>
                    )}
                </div>

                <div style={{ width: '1px', backgroundColor: 'rgba(128,128,128,0.1)' }} />

                {/* Away Subs */}
                <div style={{ flex: 1, minWidth: 0, textAlign: 'right' }}>
                    {match.subs?.away?.length > 0 && (
                        <div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>Avbytare</div>
                            {match.subs.away.map(p => renderSub(p, false))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const formatLiveTime = (timeStr, period) => {
    if (period === 4) return 'Halvtid';

    if (!timeStr) return 'LIVE';
    const str = String(timeStr).trim();
    if (str === 'HT' || str === 'Halvtid' || str === 'FT' || str === 'Fulltid') return str;

    if (str.includes('+')) {
        return str.endsWith("'") ? str : `${str}'`;
    }

    const cleanStr = str.replace(/'/g, '');
    const min = parseInt(cleanStr, 10);
    if (!isNaN(min)) {
        if (period === 3 && min >= 45) {
            return `45+${min - 45 + 1}'`;
        }
        if (period === 5 && min >= 90) {
            return `90+${min - 90 + 1}'`;
        }
        return `${min + 1}'`;
    }

    return str;
};

const EventsTimeline = ({ match, progress, showEmptyTimeline }) => {
    const parseMinute = (minStr) => {
        if (!minStr) return 0;
        const base = parseInt(String(minStr).split('+')[0]);
        const extra = parseInt(String(minStr).split('+')[1] || '0');
        return isNaN(base) ? 0 : base + (extra / 100);
    };

    let events = [];

    if (match.scorers?.home) {
        match.scorers.home.forEach(g => events.push({
            type: g.incidentClass || 'goal',
            side: 'home',
            player: g.player?.name || g.player,
            minuteStr: g.minute || g.time,
            minute: parseMinute(g.minute || g.time)
        }));
    }
    if (match.scorers?.away) {
        match.scorers.away.forEach(g => events.push({
            type: g.incidentClass || 'goal',
            side: 'away',
            player: g.player?.name || g.player,
            minuteStr: g.minute || g.time,
            minute: parseMinute(g.minute || g.time)
        }));
    }
    if (match.bookings) {
        match.bookings.filter(b => b.card === 'yellow').forEach(b => events.push({
            type: 'yellow-card',
            side: b.side,
            player: b.player?.name || b.player,
            minuteStr: b.minute,
            minute: parseMinute(b.minute)
        }));
    }
    // Substitutions disabled

    events.sort((a, b) => a.minute - b.minute); // Left to right

    if (events.length === 0 && !showEmptyTimeline) return null;

    const renderEventIcon = (e) => {
        if (e.type === 'goal' || e.type === 'penalty-goal') return (
            <svg width="14" height="14" viewBox="0 0 24 24" style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.2))' }}>
                <circle cx="12" cy="12" r="10.5" fill="#fff" stroke="#000" strokeWidth="1.5" />
                <path d="M12 7 L16 10 L14.5 15 L9.5 15 L8 10 Z" fill="#000" />
                <path d="M12 7 L12 1.5 M16 10 L21.5 8 M14.5 15 L17.5 20.5 M9.5 15 L6.5 20.5 M8 10 L2.5 8" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
        );
        if (e.type === 'red-card') return <div style={{ width: '10px', height: '14px', backgroundColor: '#e53935', borderRadius: '2px', display: 'inline-block', border: '1px solid rgba(0,0,0,0.2)', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} title="Rött kort" />;
        if (e.type === 'yellow-card') return <div style={{ width: '10px', height: '14px', backgroundColor: '#ffd600', borderRadius: '2px', display: 'inline-block', border: '1px solid rgba(0,0,0,0.2)', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} title="Gult kort" />;
        if (e.type === 'substitution') return (
            <div style={{ position: 'relative', display: 'inline-block' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.2))' }}>
                    <path d="M 3 6 L 14 6 L 14 2 L 22 8 L 14 14 L 14 10 L 3 10 Z" fill="#34c759" />
                    <path d="M 21 18 L 10 18 L 10 22 L 2 16 L 10 10 L 10 14 L 21 14 Z" fill="#ff3b30" />
                </svg>
                {e.count > 1 && (
                    <div style={{
                        position: 'absolute',
                        top: '-4px',
                        right: '-6px',
                        backgroundColor: 'var(--color-primary)',
                        color: 'white',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
                        lineHeight: 1
                    }}>
                        {e.count}
                    </div>
                )}
            </div>
        );
        return null;
    };

    const maxMin = Math.max(90, ...events.map(ev => ev.minute));

    // Anti-collision algorithm for timeline events
    events.forEach(e => {
        e.pct = 2 + (e.minute / maxMin) * 96;
    });

    const applySpacing = (teamEvents) => {
        const MIN_SPACING = 4; // minimum % distance between events on the same side
        for (let iteration = 0; iteration < 10; iteration++) {
            let moved = false;
            for (let i = 0; i < teamEvents.length - 1; i++) {
                const diff = teamEvents[i + 1].pct - teamEvents[i].pct;
                if (diff < MIN_SPACING) {
                    const overlap = MIN_SPACING - diff;
                    if (teamEvents[i].pct > 2) teamEvents[i].pct -= overlap / 2;
                    if (teamEvents[i + 1].pct < 98) teamEvents[i + 1].pct += overlap / 2;
                    moved = true;
                }
            }
            if (!moved) break;
        }
    };

    const homeEvents = events.filter(e => e.side === 'home');
    const awayEvents = events.filter(e => e.side === 'away');
    applySpacing(homeEvents);
    applySpacing(awayEvents);

    return (
        <div style={{ position: 'relative', width: '100%', height: '80px', margin: '16px 0', display: 'flex', alignItems: 'center' }}>
            {/* The horizontal line */}
            <div style={{ position: 'absolute', top: '50%', left: '2%', right: '2%', height: '4px', background: `linear-gradient(to right, var(--color-primary) ${progress || 0}%, rgba(128,128,128,0.15) ${progress || 0}%)`, transform: 'translateY(-50%)', borderRadius: '4px' }} />

            {/* Half time marker */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', width: '3px', height: '10px', backgroundColor: 'var(--color-surface-subtle)', transform: 'translate(-50%, -50%)', borderRadius: '1px' }} />

            {/* Live Progress Dot */}
            {match.status === 'live' && progress !== undefined && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: `${2 + (progress * 0.96)}%`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: 20
                }}>
                    <div style={{ position: 'relative' }}>
                        {/* The blue dot exactly in the center */}
                        <div className="live-indicator-pulse" style={{
                            position: 'absolute',
                            top: '-5px',
                            left: '-5px',
                            width: '10px',
                            height: '10px',
                            backgroundColor: 'var(--color-primary)',
                            borderRadius: '50%',
                            boxShadow: '0 0 0 2px var(--color-card-bg)'
                        }} />
                        {/* The minute text above the dot */}
                        <div style={{
                            position: 'absolute',
                            bottom: '10px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            fontSize: '0.8rem',
                            fontWeight: 'bold',
                            color: '#007aff',
                            backgroundColor: 'var(--color-card-bg)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            border: '1px solid rgba(0, 122, 255, 0.3)',
                            whiteSpace: 'nowrap',
                            zIndex: 21
                        }}>
                            {formatLiveTime(match.liveCurrentTime, match.period)}
                        </div>
                    </div>
                </div>
            )}

            {events.map((e, i) => {
                const pct = e.pct;
                const isHome = e.side === 'home';

                return (
                    <div key={i} style={{
                        position: 'absolute',
                        left: `${pct}%`,
                        // If home, anchor to bottom of the top half. If away, anchor to top of the bottom half.
                        bottom: isHome ? '50%' : 'auto',
                        top: isHome ? 'auto' : '50%',
                        transform: 'translate(-50%, 0)',
                        display: 'flex',
                        flexDirection: isHome ? 'column-reverse' : 'column',
                        alignItems: 'center',
                        gap: '4px',
                        padding: isHome ? '0 0 6px 0' : '6px 0 0 0',
                        zIndex: e.type === 'goal' ? 10 : 5 // Goals on top of cards
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {renderEventIcon(e)}
                        </div>
                        <div style={{
                            position: 'relative',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <span className="sr-only">Minut {e.minuteStr}: </span>
                            {e.type !== 'yellow-card' && e.type !== 'red-card' && e.player && (
                                <div style={{
                                    position: 'absolute',
                                    [isHome ? 'bottom' : 'top']: '100%',
                                    [isHome ? 'marginBottom' : 'marginTop']: '2px',
                                    fontSize: '0.85rem',
                                    color: 'var(--color-text)',
                                    whiteSpace: 'nowrap',
                                    textShadow: '0 0 3px var(--color-card-bg), 0 0 3px var(--color-card-bg)',
                                    fontWeight: 'normal',
                                    textAlign: 'center'
                                }}>
                                    {getLastName(e.player)}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const AllEventsList = ({ match }) => {
    const parseMinute = (minStr) => {
        if (!minStr) return 0;
        const base = parseInt(String(minStr).split('+')[0]);
        const extra = parseInt(String(minStr).split('+')[1] || '0');
        return isNaN(base) ? 0 : base + (extra / 100);
    };

    let events = [];

    // Goals & Red cards (from scorers)
    if (match.scorers?.home) {
        match.scorers.home.forEach(g => events.push({
            type: g.incidentClass || 'goal',
            side: 'home',
            player: g.player?.name || g.player,
            minuteStr: g.minute || g.time,
            minute: parseMinute(g.minute || g.time)
        }));
    }
    if (match.scorers?.away) {
        match.scorers.away.forEach(g => events.push({
            type: g.incidentClass || 'goal',
            side: 'away',
            player: g.player?.name || g.player,
            minuteStr: g.minute || g.time,
            minute: parseMinute(g.minute || g.time)
        }));
    }

    // All Bookings (Yellow & Red)
    // To avoid duplicating red cards that might be in scorers, we filter them if they already exist at the exact same minute
    if (match.bookings) {
        match.bookings.forEach(b => {
            const isRed = b.card === 'red';
            const bMin = parseMinute(b.minute);

            if (isRed) {
                // Check if already in events (from scorers)
                const exists = events.some(e => e.type === 'red-card' && e.minute === bMin && e.side === b.side);
                if (exists) return; // Skip duplicate
            }

            events.push({
                type: isRed ? 'red-card' : 'yellow-card',
                side: b.side,
                player: b.player?.name || b.player,
                minuteStr: b.minute,
                minute: bMin
            });
        });
    }

    // Substitutions disabled

    events.sort((a, b) => b.minute - a.minute);

    if (events.length === 0) return <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '8px', padding: '8px', backgroundColor: 'var(--color-bg)', borderRadius: '4px' }}>Inga händelser att visa.</div>;

    const renderEventIcon = (type) => {
        if (type === 'goal' || type === 'penalty-goal') return (
            <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.1))' }}>
                <circle cx="12" cy="12" r="10.5" fill="#fff" stroke="#000" strokeWidth="1.5" />
                <path d="M12 7 L16 10 L14.5 15 L9.5 15 L8 10 Z" fill="#000" />
                <path d="M12 7 L12 1.5 M16 10 L21.5 8 M14.5 15 L17.5 20.5 M9.5 15 L6.5 20.5 M8 10 L2.5 8" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
        );
        if (type === 'red-card') return <div aria-hidden="true" style={{ width: '8px', height: '11px', backgroundColor: '#e53935', borderRadius: '1.5px', display: 'inline-block', border: '0.5px solid rgba(0,0,0,0.15)' }} title="Rött kort" />;
        if (type === 'yellow-card') return <div aria-hidden="true" style={{ width: '8px', height: '11px', backgroundColor: '#ffd600', borderRadius: '1.5px', display: 'inline-block', border: '0.5px solid rgba(0,0,0,0.15)' }} title="Gult kort" />;
        if (type === 'substitution') return (
            <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.1))' }}>
                <path d="M 3 6 L 14 6 L 14 2 L 22 8 L 14 14 L 14 10 L 3 10 Z" fill="#34c759" />
                <path d="M 21 18 L 10 18 L 10 22 L 2 16 L 10 10 L 10 14 L 21 14 Z" fill="#ff3b30" />
            </svg>
        );
        return null;
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px', padding: '12px', backgroundColor: 'rgba(128,128,128,0.05)', borderRadius: '8px' }}>
            {events.map((e, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, color: 'var(--color-text)' }}>
                        {renderEventIcon(e.type)}
                        {e.type === 'substitution' ? (
                            <span>
                                <span className="sr-only">Minut {e.minuteStr}: </span>
                                <strong style={{ color: 'var(--color-text)' }}>{getLastName(e.playerOn)}</strong> in, <span style={{ color: 'var(--color-text-muted)' }}>{getLastName(e.playerOff)} ut</span>
                            </span>
                        ) : (
                            <span>
                                <span className="sr-only">Minut {e.minuteStr}: </span>
                                <strong>{getLastName(e.player)}</strong>
                                {e.type === 'penalty-goal' && <span className="sr-only">Straffmål</span>}
                                {e.type === 'penalty-goal' && <span aria-hidden="true" style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginLeft: '4px' }}>(Straffmål)</span>}
                                {e.type === 'goal' && <span className="sr-only">Mål</span>}
                                {e.type === 'goal' && <span aria-hidden="true" style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginLeft: '4px' }}>(Mål)</span>}
                                {e.type === 'yellow-card' && <span className="sr-only">Gult kort</span>}
                                {e.type === 'yellow-card' && <span aria-hidden="true" style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginLeft: '4px' }}>(Gult kort)</span>}
                                {e.type === 'red-card' && <span className="sr-only">Rött kort</span>}
                                {e.type === 'red-card' && <span aria-hidden="true" style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginLeft: '4px' }}>(Rött kort)</span>}
                            </span>
                        )}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {cleanTeamName(e.side === 'home' ? match.home : match.away)}
                    </div>
                </div>
            ))}
        </div>
    );
};

const MatchCard = ({ match, idx, onCountryClick, onTeamClick, homeLogo, awayLogo, highlight, variant, filterTeam, isFiltered, allMatches, homeRank, awayRank, onGroupClick, onCardClick, ...props }) => {
    const homeFlags = match.homeFlags || getFlagCodes(match.home);
    const awayFlags = match.awayFlags || getFlagCodes(match.away);

    const [timeLeftStr, setTimeLeftStr] = useState(null);
    const [showLineups, setShowLineups] = useState(false);

    const getComputedStatus = () => {
        if (match.status === 'finished') {
            const startMs = match.startTimestamp ? match.startTimestamp * 1000 : parseMatchDateLocal(match.date, match.time).getTime();
            if (Date.now() <= startMs + 140 * 60 * 1000) return 'live';
            return 'finished';
        }
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

    const getIsSoon = () => {
        if (computedStatus !== 'upcoming') return false;
        const startMs = match.startTimestamp ? match.startTimestamp * 1000 : parseMatchDateLocal(match.date, match.time).getTime();
        const timeUntilStart = startMs - Date.now();
        return timeUntilStart > 0 && timeUntilStart <= 30 * 60 * 1000;
    };
    const isSoon = getIsSoon();

    const getIsOverdue = () => {
        if (computedStatus !== 'upcoming') return false;
        const startMs = match.startTimestamp ? match.startTimestamp * 1000 : parseMatchDateLocal(match.date, match.time).getTime();
        return Date.now() >= startMs;
    };
    const isOverdue = getIsOverdue();

    const getLiveProgress = () => {
        if (computedStatus !== 'live') return 0;
        const timeStr = match.liveCurrentTime;
        if (match.period === 4) return 50; // 50%
        if (!timeStr) return 0;
        if (timeStr === 'HT' || timeStr === 'Halvtid') return 50; // 50%
        if (timeStr === 'FT' || timeStr === 'Fulltid') return 100; // 100%
        const base = parseInt(String(timeStr).split('+')[0]);
        if (isNaN(base)) return 0;
        let percentage = Math.min(base / 90, 1.0);
        return percentage * 100;
    };

    const liveProgressPercent = getLiveProgress();

    useEffect(() => {
        if (variant !== 'hero' || computedStatus !== 'upcoming') {
            setTimeLeftStr(null);
            return;
        }

        const updateTimer = () => {
            const matchDateLocal = parseMatchDateLocal(match.date, match.time);
            const diff = matchDateLocal.getTime() - Date.now();
            if (diff > 0) {
                const totalSecs = Math.floor(diff / 1000);
                const h = Math.floor(totalSecs / 3600);
                const m = Math.floor((totalSecs % 3600) / 60);
                const s = totalSecs % 60;
                if (h > 0) {
                    setTimeLeftStr(null);
                } else {
                    setTimeLeftStr(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
                }
            } else {
                setTimeLeftStr('00:00');
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [variant, computedStatus, match.date, match.time]);

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
                onClick={(e) => {
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
                    padding="28px"
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
                    {match.group && (
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
                                <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginTop: '4px' }}>
                                    {homeForm.map((f, i) => renderFormBadge(f, i))}
                                </div>
                            )}
                        </div>

                        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>

                            <button
                                onClick={handleBroadcastClick}
                                disabled={!getBroadcasterUrl(match.broadcast)}
                                style={{
                                    fontSize: '2rem',
                                    fontWeight: 'bold',
                                    color: outcomeTextColor || 'var(--color-text)',
                                    padding: '8px 20px',
                                    borderRadius: '12px',
                                    cursor: getBroadcasterUrl(match.broadcast) ? 'pointer' : 'default',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    ...badgeStyle
                                }}
                            >
                                {computedStatus === 'finished' ? (computedScore || displayTime) :
                                    computedStatus === 'live' ? (computedScore || 'LIVE') :
                                        (isOverdue ? '00:00' : (isFiltered || filterTeam ? displayTime : (timeLeftStr || displayTime)))}
                            </button>

                            {match.broadcast && !props.hideBroadcast && computedStatus !== 'live' && computedStatus !== 'finished' && (
                                <div
                                    onClick={handleBroadcastClick}
                                    style={{ marginTop: '4px', display: 'flex', justifyContent: 'center', cursor: getBroadcasterUrl(match.broadcast) ? 'pointer' : 'default' }}
                                >
                                    <BroadcasterLogo name={match.broadcast} size="large" />
                                </div>
                            )}
                            {!match.broadcast && !props.hideBroadcast && computedStatus !== 'live' && computedStatus !== 'finished' && (
                                <div style={{ marginTop: '4px', display: 'flex', justifyContent: 'center' }}>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>TBA</span>
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
                                        marginTop: '6px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'var(--color-text-muted)',
                                        transition: 'color 0.2s',
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
                                    onMouseOut={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'}
                                >
                                    <Play size={28} fill="currentColor" />
                                </a>
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
                            {showLineups && <LineupsSection match={match} />}
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
            onClick={(e) => {
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
            >
            {match.group && (
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
                    size={highlight ? 76 : 52}
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
                    {showLineups && <LineupsSection match={match} />}
                </div>
            )}
        </Card>
        </div>
    );

    return content;
};

export default MatchCard;