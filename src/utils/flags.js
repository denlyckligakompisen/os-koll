// circle-flags CDN — free open-source circular SVG flags (github.com/HatScripts/circle-flags)
export const flagUrl = (code) =>
    `https://hatscripts.github.io/circle-flags/flags/${code.toLowerCase()}.svg`;

// Comprehensive mapping of team names (Swedish + English) to ISO country codes
const FLAG_MAP = {
    // A
    'Afghanistan': 'AF',
    'Albanien': 'AL', 'Albania': 'AL',
    'Algeriet': 'DZ', 'Algeria': 'DZ',
    'Amerikanska Samoa': 'AS', 'American Samoa': 'AS',
    'Andorra': 'AD',
    'Angola': 'AO',
    'Anguilla': 'AI',
    'Antigua and Barbuda': 'AG', 'Antigua och Barbuda': 'AG',
    'Argentina': 'AR',
    'Armenien': 'AM', 'Armenia': 'AM',
    'Aruba': 'AW',
    'Australien': 'AU', 'Australia': 'AU',
    'Azerbajdzjan': 'AZ', 'Azerbaijan': 'AZ',
    'Österrike': 'AT', 'Austria': 'AT',

    // B
    'Bahamas': 'BS', 'The Bahamas': 'BS',
    'Bahrain': 'BH',
    'Bangladesh': 'BD',
    'Barbados': 'BB',
    'Belarus': 'BY', 'Vitryssland': 'BY',
    'Belgien': 'BE', 'Belgium': 'BE',
    'Belize': 'BZ',
    'Benin': 'BJ',
    'Bermuda': 'BM',
    'Bhutan': 'BT',
    'Bolivia': 'BO',
    'Bosnien och Hercegovina': 'BA', 'Bosnia and Herzegovina': 'BA', 'Bosnia': 'BA',
    'Botswana': 'BW',
    'Brasilien': 'BR', 'Brazil': 'BR',
    'British Virgin Islands': 'VG', 'Brittiska Jungfruöarna': 'VG',
    'Brunei Darussalam': 'BN', 'Brunei': 'BN',
    'Bulgarien': 'BG', 'Bulgaria': 'BG',
    'Burkina Faso': 'BF',
    'Burundi': 'BI',

    // C
    'Cabo Verde': 'CV', 'Kap Verde': 'CV', 'Cape Verde': 'CV',
    'Cambodia': 'KH', 'Kambodja': 'KH',
    'Cameroon': 'CM', 'Kamerun': 'CM',
    'Canada': 'CA', 'Kanada': 'CA',
    'Cayman Islands': 'KY', 'Caymanöarna': 'KY',
    'Central African Republic': 'CF', 'Centralafrikanska republiken': 'CF',
    'Chad': 'TD', 'Tchad': 'TD',
    'Chile': 'CL',
    'China PR': 'CN', 'Kina': 'CN',
    'Chinese Taipei': 'TW',
    'Colombia': 'CO',
    'Comoros': 'KM', 'Komorerna': 'KM',
    'Congo': 'CG', 'Kongo': 'CG',
    'Congo DR': 'CD', 'Demokratiska republiken Kongo': 'CD', 'DR Congo': 'CD',
    'Cook Islands': 'CK', 'Cooköarna': 'CK',
    'Costa Rica': 'CR',
    'Côte d\'Ivoire': 'CI', 'Elfenbenskusten': 'CI', 'Ivory Coast': 'CI',
    'Kroatien': 'HR', 'Croatia': 'HR',
    'Cuba': 'CU', 'Kuba': 'CU',
    'Curaçao': 'CW', 'Curacao': 'CW',
    'Cypern': 'CY', 'Cyprus': 'CY',
    'Tjeckien': 'CZ', 'Czech Republic': 'CZ', 'Czechia': 'CZ',

    // D
    'Danmark': 'DK', 'Denmark': 'DK',
    'Djibouti': 'DJ',
    'Dominica': 'DM',
    'Dominikanska republiken': 'DO', 'Dominican Republic': 'DO',

    // E
    'Ecuador': 'EC',
    'Egypten': 'EG', 'Egypt': 'EG',
    'El Salvador': 'SV',
    'England': 'GB-ENG',
    'Equatorial Guinea': 'GQ', 'Ekvatorialguinea': 'GQ',
    'Eritrea': 'ER',
    'Estland': 'EE', 'Estonia': 'EE',
    'Eswatini': 'SZ', 'Swaziland': 'SZ',
    'Etiopien': 'ET', 'Ethiopia': 'ET',

    // F
    'Faroe Islands': 'FO', 'Färöarna': 'FO',
    'Fiji': 'FJ',
    'Finland': 'FI',
    'Frankrike': 'FR', 'France': 'FR',
    'Förenade Arabemiraten': 'AE', 'United Arab Emirates': 'AE', 'UAE': 'AE',

    // G
    'Gabon': 'GA',
    'Gambia': 'GM', 'The Gambia': 'GM',
    'Georgien': 'GE', 'Georgia': 'GE',
    'Ghana': 'GH',
    'Gibraltar': 'GI',
    'Grekland': 'GR', 'Greece': 'GR',
    'Grenada': 'GD',
    'Guam': 'GU',
    'Guatemala': 'GT',
    'Guinea': 'GN',
    'Guinea-Bissau': 'GW',
    'Guyana': 'GY',

    // H
    'Haiti': 'HT',
    'Honduras': 'HN',
    'Hong Kong, China': 'HK', 'Hongkong': 'HK',
    'Ungern': 'HU', 'Hungary': 'HU',

    // I
    'Island': 'IS', 'Iceland': 'IS',
    'Indien': 'IN', 'India': 'IN',
    'Indonesien': 'ID', 'Indonesia': 'ID',
    'Iran': 'IR', 'IR Iran': 'IR',
    'Irak': 'IQ', 'Iraq': 'IQ',
    'Irland': 'IE', 'Republic of Ireland': 'IE', 'Ireland': 'IE',
    'Israel': 'IL',
    'Italien': 'IT', 'Italy': 'IT',

    // J
    'Jamaika': 'JM', 'Jamaica': 'JM',
    'Japan': 'JP',
    'Jordanien': 'JO', 'Jordan': 'JO',

    // K
    'Kazakstan': 'KZ', 'Kazakhstan': 'KZ',
    'Kenya': 'KE',
    'Kirgizistan': 'KG', 'Kyrgyz Republic': 'KG', 'Kyrgyzstan': 'KG',
    'Kosovo': 'XK',
    'Kuwait': 'KW',
    'Korea Republic': 'KR', 'Sydkorea': 'KR', 'South Korea': 'KR',
    'Korea DPR': 'KP', 'Nordkorea': 'KP', 'North Korea': 'KP',

    // L
    'Laos': 'LA',
    'Lettland': 'LV', 'Latvia': 'LV',
    'Libanon': 'LB', 'Lebanon': 'LB',
    'Lesotho': 'LS',
    'Liberia': 'LR',
    'Libyen': 'LY', 'Libya': 'LY',
    'Liechtenstein': 'LI',
    'Litauen': 'LT', 'Lithuania': 'LT',
    'Luxemburg': 'LU', 'Luxembourg': 'LU',

    // M
    'Macau': 'MO',
    'Madagaskar': 'MG', 'Madagascar': 'MG',
    'Malawi': 'MW',
    'Malaysia': 'MY',
    'Maldiverna': 'MV', 'Maldives': 'MV',
    'Mali': 'ML',
    'Malta': 'MT',
    'Mauretanien': 'MR', 'Mauritania': 'MR',
    'Mauritius': 'MU',
    'Mexiko': 'MX', 'Mexico': 'MX',
    'Moldavien': 'MD', 'Moldova': 'MD',
    'Mongoliet': 'MN', 'Mongolia': 'MN',
    'Montenegro': 'ME',
    'Montserrat': 'MS',
    'Marocko': 'MA', 'Morocco': 'MA',
    'Moçambique': 'MZ', 'Mozambique': 'MZ',
    'Myanmar': 'MM',

    // N
    'Namibia': 'NA',
    'Nepal': 'NP',
    'Nederländerna': 'NL', 'Netherlands': 'NL',
    'Nya Kaledonien': 'NC', 'New Caledonia': 'NC',
    'Nya Zeeland': 'NZ', 'New Zealand': 'NZ',
    'Nicaragua': 'NI',
    'Niger': 'NE',
    'Nigeria': 'NG',
    'Nordirland': 'GB-NIR', 'Northern Ireland': 'GB-NIR',
    'Nordmakedonien': 'MK', 'North Macedonia': 'MK',
    'Norge': 'NO', 'Norway': 'NO',

    // O
    'Oman': 'OM',

    // P
    'Pakistan': 'PK',
    'Palestina': 'PS', 'Palestine': 'PS',
    'Panama': 'PA',
    'Papua New Guinea': 'PG', 'Papua Nya Guinea': 'PG',
    'Paraguay': 'PY',
    'Peru': 'PE',
    'Filippinerna': 'PH', 'Philippines': 'PH',
    'Polen': 'PL', 'Poland': 'PL',
    'Portugal': 'PT',
    'Puerto Rico': 'PR',

    // Q
    'Qatar': 'QA',

    // R
    'Rumänien': 'RO', 'Romania': 'RO',
    'Ryssland': 'RU', 'Russia': 'RU',
    'Rwanda': 'RW',

    // S
    'Samoa': 'WS',
    'San Marino': 'SM',
    'São Tomé and Príncipe': 'ST', 'São Tomé och Príncipe': 'ST',
    'Saudiarabien': 'SA', 'Saudi Arabia': 'SA',
    'Skottland': 'GB-SCT', 'Scotland': 'GB-SCT',
    'Senegal': 'SN',
    'Serbien': 'RS', 'Serbia': 'RS',
    'Seychellerna': 'SC', 'Seychelles': 'SC',
    'Sierra Leone': 'SL',
    'Singapore': 'SG',
    'Slovakien': 'SK', 'Slovakia': 'SK',
    'Slovenien': 'SI', 'Slovenia': 'SI',
    'Solomon Islands': 'SB', 'Salomonöarna': 'SB',
    'Somalia': 'SO',
    'Spanien': 'ES', 'Spain': 'ES',
    'Sri Lanka': 'LK',
    'St Kitts and Nevis': 'KN', 'Saint Kitts och Nevis': 'KN',
    'St Lucia': 'LC', 'Saint Lucia': 'LC',
    'St Vincent and the Grenadines': 'VC', 'Saint Vincent och Grenadinerna': 'VC',
    'Sudan': 'SD',
    'Suriname': 'SR',
    'Sverige': 'SE', 'Sweden': 'SE',
    'Schweiz': 'CH', 'Switzerland': 'CH',
    'Sydafrika': 'ZA', 'South Africa': 'ZA',
    'Sydsudan': 'SS', 'South Sudan': 'SS',
    'Syrien': 'SY', 'Syria': 'SY',

    // T
    'Tahiti': 'PF',
    'Tadzjikistan': 'TJ', 'Tajikistan': 'TJ',
    'Tanzania': 'TZ',
    'Thailand': 'TH',
    'Timor-Leste': 'TL', 'Östtimor': 'TL',
    'Togo': 'TG',
    'Tonga': 'TO',
    'Trinidad and Tobago': 'TT', 'Trinidad och Tobago': 'TT',
    'Tunisien': 'TN', 'Tunisia': 'TN',
    'Turkiet': 'TR', 'Turkey': 'TR', 'Türkiye': 'TR',
    'Turkmenistan': 'TM',
    'Turks and Caicos Islands': 'TC', 'Turks- och Caicosöarna': 'TC',
    'Tyskland': 'DE', 'Germany': 'DE',

    // U
    'Uganda': 'UG',
    'Ukraina': 'UA', 'Ukraine': 'UA',
    'Ungern': 'HU',
    'Uruguay': 'UY',
    'USA': 'US', 'United States': 'US',
    'US Virgin Islands': 'VI', 'Amerikanska Jungfruöarna': 'VI',
    'Uzbekistan': 'UZ',

    // V
    'Vanuatu': 'VU',
    'Venezuela': 'VE',
    'Vietnam': 'VN',

    // W
    'Wales': 'GB-WLS',

    // Y
    'Jemen': 'YE', 'Yemen': 'YE',

    // Z
    'Zambia': 'ZM',
    'Zimbabwe': 'ZW',
};

export const getFlagCode = (name) => {
    if (!name) return null;
    
    // Direct lookup
    const direct = FLAG_MAP[name];
    if (direct) return direct;
    
    // Try partial match (for names like "Bosnien och Hercegovina" embedded in longer strings)
    for (const [key, code] of Object.entries(FLAG_MAP)) {
        if (name.includes(key)) return code;
    }
    
    return null;
};

export const getFlagCodes = (name) => {
    if (!name) return [];
    if (!name.includes('/')) {
        const code = getFlagCode(name);
        return code ? [code] : [];
    }
    return name.split('/')
        .map(part => getFlagCode(part.trim()))
        .filter(code => code !== null);
};
