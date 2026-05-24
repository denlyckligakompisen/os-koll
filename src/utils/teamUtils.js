export const cleanTeamNameForDisplay = (name) => {
    if (!name) return '';
    let cleaned = name.trim();
    
    // Explicit clean mapping for known teams
    if (cleaned === 'Djurgårdens IF') return 'Djurgården';
    if (cleaned === 'Hammarby IF') return 'Hammarby';
    if (cleaned === 'Malmö FF') return 'Malmö';
    if (cleaned === 'IK Sirius') return 'Sirius';
    if (cleaned === 'BK Häcken') return 'Häcken';
    if (cleaned === 'Halmstads BK') return 'Halmstad';
    if (cleaned === 'Kalmar FF') return 'Kalmar';
    if (cleaned === 'Mjällby AIF') return 'Mjällby';
    if (cleaned === 'Västerås SK') return 'Västerås';
    if (cleaned === 'IFK Göteborg') return 'Göteborg';
    if (cleaned === 'IFK Norrköping') return 'Norrköping';
    if (cleaned === 'IFK Värnamo') return 'Värnamo';
    if (cleaned === 'IF Elfsborg') return 'Elfsborg';
    if (cleaned === 'IF Brommapojkarna') return 'BP';
    if (cleaned === 'Degerfors IF') return 'Degerfors';
    if (cleaned === 'Örgryte IS') return 'Örgryte';
    if (cleaned === 'Varbergs BoIS') return 'Varberg';
    if (cleaned === 'Landskrona BoIS') return 'Landskrona';
    if (cleaned === 'Trelleborgs FF') return 'Trelleborg';
    if (cleaned === 'Gefle IF') return 'Gefle';
    if (cleaned === 'IK Oddevold') return 'Oddevold';
    if (cleaned === 'Östers IF') return 'Öster';
    if (cleaned === 'Örebro SK') return 'Örebro';
    if (cleaned === 'Helsingborgs IF') return 'Helsingborg';
    if (cleaned === 'GIF Sundsvall') return 'Sundsvall';
    
    // Generic regex fallbacks
    cleaned = cleaned.replace(/^IFK\s+/i, '');
    cleaned = cleaned.replace(/^(BK|IK)\s+/i, '');
    cleaned = cleaned.replace(/\s+(IF|FF|BK|BoIS|IS|FK|IK|AIF|SK)\b/gi, '');
    
    return cleaned;
};
