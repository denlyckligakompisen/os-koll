
import React from 'react';
import EventItem from './EventItem';
import { formatDayHeading } from '../../utils/dateUtils';

const DayGroup = ({ day, events, svtEvents }) => {
    return (
        <div key={day}>
            <div style={{
                padding: '1rem',
                backgroundColor: 'var(--color-bg-alt)',
                borderBottom: '1px solid var(--color-border)',
                color: 'var(--color-text-highlight)'
            }}>
                <h2 style={{
                    margin: 0,
                    fontSize: '1.5rem',
                    fontWeight: '800',
                    textTransform: 'capitalize'
                }}>
                    {formatDayHeading(day)}
                </h2>
            </div>

            <div className="events-list" style={{ padding: '0.5rem' }}>
                {events.map((event) => (
                    <EventItem
                        key={event.id}
                        event={event}
                        svtEvents={svtEvents}
                    />
                ))}
            </div>
        </div>
    );
};

export default DayGroup;
