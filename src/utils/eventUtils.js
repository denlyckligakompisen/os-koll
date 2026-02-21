
import { parseSwedishDate, normalizeTime } from './dateUtils';

/**
 * Clean up SOK event details by removing standings and adding line breaks.
 */
/**
 * Clean up SOK event details by removing standings and adding line breaks.
 * Also filters for specific sports to show only Swedish results/relevant info.
 */
export const cleanEventDetails = (text, sport) => {
    if (!text) return "";

    let cleaned = text
        .replace(/\s*Ställning.*$/s, '') // Remove standings
        .replace(/(\d+[-–]\d+)\s+([A-ZÅÄÖ])/g, '$1\n$2') // Break after score
        .replace(/[,]?\s+(\d+\))/g, '\n$1') // Break before numbered items
        .trim();

    // Specific filtering for mass-start/individual sports with many results
    const filterSports = ['Längdskidor', 'Alpint', 'Skidskytte'];
    if (sport && filterSports.some(s => sport.includes(s))) {
        // Split into lines/segments
        const lines = cleaned.split('\n');

        const foreignCountries = [
            'Norge', 'Finland', 'USA', 'Tyskland', 'Italien', 'Frankrike',
            'Schweiz', 'Österrike', 'Kanada', 'Kina', 'Japan', 'Sydkorea',
            'Slovenien', 'Tjeckien', 'Polen', 'Estland', 'Lettland', 'Storbritannien',
            'Brasilien'
        ];

        const filtered = lines.filter(line => {
            // Always keep lines with explicit Swedish markers
            if (line.includes('Sv.plac') || line.includes('Övr.sv.plac') || line.includes('Sverige')) return true;

            // Filter out lines containing foreign countries
            if (foreignCountries.some(c => line.includes(c))) return false;

            // Keep header-like lines or results without country (likely Swede or just name)
            return true;
        });

        cleaned = filtered.join('\n');
    }

    return cleaned;
};

/**
 * Finds a matching SVT broadcast for a given SOK event.
 */
export const findSvtBroadcast = (event, svtEvents) => {
    if (!svtEvents || svtEvents.length === 0) return null;

    const date = parseSwedishDate(event.day);
    if (!date) return null;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const sokTime = normalizeTime(event.time);
    const dayEvents = svtEvents.filter(e => e.date === dateStr);

    // 1. Try exact time match
    let match = dayEvents.find(e => e.time === sokTime);
    if (match) return match;

    // 2. Try keyword match within +/- 60 minutes
    const sportLower = event.sport.toLowerCase();
    match = dayEvents.find(e => {
        const titleLower = e.title.toLowerCase();
        const subtitleLower = e.subtitle?.toLowerCase() || '';
        const isSportMatch = titleLower.includes(sportLower) || subtitleLower.includes(sportLower);
        if (!isSportMatch) return false;

        if (e.time === 'LIVE') return true;

        const [sokH, sokM] = sokTime.split(':').map(Number);
        const [svtH, svtM] = e.time.split(':').map(Number);
        const diff = Math.abs((sokH * 60 + sokM) - (svtH * 60 + svtM));

        return diff <= 60;
    });

    return match;
};
