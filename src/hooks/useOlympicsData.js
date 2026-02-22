
import { useState, useEffect, useCallback } from 'react';
import { fetchSokSchedule, fetchMedals } from '../services/olympicsApi';

const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export const useOlympicsData = () => {
    const [data, setData] = useState({
        sokSchedule: [],
        medals: { top10: [] },
        loading: true,
        error: null
    });

    const loadAllData = useCallback(async () => {
        try {
            const [sokData, medalData] = await Promise.all([
                fetchSokSchedule(),
                fetchMedals()
            ]);

            setData({
                sokSchedule: sokData || [],
                medals: medalData || { top10: [] },
                loading: false,
                error: null
            });
        } catch (err) {
            console.error("Failed to fetch Olympics data:", err);
            setData(prev => ({ ...prev, loading: false, error: err }));
        }
    }, []);

    useEffect(() => {
        // Initial load
        loadAllData();

        // Periodic refresh every 5 minutes
        const interval = setInterval(loadAllData, REFRESH_INTERVAL_MS);

        // Refresh immediately when user returns to the tab
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                loadAllData();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [loadAllData]);

    return data;
};
