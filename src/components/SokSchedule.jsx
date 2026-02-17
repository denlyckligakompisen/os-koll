
import React, { useMemo } from 'react';

const SokSchedule = ({ events }) => {
    if (!events || events.length === 0) {
        return <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>Inga events hittades från SOK.</div>;
    }

    // Helper to normalize time format "HH.MM" (SOK) to "HH:MM" (standard)
    const normalizeTime = (timeStr) => {
        return timeStr.replace('.', ':');
    };

    const groupedEvents = useMemo(() => {
        const groups = {};
        events.forEach(event => {
            // Use the day string directly for grouping, e.g., "tisdag 17 feb"
            if (!groups[event.day]) {
                groups[event.day] = [];
            }
            groups[event.day].push(event);
        });
        return groups;
    }, [events]);

    // Sort days? Since they come in scrape order we might not need to sort by date object if scraped sequentially.
    // But let's rely on scrape order for now as "tisdag 17 feb" is not easily sortable without parsing.
    // Assuming the scraper saves them in chronological order.
    const days = Object.keys(groupedEvents);

    return (
        <div className="day-group" style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: '12px', marginBottom: '20px', overflow: 'hidden' }}>


            {days.map(day => (
                <div key={day}>
                    <div style={{
                        padding: '0.75rem 1rem',
                        backgroundColor: 'var(--color-bg-alt)',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        borderBottom: '1px solid var(--color-border)',
                        color: 'var(--color-text-highlight)'
                    }}>
                        {day}
                    </div>

                    <div className="events-list">
                        {groupedEvents[day].map((event) => (
                            <div key={event.id} className="event-card" style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '0.5rem' }}>
                                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>{event.time}</span>
                                    <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{event.sport}</span>
                                </div>
                                <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem' }}>{event.event}</h3>
                                {event.details && (
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-muted)', whiteSpace: 'pre-line', lineHeight: '1.4' }}>
                                        {event.details}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SokSchedule;
