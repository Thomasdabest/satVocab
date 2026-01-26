import React, { useState } from 'react';
import { User } from '../types';

interface LoginViewProps {
  onLogin: (user: User) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Robust email validation regex
  const isValidEmail = (emailStr: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
  };

  const normalizeEmail = (value: string) => value.trim().toLowerCase();
  const normalizeName = (value: string) => value.trim();

  const loadUsers = (): User[] => {
    const usersJson = localStorage.getItem('vocab_app_users');
    if (!usersJson) return [];
    try {
      const parsed = JSON.parse(usersJson);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const persistUsers = (users: User[]) => {
    localStorage.setItem('vocab_app_users', JSON.stringify(users));
  };

  const hashPassword = async (value: string) => {
    if (!window.crypto?.subtle) return null;
    const encoder = new TextEncoder();
    const data = encoder.encode(value);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Basic format validation
    const normalizedEmail = normalizeEmail(email);
    const normalizedPassword = password.trim();
    const normalizedName = normalizeName(name);

    if (!isValidEmail(normalizedEmail)) {
      setError("Please enter a valid email address (e.g., name@example.com).");
      setIsSubmitting(false);
      return;
    }

    if (normalizedPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      setIsSubmitting(false);
      return;
    }

    // Get current users from "Database"
    const users = loadUsers();

    if (isLoginMode) {
      // Login logic: Search existing list
      const user = users.find(u => u.email.toLowerCase() === normalizedEmail);
      if (!user) {
        setError("Invalid email or password. Please try again.");
        setIsSubmitting(false);
        return;
      }

      let inputHash: string | null = null;
      if (user.passwordHash) {
        inputHash = await hashPassword(normalizedPassword);
        if (!inputHash) {
          setError("Your browser doesn't support secure password verification. Please update your browser.");
          setIsSubmitting(false);
          return;
        }
      }

      const matches =
        (user.passwordHash && inputHash && user.passwordHash === inputHash) ||
        (!user.passwordHash && user.password === normalizedPassword);

      if (!matches) {
        setError("Invalid email or password. Please try again.");
        setIsSubmitting(false);
        return;
      }

      const sanitizedUser: User = {
        ...user,
        email: normalizedEmail,
        name: user.name?.trim() || 'Scholar',
        savedWords: Array.isArray(user.savedWords) ? user.savedWords : [],
        password: undefined,
        passwordHash: undefined
      };

      if (!user.passwordHash) {
        const passwordHash = await hashPassword(normalizedPassword);
        if (!passwordHash) {
          onLogin(sanitizedUser);
          setIsSubmitting(false);
          return;
        }
        const updatedUsers = users.map(u =>
          u.email.toLowerCase() === normalizedEmail
            ? { ...u, passwordHash, password: undefined }
            : u
        );
        persistUsers(updatedUsers);
      }

      onLogin(sanitizedUser);
    } else {
      // Sign up logic: Protect against duplicates and preserve existing accounts
      if (users.some(u => u.email.toLowerCase() === normalizedEmail)) {
        setError("This email is already registered. Please login instead.");
        setIsSubmitting(false);
        return;
      }

      if (!normalizedName) {
        setError("Please enter your full name.");
        setIsSubmitting(false);
        return;
      }

      const passwordHash = await hashPassword(normalizedPassword);
      if (!passwordHash) {
        setError("Your browser doesn't support secure password storage. Please update your browser.");
        setIsSubmitting(false);
        return;
      }

      const newUser: User = {
        name: normalizedName,
        email: normalizedEmail,
        passwordHash,
        savedWords: []
      };

      // Append new user to the existing array to ensure no one is deleted
      const updatedUsers = [...users, newUser];
      persistUsers(updatedUsers);
      onLogin({ ...newUser, passwordHash: undefined });
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-5xl w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-100">
        
        {/* Left Side: Brand/Marketing */}
        <div className="md:w-1/2 bg-indigo-600 p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-50 rounded-full opacity-50 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-indigo-400 rounded-full opacity-30 blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 font-black text-2xl shadow-xl">F</div>
              <span className="text-2xl font-black tracking-tight">Fun 2 Learn</span>
            </div>
            
            <h2 className="text-4xl font-black mb-6 leading-tight">
              Join the world's most <span className="text-indigo-200">visual</span> way to study for the SAT.
            </h2>
            
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <div className="mt-1 bg-indigo-500/50 p-1 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                </div>
                <div>
                  <h4 className="font-bold text-lg">Persistent Progress</h4>
                  <p className="text-indigo-100 text-sm">Your saved words are stored locally on this device.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="mt-1 bg-indigo-500/50 p-1 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                </div>
                <div>
                  <h4 className="font-bold text-lg">AI-Powered Visuals</h4>
                  <p className="text-indigo-100 text-sm">Custom mnemonics generated for every single word.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="md:w-1/2 p-12 lg:p-16 flex flex-col justify-center">
          <div className="mb-10">
            <div className="flex p-1 bg-slate-100 rounded-2xl mb-8 w-fit">
              <button 
                onClick={() => { setIsLoginMode(true); setError(null); }}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${isLoginMode ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Log In
              </button>
              <button 
                onClick={() => { setIsLoginMode(false); setError(null); }}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${!isLoginMode ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Sign Up
              </button>
            </div>
            
            <h1 className="text-3xl font-black text-slate-800 mb-2">
              {isLoginMode ? 'Welcome back' : 'Create an account'}
            </h1>
            <p className="text-slate-500">
              {isLoginMode ? 'Enter your details to access your study deck.' : 'Join 22,000+ students and start your journey today.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 text-sm font-bold rounded-2xl animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLoginMode && (
              <div className="view-enter">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </span>
                <input 
                  type="text" 
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 focus:border-indigo-400 focus:bg-white focus:outline-none transition-all font-medium"
                  placeholder="Your Name"
                />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </span>
                <input 
                  type="email" 
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 focus:border-indigo-400 focus:bg-white focus:outline-none transition-all font-medium"
                  placeholder="hello@example.com"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2 ml-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Password</label>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </span>
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  autoComplete={isLoginMode ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-12 focus:border-indigo-400 focus:bg-white focus:outline-none transition-all font-medium"
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.025 10.025 0 014.132-5.411m0 0L21 21" /></svg>
                  )}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 text-white py-5 rounded-[1.5rem] font-black text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-[0.98] mt-4"
            >
              {isSubmitting ? 'Please wait…' : isLoginMode ? 'Sign In' : 'Create Free Account'}
            </button>
          </form>

          <div className="mt-8 text-center space-y-6">
            <p className="text-xs text-slate-400 font-medium px-8 leading-relaxed">
              Account data is stored locally in your browser on this device. It will persist unless you clear your browser storage.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }
      `}</style>
    </div>
  );
};

export default LoginView;
