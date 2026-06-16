import { useState, useEffect } from 'react';
import { parseMatchDateLocal } from '../components/MatchCard/utils.jsx';

export const useMatchStatus = (match, variant) => {
    const [timeLeftStr, setTimeLeftStr] = useState(null);

    const getComputedStatus = () => {
        if (match.status === 'finished') return 'finished';
        if (match.status === 'postponed') return 'postponed';
        if (match.status === 'live') return 'live';

        if (match.status === 'upcoming' && match.startTimestamp) {
            const startMs = match.startTimestamp * 1000;
            const now = Date.now();
            if (now >= startMs) {
                const durationMs = 125 * 60 * 1000; // 125 mins
                if (now >= startMs + durationMs) return 'finished';
            }
        }
        return 'upcoming';
    };

    const computedStatus = getComputedStatus();

    const getIsSoon = () => {
        if (computedStatus !== 'upcoming') return false;
        const startMs = match.startTimestamp ? match.startTimestamp * 1000 : parseMatchDateLocal(match.date, match.time).getTime();
        const timeUntilStart = startMs - Date.now();
        return timeUntilStart > 0 && timeUntilStart <= 30 * 60 * 1000;
    };
    const isSoon = getIsSoon();

    const getIsOverdue = () => {
        if (computedStatus !== 'upcoming') return false;
        const startMs = match.startTimestamp ? match.startTimestamp * 1000 : parseMatchDateLocal(match.date, match.time).getTime();
        return Date.now() >= startMs;
    };
    const isOverdue = getIsOverdue();

    const getLiveProgress = () => {
        if (computedStatus !== 'live') return 0;
        const timeStr = match.liveCurrentTime;
        if (match.period === 4) return 50; // 50%
        if (!timeStr) return 0;
        if (timeStr === 'HT' || timeStr === 'Halvtid') return 50; // 50%
        if (timeStr === 'FT' || timeStr === 'Fulltid') return 100; // 100%
        const base = parseInt(String(timeStr).split('+')[0]);
        if (isNaN(base)) return 0;
        let percentage = Math.min(base / 90, 1.0);
        return percentage * 100;
    };

    const liveProgressPercent = getLiveProgress();

    useEffect(() => {
        if (variant !== 'hero' || computedStatus !== 'upcoming') {
            setTimeLeftStr(null);
            return;
        }

        const updateTimer = () => {
            const matchDateLocal = parseMatchDateLocal(match.date, match.time);
            const diff = matchDateLocal.getTime() - Date.now();
            if (diff > 0) {
                const totalSecs = Math.floor(diff / 1000);
                const h = Math.floor(totalSecs / 3600);
                const m = Math.floor((totalSecs % 3600) / 60);
                const s = totalSecs % 60;
                if (h > 0) {
                    setTimeLeftStr(null);
                } else {
                    setTimeLeftStr(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
                }
            } else {
                setTimeLeftStr('00:00');
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [variant, computedStatus, match.date, match.time]);

    return {
        computedStatus,
        isSoon,
        isOverdue,
        liveProgressPercent,
        timeLeftStr
    };
};
