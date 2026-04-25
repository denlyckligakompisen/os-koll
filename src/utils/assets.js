
/**
 * Shared logo mapping for competitions and special logos
 */
export const getTeamLogo = (name) => {
    if (!name) return null;

    // Mapping for competition logos
    const specialLogos = {
        'Champions League': 'https://upload.wikimedia.org/wikipedia/commons/f/f3/Logo_UEFA_Champions_League.png',
        'Conference League': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTNrFv0oLweCA6oSLIWMaA5_aQIufqZgVprsA&s',
        'Europa League': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/UEFA_Europa_League_logo_%282024_version%29.svg/1920px-UEFA_Europa_League_logo_%282024_version%29.svg.png',
        'FIFA World Cup': 'https://upload.wikimedia.org/wikipedia/en/1/17/2026_FIFA_World_Cup_emblem.svg'
    };

    return specialLogos[name] || null;
};

/**
 * Get broadcaster logos (TV4, SVT)
 */
export const getBroadcasterLogo = (name) => {
    if (!name) return null;
    const n = name.toUpperCase();
    
    if (n.includes('TV4')) {
        return '/assets/tv4_logo.png';
    }
    if (n.includes('SVT')) {
        return 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/SVT_Play_logo_2021.svg/512px-SVT_Play_logo_2021.svg.png';
    }
    return null;
};
