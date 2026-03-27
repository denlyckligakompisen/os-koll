// circle-flags CDN — free open-source circular SVG flags (github.com/HatScripts/circle-flags)
export const flagUrl = (code) =>
    `https://hatscripts.github.io/circle-flags/flags/${code.toLowerCase()}.svg`;

export const getFlagCode = (name) => {
    if (!name) return 'UN';
    if (name.includes('Sverige')) return 'SE';
    if (name.includes('Ukraina')) return 'UA';
    if (name.includes('Japan')) return 'JP';
    if (name.includes('Nederländerna')) return 'NL';
    if (name.includes('Tunisien')) return 'TN';
    if (name.includes('Polen')) return 'PL';
    if (name.includes('Albanien')) return 'AL';
    if (name.includes('Mexiko')) return 'MX';
    if (name.includes('Sydafrika')) return 'ZA';
    if (name.includes('Sydkorea')) return 'KR';
    if (name.includes('Kanada')) return 'CA';
    if (name.includes('Qatar')) return 'QA';
    if (name.includes('Schweiz')) return 'CH';
    if (name.includes('Brasilien')) return 'BR';
    if (name.includes('Marocko')) return 'MA';
    if (name.includes('Haiti')) return 'HT';
    if (name.includes('Skottland')) return 'GB-SCT';
    if (name.includes('USA')) return 'US';
    if (name.includes('Paraguay')) return 'PY';
    if (name.includes('Australien')) return 'AU';
    if (name.includes('Tyskland')) return 'DE';
    if (name.includes('Curaçao')) return 'CW';
    if (name.includes('Elfenbenskusten')) return 'CI';
    if (name.includes('Ecuador')) return 'EC';
    if (name.includes('Belgien')) return 'BE';
    if (name.includes('Egypten')) return 'EG';
    if (name.includes('Iran')) return 'IR';
    if (name.includes('Nya Zeeland')) return 'NZ';
    if (name.includes('Spanien')) return 'ES';
    if (name.includes('Kap Verde')) return 'CV';
    if (name.includes('Saudiarabien')) return 'SA';
    if (name.includes('Uruguay')) return 'UY';
    if (name.includes('Frankrike')) return 'FR';
    if (name.includes('Senegal')) return 'SN';
    if (name.includes('Norge')) return 'NO';
    if (name.includes('Argentina')) return 'AR';
    if (name.includes('Algeriet')) return 'DZ';
    if (name.includes('Österrike')) return 'AT';
    if (name.includes('Jordanien')) return 'JO';
    if (name.includes('Portugal')) return 'PT';
    if (name.includes('Uzbekistan')) return 'UZ';
    if (name.includes('Colombia')) return 'CO';
    if (name.includes('England')) return 'GB-ENG';
    if (name.includes('Kroatien')) return 'HR';
    if (name.includes('Ghana')) return 'GH';
    if (name.includes('Panama')) return 'PA';
    if (name.includes('Peru')) return 'PE';
    if (name.includes('Kamerun')) return 'CM';
    if (name.includes('Georgien')) return 'GE';
    if (name.includes('Grekland')) return 'GR';
    if (name.includes('Wales')) return 'GB-WLS';
    if (name.includes('Island')) return 'IS';
    return null; // No flag for anything else (Play-offs etc)
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
