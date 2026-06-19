import React from 'react';
import PitchLineup from './PitchLineup';
import { getPlayerEvents } from './utils.jsx';
import { getLastName } from './utils.jsx';

const LineupsSection = ({ match }) => {
    if (!match.startingXI?.home?.length && !match.startingXI?.away?.length) return null;

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
                            <div style={{ marginLeft: '6px', display: 'flex', alignItems: 'center' }}>{renderEventIcon(event.type)}</div>
                        </>
                    )}
                </div>

                {/* Center line + minute */}
                <div style={{ width: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                    {/* The continuous line */}
                    <div style={{ position: 'absolute', top: 0, bottom: '-8px', width: '2px', backgroundColor: 'rgba(128,128,128,0.2)', zIndex: 0 }} />
                    
                    {/* The minute bubble */}
                    <div style={{ 
                        width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--color-card-bg)', border: '2px solid rgba(128,128,128,0.2)', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 'bold', color: 'var(--color-text-muted)', zIndex: 1, marginTop: '2px'
                    }}>
                        {event.minuteStr}'
                    </div>
                </div>

                {/* Away side */}
                <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start', alignItems: 'center', paddingLeft: '12px', textAlign: 'left' }}>
                    {!isHome && (
                        <>
                            <div style={{ marginRight: '6px', display: 'flex', alignItems: 'center' }}>{renderEventIcon(event.type)}</div>
                            <span style={{ fontSize: '0.85rem', color: 'var(--color-text)', whiteSpace: 'nowrap' }}>{getLastName(event.player)}{suffix}</span>
                        </>
                    )}
                </div>
            </div>
        );
    };

    const renderHalf = (title, events) => {
        if (events.length === 0) return null;
        return (
            <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', backgroundColor: 'var(--color-surface-subtle)', padding: '2px 8px', borderRadius: '10px', zIndex: 2 }}>
                    {title}
                </div>
                {events.map(e => renderTimelineEvent(e))}
            </div>
        );
    };

    const renderSub = (p, isHome) => {
        const events = getPlayerEvents(match, p, isHome);
        return (
            <div key={p.number || p.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', marginBottom: '4px', flexDirection: isHome ? 'row' : 'row-reverse' }}>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', width: '20px', textAlign: 'center', backgroundColor: 'rgba(128,128,128,0.1)', borderRadius: '3px', padding: '1px', flexShrink: 0 }}>{p.number}</span>
                <span style={{ color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {formatName(p.name)}
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
        <div style={{ marginTop: '12px' }}>
            {allEvents.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                    {renderHalf('Förlängning', extraTime)}
                    {renderHalf('Andra halvlek', secondHalf)}
                    {renderHalf('Första halvlek', firstHalf)}
                </div>
            )}

            <PitchLineup match={match} />

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginTop: '16px' }}>
                {/* Home Subs */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    {match.subs?.home?.length > 0 && (
                        <div>

                            {match.subs.home.map(p => renderSub(p, true))}
                        </div>
                    )}
                </div>

                <div style={{ width: '1px', backgroundColor: 'rgba(128,128,128,0.1)' }} />

                {/* Away Subs */}
                <div style={{ flex: 1, minWidth: 0, textAlign: 'right' }}>
                    {match.subs?.away?.length > 0 && (
                        <div>

                            {match.subs.away.map(p => renderSub(p, false))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LineupsSection;
