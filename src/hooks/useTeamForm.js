import { cleanTeamName, parseMatchDateLocal } from '../components/MatchCard/utils.jsx';

export const useTeamForm = (match, allMatches) => {
    const getTeamForm = (teamName) => {
        if (!allMatches) return [];
        const cleanTeam = cleanTeamName(teamName);
        const teamFinished = allMatches
            .filter(m => m.status === 'finished' && m.score)
            .filter(m => cleanTeamName(m.home) === cleanTeam || cleanTeamName(m.away) === cleanTeam);

        const sorted = [...teamFinished].sort((a, b) => {
            return parseMatchDateLocal(b.date, b.time) - parseMatchDateLocal(a.date, a.time);
        });

        const last5 = sorted.slice(0, 5).reverse();

        return last5.map(m => {
            const parts = m.score.split('-').map(s => parseInt(s.trim()));
            if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                const homeScore = parts[0];
                const awayScore = parts[1];
                const isHome = cleanTeamName(m.home) === cleanTeam;
                if (homeScore === awayScore) return 'O'; // Draw
                if ((isHome && homeScore > awayScore) || (!isHome && awayScore > homeScore)) return 'V'; // Win
                return 'F'; // Loss
            }
            return null;
        }).filter(Boolean);
    };

    const homeForm = getTeamForm(match.home);
    const awayForm = getTeamForm(match.away).reverse();

    return { homeForm, awayForm };
};
