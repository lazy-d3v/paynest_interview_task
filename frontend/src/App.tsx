import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useSocket } from './hooks/useSocket';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AuctionDetail from './pages/AuctionDetail';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

import './index.css';

// Login route protector - don't show login if already authenticated
function AuthRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  const {
    isConnected,
    joinAuction,
    leaveAuction,
    onNewBid,
    onAuctionEnded,
  } = useSocket();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <Layout isConnected={isConnected}>
            <AuthRoute>
              <Login />
            </AuthRoute>
          </Layout>
        }
      />

      {/* Protected Routes inside Layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout isConnected={isConnected} />}>
          <Route path="/" element={<Dashboard />} />
          <Route
            path="/auction/:id"
            element={
              <AuctionDetail
                joinAuction={joinAuction}
                leaveAuction={leaveAuction}
                onNewBid={onNewBid}
                onAuctionEnded={onAuctionEnded}
              />
            }
          />
        </Route>
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1f2e',
              color: '#f1f5f9',
              border: '1px solid #1e293b',
              borderRadius: '12px',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#1a1f2e',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#1a1f2e',
              },
            },
          }}
        />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
