
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
        'sirius': '/logos/ik_sirius.png',
        'ik_sirius': '/logos/ik_sirius.png',
        'elfsborg': '/logos/if_elfsborg.png',
        'if_elfsborg': '/logos/if_elfsborg.png',
        'djurgarden': '/logos/djurgardens_if.png',
        'djurgardens_if': '/logos/djurgardens_if.png',
        'hammarby': '/logos/hammarby_if.png',
        'hammarby_if': '/logos/hammarby_if.png',
        'mjallby': '/logos/mjallby_aif.png',
        'mjallby_aif': '/logos/mjallby_aif.png',
        'degerfors': '/logos/degerfors_if.png',
        'degerfors_if': '/logos/degerfors_if.png',
        'hacken': '/logos/bk_hacken.png',
        'bk_hacken': '/logos/bk_hacken.png',
        'vasteras': '/logos/vasteras_sk_fk.png',
        'vsk': '/logos/vasteras_sk_fk.png',
        'vasteras_sk_fk': '/logos/vasteras_sk_fk.png',
        'goteborg': '/logos/ifk_goteborg.png',
        'ifk_goteborg': '/logos/ifk_goteborg.png',
        'aik': '/logos/aik.png',
        'gais': '/logos/gais.png',
        'halmstad': '/logos/halmstads_bk.png',
        'halmstads_bk': '/logos/halmstads_bk.png',
        'malmo': '/logos/malmo_ff.png',
        'malmo_ff': '/logos/malmo_ff.png',
        'kalmar': '/logos/kalmar_ff.png',
        'kalmar_ff': '/logos/kalmar_ff.png',
        'orgryte': '/logos/orgryte_is.png',
        'orgryte_is': '/logos/orgryte_is.png',
        'helsingborg': '/logos/helsingborgs_if.png',
        'helsingborgs_if': '/logos/helsingborgs_if.png',
        'brommapojkarna': '/logos/if_brommapojkarna.png',
        'if_brommapojkarna': '/logos/if_brommapojkarna.png'
    };

    if (overrides[slug]) return overrides[slug];

    // Fallback try simple slug
    return `/logos/${slug}.png`;
};
