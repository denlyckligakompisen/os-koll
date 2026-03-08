
import React, { useState } from 'react';
import VMKollen from './components/VMKollen';
import TabBar from './components/TabBar';
import SiriusKollen from './components/SiriusKollen';

function App() {
  const [activeTab, setActiveTab] = useState('sirius');

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  return (
    <div className="app-container" style={{ paddingBottom: '120px' }}>
      <div key={activeTab} className="animate-fade-in">
        {activeTab === 'vm' ? (
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
