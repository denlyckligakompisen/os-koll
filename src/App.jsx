
import React from 'react';
import { useOlympicsData } from './hooks/useOlympicsData';
import SokSchedule from './components/SokSchedule/SokSchedule';

const MedalCounter = ({ medals }) => (
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
);

const Header = ({ medals }) => (
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
      <MedalCounter medals={medals} />
    </div>
  </header>
);

function App() {
  const { sokSchedule, svtSchedule, medals, loading, error } = useOlympicsData();

  if (loading) {
    return (
      <div className="app-container" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        color: 'var(--color-text-muted)'
      }}>
        Laddar schema...
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container" style={{ color: '#ef4444', textAlign: 'center', padding: '2rem' }}>
        Kunde inte hämta data. Försök igen senare.
      </div>
    );
  }

  return (
    <div className="app-container">
      <Header medals={medals} />
      <SokSchedule events={sokSchedule} svtEvents={svtSchedule} />
    </div>
  );
}

export default App;
