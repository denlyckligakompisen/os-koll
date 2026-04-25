import fs from 'fs';
const rankings = JSON.parse(fs.readFileSync('./public/data/fifa_ranking.json', 'utf8')).rankings;

// Replicate the FLAG_MAP inline for Node.js verification
const FLAG_MAP = {
    'Afghanistan': 'AF', 'Albanien': 'AL', 'Albania': 'AL', 'Algeriet': 'DZ', 'Algeria': 'DZ',
    'Amerikanska Samoa': 'AS', 'American Samoa': 'AS', 'Andorra': 'AD', 'Angola': 'AO', 'Anguilla': 'AI',
    'Antigua and Barbuda': 'AG', 'Argentina': 'AR', 'Armenien': 'AM', 'Armenia': 'AM', 'Aruba': 'AW',
    'Australien': 'AU', 'Australia': 'AU', 'Azerbajdzjan': 'AZ', 'Azerbaijan': 'AZ',
    '\u00d6sterrike': 'AT', 'Austria': 'AT',
    'Bahamas': 'BS', 'The Bahamas': 'BS', 'Bahrain': 'BH',
    'Bangladesh': 'BD', 'Barbados': 'BB', 'Belarus': 'BY', 'Belgien': 'BE', 'Belgium': 'BE',
    'Belize': 'BZ', 'Benin': 'BJ', 'Bermuda': 'BM', 'Bhutan': 'BT', 'Bolivia': 'BO',
    'Bosnien och Hercegovina': 'BA', 'Bosnia and Herzegovina': 'BA', 'Botswana': 'BW',
    'Brasilien': 'BR', 'Brazil': 'BR', 'British Virgin Islands': 'VG', 'Brunei Darussalam': 'BN', 'Brunei': 'BN',
    'Bulgarien': 'BG', 'Bulgaria': 'BG', 'Burkina Faso': 'BF', 'Burundi': 'BI',
    'Cabo Verde': 'CV', 'Kap Verde': 'CV', 'Cambodia': 'KH', 'Cameroon': 'CM', 'Kamerun': 'CM',
    'Canada': 'CA', 'Kanada': 'CA', 'Cayman Islands': 'KY', 'Central African Republic': 'CF',
    'Chad': 'TD', 'Chile': 'CL', 'China PR': 'CN', 'Chinese Taipei': 'TW', 'Colombia': 'CO',
    'Comoros': 'KM', 'Congo': 'CG', 'Congo DR': 'CD', 'Demokratiska republiken Kongo': 'CD',
    'Cook Islands': 'CK', 'Costa Rica': 'CR', "Côte d'Ivoire": 'CI', 'Elfenbenskusten': 'CI',
    'Kroatien': 'HR', 'Croatia': 'HR', 'Cuba': 'CU', 'Curaçao': 'CW', 'Cypern': 'CY', 'Cyprus': 'CY',
    'Tjeckien': 'CZ', 'Danmark': 'DK', 'Denmark': 'DK', 'Djibouti': 'DJ', 'Dominica': 'DM',
    'Dominican Republic': 'DO', 'Ecuador': 'EC', 'Egypten': 'EG', 'Egypt': 'EG', 'El Salvador': 'SV',
    'England': 'GB-ENG', 'Equatorial Guinea': 'GQ', 'Eritrea': 'ER', 'Estland': 'EE', 'Estonia': 'EE',
    'Eswatini': 'SZ', 'Etiopien': 'ET', 'Ethiopia': 'ET', 'Faroe Islands': 'FO', 'Fiji': 'FJ',
    'Finland': 'FI', 'Frankrike': 'FR', 'France': 'FR', 'Förenade Arabemiraten': 'AE',
    'Gabon': 'GA', 'Gambia': 'GM', 'The Gambia': 'GM', 'Georgien': 'GE', 'Georgia': 'GE',
    'Ghana': 'GH', 'Gibraltar': 'GI', 'Grekland': 'GR', 'Greece': 'GR', 'Grenada': 'GD',
    'Guam': 'GU', 'Guatemala': 'GT', 'Guinea': 'GN', 'Guinea-Bissau': 'GW', 'Guyana': 'GY',
    'Haiti': 'HT', 'Honduras': 'HN', 'Hong Kong, China': 'HK', 'Ungern': 'HU', 'Hungary': 'HU',
    'Island': 'IS', 'Iceland': 'IS', 'Indien': 'IN', 'India': 'IN', 'Indonesien': 'ID', 'Indonesia': 'ID',
    'Iran': 'IR', 'IR Iran': 'IR', 'Irak': 'IQ', 'Iraq': 'IQ', 'Irland': 'IE', 'Republic of Ireland': 'IE',
    'Israel': 'IL', 'Italien': 'IT', 'Italy': 'IT', 'Jamaika': 'JM', 'Jamaica': 'JM', 'Japan': 'JP',
    'Jordanien': 'JO', 'Jordan': 'JO', 'Kazakstan': 'KZ', 'Kazakhstan': 'KZ', 'Kenya': 'KE',
    'Kirgizistan': 'KG', 'Kyrgyz Republic': 'KG', 'Kosovo': 'XK', 'Kuwait': 'KW',
    'Korea Republic': 'KR', 'Sydkorea': 'KR', 'Korea DPR': 'KP', 'Laos': 'LA', 'Lettland': 'LV', 'Latvia': 'LV',
    'Libanon': 'LB', 'Lebanon': 'LB', 'Lesotho': 'LS', 'Liberia': 'LR', 'Libyen': 'LY', 'Libya': 'LY',
    'Liechtenstein': 'LI', 'Litauen': 'LT', 'Lithuania': 'LT', 'Luxemburg': 'LU', 'Luxembourg': 'LU',
    'Macau': 'MO', 'Madagaskar': 'MG', 'Madagascar': 'MG', 'Malawi': 'MW', 'Malaysia': 'MY',
    'Maldiverna': 'MV', 'Maldives': 'MV', 'Mali': 'ML', 'Malta': 'MT', 'Mauretanien': 'MR', 'Mauritania': 'MR',
    'Mauritius': 'MU', 'Mexiko': 'MX', 'Mexico': 'MX', 'Moldavien': 'MD', 'Moldova': 'MD',
    'Mongoliet': 'MN', 'Mongolia': 'MN', 'Montenegro': 'ME', 'Montserrat': 'MS', 'Marocko': 'MA', 'Morocco': 'MA',
    'Moçambique': 'MZ', 'Mozambique': 'MZ', 'Myanmar': 'MM', 'Namibia': 'NA', 'Nepal': 'NP',
    'Nederländerna': 'NL', 'Netherlands': 'NL', 'Nya Kaledonien': 'NC', 'New Caledonia': 'NC',
    'Nya Zeeland': 'NZ', 'New Zealand': 'NZ', 'Nicaragua': 'NI', 'Niger': 'NE', 'Nigeria': 'NG',
    'Nordirland': 'GB-NIR', 'Northern Ireland': 'GB-NIR', 'Nordmakedonien': 'MK', 'North Macedonia': 'MK',
    'Norge': 'NO', 'Norway': 'NO', 'Oman': 'OM', 'Pakistan': 'PK', 'Palestina': 'PS', 'Palestine': 'PS',
    'Panama': 'PA', 'Papua New Guinea': 'PG', 'Paraguay': 'PY', 'Peru': 'PE',
    'Filippinerna': 'PH', 'Philippines': 'PH', 'Polen': 'PL', 'Poland': 'PL', 'Portugal': 'PT',
    'Puerto Rico': 'PR', 'Qatar': 'QA', 'Rumänien': 'RO', 'Romania': 'RO', 'Ryssland': 'RU', 'Russia': 'RU',
    'Rwanda': 'RW', 'Samoa': 'WS', 'San Marino': 'SM', 'São Tomé and Príncipe': 'ST',
    'Saudiarabien': 'SA', 'Saudi Arabia': 'SA', 'Skottland': 'GB-SCT', 'Scotland': 'GB-SCT',
    'Senegal': 'SN', 'Serbien': 'RS', 'Serbia': 'RS', 'Seychellerna': 'SC', 'Seychelles': 'SC',
    'Sierra Leone': 'SL', 'Singapore': 'SG', 'Slovakien': 'SK', 'Slovakia': 'SK',
    'Slovenien': 'SI', 'Slovenia': 'SI', 'Solomon Islands': 'SB', 'Somalia': 'SO',
    'Spanien': 'ES', 'Spain': 'ES', 'Sri Lanka': 'LK', 'St Kitts and Nevis': 'KN',
    'St Lucia': 'LC', 'St Vincent and the Grenadines': 'VC', 'Sudan': 'SD', 'Suriname': 'SR',
    'Sverige': 'SE', 'Sweden': 'SE', 'Schweiz': 'CH', 'Switzerland': 'CH', 'Sydafrika': 'ZA', 'South Africa': 'ZA',
    'Sydsudan': 'SS', 'South Sudan': 'SS', 'Syrien': 'SY', 'Syria': 'SY', 'Tahiti': 'PF',
    'Tadzjikistan': 'TJ', 'Tajikistan': 'TJ', 'Tanzania': 'TZ', 'Thailand': 'TH', 'Timor-Leste': 'TL',
    'Togo': 'TG', 'Tonga': 'TO', 'Trinidad and Tobago': 'TT', 'Tunisien': 'TN', 'Tunisia': 'TN',
    'Turkiet': 'TR', 'Turkey': 'TR', 'Türkiye': 'TR', 'Turkmenistan': 'TM',
    'Turks and Caicos Islands': 'TC', 'Tyskland': 'DE', 'Germany': 'DE', 'Uganda': 'UG',
    'Ukraina': 'UA', 'Ukraine': 'UA', 'Uruguay': 'UY', 'USA': 'US', 'United States': 'US',
    'US Virgin Islands': 'VI', 'Uzbekistan': 'UZ', 'Vanuatu': 'VU', 'Venezuela': 'VE', 'Vietnam': 'VN',
    'Wales': 'GB-WLS', 'Jemen': 'YE', 'Yemen': 'YE', 'Zambia': 'ZM', 'Zimbabwe': 'ZW'
};

const missing = [];
rankings.forEach(r => {
    const direct = FLAG_MAP[r.team];
    if (direct) return;
    // Try partial match
    const partial = Object.entries(FLAG_MAP).find(([key]) => r.team.includes(key));
    if (!partial) {
        missing.push(r.team);
    }
});

if (missing.length === 0) {
    console.log(`✅ All ${rankings.length} teams have flag mappings!`);
} else {
    console.log(`❌ Missing flags for ${missing.length} teams:`);
    missing.forEach(t => console.log(`  - ${t}`));
}
