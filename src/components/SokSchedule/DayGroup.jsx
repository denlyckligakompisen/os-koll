
import React from 'react';
import EventItem from './EventItem';
import { formatDayHeading } from '../../utils/dateUtils';

const DayGroup = ({ day, events, svtEvents, now }) => {
    return (
        <div key={day} style={{ marginBottom: '32px' }}>
            <div style={{
                marginBottom: '12px',
                marginTop: '8px'
            }}>
                <h2 style={{
                    margin: 0,
                    fontSize: '1.2rem',
                    fontWeight: '800',
                    color: 'var(--color-text)',
                    letterSpacing: '-0.02em'
                }}>
                    {formatDayHeading(day)}
                </h2>
            </div>
            <div className="events-list">
                {events.map((event) => (
                    <EventItem
                        key={event.id}
                        event={event}
                        svtEvents={svtEvents}
                        now={now}
                    />
                ))}
            </div>
        </div>
    );
};

export default DayGroup;
