
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
          transition: 'background 0.2s'
        }}
        onMouseOver={(e) => hasMedalists && (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.03)')}
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
          backgroundColor: 'var(--color-card-bg)',
          backdropFilter: 'blur(16px)',
          borderRadius: 'var(--radius-md)',
          border: 'var(--border)',
          padding: '16px',
          width: '280px',
          boxShadow: 'var(--shadow-hover)',
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
    marginBottom: '20px',
    paddingTop: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center'
  }}>
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '2px'
    }}>
      <svg width="42" height="20" viewBox="0 0 110 50" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.9 }}>
        <circle cx="20" cy="18" r="16" fill="none" stroke="black" strokeWidth="5" />
        <circle cx="55" cy="18" r="16" fill="none" stroke="black" strokeWidth="5" />
        <circle cx="90" cy="18" r="16" fill="none" stroke="black" strokeWidth="5" />
        <circle cx="37.5" cy="34" r="16" fill="none" stroke="black" strokeWidth="5" />
        <circle cx="72.5" cy="34" r="16" fill="none" stroke="black" strokeWidth="5" />
      </svg>
      <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '700', letterSpacing: '-0.04em' }}>OS-kollen</h1>
    </div>
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
      <MedalCounter medals={medals} />
    </div>
  </header>
);

const TabBar = ({ activeTab, onTabChange }) => (
  <nav style={{
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'saturate(180%) blur(20px)',
    WebkitBackdropFilter: 'saturate(180%) blur(20px)',
    borderTop: '0.5px solid rgba(0, 0, 0, 0.1)',
    display: 'flex',
    justifyContent: 'space-around',
    paddingTop: '8px',
    paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
    zIndex: 1000
  }}>
    {[
      { id: 'os', label: 'OS-kollen', icon: '🏅' },
      { id: 'vm', label: 'Vägen till VM', icon: '⚽' }
    ].map(tab => (
      <button
        key={tab.id}
        onClick={() => onTabChange(tab.id)}
        style={{
          background: 'none',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-text-muted)',
          cursor: 'pointer',
          flex: 1,
          transition: 'color 0.2s ease'
        }}
      >
        <span style={{ fontSize: '1.4rem' }}>{tab.icon}</span>
        <span style={{ fontSize: '0.65rem', fontWeight: '500' }}>{tab.label}</span>
      </button>
    ))}
  </nav>
);


function App() {
  const { sokSchedule, svtSchedule, medals, loading, error } = useOlympicsData();
  const [activeTab, setActiveTab] = useState('os');

  if (loading) {
    return (
      <div className="app-container" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        color: 'var(--color-text-muted)'
      }}>
        Laddar...
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
    <div className="app-container" style={{ paddingBottom: '80px' }}>
      {activeTab === 'os' ? (
        <>
          <Header medals={medals} />
          <SokSchedule events={sokSchedule} svtEvents={svtSchedule} />
        </>
      ) : (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '16px' }}>Vägen till VM</h2>
          <div style={{
            backgroundColor: 'var(--color-card-bg)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            border: 'var(--border)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
              Här kommer du snart se schemat för Sveriges väg till Fotbolls-VM.
              Information om kvalmatcher och förberedelser uppdateras löpande efter OS.
            </p>
            <div style={{ fontSize: '3rem', marginTop: '20px' }}>⚽🇸🇪</div>
          </div>
        </div>
      )}
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}



export default App;
