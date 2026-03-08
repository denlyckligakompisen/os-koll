
/**
 * Shared logo mapping for Swedish teams and competitions
 */
export const getTeamLogo = (teamName) => {
    const logos = {
        'IK Sirius': 'https://data-20ca4.kxcdn.com/teamImages%2Flo70q4e1-iks.png?width=100',
        'Sirius': 'https://data-20ca4.kxcdn.com/teamImages%2Flo70q4e1-iks.png?width=100',
        'GIF Sundsvall': 'https://data-20ca4.kxcdn.com/teamImages%2Flps4uo4a-gif-logga.png?width=100',
        'Helsingborgs IF': 'https://data-20ca4.kxcdn.com/teamImages%2FHIF%2Flf89k8un-HIF_emblem.png?width=100',
        'Helsingborg': 'https://data-20ca4.kxcdn.com/teamImages%2FHIF%2Flf89k8un-HIF_emblem.png?width=100',
        'IF Elfsborg': 'https://data-20ca4.kxcdn.com/teamImages%2FIFE%2Flo70p360-ife.png?width=100',
        'Elfsborg': 'https://data-20ca4.kxcdn.com/teamImages%2FIFE%2Flo70p360-ife.png?width=100',
        'Malmö FF': 'https://data-20ca4.kxcdn.com/teamImages%2FMFF%2Flo70qypl-mff.png?width=100',
        'AIK': 'https://data-20ca4.kxcdn.com/teamImages%2FAIK%2Flo739j5e-aik.png?width=100',
        'Djurgården': 'https://data-20ca4.kxcdn.com/teamImages%2FDIF%2Flo70oyre-dif.png?width=100',
        'Hammarby': 'https://data-20ca4.kxcdn.com/teamImages%2FHAM%2Flo70p0y7-ham.png?width=100',
        'BK Häcken': 'https://data-20ca4.kxcdn.com/teamImages%2FBKH%2Flo70ljkw-bkh.png?width=100',
        'GAIS': 'https://data-20ca4.kxcdn.com/teamImages%2FGAI%2Flf89l5m3-GAIS_emblem.png?width=100',
        'IFK Göteborg': 'https://data-20ca4.kxcdn.com/teamImages%2FIFK%2Flo70p4u3-ifk.png?width=100',
        'Degerfors IF': 'https://data-20ca4.kxcdn.com/teamImages%2FDEIF%2Flo70mdul-deif.png?width=100',
        'Degerfors': 'https://data-20ca4.kxcdn.com/teamImages%2FDEIF%2Flo70mdul-deif.png?width=100',
        'Västerås SK': 'https://data-20ca4.kxcdn.com/teamImages%2FVSK%2Flf89m083-VSK_emblem.png?width=100',
        'Kalmar FF': 'https://data-20ca4.kxcdn.com/teamImages%2FKFF%2Flo70p880-kff.png?width=100',
        'Kalmar': 'https://data-20ca4.kxcdn.com/teamImages%2FKFF%2Flo70p880-kff.png?width=100',
        'Champions League': 'https://upload.wikimedia.org/wikipedia/commons/f/f3/Logo_UEFA_Champions_League.png',
        'Conference League': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTNrFv0oLweCA6oSLIWMaA5_aQIufqZgVprsA&s',
        'Europa League': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/UEFA_Europa_League_logo_%282024_version%29.svg/1920px-UEFA_Europa_League_logo_%282024_version%29.svg.png',
        'FIFA World Cup': 'https://upload.wikimedia.org/wikipedia/en/1/17/2026_FIFA_World_Cup_emblem.svg'
    };
    return logos[teamName] || null;
};
