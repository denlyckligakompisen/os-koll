
import path from 'path';

export const LEAGUE_IDS = {
    ALLSVENSKAN: 67,
    CUPEN: 171
};

export const TARGET_TEAM = {
    ID: 'Sirius',
    DISPLAY_NAME: 'IK Sirius'
};

/**
 * Common team name overrides for consistency
 */
export const TEAM_NAME_OVERRIDES = {
    'Sirius': TARGET_TEAM.DISPLAY_NAME,
    'Degerfors': 'Degerfors IF',
    'Djurgården': 'Djurgårdens IF',
    'Häcken': 'BK Häcken',
    'Halmstad': 'Halmstads BK',
    'Hammarby': 'Hammarby IF',
    'Kalmar': 'Kalmar FF',
    'Malmö': 'Malmö FF',
    'Mjällby': 'Mjällby AIF',
    'Örgryte': 'Örgryte IS',
    'Västerås SK': 'Västerås SK FK',
    'IFK Göteborg': 'IFK Göteborg',
    'Brommapojkarna': 'IF Brommapojkarna',
    'GAIS': 'GAIS',
    'AIK': 'AIK',
    'IF Elfsborg': 'IF Elfsborg',
    'Varbergs BoIS': 'Varbergs BoIS',
    'Helsingborg': 'Helsingborgs IF',
    'Östers IF': 'Östers IF',
    'Utsiktens BK': 'Utsiktens BK'
};

export const normalizeTeamName = (name) => {
    if (!name) return name;
    // Special handling for abbreviations or common versions
    const normalized = name.trim();
    return TEAM_NAME_OVERRIDES[normalized] || normalized;
};

/**
 * Convert a normalized team name to a slug used in URLs (e.g., on allsvenskan.se)
 */
export const getTeamSlug = (name) => {
    if (!name) return '';
    return name.toLowerCase()
        .replace(/å/g, 'a')
        .replace(/ä/g, 'a')
        .replace(/ö/g, 'o')
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
};

/**
 * Convert a normalized team name to a slug used in filenames (lowercase, underscores, no åäö)
 */
export const getTeamFileSlug = (name) => {
    if (!name) return '';
    return name.toLowerCase()
        .replace(/å/g, 'a')
        .replace(/ä/g, 'a')
        .replace(/ö/g, 'o')
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');
};
