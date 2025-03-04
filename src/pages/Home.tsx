import React, { useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import './Home.css';

import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';

const Home: React.FC = () => {
  const navigate = useNavigate();

  // Disable scrolling on Home page by adding a class to body
  useEffect(() => {
    document.body.classList.add("home-page-body");
    return () => {
      document.body.classList.remove("home-page-body");
    };
  }, []);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        // Successfully signed out. Redirect to Login page.
        navigate('/');
      })
      .catch((error) => {
        console.error("Error signing out:", error);
        // Optionally, show an error message to the user.
      });
  };

  return (
    <div className="app-container">
      <nav className="sidebar">
        <ul>
          <li>
            <NavLink
              to="Dashboard"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <div className="nav-item">
                <img src="src/assets/dashboard.png" alt="Dashboard Icon" className="icon" />
                <span className="nav-text">Dashboard</span>
              </div>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="Patients"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <div className="nav-item">
                <img src="src/assets/user.png" alt="Patients Icon" className="icon" />
                <span className="nav-text">Patients</span>
              </div>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/PatientGaitAnalysis"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <div className="nav-item">
                <img src="src/assets/stats.png" alt="Data Icon" className="icon" />
                <span className="nav-text">Data Visualization</span>
              </div>
            </NavLink>
          </li>
          {/* Push the logout button to the bottom */}
          <li className="logout-item">
            <button onClick={handleLogout} className="logout-button">
              <div className="nav-item">
                <img src="src/assets/logout.png" alt="Logout Icon" className="icon" />
                <span className="nav-text">Logout</span>
              </div>
            </button>
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
