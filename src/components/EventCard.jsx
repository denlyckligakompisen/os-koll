import React from 'react';
import { Calendar, Monitor, Award, Tv, ExternalLink } from 'lucide-react';
import ChannelLogo from './ChannelLogo';

const EventCard = ({ event }) => {


    const isLive = () => {
        const eventDate = new Date(`${event.date}T${event.time}`);
        const now = new Date();
        const diff = now - eventDate;
        // If started in the past but less than 3 hours ago
        return diff >= 0 && diff < 3 * 60 * 60 * 1000;
    };

    return (
        <a
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`event-card glass-panel animate-fade-in ${isLive() ? 'live-event' : ''}`}
            style={{
                borderRadius: 'var(--radius)',
                padding: '20px',
                marginBottom: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                borderLeft: isLive() ? '4px solid #ef4444' : (event.isMedal ? '4px solid #fca311' : '1px solid rgba(255,255,255,0.08)'),
                position: 'relative',
                transition: 'transform 0.2s, box-shadow 0.2s',
                textDecoration: 'none', // Remove link underline
                color: 'inherit', // Inherit text color
                cursor: 'pointer',
                animation: isLive() ? 'pulse-border 2s infinite' : 'fadeIn 0.4s ease-out forwards'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 40px 0 rgba(0, 0, 0, 0.45)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow)';
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: isLive() ? '#ef4444' : 'var(--color-text-muted)', fontSize: '0.9rem', fontWeight: '500' }}>
                    {isLive() ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ position: 'relative', display: 'flex', height: '8px', width: '8px' }}>
                                <span style={{ animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite', position: 'absolute', display: 'inline-flex', height: '100%', width: '100%', borderRadius: '50%', backgroundColor: '#ef4444', opacity: 0.75 }}></span>
                                <span style={{ position: 'relative', display: 'inline-flex', borderRadius: '50%', height: '8px', width: '8px', backgroundColor: '#ef4444' }}></span>
                            </span>
                            <span style={{ fontWeight: 'bold' }}>LIVE</span>
                        </div>
                    ) : (
                        <>
                            <Calendar size={14} />
                            <span>{event.time}</span>
                        </>
                    )}
                </div>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    // transparency for background to let logo shine, or just subtle
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    padding: '4px 8px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    {event.channel.split('/').map((channelName, index) => (
                        <React.Fragment key={channelName}>
                            {index > 0 && <span style={{ opacity: 0.5, fontSize: '0.8rem' }}>/</span>}
                            <ChannelLogo channel={channelName.trim()} />
                        </React.Fragment>
                    ))}
                </div>
            </div>

            <div style={{ fontSize: '1.2rem', fontWeight: '700', letterSpacing: '-0.02em', marginTop: '4px' }}>
                {event.sport}
            </div>

            <div style={{ fontSize: '1rem', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>
                {event.event}
            </div>

            {event.isMedal && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fca311', fontSize: '0.8rem', marginTop: '4px' }}>
                    <Award size={14} />
                    <span>Medaljchans</span>
                </div>
            )}
        </a>
    );
};

export default EventCard;
