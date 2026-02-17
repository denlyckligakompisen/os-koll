
import React, { useMemo } from 'react';

const SokSchedule = ({ events }) => {
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

            // Simple month map
            const monthMap = { 'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'maj': 4, 'jun': 5, 'jul': 6, 'aug': 7, 'sep': 8, 'okt': 9, 'nov': 10, 'dec': 11 };
            // Full names fallback
            const fullMonthMap = { 'januari': 0, 'februari': 1, 'mars': 2, 'april': 3, 'maj': 4, 'juni': 5, 'juli': 6, 'augusti': 7, 'september': 8, 'oktober': 9, 'november': 10, 'december': 11 };

            let monthIndex = monthMap[parts[3]];
            if (monthIndex === undefined) monthIndex = fullMonthMap[parts[3]];
            if (monthIndex === undefined) return null;

            const now = new Date();
            const year = now.getFullYear();
            const date = new Date(year, monthIndex, parseInt(parts[2], 10));

            if (timeStr) {
                const [hours, minutes] = timeStr.replace('.', ':').split(':').map(Number);
                date.setHours(hours, minutes, 0, 0);
            }
            return date;
        } catch (e) { return null; }
    };

    const isEventLive = (event) => {
        const start = parseEventDate(event.day, event.time);
        if (!start) return false;
        const now = new Date();
        const diffMs = now - start;
        const diffHours = diffMs / (1000 * 60 * 60);
        // Live if started 0-3 hours ago
        return diffHours >= 0 && diffHours < 3;
    };

    const formatDetails = (text) => {
        if (!text) return "";
        let formatted = text;

        // Remove "Ställning..." and everything after it
        formatted = formatted.replace(/\s*Ställning.*$/s, '');

        // Break after score (e.g. "9-4 Christoffer")
        formatted = formatted.replace(/(\d+[-–]\d+)\s+([A-ZÅÄÖ])/g, '$1\n$2');

        // Break before numbered items like 1), 2), 3)
        formatted = formatted.replace(/[,]?\s+(\d+\))/g, '\n$1');

        return formatted.trim();
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
                            fontSize: '1.5rem',
                            fontWeight: '800',
                            textTransform: 'capitalize'
                        }}>
                            {formatDayHeader(day)}
                        </h2>
                    </div>

                    <div className="events-list" style={{ padding: '0.5rem' }}>
                        {groupedEvents[day].map((event) => {
                            const live = isEventLive(event);
                            return (
                                <div key={event.id} className="event-card" style={{
                                    padding: '0.75rem 1rem',
                                    backgroundColor: 'var(--color-bg-alt)',
                                    borderRadius: '8px',
                                    marginBottom: '0.5rem',
                                    border: '1px solid var(--color-border)',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    {live && (
                                        <div style={{
                                            position: 'absolute',
                                            left: 0,
                                            top: 0,
                                            bottom: 0,
                                            width: '4px',
                                            backgroundColor: '#d32f2f'
                                        }} />
                                    )}

                                    <div style={{
                                        display: 'flex',
                                        gap: '12px',
                                        alignItems: 'baseline',
                                        flexWrap: 'wrap',
                                        paddingLeft: live ? '8px' : '0'
                                    }}>
                                        <span style={{
                                            fontSize: '1.1rem',
                                            fontWeight: 'bold',
                                            color: '#fbc02d',
                                            minWidth: '50px'
                                        }}>
                                            {event.time}
                                        </span>

                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'baseline' }}>
                                            <span style={{
                                                fontSize: '1.1rem',
                                                fontWeight: '700',
                                                color: 'var(--color-text-highlight)'
                                            }}>
                                                {event.sport}
                                            </span>
                                            <span style={{
                                                fontSize: '1rem',
                                                color: 'var(--color-text-primary)',
                                                opacity: 0.9
                                            }}>
                                                {event.event}
                                            </span>
                                        </div>

                                        {live && (
                                            <div style={{
                                                width: '10px',
                                                height: '10px',
                                                borderRadius: '50%',
                                                backgroundColor: '#d32f2f',
                                                marginLeft: '4px'
                                            }} title="PÅGÅR" />
                                        )}
                                    </div>

                                    {event.details && (
                                        <div style={{ marginTop: '8px', paddingLeft: live ? '8px' : '0' }}>
                                            <p style={{
                                                margin: 0,
                                                fontSize: '0.9rem',
                                                color: 'var(--color-text-muted)',
                                                lineHeight: '1.4',
                                                whiteSpace: 'pre-line'
                                            }}>
                                                {formatDetails(event.details)}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SokSchedule;
