
import React, { useState } from 'react';
import { useOlympicsData } from './hooks/useOlympicsData';
import SokSchedule from './components/SokSchedule';
import VMPlayoff from './components/VMPlayoff';
import LACountdown from './components/LACountdown';
import MedalTable from './components/MedalTable';
import Header from './components/Header';
import TabBar from './components/TabBar';

const SHOW_COUNTDOWN_FROM = new Date('2026-02-22T00:00:00');

function App() {
  const { sokSchedule, medals, loading, error } = useOlympicsData();
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
    <div className="app-container" style={{ paddingBottom: '120px' }}>
      <div key={activeTab} className="animate-fade-in">
        {activeTab === 'os' ? (
          <>
            <Header />
            <MedalTable data={medals} />
            {new Date() >= SHOW_COUNTDOWN_FROM && <LACountdown />}
          </>
        ) : (
          <VMPlayoff />
        )}
      </div>
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default App;
