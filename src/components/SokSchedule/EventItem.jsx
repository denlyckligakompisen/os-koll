import React from 'react';
import SvtPlayBadge from './SvtPlayBadge';
import { cleanEventDetails, findSvtBroadcast } from '../../utils/eventUtils';

const EventItem = ({ event, svtEvents }) => {
    const svtMatch = findSvtBroadcast(event, svtEvents);
    const details = cleanEventDetails(event.details);

    return (
        <div className="event-card" style={{
            padding: '1rem',
            backgroundColor: 'var(--color-bg-alt)',
            borderRadius: '12px',
            marginBottom: '0.75rem',
            border: '1px solid var(--color-border)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            position: 'relative',
            overflow: 'hidden',
            transition: 'transform 0.2s, background-color 0.2s'
        }}>
            <div style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                flexWrap: 'wrap'
            }}>
                <div style={{
                    backgroundColor: 'rgba(251, 192, 45, 0.1)',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    minWidth: '55px',
                    textAlign: 'center'
                }}>
                    <span style={{
                        fontSize: '1rem',
                        fontWeight: '800',
                        color: '#fbc02d'
                    }}>
                        {event.time}
                    </span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', flex: 1 }}>
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
                        opacity: 0.8
                    }}>
                        {event.event}
                    </span>
                    {svtMatch ? (
                        <SvtPlayBadge link={svtMatch.link} isLive={svtMatch.live} />
                    ) : (
                        <div style={{ display: 'flex', gap: '4px' }}>
                            <a
                                href="https://www.tv4play.se/kategorier/os-2026"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    backgroundColor: '#FF3334', // TV4 Red
                                    color: 'white',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    fontSize: '0.75rem',
                                    fontWeight: '800',
                                    textDecoration: 'none',
                                    transition: 'opacity 0.2s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
                                onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                            >
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                                TV4
                            </a>
                        </div>
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
