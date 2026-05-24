import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import VMKollen from './components/VMKollen';
import AllsvenskanKollen from './components/AllsvenskanKollen';

import PullToRefresh from './components/common/PullToRefresh';

function App() {
  return (
    <PullToRefresh>
        <div className="app-container">
          <main>
            <Routes>
              <Route path="/vm" element={<VMKollen />} />
              <Route path="/allsvenskan" element={<AllsvenskanKollen />} />
              <Route path="/" element={<Navigate to="/vm" replace />} />
            </Routes>
          </main>
        </div>
    </PullToRefresh>
  );
}

export default App;
