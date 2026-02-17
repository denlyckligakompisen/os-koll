import React, { useState, useEffect } from 'react';
import { fetchSokSchedule, fetchMedals, fetchSvtSchedule } from './services/olympicsApi';
import SokSchedule from './components/SokSchedule';

function App() {
  const [sokSchedule, setSokSchedule] = useState([]);
  const [svtSchedule, setSvtSchedule] = useState([]);
  const [medals, setMedals] = useState({ gold: 0, silver: 0, bronze: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [sokData, testSvtData, medalData] = await Promise.all([
          fetchSokSchedule(),
          fetchSvtSchedule(),
          fetchMedals()
        ]);
        setSokSchedule(sokData);
        setSvtSchedule(testSvtData);
        if (medalData) setMedals(medalData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);


  if (loading) {
    return (
      <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--color-text-muted)' }}>
        Laddar schema...
      </div>
    );
  }

  return (
    <div className="app-container">
      <header style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '24px',
        paddingTop: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', transform: 'translateY(-3px)' }}>
          <svg width="60" height="28" viewBox="0 0 110 50" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="18" r="16" fill="none" stroke="#0081C8" strokeWidth="4" />
            <circle cx="55" cy="18" r="16" fill="none" stroke="#000000" strokeWidth="4" />
            <circle cx="90" cy="18" r="16" fill="none" stroke="#EE334E" strokeWidth="4" />
            <circle cx="37.5" cy="34" r="16" fill="none" stroke="#FCB131" strokeWidth="4" />
            <circle cx="72.5" cy="34" r="16" fill="none" stroke="#00A651" strokeWidth="4" />
          </svg>
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800' }}>OS-kollen</h1>
          <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Vinter-OS 2026</p>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '8px' }}>
            <span title="Guld" style={{ fontSize: '1rem', fontWeight: 'bold', color: '#e0aa3e', display: 'flex', alignItems: 'center', gap: '4px' }}>
              🥇 {medals.gold}
            </span>
            <span title="Silver" style={{ fontSize: '1rem', fontWeight: 'bold', color: '#b6b6b6', display: 'flex', alignItems: 'center', gap: '4px' }}>
              🥈 {medals.silver}
            </span>
            <span title="Brons" style={{ fontSize: '1rem', fontWeight: 'bold', color: '#bf8970', display: 'flex', alignItems: 'center', gap: '4px' }}>
              🥉 {medals.bronze}
            </span>
          </div>
        </div>
      </header>

      {sokSchedule.length > 0 && (
        <SokSchedule events={sokSchedule} svtEvents={svtSchedule} />
      )}
    </div>
  );
}

export default App;
