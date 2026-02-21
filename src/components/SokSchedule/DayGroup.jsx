
import React from 'react';
import EventItem from './EventItem';
import { formatDayHeading } from '../../utils/dateUtils';

const DayGroup = ({ day, events, svtEvents }) => {
    return (
        <div key={day}>


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
