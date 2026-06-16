import React from 'react';

export const getLastName = (name) => {
    if (!name || typeof name !== 'string') {
        if (name && typeof name === 'object' && name.name) {
            name = name.name;
        } else {
            return '';
        }
    }
    const parts = name.trim().split(/\s+/);
    let lastName = parts.length <= 1 ? name : parts[parts.length - 1];

    if (parts.length > 2) {
        const lowerLast = lastName.toLowerCase().replace(/\./g, '');
        if (lowerLast === 'jr' || lowerLast === 'sr' || lowerLast === 'ii' || lowerLast === 'iii') {
            lastName = parts[parts.length - 2] + ' ' + lastName;
        }
    }

    // Convert to title case if the name is all uppercase
    if (lastName === lastName.toUpperCase() && lastName.match(/[A-ZÅÄÖ]/)) {
        lastName = lastName.split(/[- ]/).map(part => {
            if (!part) return part;
            return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
        }).join(lastName.includes('-') ? '-' : ' ');
    }

    return lastName;
};

export const getSortedScorers = (scorersList) => {
    if (!scorersList || !Array.isArray(scorersList)) return [];

    const parseMinute = (minStr) => {
        const timeStr = String(minStr || '0');
        const base = parseInt(timeStr.split('+')[0]);
        const extra = parseInt(timeStr.split('+')[1] || '0');
        return isNaN(base) ? 0 : base + (extra / 100);
    };

    return [...scorersList]
        .filter(s => s.incidentClass !== 'yellow-card')
        .sort((a, b) => parseMinute(a.minute || a.time) - parseMinute(b.minute || b.time));
};

export const getCombinedScorers = (homeScorers = [], awayScorers = []) => {
    const parseMinute = (minStr) => {
        if (!minStr) return 0;
        const base = parseInt(minStr.split('+')[0]);
        const extra = parseInt(minStr.split('+')[1] || '0');
        return isNaN(base) ? 0 : base + (extra / 100);
    };

    const homeWithTeam = (homeScorers || []).map(s => ({ ...s, team: 'home', minVal: parseMinute(s.minute) }));
    const awayWithTeam = (awayScorers || []).map(s => ({ ...s, team: 'away', minVal: parseMinute(s.minute) }));

    return [...homeWithTeam, ...awayWithTeam].sort((a, b) => a.minVal - b.minVal);
};

export const MONTH_MAP_LOCAL = {
    'jan': 0, 'januari': 0,
    'feb': 1, 'februari': 1,
    'mar': 2, 'mars': 2,
    'apr': 3, 'april': 3,
    'maj': 4,
    'jun': 5, 'juni': 5,
    'jul': 6, 'juli': 6,
    'aug': 7, 'augusti': 7,
    'sep': 8, 'september': 8,
    'okt': 9, 'oktober': 9,
    'nov': 10, 'november': 10,
    'dec': 11, 'december': 11
};

export const parseMatchDateLocal = (dateStr, timeStr) => {
    if (!dateStr) return new Date();
    const parts = dateStr.split(' ');

    let day, monthName, year;

    if (parts.length === 2) {
        day = parseInt(parts[0]);
        monthName = parts[1]?.toLowerCase();
        year = 2026;
    } else if (parts.length >= 3) {
        day = parseInt(parts[1]);
        monthName = parts[2]?.toLowerCase();
        year = parseInt(parts[3]) || 2026;
    } else {
        return new Date();
    }

    let hour = 0, minute = 0;
    if (timeStr && timeStr.includes(':')) {
        const [h, m] = timeStr.split(':').map(Number);
        hour = h;
        minute = m;
    }

    return new Date(year, MONTH_MAP_LOCAL[monthName] ?? 0, day, hour, minute);
};

export const cleanTeamName = (n) => {
    if (!n) return '';
    return n.replace(/\b(IF|FF|BK|AIF)\b/g, '').replace(/\s+/g, ' ').trim();
};

export const getPlayerEvents = (match, p, isHome) => {
    const events = [];
    if (!match || !p) return events;
    const sideStr = isHome ? 'home' : 'away';

    const teamScorers = match.scorers?.[sideStr] || [];
    const goals = teamScorers.filter(g => g.player?.name === p.name && (g.incidentClass === 'goal' || g.incidentClass === 'penalty-goal'));
    goals.forEach(() => events.push('⚽'));

    const teamBookings = match.bookings?.filter(b => b.side === sideStr) || [];
    const cards = teamBookings.filter(b => b.player?.name === p.name);
    cards.forEach(c => {
        if (c.card === 'yellow') events.push('🟨');
        if (c.card === 'red') events.push('🟥');
    });

    const teamSubs = match.substitutions?.filter(s => s.side === sideStr) || [];
    if (teamSubs.find(s => s.playerOff === p.name)) {
        events.push(
            <div aria-hidden="true" style={{ backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: '50%', padding: '1px', display: 'flex' }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#e53935" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <polyline points="19 12 12 19 5 12"></polyline>
                </svg>
            </div>
        );
    }
    if (teamSubs.find(s => s.playerOn === p.name)) {
        events.push(
            <div aria-hidden="true" style={{ backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: '50%', padding: '1px', display: 'flex' }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="19" x2="12" y2="5"></line>
                    <polyline points="5 12 12 5 19 12"></polyline>
                </svg>
            </div>
        );
    }

    return events;
};

export const formatLiveTime = (timeStr, period) => {
    if (period === 4) return 'Halvtid';

    if (!timeStr) return 'LIVE';
    const str = String(timeStr).trim();
    if (str === 'HT' || str === 'Halvtid') return 'Halvtid';
    if (str === 'FT' || str === 'Fulltid' || str === 'Finished') return 'SLUT';

    if (str.includes('+')) {
        return str.endsWith("'") ? str : `${str}'`;
    }

    const cleanStr = str.replace(/'/g, '');
    const min = parseInt(cleanStr, 10);
    if (!isNaN(min)) {
        if ((period === 3 || period === 1) && min >= 45) {
            return `45+${min - 45 + 1}'`;
        }
        if ((period === 5 || period === 2) && min >= 90) {
            return `90+${min - 90 + 1}'`;
        }
        return `${min + 1}'`;
    }

    return str;
};
