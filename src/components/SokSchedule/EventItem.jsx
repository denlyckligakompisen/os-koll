
import React from 'react';
import SvtPlayBadge from './SvtPlayBadge';
import { cleanEventDetails, findSvtBroadcast } from '../../utils/eventUtils';

const EventItem = ({ event, svtEvents }) => {
    const svtMatch = findSvtBroadcast(event, svtEvents);
    const details = cleanEventDetails(event.details);

    return (
        <div className="event-card" style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--color-bg-alt)',
            borderRadius: '8px',
            marginBottom: '0.5rem',
            border: '1px solid var(--color-border)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'baseline',
                flexWrap: 'wrap'
            }}>
                <span style={{
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    color: '#fbc02d',
                    minWidth: '50px'
                }}>
                    {event.time}
                </span>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                    <span style={{
                        fontSize: '1.1rem',
                        fontWeight: '700',
                        color: 'var(--color-text-highlight)'
                    }}>
                        {event.sport}
                    </span>
                    <span style={{
                        fontSize: '1rem',
                        color: 'var(--color-text-primary)',
                        opacity: 0.9
                    }}>
                        {event.event}
                    </span>
                    {svtMatch && (
                        <SvtPlayBadge link={svtMatch.link} isLive={svtMatch.live} />
                    )}
                </div>
            </div>

            {details && (
                <div style={{ marginTop: '8px' }}>
                    <p style={{
                        margin: 0,
                        fontSize: '0.9rem',
                        color: 'var(--color-text-muted)',
                        lineHeight: '1.4',
                        whiteSpace: 'pre-line'
                    }}>
                        {details}
                    </p>
                </div>
            )}
        </div>
    );
};

export default EventItem;
