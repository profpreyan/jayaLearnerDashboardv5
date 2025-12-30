import React, { useState } from 'react';

interface LoginProps {
  onLogin: (name: string, passcode: string) => Promise<boolean>;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [passcode, setPasscode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await onLogin(name, passcode);
      if (!success) {
        setError('Access Denied: Invalid Identity or Passcode.');
      }
    } catch (err) {
      setError('Connection Error: Unable to verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#050505]">
      {/* Background Ambience */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-accent/10 rounded-full blur-[150px] opacity-40 animate-pulse"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[150px] opacity-30"></div>

      <div className="relative z-10 w-full max-w-md px-6 animate-slide-up">
        <div className="glass-panel p-8 rounded-2xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 border border-accent/20 mb-4 shadow-[0_0_15px_rgba(220,38,38,0.3)]">
              <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Login</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-gray-400 font-bold ml-1">Student Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your registered name"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-gray-400 font-bold ml-1">Access Code</label>
              <input 
                type="password" 
                value={passcode}
                onChange={(e) => setPasscode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="••••"
                maxLength={4}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all font-mono tracking-widest text-center text-lg"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-xs text-center font-mono">{error}</p>
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading || name.length < 3 || passcode.length !== 4}
              className="w-full py-4 rounded-xl bg-accent text-white font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] hover:bg-accent-hover transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Verifying...
                </span>
              ) : (
                "Enter Mission Control"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};