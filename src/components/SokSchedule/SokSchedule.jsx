
import React, { useMemo } from 'react';
import DayGroup from './DayGroup';
import { parseSwedishDate } from '../../utils/dateUtils';

const SokSchedule = ({ events, svtEvents = [] }) => {
    const groupedEvents = useMemo(() => {
        if (!events) return {};

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const groups = {};
        events.forEach(event => {
            const eventDate = parseSwedishDate(event.day);
            if (eventDate) {
                eventDate.setHours(0, 0, 0, 0);
                if (eventDate < today) return; // Skip past events
            }

            if (!groups[event.day]) {
                groups[event.day] = [];
            }
            groups[event.day].push(event);
        });
        return groups;
    }, [events]);

    const days = Object.keys(groupedEvents);

    if (days.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                Inga kommande events hittades.
            </div>
        );
    }

    return (
        <div className="day-group" style={{
            backgroundColor: 'var(--color-bg-card)',
            borderRadius: '12px',
            marginBottom: '20px',
            overflow: 'hidden'
        }}>
            {days.map(day => (
                <DayGroup
                    key={day}
                    day={day}
                    events={groupedEvents[day]}
                    svtEvents={svtEvents}
                />
            ))}
        </div>
    );
};

export default SokSchedule;
