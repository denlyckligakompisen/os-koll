import React from 'react';
import SvtPlayBadge from './SvtPlayBadge';
import { cleanEventDetails, findSvtBroadcast, getEventStatus } from '../../utils/eventUtils';

const EventItem = ({ event, svtEvents, now = new Date() }) => {
    const svtMatch = findSvtBroadcast(event, svtEvents);
    const details = cleanEventDetails(event.details, event.sport);
    const { isLive } = getEventStatus(event, svtMatch, now);

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
                padding: '16px',
                paddingLeft: isLive ? '36px' : '16px',
                backgroundColor: 'var(--color-card-bg)',
                backdropFilter: 'saturate(180%) blur(20px)',
                WebkitBackdropFilter: 'saturate(180%) blur(20px)',
                borderRadius: 'var(--radius-lg)',
                marginBottom: '10px',
                border: 'var(--border)',
                boxShadow: 'var(--shadow-sm)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
            }}
            onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-card-bg)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }}
        >
            {isLive && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: '28px',
                    backgroundColor: '#34c759',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 'var(--radius-lg) 0 0 var(--radius-lg)'
                }} className="live-strip">
                    <span style={{
                        color: 'white',
                        fontSize: '0.6rem',
                        fontWeight: '900',
                        letterSpacing: '0.12em',
                        writingMode: 'vertical-rl',
                        textOrientation: 'mixed',
                        transform: 'rotate(180deg)',
                        textTransform: 'uppercase',
                        userSelect: 'none'
                    }}>LIVE</span>
                </div>
            )}
            <div style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1, minWidth: 0 }}>
                    <div style={{
                        backgroundColor: 'rgba(0, 122, 255, 0.1)',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        minWidth: '48px',
                        textAlign: 'center',
                        flexShrink: 0
                    }}>
                        <span style={{
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            color: 'var(--color-primary)',
                        }}>
                            {event.time}
                        </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                        <span style={{
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            color: 'var(--color-text)',
                            letterSpacing: '-0.02em',
                            lineHeight: '1.2'
                        }}>
                            {event.sport}
                        </span>
                        <span style={{
                            fontSize: '0.9rem',
                            color: 'var(--color-text-muted)',
                            fontWeight: '400',
                            marginTop: '1px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>
                            {event.title || event.event}
                        </span>
                    </div>
                </div>

                <div style={{ flexShrink: 0, marginRight: '8px' }}>
                    <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '3px 10px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        backgroundColor: svtMatch ? 'rgba(52, 199, 89, 0.15)' : 'rgba(220, 38, 38, 0.12)',
                        color: svtMatch ? '#34c759' : '#dc2626',
                        whiteSpace: 'nowrap'
                    }}>
                        {svtMatch ? 'SVT' : 'TV4'} →
                    </span>
                </div>
            </div>

            {details && (
                <div style={{
                    marginTop: '10px',
                    paddingTop: '10px',
                    borderTop: 'var(--border)'
                }}>
                    <p style={{
                        margin: 0,
                        fontSize: '0.85rem',
                        color: 'var(--color-text-muted)',
                        lineHeight: '1.4',
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
