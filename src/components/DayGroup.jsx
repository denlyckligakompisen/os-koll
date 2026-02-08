import React from 'react';
import EventCard from './EventCard';

const DayGroup = ({ date, events }) => {
    const formatDate = (dateStr) => {
        const options = { weekday: 'long', day: 'numeric', month: 'long' };
        const d = new Date(dateStr);
        const formatted = d.toLocaleDateString('sv-SE', options);
        return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    };

    return (
        <div className="day-group" style={{ marginBottom: '32px' }}>
            <div style={{
                position: 'sticky',
                top: '10px',
                zIndex: 10,
                margin: '0 0 16px 0',
            }}>
                <h2 style={{
                    display: 'inline-block',
                    backgroundColor: 'rgba(15, 23, 42, 0.8)', // Semi-transparent based on bg
                    backdropFilter: 'blur(8px)',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    fontSize: '1rem',
                    fontWeight: '600',
                    textTransform: 'capitalize',
                    margin: 0,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                    {formatDate(date)}
                </h2>
            </div>
            <div className="events-list">
                {events.map(event => (
                    <EventCard key={event.id} event={event} />
                ))}
            </div>
        </div>
    );
};

export default DayGroup;
