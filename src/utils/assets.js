
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

    // Local logos are named as slugified team names (lowercase, underscore)
    const slug = teamName.toLowerCase()
        .replace(/ifk göteborg/g, 'ifk_göteborg') // map aliases
        .replace(/helsingborgs if/g, 'helsingborgs_if')
        .replace(/if elfsborg/g, 'elfsborg')
        .replace(/gif sundsvall/g, 'gif_sundsvall')
        .replace(/brommapojkarna/g, 'brommapojkarna')
        .replace(/\s+/g, '_')
        .replace(/ik_sirius/g, 'ik_sirius');

    // Special handling for common names
    if (slug === 'sirius' || slug === 'ik_sirius') return '/logos/ik_sirius.png';
    if (slug === 'elfsborg' || slug === 'if_elfsborg') return '/logos/elfsborg.png';
    if (slug === 'mjällby' || slug === 'mjällby_aif') return '/logos/mjällby.png';
    if (slug === 'häcken' || slug === 'bk_häcken') return '/logos/häcken.png';
    if (slug === 'malmö' || slug === 'malmö_ff') return '/logos/malmö_ff.png';
    if (slug === 'halmstad' || slug === 'halmstads_bk') return '/logos/halmstads_bk.png';
    if (slug === 'göteborg' || slug === 'ifk_göteborg') return '/logos/ifk_göteborg.png';
    if (slug === 'degerfors' || slug === 'degerfors_if') return '/logos/degerfors.png';
    if (slug === 'gais') return '/logos/gais.png';
    if (slug === 'aik') return '/logos/aik.png';
    if (slug === 'djurgården') return '/logos/djurgården.png';
    if (slug === 'hammarby') return '/logos/hammarby.png';
    if (slug === 'västerås_sk' || slug === 'vasteras' || slug === 'vsk') return '/logos/västerås_sk.png';
    if (slug === 'örgryte' || slug === 'ois') return '/logos/örgryte.png';
    if (slug === 'kalmar' || slug === 'kalmar_ff') return '/logos/kalmar_ff.png';
    if (slug === 'helsingborg' || slug === 'helsingborgs_if') return '/logos/helsingborg.png';
    if (slug === 'gif_sundsvall' || slug === 'sundsvall') return '/logos/gif_sundsvall.png';

    // Fallback try simple slug
    return `/logos/${slug}.png`;
};
