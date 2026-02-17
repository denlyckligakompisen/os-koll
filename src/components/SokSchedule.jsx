
import React from 'react';

const SokSchedule = ({ events }) => {
    if (!events || events.length === 0) {
        return <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>Inga events hittades från SOK idag.</div>;
    }

    return (
        <div className="day-group" style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: '12px', marginBottom: '20px', overflow: 'hidden' }}>
            <h2 style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)', margin: 0, fontSize: '1.2rem' }}>
                Dagens Program (Källa: SOK)
            </h2>
            <div className="events-list">
                {events.map((event) => (
                    <div key={event.id} className="event-card" style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
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
    );
};

export default SokSchedule;
