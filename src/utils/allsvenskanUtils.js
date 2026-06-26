export const formatTmDate = (dateStr) => {
    if (!dateStr || !dateStr.includes('/')) return dateStr;
    const parts = dateStr.split('/');
    if (parts.length !== 3) return dateStr;
    const [d, m, y] = parts;
    const months = ['jan', 'feb', 'mars', 'apr', 'maj', 'juni', 'juli', 'aug', 'sep', 'okt', 'nov', 'dec'];
    const monthName = months[parseInt(m, 10) - 1];
    return `${monthName} ${y}`;
};

export const convertValueToSek = (valueStr) => {
    if (!valueStr || valueStr === '-') return '-';
    const match = valueStr.match(/([\d.]+)([km]?)/i);
    if (!match) return valueStr;

    let num = parseFloat(match[1]);
    const suffix = match[2].toLowerCase();
    
    if (suffix === 'k') num *= 1000;
    else if (suffix === 'm') num *= 1000000;
    
    // Approximate EUR to SEK exchange rate (11.5)
    const sekValue = num * 11.5;
    
    return (sekValue / 1000000).toFixed(1).replace('.', ',') + ' mnkr';
};

export const getRawSekValue = (valueStr) => {
    if (!valueStr || valueStr === '-') return 0;
    const match = valueStr.match(/([\d.]+)([km]?)/i);
    if (!match) return 0;
    let num = parseFloat(match[1]);
    const suffix = match[2].toLowerCase();
    if (suffix === 'k') num *= 1000;
    else if (suffix === 'm') num *= 1000000;
    return num * 11.5;
};

export const TEAM_COLORS = {
    "AIK": { bg: "#000000", text: "#ffca28", label: "#ffffff" },
    "BK Häcken": { bg: "#ffd600", text: "#000000", label: "#000000" },
    "Djurgårdens IF": { bg: "#002d62", text: "#7bc3e5", label: "#ffffff" },
    "GAIS": { bg: "#006241", text: "#ffca28", label: "#ffffff" },
    "Halmstads BK": { bg: "#0054a6", text: "#ffd700", label: "#ffffff" },
    "Hammarby IF": { bg: "#007e4a", text: "#ffffff", label: "#ffffff" },
    "IF Brommapojkarna": { bg: "#d32f2f", text: "#000000", label: "#ffffff" },
    "IF Elfsborg": { bg: "#ffd200", text: "#000000", label: "#000000" },
    "IFK Göteborg": { bg: "#004b87", text: "#ffffff", label: "#ffffff" },
    "IK Sirius": { bg: "#004f9f", text: "#ffffff", label: "#ffffff" },
    "Kalmar FF": { bg: "#c2185b", text: "#ffffff", label: "#ffffff" },
    "Malmö FF": { bg: "#7bc3e5", text: "#004b87", label: "#1d2a44" },
    "Mjällby AIF": { bg: "#ff9900", text: "#000000", label: "#000000" },
    "Västerås SK": { bg: "#006338", text: "#ffffff", label: "#ffffff" },
    "Degerfors IF": { bg: "#e53935", text: "#ffffff", label: "#ffffff" },
    "Örgryte IS": { bg: "#aa1111", text: "#2196f3", label: "#ffffff" }
};

export const getHeaderStyle = (teamName) => {
    if (!teamName || !TEAM_COLORS[teamName]) {
        return {
            bg: "var(--color-glass-bg)",
            text: "var(--color-text)",
            inactiveText: "var(--color-text-muted)",
            activeLine: "var(--color-text)"
        };
    }
    const colors = TEAM_COLORS[teamName];
    const isLightBg = ["BK Häcken", "IF Elfsborg", "Malmö FF", "Mjällby AIF"].includes(teamName);
    return {
        bg: colors.bg + "e6", // 90% opacity to enable glassmorphism blur
        text: colors.label,
        inactiveText: isLightBg ? "rgba(0, 0, 0, 0.45)" : "rgba(255, 255, 255, 0.6)",
        activeLine: colors.text
    };
};
