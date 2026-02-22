
import React, { useState, useMemo, useEffect } from 'react';
import DayGroup from './DayGroup';
import { parseSwedishDate } from '../../utils/dateUtils';
import { getEventStatus, findSvtBroadcast } from '../../utils/eventUtils';

const SokSchedule = ({ events, svtEvents = [] }) => {
    const [now, setNow] = useState(new Date());

    // Update current time every minute
    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // Group and sort events
    const { days, groupedEvents } = useMemo(() => {
        if (!events) return { days: [], groupedEvents: {} };

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const groups = {};
        events.forEach(event => {
            const eventDate = parseSwedishDate(event.day);
            if (eventDate) {
                eventDate.setHours(0, 0, 0, 0);
                if (eventDate < today) return;
            }

            // Check if event is finished
            const svtMatch = findSvtBroadcast(event, svtEvents);
            const status = getEventStatus(event, svtMatch, now);

            if (status.isFinished) return;

            if (!groups[event.day]) {
                groups[event.day] = [];
            }
            groups[event.day].push(event);
        });

        const sortedDays = Object.keys(groups).sort((a, b) => {
            const da = parseSwedishDate(a);
            const db = parseSwedishDate(b);
            return da - db;
        });

        return { days: sortedDays, groupedEvents: groups };
    }, [events, now, svtEvents]);


    if (days.length === 0) {
        return null;
    }

    return (
        <div className="schedule-container" style={{ padding: '0 4px' }}>
            <div className="all-days-content">
                {days.map((day) => (
                    <DayGroup
                        key={day}
                        day={day}
                        events={groupedEvents[day]}
                        svtEvents={svtEvents}
                        now={now}
                    />
                ))}
            </div>
        </div>
    );
};

export default SokSchedule;
