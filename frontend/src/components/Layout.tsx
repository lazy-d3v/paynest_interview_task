import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface LayoutProps {
  isConnected: boolean;
  children?: React.ReactNode;
}

export default function Layout({ isConnected, children }: LayoutProps) {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="layout">
      <header className="header">
        <Link to="/" className="header-logo">
          <div className="header-logo-icon">⚡</div>
          <div className="header-logo-text">
            Pay<span>Nest</span> Bidding
          </div>
        </Link>
        <nav className="header-nav">
          <div className="header-status">
            <div
              className="header-status-dot"
              style={{
                background: isConnected ? 'var(--accent-success)' : 'var(--accent-danger)',
              }}
            />
            {isConnected ? 'Live' : 'Connecting...'}
          </div>
          {isAuthenticated && user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '1rem', paddingLeft: '1rem', borderLeft: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div className="bidder-avatar" style={{ width: '28px', height: '28px', fontSize: '0.9rem' }}>
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 500 }}>
                  {user.username}
                </span>
              </div>
              <button 
                onClick={handleLogout}
                className="btn btn-secondary" 
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
              >
                Logout
              </button>
            </div>
          )}
        </nav>
      </header>
      <main className="main-content">
        {children || <Outlet />}
      </main>
    </div>
  );
}
