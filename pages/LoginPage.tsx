import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { ICONS } from '../constants';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@dfts.com');
  const [password, setPassword] = useState('password');
  const [showPassword, setShowPassword] = useState(false);
  const { setTokens, setUser, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { accessToken, refreshToken, user } = await api.login(email, password);
      setTokens(accessToken, refreshToken);
      setUser(user);
      navigate('/');
    } catch (err) {
      setError((err as Error).message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 px-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl">
          <div className="text-center">
              <h2 className="text-3xl font-bold text-teal-400">Welcome Back!</h2>
              <p className="mt-2 text-gray-400">Log in to access the Digital File Tracking System.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                required
                placeholder="e.g., admin@dfts.com"
              />
            </div>
            
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Password
              </label>
              <div className="relative mt-1">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                    required
                    placeholder="Enter any password"
                  />
                  <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-white rounded-r-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                      {showPassword ? <ICONS.VIEW_OFF className="h-5 w-5" /> : <ICONS.VIEW_ON className="h-5 w-5" />}
                  </button>
              </div>
               <p className="mt-2 text-xs text-gray-500">Hint: Use any email from the mock API and any password.</p>
            </div>

            {error && <p className="text-sm text-red-400 bg-red-900/50 p-3 rounded-md text-center">{error}</p>}
            
            <div>
              <Button type="submit" isLoading={loading} className="w-full text-base py-2.5">
                Sign In
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;