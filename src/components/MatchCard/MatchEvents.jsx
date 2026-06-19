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

    if (allEvents.length === 0) return null;

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

    const renderTimelineEvent = (event) => {
        const isHome = event.side === 'home';
        const suffix = event.type === 'own-goal' ? ' (sm)' : event.type === 'penalty-goal' ? ' (s)' : '';

        return (
            <div key={`${event.player}-${event.minuteStr}-${event.type}`} style={{ display: 'flex', width: '100%', marginBottom: '8px', position: 'relative' }}>
                {/* Home side */}
                <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', paddingRight: '12px', textAlign: 'right' }}>
                    {isHome && (
                        <>
                            <span style={{ fontSize: '0.85rem', color: 'var(--color-text)', whiteSpace: 'nowrap' }}>{getLastName(event.player)}{suffix}</span>
                            <div style={{ marginLeft: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '16px' }}>{renderEventIcon(event.type)}</div>
                        </>
                    )}
                </div>

                {/* Center line + minute */}
                <div style={{ width: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                    {/* The continuous line */}
                    <div style={{ position: 'absolute', top: '-16px', bottom: '-16px', width: '2px', backgroundColor: 'rgba(128,128,128,0.2)', zIndex: 0 }} />
                    
                    {/* The minute bubble */}
                    <div style={{ 
                        width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--color-card-bg)', border: '2px solid rgba(128,128,128,0.2)', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 'bold', color: 'var(--color-text-muted)', zIndex: 1, marginTop: '2px'
                    }}>
                        {event.minuteStr}
                    </div>
                </div>

                {/* Away side */}
                <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start', alignItems: 'center', paddingLeft: '12px', textAlign: 'left' }}>
                    {!isHome && (
                        <>
                            <div style={{ marginRight: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '16px' }}>{renderEventIcon(event.type)}</div>
                            <span style={{ fontSize: '0.85rem', color: 'var(--color-text)', whiteSpace: 'nowrap' }}>{getLastName(event.player)}{suffix}</span>
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
