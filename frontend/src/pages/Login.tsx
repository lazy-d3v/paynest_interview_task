import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Lock, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    try {
      const data = await api.login({ email, password });
      login(data);
      toast.success(`Welcome back, ${data.user.username}!`);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error.message || 'Access denied. Verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="w-full max-w-[440px] space-y-12">
        {/* Branding/Header Section */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="h-16 w-16 bg-white text-black flex items-center justify-center mb-2 shadow-[0_0_40px_rgba(255,255,255,0.15)]">
            <Lock className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-[0.2em] uppercase glow-text">Access Club</h1>
            <p className="text-xs font-bold text-zinc-400 tracking-[0.3em] uppercase">Authorized Personnel Only</p>
          </div>
        </div>

        <Card className="border-zinc-800 bg-zinc-950/20 backdrop-blur-md border-x-0 sm:border-x rounded-none shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-500 to-transparent opacity-30" />
          
          <form onSubmit={handleSubmit}>
            <CardContent className="p-8 sm:p-10 space-y-8">
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-xs font-black uppercase tracking-[0.2em] text-zinc-300">Collector Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="IDENTIFIER@DOMAIN.COM"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 bg-zinc-900/30 border-zinc-800 rounded-none text-white placeholder:text-zinc-700 focus-visible:ring-zinc-600 font-mono text-xs tracking-wider"
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-xs font-black uppercase tracking-[0.2em] text-zinc-300">Security Key</Label>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 bg-zinc-900/30 border-zinc-800 rounded-none text-white focus-visible:ring-zinc-600 tracking-[0.5em]"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-14 bg-white text-black hover:bg-zinc-200 transition-all duration-300 font-black text-xs uppercase tracking-[0.3em] rounded-none group"
                disabled={loading || !email || !password}
              >
                {loading ? 'Processing...' : (
                  <span className="flex items-center gap-2">
                    Enter Vault <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                )}
              </Button>
            </CardContent>
          </form>
        </Card>

      </div>
    </div>
  );
}
