import React from 'react';
import EventCard from './EventCard';

const DayGroup = ({ date, events }) => {
    const formatDate = (dateStr) => {
        const options = { weekday: 'long', day: 'numeric', month: 'long' };
        const d = new Date(dateStr);
        // Capitalize first letter
        const formatted = d.toLocaleDateString('sv-SE', options);
        return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    };

    return (
        <div className="day-group" style={{ marginBottom: '24px' }}>
            <h2 style={{
                position: 'sticky',
                top: '0',
                backgroundColor: 'var(--color-bg)',
                padding: '12px 0',
                borderBottom: '1px solid var(--color-card-bg)',
                zIndex: 10,
                margin: '0 0 16px 0',
                fontSize: '1.2rem',
                textTransform: 'capitalize'
            }}>
                {formatDate(date)}
            </h2>
            <div className="events-list">
                {events.map(event => (
                    <EventCard key={event.id} event={event} />
                ))}
            </div>
        </div>
    );
};

export default DayGroup;
