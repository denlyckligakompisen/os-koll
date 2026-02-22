
import React, { useMemo } from 'react';

/**
 * Parses a Swedish date string like "Söndag 22 Februari" into a Date object.
 */
const parseEventDate = (dayStr) => {
    if (!dayStr) return null;
    const parts = dayStr.match(/([a-ö]+)\s+(\d+)\s+([a-zA-Z]+)/i);
    if (!parts) return null;

    const dayNum = parseInt(parts[2], 10);
    const monthStr = parts[3].toLowerCase().substring(0, 3);
    const monthMap = {
        'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'maj': 4, 'jun': 5,
        'jul': 6, 'aug': 7, 'sep': 8, 'okt': 9, 'nov': 10, 'dec': 11
    };

    const monthIndex = monthMap[monthStr];
    if (monthIndex === undefined) return null;

    return new Date(new Date().getFullYear(), monthIndex, dayNum);
};

const formatDayHeader = (dayStr) => {
    const date = parseEventDate(dayStr);
    if (!date) return dayStr.charAt(0).toUpperCase() + dayStr.slice(1);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    if (checkDate.getTime() === today.getTime()) return "Idag";
    if (checkDate.getTime() === tomorrow.getTime()) return "Imorgon";

    const dayName = dayStr.split(' ')[0];
    return dayName.charAt(0).toUpperCase() + dayName.slice(1);
};

const formatDetails = (text) => {
    if (!text) return "";
    return text
        .replace(/\s*Ställning.*$/s, '')
        .replace(/(\d+[-–]\d+)\s+([A-ZÅÄÖ])/g, '$1\n$2')
        .replace(/[,]?\s+(\d+\))/g, '\n$1')
        .trim();
};

const SokSchedule = ({ events }) => {
    const groupedEvents = useMemo(() => {
        if (!events?.length) return {};

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return events.reduce((acc, event) => {
            if (event.sport === 'Ceremoni') return acc;

            const eventDate = parseEventDate(event.day);
            if (eventDate) {
                eventDate.setHours(0, 0, 0, 0);
                if (eventDate < today) return acc;
            }

            if (!acc[event.day]) acc[event.day] = [];
            acc[event.day].push(event);
            return acc;
        }, {});
    }, [events]);

    const days = Object.keys(groupedEvents);

    if (days.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>
                Inga kommande tävlingar hittades.
            </div>
        );
    }

    return (
        <div style={{ padding: '0 16px', maxWidth: '600px', margin: '0 auto' }}>
            {days.map(day => (
                <div key={day} style={{ marginBottom: '24px' }}>
                    <div style={{
                        padding: '12px 16px',
                        backgroundColor: 'var(--color-card-bg)',
                        borderBottom: '1px solid var(--color-border-subtle)',
                        borderTopLeftRadius: '12px',
                        borderTopRightRadius: '12px',
                        color: 'var(--color-text-highlight)'
                    }}>
                        <h2 style={{
                            margin: 0,
                            fontSize: '1.2rem',
                            fontWeight: '800',
                            letterSpacing: '-0.02em'
                        }}>
                            {formatDayHeader(day)}
                        </h2>
                    </div>

                    <div style={{
                        backgroundColor: 'var(--color-card-bg)',
                        borderBottomLeftRadius: '12px',
                        borderBottomRightRadius: '12px',
                        overflow: 'hidden',
                        padding: '8px'
                    }}>
                        {groupedEvents[day].map((event) => (
                            <div key={event.id} style={{
                                padding: '12px',
                                borderRadius: '8px',
                                marginBottom: '4px',
                                backgroundColor: 'rgba(255,255,255,0.02)',
                                border: '1px solid transparent',
                                transition: 'all 0.2s ease'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    gap: '12px',
                                    alignItems: 'baseline'
                                }}>
                                    <span style={{
                                        fontSize: '1rem',
                                        fontWeight: '800',
                                        color: '#fbc02d',
                                        minWidth: '50px',
                                        fontVariantNumeric: 'tabular-nums'
                                    }}>
                                        {event.time}
                                    </span>

                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 8px', alignItems: 'center' }}>
                                        <span style={{
                                            fontSize: '1rem',
                                            fontWeight: '700',
                                            color: 'var(--color-text-highlight)'
                                        }}>
                                            {event.sport}
                                        </span>
                                        <span style={{
                                            fontSize: '0.95rem',
                                            color: 'var(--color-text-primary)'
                                        }}>
                                            {event.event}
                                        </span>
                                    </div>
                                </div>

                                {event.details && (
                                    <div style={{
                                        marginTop: '6px',
                                        paddingLeft: '62px',
                                        fontSize: '0.85rem',
                                        color: 'var(--color-text-muted)',
                                        lineHeight: '1.4',
                                        whiteSpace: 'pre-line'
                                    }}>
                                        {formatDetails(event.details)}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SokSchedule;
