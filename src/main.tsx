// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import PatientGaitAnalysis from './pages/PatientGaitAnalysis';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          {/* Redirect the root path to /Home */}
          <Route index element={<Navigate to="Home" replace />} />
          <Route path="PatientGaitAnalysis" element={<PatientGaitAnalysis />} />
          <Route path="Home" element={<Home />}>
            <Route path="Dashboard" element={<Dashboard />} />
            <Route path="Patients" element={<Patients />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
