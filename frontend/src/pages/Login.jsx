import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Shield, Eye, EyeOff, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginMode, setLoginMode] = useState('citizen');
  const { login, logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const { success, user } = await login(email, password);
    setIsSubmitting(false);

    if (success && user) {
      if (loginMode === 'admin' && user.role !== 'admin') {
        logout();
        return;
      }
      if (loginMode === 'citizen' && user.role !== 'citizen') {
        logout();
        return;
      }
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    }
  };

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary rounded-2xl shadow-xl mb-4">
            <span className="font-black text-white text-lg">SS</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            {loginMode === 'admin' ? 'Admin Portal' : 'Welcome Back'}
          </h1>
          <p className="text-gray-500 mt-1 text-sm flex items-center justify-center gap-1.5">
            {loginMode === 'admin' && <Shield className="w-3.5 h-3.5 text-accent" />}
            {loginMode === 'admin' ? 'Secure login for administrators' : 'Sign in to your Smart Setu account'}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {/* Tab Toggle */}
          <div className="flex w-full mb-7 bg-gray-100 rounded-xl p-1">
            {['citizen', 'admin'].map(mode => (
              <button
                key={mode}
                type="button"
                onClick={() => setLoginMode(mode)}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 capitalize
                  ${loginMode === mode ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {mode === 'admin' ? '🛡 Admin Login' : '👤 Citizen Login'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label-text" htmlFor="email">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4.5 w-4.5 text-gray-400" style={{ width: '18px', height: '18px' }} />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  className="input-field pl-10"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label className="label-text" htmlFor="password">Password</label>
                <Link to="#" className="text-xs text-accent hover:underline font-medium">Forgot password?</Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="text-gray-400" style={{ width: '18px', height: '18px' }} />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="input-field pl-10 pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff style={{ width: '16px', height: '16px' }} /> : <Eye style={{ width: '16px', height: '16px' }} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full py-3 text-base mt-2"
            >
              {isSubmitting ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4 ml-1" /></>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-accent font-semibold hover:underline">
              Register here
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          By signing in, you agree to our{' '}
          <Link to="#" className="hover:underline">Terms of Service</Link> and{' '}
          <Link to="#" className="hover:underline">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
