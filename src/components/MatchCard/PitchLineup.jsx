import React from 'react';
import { getLastName, getPlayerEvents } from './utils.jsx';

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
                                width={32}
                                height={32}
                                loading="lazy"
                                decoding="async"
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
                        <div style={{ position: 'absolute', top: '-4px', right: '-8px', zIndex: 2, backgroundColor: 'white', color: '#000', borderRadius: '3px', fontSize: '0.8rem', padding: '1px 3px', fontWeight: 'bold', border: '1px solid rgba(0,0,0,0.2)' }}>C</div>
                    )}
                </div>

                <div style={{
                    fontSize: '0.85rem', color: 'white', marginTop: '4px',
                    textAlign: 'center', maxWidth: '90px',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    fontWeight: '600', zIndex: 2, letterSpacing: '-0.02em',
                    textShadow: '0 1px 3px rgba(0,0,0,0.8), 0 0 2px rgba(0,0,0,0.5)'
                }}>
                    {p.number ? `${p.number} ` : ''}{getLastName(p.name)}
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

export default PitchLineup;
