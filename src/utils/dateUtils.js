
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

    if (diffDays === 0) return 'Idag';
    if (diffDays === 1) return 'Imorgon';

    if (diffDays > 1 && diffDays < 8) {
        const weekdays = ['Söndag', 'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag'];
        return weekdays[matchDate.getDay()];
    }

    const months = ['januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli', 'augusti', 'september', 'oktober', 'november', 'december'];
    return `${matchDate.getDate()} ${months[matchDate.getMonth()]}`;
};
