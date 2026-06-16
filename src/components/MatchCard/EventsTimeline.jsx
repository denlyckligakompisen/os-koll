import React from 'react';
import FlagBadge from '../common/FlagBadge';
import { getFlagCodes } from '../../utils/flags';
import { getLastName } from './utils';

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

    events.sort((a, b) => a.minute - b.minute);

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

    const homeFlags = match.homeFlags || getFlagCodes(match.home);
    const awayFlags = match.awayFlags || getFlagCodes(match.away);

    return (
        <div style={{ position: 'relative', width: '100%', height: '44px', margin: '4px 0', display: 'flex', alignItems: 'center', paddingLeft: '16px' }}>
            <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 5 }}>
                <div style={{ position: 'absolute', bottom: '6px', left: 0 }} title={match.home}>
                    {homeFlags?.length > 0 && <FlagBadge codes={homeFlags} name={match.home} size={14} />}
                </div>
                <div style={{ position: 'absolute', top: '6px', left: 0 }} title={match.away}>
                    {awayFlags?.length > 0 && <FlagBadge codes={awayFlags} name={match.away} size={14} />}
                </div>
            </div>

            <div style={{ position: 'absolute', top: '50%', left: '24px', right: 'calc(50% + 3px)', height: '4px', background: `linear-gradient(to right, #3b82f6 ${Math.min((progress || 0) * 2, 100)}%, rgba(128,128,128,0.15) ${Math.min((progress || 0) * 2, 100)}%)`, transform: 'translateY(-50%)', borderRadius: '4px' }} />

            <div style={{ position: 'absolute', top: '50%', left: 'calc(50% + 3px)', right: '2%', height: '4px', background: `linear-gradient(to right, var(--color-primary) ${Math.max(((progress || 0) - 50) * 2, 0)}%, rgba(128,128,128,0.15) ${Math.max(((progress || 0) - 50) * 2, 0)}%)`, transform: 'translateY(-50%)', borderRadius: '4px' }} />

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
                        gap: '4px',
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

export default EventsTimeline;
