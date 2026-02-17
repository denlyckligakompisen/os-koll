
export const MONTH_MAP = {
    'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'maj': 4, 'jun': 5,
    'jul': 6, 'aug': 7, 'sep': 8, 'okt': 9, 'nov': 10, 'dec': 11,
    'januari': 0, 'februari': 1, 'mars': 2, 'april': 3, 'juni': 5,
    'juli': 6, 'augusti': 7, 'september': 8, 'oktober': 9, 'november': 10, 'december': 11
};

/**
 * Parses a Swedish date string like "tisdag 18 feb" into a Date object.
 */
export const parseSwedishDate = (dayStr) => {
    try {
        const parts = dayStr.match(/([a-ö]+)\s+(\d+)\s+([a-zA-Z]+)/);
        if (!parts) return null;

        const dayNum = parseInt(parts[2], 10);
        const monthStr = parts[3].toLowerCase();

        // Find month index from map
        let monthIndex = MONTH_MAP[monthStr];
        if (monthIndex === undefined && monthStr.length > 3) {
            monthIndex = MONTH_MAP[monthStr.substring(0, 3)];
        }

        if (monthIndex === undefined) return null;

        return new Date(new Date().getFullYear(), monthIndex, dayNum);
    } catch (e) {
        return null;
    }
};

/**
 * Formats a date heading into "Idag", "Imorgon", or the capitalized weekday.
 */
export const formatDayHeading = (dayStr) => {
    const date = parseSwedishDate(dayStr);
    if (!date) return dayStr.charAt(0).toUpperCase() + dayStr.slice(1);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);

    if (compareDate.getTime() === today.getTime()) return "Idag";
    if (compareDate.getTime() === tomorrow.getTime()) return "Imorgon";

    const weekday = dayStr.split(' ')[0];
    return weekday.charAt(0).toUpperCase() + weekday.slice(1);
};

/**
 * Normalizes time format from "09.45" to "09:45"
 */
export const normalizeTime = (time) => time.replace('.', ':');
