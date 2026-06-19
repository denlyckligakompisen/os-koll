import React from 'react';
import { getLastName } from './utils.jsx';

const MatchEvents = ({ match }) => {
    const formatName = (name) => {
        if (!name || typeof name !== 'string') return name;
        return name.replace(/\b([A-ZÅÄÖ])([A-ZÅÄÖ]+)\b/g, (match, p1, p2) => {
            return p1 + p2.toLowerCase();
        });
    };

    const parseMinute = (minStr) => {
        if (!minStr) return 0;
        const base = parseInt(String(minStr).split('+')[0]);
        const extra = parseInt(String(minStr).split('+')[1] || '0');
        return isNaN(base) ? 0 : base + (extra / 100);
    };

    let allEvents = [];
    if (match.scorers?.home) match.scorers.home.forEach(g => allEvents.push({ side: 'home', player: g.player?.name || g.player, minuteStr: g.minute || g.time, minute: parseMinute(g.minute || g.time), type: g.incidentClass || 'goal' }));
    if (match.scorers?.away) match.scorers.away.forEach(g => allEvents.push({ side: 'away', player: g.player?.name || g.player, minuteStr: g.minute || g.time, minute: parseMinute(g.minute || g.time), type: g.incidentClass || 'goal' }));
    if (match.bookings) {
        match.bookings.forEach(b => {
            if (b.card === 'yellow' || b.card === 'red') {
                allEvents.push({ side: b.side, player: b.player?.name || b.player, minuteStr: b.minute, minute: parseMinute(b.minute), type: b.card });
            }
        });
    }

    if (match.substitutions) {
        match.substitutions.forEach(s => {
            allEvents.push({
                side: s.side,
                player: s.playerOn ? { in: s.playerOn, out: s.playerOff } : 'Byte',
                minuteStr: s.minute,
                minute: parseMinute(s.minute),
                type: 'substitution'
            });
        });
    }

    if (allEvents.length === 0) return null;

    // Check if match has reached or passed halftime
    const isPastFirstHalf = String(match.period) === '4' || String(match.period) === '2' || match.status?.type === 'finished' || match.period === 'Finished' || allEvents.some(e => e.minute > 45);
    
    if (isPastFirstHalf) {
        allEvents.push({ 
            side: 'center', 
            player: 'Halvtid', 
            minuteStr: 'HT', 
            minute: 45.5, 
            type: 'halftime' 
        });
    }

    // Sort descending (latest event first)
    allEvents.sort((a, b) => b.minute - a.minute);

    const getBaseMinute = (minStr) => parseInt(String(minStr).split('+')[0] || '0');
    
    const extraTime = allEvents.filter(e => getBaseMinute(e.minuteStr) > 90);
    const secondHalf = allEvents.filter(e => getBaseMinute(e.minuteStr) > 45 && getBaseMinute(e.minuteStr) <= 90);
    const firstHalf = allEvents.filter(e => getBaseMinute(e.minuteStr) <= 45);

    const renderEventIcon = (type) => {
        if (type === 'goal' || type === 'penalty-goal' || type === 'own-goal') return <span style={{ filter: 'grayscale(100%)', fontSize: '0.8rem' }}>⚽</span>;
        if (type === 'yellow') return <div style={{ width: '10px', height: '14px', backgroundColor: '#ffd600', borderRadius: '2px', display: 'inline-block', border: '1px solid rgba(0,0,0,0.15)' }} />;
        if (type === 'red') return <div style={{ width: '10px', height: '14px', backgroundColor: '#e53935', borderRadius: '2px', display: 'inline-block', border: '1px solid rgba(0,0,0,0.15)' }} />;
        return null;
    };

    const hasSecondHalfStarted = String(match.period) === '2' || match.status?.type === 'finished' || match.period === 'Finished' || allEvents.some(e => e.minute > 45 && e.type !== 'halftime');

    const renderTimelineEvent = (event) => {
        if (event.type === 'halftime') {
            return (
                <div key="halftime" style={{ display: 'flex', width: '100%', marginBottom: '8px', position: 'relative', justifyContent: 'center' }}>
                    {/* The continuous line */}
                    <div style={{ position: 'absolute', top: hasSecondHalfStarted ? '-16px' : '0', bottom: '-16px', width: '2px', backgroundColor: 'rgba(128,128,128,0.2)', zIndex: 0 }} />
                    <div style={{ 
                        background: 'var(--color-card-bg)',
                        padding: '4px 0',
                        zIndex: 1,
                        display: 'flex',
                        justifyContent: 'center'
                    }}>
                        <div style={{
                            background: 'rgba(128, 128, 128, 0.1)',
                            border: '1px solid rgba(128, 128, 128, 0.2)',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            color: 'var(--color-text)',
                            fontSize: '0.75rem',
                            fontWeight: '600'
                        }}>
                            Halvtid
                        </div>
                    </div>
                </div>
            );
        }

        const isHome = event.side === 'home';
        const suffix = event.type === 'own-goal' ? ' (sm)' : event.type === 'penalty-goal' ? ' (s)' : '';
        const playerKey = typeof event.player === 'object' ? `${event.player.in}-${event.player.out}` : event.player;

        return (
            <div key={`${playerKey}-${event.minuteStr}-${event.type}`} style={{ display: 'flex', width: '100%', marginBottom: '8px', position: 'relative' }}>
                {/* Home side */}
                <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', paddingRight: '12px', textAlign: 'right' }}>
                    {isHome && (
                        <>
                            {event.type === 'substitution' && typeof event.player === 'object' ? (
                                <>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--color-text)', whiteSpace: 'nowrap' }}>{getLastName(event.player.in)}</span>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--color-text)', whiteSpace: 'nowrap' }}>{getLastName(event.player.out)}</span>
                                    </div>
                                    <div style={{ marginLeft: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '16px', gap: '2px' }}>
                                        <span style={{ color: '#34c759', fontSize: '0.75rem', lineHeight: 1 }}>▲</span>
                                        <span style={{ color: '#ff3b30', fontSize: '0.75rem', lineHeight: 1 }}>▼</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text)', whiteSpace: 'nowrap' }}>
                                        {event.type === 'substitution' ? event.player : getLastName(event.player)}{suffix}
                                    </span>
                                    {event.type !== 'substitution' && (
                                        <div style={{ marginLeft: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '16px' }}>{renderEventIcon(event.type)}</div>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </div>

                {/* Center line + minute */}
                <div style={{ width: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    {/* The continuous line */}
                    <div style={{ position: 'absolute', top: '-16px', bottom: '-16px', width: '2px', backgroundColor: 'rgba(128,128,128,0.2)', zIndex: 0 }} />
                    
                    {/* The minute bubble */}
                    <div style={{ 
                        width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--color-card-bg)', border: '2px solid rgba(128,128,128,0.2)', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 'bold', color: 'var(--color-text-muted)', zIndex: 1
                    }}>
                        {event.minuteStr}
                    </div>
                </div>

                {/* Away side */}
                <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start', alignItems: 'center', paddingLeft: '12px', textAlign: 'left' }}>
                    {!isHome && (
                        <>
                            {event.type === 'substitution' && typeof event.player === 'object' ? (
                                <>
                                    <div style={{ marginRight: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '16px', gap: '2px' }}>
                                        <span style={{ color: '#34c759', fontSize: '0.75rem', lineHeight: 1 }}>▲</span>
                                        <span style={{ color: '#ff3b30', fontSize: '0.75rem', lineHeight: 1 }}>▼</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--color-text)', whiteSpace: 'nowrap' }}>{getLastName(event.player.in)}</span>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--color-text)', whiteSpace: 'nowrap' }}>{getLastName(event.player.out)}</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {event.type !== 'substitution' && (
                                        <div style={{ marginRight: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '16px' }}>{renderEventIcon(event.type)}</div>
                                    )}
                                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text)', whiteSpace: 'nowrap' }}>
                                        {event.type === 'substitution' ? event.player : getLastName(event.player)}{suffix}
                                    </span>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div style={{ marginTop: '0px', padding: '0 12px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {allEvents.map(e => renderTimelineEvent(e))}
        </div>
    );
};

export default MatchEvents;
