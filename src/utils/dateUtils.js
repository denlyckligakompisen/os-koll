
/**
 * Shared date formatting for match schedules
 */
export const formatMatchDisplayDate = (dateStr, referenceDate = new Date()) => {
    if (!dateStr) return '';
    const matchDate = new Date(dateStr);

    const d1 = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
    const d2 = new Date(matchDate.getFullYear(), matchDate.getMonth(), matchDate.getDate());

    const diffTime = d2.getTime() - d1.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Ikväll';
    if (diffDays === 1) return 'Imorgon';

    if (diffDays > 1 && diffDays < 8) {
        const weekdays = ['Söndag', 'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag'];
        return weekdays[matchDate.getDay()];
    }

    const months = ['januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli', 'augusti', 'september', 'oktober', 'november', 'december'];
    return `${matchDate.getDate()} ${months[matchDate.getMonth()]}`;
};

export const MONTH_MAP = { 
    'jan': 0, 'januari': 0,
    'feb': 1, 'februari': 1,
    'mar': 2, 'mars': 2,
    'apr': 3, 'april': 3,
    'maj': 4,
    'jun': 5, 'juni': 5,
    'jul': 6, 'juli': 6,
    'aug': 7, 'augusti': 7,
    'sep': 8, 'september': 8,
    'okt': 9, 'oktober': 9,
    'nov': 10, 'november': 10,
    'dec': 11, 'december': 11
};

export const parseTournamentDate = (dateStr, timeStr, monthMap = MONTH_MAP, currentYear = 2026) => {
    if (!dateStr) return new Date();
    const parts = dateStr.split(' ');
    
    // Om vi har "14 apr" -> parts[0]="14", parts[1]="apr"
    const day = parseInt(parts[0]);
    let monthName = parts[1]?.toLowerCase();
    
    // Hantera Allsvenskan-format om "14 apr" ligger på parts[0] och parts[1]? 
    // Wait, let's make it robust: 
    // Om parts[0] är en veckodag som "Måndag", då är datumet i parts[1] och parts[2]
    let dayIdx = 0;
    if (isNaN(day) && parts.length >= 3) {
        dayIdx = 1; 
    }
    
    const parsedDay = parseInt(parts[dayIdx]);
    monthName = parts[dayIdx + 1]?.toLowerCase();
    const year = parseInt(parts[dayIdx + 2]) || currentYear;

    let hour = 0, minute = 0;
    if (timeStr && timeStr.includes(':')) {
        const [h, m] = timeStr.split(':').map(Number);
        hour = h;
        minute = m;
    }

    return new Date(year, monthMap[monthName] ?? 0, parsedDay, hour, minute);
};

export const getRelativeDateLabel = (dateStr, monthMap = MONTH_MAP, currentYear = 2026) => {
    if (!dateStr) return '';
    try {
        const matchDate = parseTournamentDate(dateStr, "12:00", monthMap, currentYear);
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        
        matchDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        tomorrow.setHours(0, 0, 0, 0);
        yesterday.setHours(0, 0, 0, 0);
        
        if (matchDate.getTime() === today.getTime()) return "Ikväll";
        if (matchDate.getTime() === tomorrow.getTime()) return "Imorgon";
        if (matchDate.getTime() === yesterday.getTime()) return "Igår";

        const weekdays = ['Söndag', 'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag'];
        const dayName = weekdays[matchDate.getDay()];
        const cleanedDateStr = dateStr.replace(/^(söndag|måndag|tisdag|onsdag|torsdag|fredag|lördag)\s+/i, '');
        return `${dayName} ${cleanedDateStr}`;
    } catch {
        return dateStr;
    }
};
