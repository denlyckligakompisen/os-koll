
import path from 'path';

export const LEAGUE_IDS = {
    WORLD_CUP_2026: 48 // Example ID for FIFA World Cup
};

export const TARGET_TEAM = {
    ID: 'Sweden',
    DISPLAY_NAME: 'Sverige'
};

/**
 * Common team name overrides for consistency
 */
export const TEAM_NAME_OVERRIDES = {
    'Sweden': TARGET_TEAM.DISPLAY_NAME,
};

export const normalizeTeamName = (name) => {
    if (!name) return name;
    const normalized = name.trim();
    return TEAM_NAME_OVERRIDES[normalized] || normalized;
};

/**
 * Convert a normalized team name to a slug used in URLs
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
