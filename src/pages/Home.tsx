// src/pages/Home.tsx
import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import './Home.css';

const Home: React.FC = () => {
  return (
    <div className="app-container">
      <nav className="sidebar">
        <ul>
          <li>
            <NavLink to="Dashboard" className={({ isActive }) => isActive ? "active" : ""}>
              <div className="nav-item">
                <img src="src/assets/dashboard.png" alt="Dashboard Icon" className="icon" />
                <span className="nav-text">Dashboard</span>
              </div>
            </NavLink>
          </li>
          <li>
            <NavLink to="Patients" className={({ isActive }) => isActive ? "active" : ""}>
              <div className="nav-item">
                <img src="src/assets/user.png" alt="Patients Icon" className="icon" />
                <span className="nav-text">Patients</span>
              </div>
            </NavLink>
          </li>
        </ul>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Home;
