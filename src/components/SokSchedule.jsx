
import React, { useMemo } from 'react';

const SokSchedule = ({ events, svtEvents }) => {
    if (!events || events.length === 0) {
        return <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>Inga events hittades från SOK.</div>;
    }

    const formatDayHeader = (dayStr) => {
        try {
            // expected format: "tisdag 17 feb"
            const parts = dayStr.match(/([a-ö]+)\s+(\d+)\s+([a-zA-Z]+)/);
            if (!parts) return dayStr.charAt(0).toUpperCase() + dayStr.slice(1);

            const dayName = parts[1];
            const dayNum = parseInt(parts[2], 10);
            const monthStr = parts[3];

            const monthMap = {
                'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'maj': 4, 'jun': 5,
                'jul': 6, 'aug': 7, 'sep': 8, 'okt': 9, 'nov': 10, 'dec': 11
            };

            // Handle full month names if present
            if (monthStr.length > 3) {
                const fullMonthMap = {
                    'januari': 0, 'februari': 1, 'mars': 2, 'april': 3, 'maj': 4, 'juni': 5,
                    'juli': 6, 'augusti': 7, 'september': 8, 'oktober': 9, 'november': 10, 'december': 11
                };
                if (fullMonthMap[monthStr] !== undefined) monthMap[monthStr] = fullMonthMap[monthStr];
            }

            const monthIndex = monthMap[monthStr];
            if (monthIndex === undefined) return dayStr.charAt(0).toUpperCase() + dayStr.slice(1);

            const now = new Date();
            const currentYear = now.getFullYear(); // 2026?

            const date = new Date(currentYear, monthIndex, dayNum);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            // Reset hours for comparison
            date.setHours(0, 0, 0, 0);

            if (date.getTime() === today.getTime()) {
                return "Idag";
            } else if (date.getTime() === tomorrow.getTime()) {
                return "Imorgon";
            } else {
                // Just capitalize the day name, e.g. "Onsdag"
                // Or keep the full string "Onsdag 18 feb"? 
                // User said "sedan veckodagar", implies simplify to just the day?
                // "Idag", "Imorgon", "Torsdag", "Fredag"...
                // But if there's a gap or for clarity, the date is nice. 
                // I'll capitalize the full string for now to be safe, e.g. "Torsdag 19 feb"
                // actually, let's just use the dayName capitalized.
                return dayName.charAt(0).toUpperCase() + dayName.slice(1);
            }
        } catch (e) {
            return dayStr;
        }
    };

    const parseEventDate = (dayStr, timeStr) => {
        try {
            const parts = dayStr.match(/([a-ö]+)\s+(\d+)\s+([a-zA-Z]+)/);
            if (!parts) return null;

            const dayNum = parseInt(parts[2], 10);
            const monthStr = parts[3];

            const monthMap = {
                'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'maj': 4, 'jun': 5,
                'jul': 6, 'aug': 7, 'sep': 8, 'okt': 9, 'nov': 10, 'dec': 11,
                'januari': 0, 'februari': 1, 'mars': 2, 'april': 3, 'maj': 4, 'juni': 5,
                'juli': 6, 'augusti': 7, 'september': 8, 'oktober': 9, 'november': 10, 'december': 11
            };

            const monthIndex = monthMap[monthStr];
            if (monthIndex === undefined) return null;

            const now = new Date();
            const year = now.getFullYear();
            const date = new Date(year, monthIndex, dayNum);

            if (timeStr) {
                const [hours, minutes] = timeStr.replace('.', ':').split(':').map(Number);
                date.setHours(hours, minutes, 0, 0);
            }
            return date;
        } catch (e) { return null; }
    };

    const getEventStatus = (event) => {
        const start = parseEventDate(event.day, event.time);
        if (!start) return null;

        const now = new Date();
        const diffMs = now - start;
        const diffHours = diffMs / (1000 * 60 * 60); // Hours since start

        // Live: Started 0-3 hours ago (Olympics events can be long)
        if (diffHours >= 0 && diffHours < 3) {
            return { label: 'PÅGÅR', color: '#e63946', animate: true };
        }
        // Soon: Starts in less than 30 mins
        if (diffHours < 0 && diffHours > -0.5) {
            return { label: 'STARTAR SNART', color: '#fca311', animate: false };
        }
        return null;
    };

    const groupedEvents = useMemo(() => {
        const groups = {};
        events.forEach(event => {
            if (!groups[event.day]) {
                groups[event.day] = [];
            }
            groups[event.day].push(event);
        });
        return groups;
    }, [events]);

    const days = Object.keys(groupedEvents);

    return (
        <div className="day-group" style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: '12px', marginBottom: '20px', overflow: 'hidden' }}>
            {days.map(day => (
                <div key={day}>
                    <div style={{
                        padding: '1rem',
                        backgroundColor: 'var(--color-bg-alt)',
                        borderBottom: '1px solid var(--color-border)',
                        color: 'var(--color-text-highlight)'
                    }}>
                        <h2 style={{
                            margin: 0,
                            fontSize: '1.5rem', // Större text
                            fontWeight: '800',
                            textTransform: 'capitalize'
                        }}>
                            {formatDayHeader(day)}
                        </h2>
                        {/* Optional: Show full date underneath if it's Idag/Imorgon/WeekDay */}
                        {/* <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: 'normal' }}>{day}</span> */}
                    </div>

                    <div className="events-list" style={{ padding: '0.5rem' }}>
                        {groupedEvents[day].map((event) => (
                            <div key={event.id} className="event-card" style={{
                                padding: '1rem',
                                backgroundColor: 'var(--color-bg-alt)', // Lighter background for card
                                borderRadius: '8px',
                                marginBottom: '0.75rem',
                                border: '1px solid var(--color-border)',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>{event.time}</span>
                                    <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{event.sport}</span>

                                    {/* SVT Badge */}
                                    {svtEvents && (() => {
                                        const eventDate = parseEventDate(event.day, event.time);
                                        if (eventDate) {
                                            const dateStr = eventDate.toISOString().split('T')[0];
                                            const match = svtEvents.find(svt => {
                                                if (svt.date !== dateStr) return false;
                                                const [h1, m1] = event.time.replace('.', ':').split(':').map(Number);
                                                const [h2, m2] = svt.time.replace('.', ':').split(':').map(Number);
                                                if (Math.abs((h1 * 60 + m1) - (h2 * 60 + m2)) > 20) return false;
                                                const sportLower = event.sport.toLowerCase();
                                                const svtTitleLower = svt.title.toLowerCase();
                                                return svtTitleLower.includes(sportLower) || sportLower.includes(svtTitleLower);
                                            });

                                            if (match) {
                                                return (
                                                    <a href={match.link} target="_blank" rel="noopener noreferrer" style={{
                                                        marginLeft: 'auto',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        textDecoration: 'none',
                                                        backgroundColor: '#000000',
                                                        color: '#ffffff',
                                                        padding: '4px 8px',
                                                        borderRadius: '4px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 'bold',
                                                        border: '1px solid #333'
                                                    }}>
                                                        SVT Play
                                                    </a>
                                                );
                                            }
                                        }
                                        return null;
                                    })()}
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
            ))
            }
        </div >
    );
};

export default SokSchedule;
