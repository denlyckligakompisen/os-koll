import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import VMKollen from './components/VMKollen';
import SiriusKollen from './components/SiriusKollen';

function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/vm" element={<VMKollen />} />
        <Route path="/sirius" element={<SiriusKollen />} />
        <Route path="/" element={<Navigate to="/vm" replace />} />
      </Routes>
    </div>
  );
}

export default App;
