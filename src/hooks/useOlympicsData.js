
import { useState, useEffect } from 'react';
import { fetchSokSchedule, fetchMedals, fetchSvtSchedule } from '../services/olympicsApi';

export const useOlympicsData = () => {
    const [data, setData] = useState({
        sokSchedule: [],
        svtSchedule: [],
        medals: { gold: 0, silver: 0, bronze: 0 },
        loading: true,
        error: null
    });

    useEffect(() => {
        const loadAllData = async () => {
            try {
                const [sokData, svtData, medalData] = await Promise.all([
                    fetchSokSchedule(),
                    fetchSvtSchedule(),
                    fetchMedals()
                ]);

                setData({
                    sokSchedule: sokData || [],
                    svtSchedule: svtData || [],
                    medals: medalData || { gold: 0, silver: 0, bronze: 0 },
                    loading: false,
                    error: null
                });
            } catch (err) {
                console.error("Failed to fetch Olympics data:", err);
                setData(prev => ({ ...prev, loading: false, error: err }));
            }
        };

        loadAllData();
    }, []);

    return data;
};
