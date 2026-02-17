import React from 'react';
import SvtPlayBadge from './SvtPlayBadge';
import { cleanEventDetails, findSvtBroadcast } from '../../utils/eventUtils';

const EventItem = ({ event, svtEvents }) => {
    const svtMatch = findSvtBroadcast(event, svtEvents);
    const details = cleanEventDetails(event.details);

    const watchLink = svtMatch ? svtMatch.link : "https://www.tv4play.se/kategorier/os-2026";

    return (
        <a
            href={watchLink}
            target="_blank"
            rel="noopener noreferrer"
            className="event-card"
            style={{
                display: 'block',
                textDecoration: 'none',
                color: 'inherit',
                padding: '1.25rem',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '16px',
                marginBottom: '1rem',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
            }}
            onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.transform = 'translateY(0)';
            }}
        >
            <div style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                flexWrap: 'wrap'
            }}>
                <div style={{
                    backgroundColor: 'rgba(251, 192, 45, 0.15)',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    minWidth: '60px',
                    textAlign: 'center',
                    border: '1px solid rgba(251, 192, 45, 0.2)'
                }}>
                    <span style={{
                        fontSize: '1rem',
                        fontWeight: '900',
                        color: '#fbc02d',
                        letterSpacing: '0.02em'
                    }}>
                        {event.time}
                    </span>
                </div>

                {svtMatch ? (
                    <SvtPlayBadge link={svtMatch.link} isLive={svtMatch.live} />
                ) : (
                    <div style={{ display: 'flex', gap: '4px' }}>
                        <div
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                backgroundColor: '#FF3334',
                                color: 'white',
                                padding: '3px 10px',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: '900'
                            }}
                        >
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                            TV4
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', flex: 1 }}>
                    <span style={{
                        fontSize: '1.2rem',
                        fontWeight: '800',
                        color: '#ffffff',
                        letterSpacing: '-0.01em'
                    }}>
                        {event.sport}
                    </span>
                    <span style={{
                        fontSize: '1.05rem',
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontWeight: '500'
                    }}>
                        {event.event}
                    </span>
                </div>
            </div>

            {details && (
                <div style={{
                    marginTop: '12px',
                    paddingTop: '12px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                    <p style={{
                        margin: 0,
                        fontSize: '0.95rem',
                        color: 'rgba(255, 255, 255, 0.55)',
                        lineHeight: '1.5',
                        whiteSpace: 'pre-line'
                    }}>
                        {details}
                    </p>
                </div>
            )}
        </a>
    );
};

export default EventItem;
