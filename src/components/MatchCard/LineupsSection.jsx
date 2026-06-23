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

    const renderSub = (p, isHome) => {
        const events = getPlayerEvents(match, p, isHome);
        return (
            <div key={p.number || p.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', marginBottom: '4px', flexDirection: isHome ? 'row' : 'row-reverse' }}>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', width: '20px', textAlign: 'center', backgroundColor: 'rgba(128,128,128,0.1)', borderRadius: '3px', padding: '1px', flexShrink: 0 }}>{p.number}</span>
                <span style={{ color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {formatName(getLastName(p.name))}
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
