
import React, { useState } from 'react';
import { useOlympicsData } from './hooks/useOlympicsData';
import SokSchedule from './components/SokSchedule/SokSchedule';
import { ChevronDown, ChevronUp } from 'lucide-react';

const MedalCounter = ({ medals }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasMedalists = medals.medalists && medals.medalists.length > 0;

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => hasMedalists && setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          marginTop: '8px',
          background: 'none',
          border: 'none',
          padding: '4px 8px',
          borderRadius: '8px',
          cursor: hasMedalists ? 'pointer' : 'default',
          transition: 'background 0.2s',
          marginLeft: '-8px'
        }}
        onMouseOver={(e) => hasMedalists && (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)')}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
      >
        <span title="Guld" style={{ fontSize: '1rem', fontWeight: 'bold', color: '#e0aa3e', display: 'flex', alignItems: 'center', gap: '4px' }}>
          🥇 {medals.gold}
        </span>
        <span title="Silver" style={{ fontSize: '1rem', fontWeight: 'bold', color: '#b6b6b6', display: 'flex', alignItems: 'center', gap: '4px' }}>
          🥈 {medals.silver}
        </span>
        <span title="Brons" style={{ fontSize: '1rem', fontWeight: 'bold', color: '#bf8970', display: 'flex', alignItems: 'center', gap: '4px' }}>
          🥉 {medals.bronze}
        </span>
        {hasMedalists && (isOpen ? <ChevronUp size={16} color="var(--color-text-muted)" /> : <ChevronDown size={16} color="var(--color-text-muted)" />)}
      </button>

      {isOpen && hasMedalists && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          zIndex: 100,
          marginTop: '8px',
          backgroundColor: 'rgba(30, 41, 59, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '12px',
          width: '280px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          // Simple fade in animation via standard css if available, or just inline
          opacity: 1,
          transition: 'opacity 0.2s ease-out'
        }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Svenska Medaljörer</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
            {medals.medalists.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'start' }}>
                <span style={{ fontSize: '1.1rem' }}>{m.type === 'gold' ? '🥇' : (m.type === 'silver' ? '🥈' : '🥉')}</span>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{m.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{m.event}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

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
        <circle cx="20" cy="18" r="16" fill="none" stroke="white" strokeWidth="4" />
        <circle cx="55" cy="18" r="16" fill="none" stroke="white" strokeWidth="4" />
        <circle cx="90" cy="18" r="16" fill="none" stroke="white" strokeWidth="4" />
        <circle cx="37.5" cy="34" r="16" fill="none" stroke="white" strokeWidth="4" />
        <circle cx="72.5" cy="34" r="16" fill="none" stroke="white" strokeWidth="4" />
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
