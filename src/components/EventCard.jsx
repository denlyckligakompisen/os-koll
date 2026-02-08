import React from 'react';
import { Calendar, Monitor, Award, Tv, ExternalLink } from 'lucide-react';

const EventCard = ({ event }) => {
    const isLive = () => {
        // Only a mock function, could connect to real time
        const eventTime = new Date(`${event.date}T${event.time}`);
        const now = new Date(); // In a real app this would be more complex
        // For demo, just check if it's the current hour of a mocked 'now'
        // But since dates are in 2026, we can't really do "Live" properly without faking "now".
        // Let's just return false for now or maybe base it on a prop.
        return false;
    };

    const getChannelColor = (channel) => {
        if (channel.includes('SVT')) return '#65a30d'; // Greenish
        if (channel.includes('TV4')) return '#dc2626'; // Red
        if (channel.includes('Max')) return '#2563eb'; // Blue
        return '#475569'; // Gray
    };

    return (
        <div className="event-card" style={{
            backgroundColor: 'var(--color-card-bg)',
            borderRadius: 'var(--radius)',
            padding: '16px',
            marginBottom: '12px',
            boxShadow: 'var(--shadow)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            borderLeft: event.isMedal ? '4px solid #fca311' : '4px solid transparent',
            position: 'relative'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                    <Calendar size={14} />
                    <span>{event.time}</span>
                </div>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: getChannelColor(event.channel),
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                }}>
                    <Tv size={12} />
                    {event.channel}
                </div>
            </div>

            <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                {event.sport}
            </div>

            <div style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>
                {event.event}
            </div>

            {event.isMedal && (
                <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px', // Adjust if channel badge is there, maybe move medal icon elsewhere
                    // Actually let's put it next to the sport title or just keep the border
                }}>
                    {/* Maybe an icon if needed, but border is good enough for now */}
                </div>
            )}

            {event.isMedal && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fca311', fontSize: '0.8rem', marginTop: '4px' }}>
                    <Award size={14} />
                    <span>Medaljchans</span>
                </div>
            )}
        </div>
    );
};

export default EventCard;
