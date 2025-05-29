import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import '../styles/DashboardStyles.css';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/signin');
  };

  return (
    <>
      <div className="dashboard-background"></div>
      <div className="dashboard-container">
        <nav className="dashboard-navbar">
          <div className="dashboard-logo">Dashboard</div>
          <button className="dashboard-logout" onClick={handleLogout}>
            Logout
          </button>
        </nav>
        <div className="dashboard-content">
          <div className="dashboard-cards">
            <div className="dashboard-card dashboard-card-new" onClick={() => navigate('/new-bill')} style={{cursor: 'pointer'}}>
              <div className="dashboard-card-logo dashboard-card-logo-new">
                {/* Bill/plus SVG */}
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="8" y="8" width="32" height="32" rx="8" fill="#667eea" fillOpacity="0.15"/>
                  <rect x="16" y="16" width="16" height="16" rx="4" fill="#667eea"/>
                  <path d="M24 19v6m0 0v-6m0 6h6m-6 0h-6" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3>New Bill</h3>
              <p>Create and add a new bill to your records.</p>
            </div>
            <div className="dashboard-card dashboard-card-saved" onClick={() => navigate('/saved-bills')} style={{cursor: 'pointer'}}>
              <div className="dashboard-card-logo dashboard-card-logo-saved">
                {/* Folder SVG */}
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="8" y="16" width="32" height="20" rx="6" fill="#38a169" fillOpacity="0.15"/>
                  <rect x="12" y="20" width="24" height="12" rx="3" fill="#38a169"/>
                  <path d="M12 20l4-6h16l4 6" stroke="#fff" strokeWidth="2" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Saved Bills</h3>
              <p>View and manage all your saved bills.</p>
            </div>
            <div className="dashboard-card dashboard-card-expenditure" onClick={() => navigate('/my-data')} style={{cursor: 'pointer'}}>
              <div className="dashboard-card-logo dashboard-card-logo-expenditure">
                {/* Pie chart SVG */}
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="24" cy="24" r="16" fill="#e53e3e" fillOpacity="0.15"/>
                  <path d="M24 24L24 12A12 12 0 1 1 12 24h12z" fill="#e53e3e"/>
                  <path d="M24 24L36 24" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3>My Data</h3>
              <p>Track your total spending and analyze your expenses.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard; 