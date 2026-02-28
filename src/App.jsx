
import React, { useState } from 'react';
import { useOlympicsData } from './hooks/useOlympicsData';
import SokSchedule from './components/SokSchedule';
import VMKollen from './components/VMKollen';
import LACountdown from './components/LACountdown';
import MedalTable from './components/MedalTable';
import Header from './components/Header';
import TabBar from './components/TabBar';
import SiriusKollen from './components/SiriusKollen';

const SHOW_COUNTDOWN_FROM = new Date('2026-02-22T00:00:00');

function App() {
  const { sokSchedule, medals, loading, error } = useOlympicsData();
  const [activeTab, setActiveTab] = useState('vm');

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

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
          <div style={{ padding: '0 10px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <Header style={{ marginBottom: '0' }} />
            <MedalTable data={medals} />
            {new Date() >= SHOW_COUNTDOWN_FROM && <LACountdown />}
          </div>
        ) : activeTab === 'vm' ? (
          <VMKollen />
        ) : (
          <SiriusKollen />
        )}
      </div>
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default App;
