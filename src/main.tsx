// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './pages/AppLayout'; // New layout component
import PatientGaitAnalysis from './pages/PatientGaitAnalysis';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Login from './pages/Login';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Login Page (No Sidebar Here) */}
        <Route path="Login" element={<Login />} />
        <Route path="PatientGaitAnalysis" element={<PatientGaitAnalysis />} />

        {/* Everything else wrapped inside AppLayout (which includes the sidebar) */}
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="Dashboard" replace />} />
          <Route path="Dashboard" element={<Dashboard />} />
          <Route path="Patients" element={<Patients />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
