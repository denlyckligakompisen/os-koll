import React from 'react';
import FlagBadge from '../common/FlagBadge';
import { getFlagCodes } from '../../utils/flags';


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
        match.bookings.forEach(b => {
            if (b.card === 'yellow' || b.card === 'red') {
                events.push({
                    type: b.card === 'yellow' ? 'yellow-card' : 'red-card',
                    side: b.side,
                    player: b.player?.name || b.player,
                    minuteStr: b.minute,
                    minute: parseMinute(b.minute)
                });
            }
        });
    }
    
    if (match.substitutions) {
        const subsByMin = {};
        match.substitutions.forEach(s => {
            const min = parseMinute(s.minute);
            const key = `${s.side}-${min}`;
            if (!subsByMin[key]) {
                subsByMin[key] = {
                    type: 'substitution',
                    side: s.side,
                    minuteStr: s.minute,
                    minute: min,
                    count: 0
                };
            }
            subsByMin[key].count++;
        });
        events.push(...Object.values(subsByMin));
    }

    events.sort((a, b) => a.minute - b.minute);

    if (events.length === 0 && !showEmptyTimeline) return null;

    const renderEventIcon = (e) => {
        if (e.type === 'goal' || e.type === 'penalty-goal' || e.type === 'own-goal') return (
            <span style={{ fontSize: '0.8rem', filter: 'grayscale(100%) drop-shadow(0 1px 1px rgba(0,0,0,0.2))' }}>⚽</span>
        );
        if (e.type === 'red-card') return <div style={{ width: '10px', height: '14px', backgroundColor: '#e53935', borderRadius: '2px', display: 'inline-block', border: '1px solid rgba(0,0,0,0.2)', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} title="Rött kort" />;
        if (e.type === 'yellow-card') return <div style={{ width: '10px', height: '14px', backgroundColor: '#ffd600', borderRadius: '2px', display: 'inline-block', border: '1px solid rgba(0,0,0,0.2)', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} title="Gult kort" />;
        if (e.type === 'substitution') return (
            <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', fontSize: '0.65rem', letterSpacing: '-1px' }}>
                <span style={{ color: '#34c759', filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.2))' }}>▲</span>
                <span style={{ color: '#ff3b30', filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.2))' }}>▼</span>
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

    events.forEach(e => {
        e.pct = 2 + (e.minute / maxMin) * 96;
    });

    const applySpacing = (teamEvents) => {
        const MIN_SPACING = 4;
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

    const lastEventTrackPct = events.length > 0 ? Math.max(...events.map(e => (e.minute / maxMin) * 100)) : 0;
    const currentTrackPct = progress || 0;
    const solidEndTrackPct = Math.min(lastEventTrackPct, currentTrackPct);
    const dashedWidthTrackPct = Math.max(0, currentTrackPct - solidEndTrackPct);

    return (
        <div style={{ position: 'relative', width: '100%', height: '44px', margin: '4px 0', display: 'flex', alignItems: 'center' }}>

            {/* Track container mapping 0-100% to 2%-98% of parent */}
            <div style={{ position: 'absolute', top: '50%', left: '2%', right: '2%', height: '4px', transform: 'translateY(-50%)' }}>
                {/* Gray background */}
                <div style={{ position: 'absolute', width: '100%', height: '100%', backgroundColor: 'rgba(128,128,128,0.15)', borderRadius: '4px' }} />
                
                {/* Solid green from start to last event */}
                <div style={{ position: 'absolute', left: 0, width: `${solidEndTrackPct}%`, height: '100%', backgroundColor: '#34c759', borderRadius: '4px', transition: 'width 1s linear' }} />
                
                {/* Dashed green from last event to current minute */}
                {dashedWidthTrackPct > 0 && (
                    <div style={{ 
                        position: 'absolute', 
                        left: `${solidEndTrackPct}%`, 
                        width: `${dashedWidthTrackPct}%`, 
                        height: '2px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        borderTop: '3px dashed #34c759',
                        transition: 'width 1s linear, left 1s linear'
                    }} />
                )}

                {/* Center mask to recreate the gap at 50% */}
                <div style={{ position: 'absolute', left: 'calc(50% - 3px)', width: '6px', height: '100%', backgroundColor: 'var(--color-card-bg)' }} />
            </div>

            {/* Current minute pin */}
            {progress > 0 && progress < 100 && (
                <div style={{
                    position: 'absolute',
                    bottom: '50%',
                    left: `${2 + currentTrackPct * 0.96}%`,
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    zIndex: 15,
                    transition: 'left 1s linear'
                }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        border: '2px solid rgba(128,128,128,0.25)',
                        backgroundColor: 'var(--color-card-bg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        color: 'var(--color-text)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}>
                        {match.liveCurrentTime && match.liveCurrentTime !== 'HT' && match.liveCurrentTime !== 'FT' 
                            ? (String(match.liveCurrentTime).includes("'") ? match.liveCurrentTime : `${match.liveCurrentTime}'`) 
                            : ''}
                    </div>
                    <div style={{
                        width: '2px',
                        height: '24px', /* Taller stick to sit above event icons */
                        backgroundColor: 'rgba(128,128,128,0.25)',
                        marginTop: '-1px'
                    }} />
                </div>
            )}

            {events.map((e, i) => {
                const pct = e.pct;
                const isHome = e.side === 'home';

                return (
                    <div key={i} style={{
                        position: 'absolute',
                        left: `${pct}%`,
                        bottom: isHome ? '50%' : 'auto',
                        top: isHome ? 'auto' : '50%',
                        transform: 'translate(-50%, 0)',
                        display: 'flex',
                        flexDirection: isHome ? 'column-reverse' : 'column',
                        alignItems: 'center',
                        gap: '1px',
                        padding: isHome ? '0 0 6px 0' : '6px 0 0 0',
                        zIndex: e.type === 'goal' ? 10 : 5
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
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default EventsTimeline;
