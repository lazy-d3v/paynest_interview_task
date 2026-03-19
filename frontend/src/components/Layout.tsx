import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, Gavel } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface LayoutProps {
  children: React.ReactNode;
  isConnected?: boolean;
}

export default function Layout({ children, isConnected }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 selection:bg-white selection:text-black font-sans">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-white/3 blur-[100px] rounded-full" />
      </div>

      <header className="sticky top-0 z-50 w-full glass-panel border-b-white/5">
        <div className="container flex h-20 items-center justify-between">
          <div className="flex items-center gap-12">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="p-2 bg-white text-black rounded-none transition-transform group-hover:rotate-12 duration-500">
                <Gavel className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-[0.3em] uppercase leading-none glow-text">BIDMASTER</span>
                <span className="text-xs font-bold text-zinc-400 tracking-[0.1em] mt-1">EST. 2026</span>
              </div>
              {isConnected !== undefined && (
                <div
                  className={`h-1.5 w-1.5 rounded-full ml-4 ${isConnected ? 'bg-zinc-100 shadow-[0_0_10px_white]' : 'bg-red-500 shadow-[0_0_10px_red]'}`}
                  title={isConnected ? 'Real-time Sync Active' : 'Disconnected'}
                />
              )}
            </Link>
          </div>

          <div className="flex items-center gap-8">
            {user ? (
              <>
                <nav className="hidden md:flex items-center gap-8">
                  <Link
                    to="/"
                    className="text-xs font-black uppercase tracking-[0.2em] text-zinc-300 hover:text-white transition-colors"
                  >
                    COLLECTION
                  </Link>
                </nav>

                <div className="h-8 w-[1px] bg-zinc-800 mx-2" />

                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Collector</span>
                    <span className="text-sm font-black text-zinc-100 uppercase">{user.username}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="text-zinc-500 hover:text-white hover:bg-white/5"
                    title="Sign Out"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              </>
            ) : (
              !isLoginPage && (
                <div className="flex gap-6 items-center">
                  <Link to="/login" className="text-xs font-black uppercase tracking-[0.2em] text-zinc-100 hover:underline transition-colors">
                    LOGIN TO ACCESS VAULT
                  </Link>
                </div>
              )
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10 container py-12 md:py-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        {children}
      </main>

      <footer className="relative z-10 border-t border-zinc-900 py-12">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start space-y-2">
            <span className="text-xl font-black tracking-[0.3em] uppercase opacity-30">BIDMASTER</span>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-400 font-bold">
              High-Fidelity Realtime Auctions
            </p>
          </div>
          <div className="flex gap-8 text-xs font-bold text-zinc-400 uppercase tracking-widest">
            <span>© 2026 All Rights Reserved</span>
            <span className="hover:text-zinc-100 cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-zinc-300 cursor-pointer transition-colors">Terms</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
