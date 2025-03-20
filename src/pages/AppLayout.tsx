import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import './AppLayout.css';

// Import sidebar icons
import dashboardIcon from '../assets/dashboard.png';
import userIcon from '../assets/user.png';
import statsIcon from '../assets/stats.png';
import logoutIcon from '../assets/logout.png';

const AppLayout: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('User signed out successfully');
      navigate('/Login');
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Failed to log out. Please try again.');
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <nav className="sidebar">
        <ul>
          <li>
            <NavLink to="/Dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>
              <div className="nav-item">
                <img src={dashboardIcon} alt="Dashboard Icon" className="icon" />
                <span className="nav-text">Dashboard</span>
              </div>
            </NavLink>
          </li>
          <li>
            <NavLink to="/Patients" className={({ isActive }) => (isActive ? 'active' : '')}>
              <div className="nav-item">
                <img src={userIcon} alt="Patients Icon" className="icon" />
                <span className="nav-text">Patients</span>
              </div>
            </NavLink>
          </li>
          <li>
            <NavLink to="/PatientGaitAnalysis" className={({ isActive }) => (isActive ? 'active' : '')}>
              <div className="nav-item">
                <img src={statsIcon} alt="Data Icon" className="icon" />
                <span className="nav-text">Data Visualization</span>
              </div>
            </NavLink>
          </li>
          {/* Logout Button at Bottom */}
          <li className="logout-item">
            <button onClick={handleLogout} className="logout-button">
              <div className="nav-item">
                <img src={logoutIcon} alt="Logout Icon" className="icon" />
                <span className="nav-text">Logout</span>
              </div>
            </button>
          </li>
        </ul>
      </nav>

      {/* Main Content Area */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
