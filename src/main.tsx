// src/main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import PatientGaitAnalysis from './pages/PatientGaitAnalysis';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Nesting PatientGaitAnalysis under App */}
        <Route path="/" element={<App />}>
          <Route path="PatientGaitAnalysis" element={<PatientGaitAnalysis />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
