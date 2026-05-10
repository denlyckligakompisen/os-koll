
import path from 'path';

export const LEAGUE_IDS = {
    WORLD_CUP_2026: 48 // Example ID for FIFA World Cup
};

export const TARGET_TEAM = {
    ID: 'Sweden',
    DISPLAY_NAME: 'Sverige'
};

/**
 * Complete English-to-Swedish translation map for all 211 FIFA member nations
 * plus sub-nations (England, Scotland, Wales, Northern Ireland).
 * Used by all scrapers for consistent Swedish naming.
 */
export const TEAM_TRANSLATIONS = {
    // A
    'Afghanistan': 'Afghanistan',
    'Albania': 'Albanien',
    'Algeria': 'Algeriet',
    'American Samoa': 'Amerikanska Samoa',
    'Andorra': 'Andorra',
    'Angola': 'Angola',
    'Anguilla': 'Anguilla',
    'Antigua and Barbuda': 'Antigua och Barbuda',
    'Argentina': 'Argentina',
    'Armenia': 'Armenien',
    'Aruba': 'Aruba',
    'Australia': 'Australien',
    'Austria': 'Österrike',
    'Azerbaijan': 'Azerbajdzjan',

    // B
    'Bahamas': 'Bahamas',
    'The Bahamas': 'Bahamas',
    'Bahrain': 'Bahrain',
    'Bangladesh': 'Bangladesh',
    'Barbados': 'Barbados',
    'Belarus': 'Vitryssland',
    'Belgium': 'Belgien',
    'Belize': 'Belize',
    'Benin': 'Benin',
    'Bermuda': 'Bermuda',
    'Bhutan': 'Bhutan',
    'Bolivia': 'Bolivia',
    'Bosnia and Herzegovina': 'Bosnien och Hercegovina',
    'Bosnia': 'Bosnien och Hercegovina',
    'Botswana': 'Botswana',
    'Brazil': 'Brasilien',
    'British Virgin Islands': 'Brittiska Jungfruöarna',
    'Brunei Darussalam': 'Brunei',
    'Brunei': 'Brunei',
    'Bulgaria': 'Bulgarien',
    'Burkina Faso': 'Burkina Faso',
    'Burundi': 'Burundi',

    // C
    'Cabo Verde': 'Kap Verde',
    'Cape Verde': 'Kap Verde',
    'Cambodia': 'Kambodja',
    'Cameroon': 'Kamerun',
    'Canada': 'Kanada',
    'Cayman Islands': 'Caymanöarna',
    'Central African Republic': 'Centralafrikanska republiken',
    'Chad': 'Tchad',
    'Chile': 'Chile',
    'China PR': 'Kina',
    'Chinese Taipei': 'Kinesiska Taipei',
    'Colombia': 'Colombia',
    'Comoros': 'Komorerna',
    'Congo': 'Kongo',
    'Congo DR': 'DR Kongo',
    'DR Congo': 'DR Kongo',
    'Cook Islands': 'Cooköarna',
    'Costa Rica': 'Costa Rica',
    "Côte d'Ivoire": 'Elfenbenskusten',
    'Ivory Coast': 'Elfenbenskusten',
    'Ivory Coast (CIV)': 'Elfenbenskusten',
    'Croatia': 'Kroatien',
    'Cuba': 'Kuba',
    'Curaçao': 'Curaçao',
    'Curacao': 'Curaçao',
    'Cyprus': 'Cypern',
    'Czech Republic': 'Tjeckien',
    'Czechia': 'Tjeckien',

    // D
    'Denmark': 'Danmark',
    'Djibouti': 'Djibouti',
    'Dominica': 'Dominica',
    'Dominican Republic': 'Dominikanska republiken',

    // E
    'Ecuador': 'Ecuador',
    'Egypt': 'Egypten',
    'El Salvador': 'El Salvador',
    'England': 'England',
    'Equatorial Guinea': 'Ekvatorialguinea',
    'Eritrea': 'Eritrea',
    'Estonia': 'Estland',
    'Eswatini': 'Eswatini',
    'Swaziland': 'Eswatini',
    'Ethiopia': 'Etiopien',

    // F
    'Faroe Islands': 'Färöarna',
    'Fiji': 'Fiji',
    'Finland': 'Finland',
    'France': 'Frankrike',

    // G
    'Gabon': 'Gabon',
    'Gambia': 'Gambia',
    'The Gambia': 'Gambia',
    'Georgia': 'Georgien',
    'Germany': 'Tyskland',
    'Ghana': 'Ghana',
    'Gibraltar': 'Gibraltar',
    'Greece': 'Grekland',
    'Grenada': 'Grenada',
    'Guam': 'Guam',
    'Guatemala': 'Guatemala',
    'Guinea': 'Guinea',
    'Guinea-Bissau': 'Guinea-Bissau',
    'Guyana': 'Guyana',

    // H
    'Haiti': 'Haiti',
    'Honduras': 'Honduras',
    'Hong Kong, China': 'Hongkong',
    'Hungary': 'Ungern',

    // I
    'Iceland': 'Island',
    'India': 'Indien',
    'Indonesia': 'Indonesien',
    'Iran': 'Iran',
    'IR Iran': 'Iran',
    'Iraq': 'Irak',
    'Republic of Ireland': 'Irland',
    'Ireland': 'Irland',
    'Israel': 'Israel',
    'Italy': 'Italien',

    // J
    'Jamaica': 'Jamaika',
    'Jamaika': 'Jamaika',
    'Japan': 'Japan',
    'Jordan': 'Jordanien',

    // K
    'Kazakhstan': 'Kazakstan',
    'Kenya': 'Kenya',
    'Korea DPR': 'Nordkorea',
    'North Korea': 'Nordkorea',
    'Korea Republic': 'Sydkorea',
    'South Korea': 'Sydkorea',
    'Kosovo': 'Kosovo',
    'Kuwait': 'Kuwait',
    'Kyrgyz Republic': 'Kirgizistan',
    'Kyrgyzstan': 'Kirgizistan',

    // L
    'Laos': 'Laos',
    'Latvia': 'Lettland',
    'Lebanon': 'Libanon',
    'Lesotho': 'Lesotho',
    'Liberia': 'Liberia',
    'Libya': 'Libyen',
    'Liechtenstein': 'Liechtenstein',
    'Lithuania': 'Litauen',
    'Luxembourg': 'Luxemburg',

    // M
    'Macau': 'Macao',
    'Madagascar': 'Madagaskar',
    'Malawi': 'Malawi',
    'Malaysia': 'Malaysia',
    'Maldives': 'Maldiverna',
    'Mali': 'Mali',
    'Malta': 'Malta',
    'Mauritania': 'Mauretanien',
    'Mauritius': 'Mauritius',
    'Mexico': 'Mexiko',
    'Moldova': 'Moldavien',
    'Mongolia': 'Mongoliet',
    'Montenegro': 'Montenegro',
    'Montserrat': 'Montserrat',
    'Morocco': 'Marocko',
    'Mozambique': 'Moçambique',
    'Myanmar': 'Myanmar',

    // N
    'Namibia': 'Namibia',
    'Nepal': 'Nepal',
    'Netherlands': 'Nederländerna',
    'New Caledonia': 'Nya Kaledonien',
    'New Zealand': 'Nya Zeeland',
    'Nicaragua': 'Nicaragua',
    'Niger': 'Niger',
    'Nigeria': 'Nigeria',
    'North Macedonia': 'Nordmakedonien',
    'Northern Ireland': 'Nordirland',
    'Norway': 'Norge',

    // O
    'Oman': 'Oman',

    // P
    'Pakistan': 'Pakistan',
    'Palestine': 'Palestina',
    'Panama': 'Panama',
    'Papua New Guinea': 'Papua Nya Guinea',
    'Paraguay': 'Paraguay',
    'Peru': 'Peru',
    'Philippines': 'Filippinerna',
    'Poland': 'Polen',
    'Portugal': 'Portugal',
    'Puerto Rico': 'Puerto Rico',

    // Q
    'Qatar': 'Qatar',

    // R
    'Romania': 'Rumänien',
    'Russia': 'Ryssland',
    'Rwanda': 'Rwanda',

    // S
    'Samoa': 'Samoa',
    'San Marino': 'San Marino',
    'São Tomé and Príncipe': 'São Tomé och Príncipe',
    'Saudi Arabia': 'Saudiarabien',
    'Scotland': 'Skottland',
    'Senegal': 'Senegal',
    'Serbia': 'Serbien',
    'Seychelles': 'Seychellerna',
    'Sierra Leone': 'Sierra Leone',
    'Singapore': 'Singapore',
    'Slovakia': 'Slovakien',
    'Slovenia': 'Slovenien',
    'Solomon Islands': 'Salomonöarna',
    'Somalia': 'Somalia',
    'South Africa': 'Sydafrika',
    'South Sudan': 'Sydsudan',
    'Spain': 'Spanien',
    'Sri Lanka': 'Sri Lanka',
    'St Kitts and Nevis': 'Saint Kitts och Nevis',
    'St Lucia': 'Saint Lucia',
    'St Vincent and the Grenadines': 'Saint Vincent och Grenadinerna',
    'Sudan': 'Sudan',
    'Suriname': 'Surinam',
    'Sweden': 'Sverige',
    'Switzerland': 'Schweiz',
    'Syria': 'Syrien',

    // T
    'Tahiti': 'Tahiti',
    'Tajikistan': 'Tadzjikistan',
    'Tanzania': 'Tanzania',
    'Thailand': 'Thailand',
    'Timor-Leste': 'Östtimor',
    'Togo': 'Togo',
    'Tonga': 'Tonga',
    'Trinidad and Tobago': 'Trinidad och Tobago',
    'Tunisia': 'Tunisien',
    'Turkey': 'Turkiet',
    'Türkiye': 'Turkiet',
    'Turkmenistan': 'Turkmenistan',
    'Turks and Caicos Islands': 'Turks- och Caicosöarna',

    // U
    'Uganda': 'Uganda',
    'Ukraine': 'Ukraina',
    'United Arab Emirates': 'Förenade Arabemiraten',
    'UAE': 'Förenade Arabemiraten',
    'United States': 'USA',
    'United States (USA)': 'USA',
    'US Virgin Islands': 'Amerikanska Jungfruöarna',
    'Uruguay': 'Uruguay',
    'Uzbekistan': 'Uzbekistan',

    // V
    'Vanuatu': 'Vanuatu',
    'Venezuela': 'Venezuela',
    'Vietnam': 'Vietnam',

    // W
    'Wales': 'Wales',

    // Y
    'Yemen': 'Jemen',

    // Z
    'Zambia': 'Zambia',
    'Zimbabwe': 'Zimbabwe',
};

export const translateTeam = (name) => {
    if (!name) return name;
    const parts = name.split('/');
    if (parts.length > 1) {
        return parts.map(p => translateTeam(p.trim())).join('/');
    }
    const trimmed = name.trim().replace(/\s*&\s*/g, ' and ');
    const cleanName = trimmed.replace(/\s\([A-Z]+\)$/, '');
    return TEAM_TRANSLATIONS[cleanName] || TEAM_TRANSLATIONS[trimmed] || trimmed;
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
