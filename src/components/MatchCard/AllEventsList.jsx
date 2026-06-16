import React from 'react';
import { getLastName, cleanTeamName } from './utils.jsx';

const AllEventsList = ({ match }) => {
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
            const isRed = b.card === 'red';
            const bMin = parseMinute(b.minute);

            if (isRed) {
                const exists = events.some(e => e.type === 'red-card' && e.minute === bMin && e.side === b.side);
                if (exists) return;
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

export default AllEventsList;
