
/**
 * Shared logo mapping for Swedish teams and competitions
 */
export const getTeamLogo = (teamName) => {
    if (!teamName) return null;

    // Exact mapping for competitions and special logos
    const specialLogos = {
        'Champions League': 'https://upload.wikimedia.org/wikipedia/commons/f/f3/Logo_UEFA_Champions_League.png',
        'Conference League': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTNrFv0oLweCA6oSLIWMaA5_aQIufqZgVprsA&s',
        'Europa League': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/UEFA_Europa_League_logo_%282024_version%29.svg/1920px-UEFA_Europa_League_logo_%282024_version%29.svg.png',
        'FIFA World Cup': 'https://upload.wikimedia.org/wikipedia/en/1/17/2026_FIFA_World_Cup_emblem.svg'
    };

    if (specialLogos[teamName]) return specialLogos[teamName];

    // Generic slugification for local logos (matches getTeamFileSlug)
    const slug = teamName.toLowerCase()
        .trim()
        .replace(/å/g, 'a')
        .replace(/ä/g, 'a')
        .replace(/ö/g, 'o')
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');

    // Special mappings for specific filenames if they differ from the slug
    const overrides = {
        // No specific team overrides needed for OS-koll/VM-kollen
    };

    if (overrides[slug]) return overrides[slug];

    // Fallback try simple slug
    return `/logos/${slug}.png`;
};
