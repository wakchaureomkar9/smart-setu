import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Home, Users, Phone, Info, LogIn, UserPlus } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const publicLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'About', path: '/about', icon: Info },
    { name: 'Contact', path: '/contact', icon: Phone },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-primary text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <span className="font-black text-white text-sm">SS</span>
            </div>
            <div className="hidden sm:block">
              <div className="font-bold text-white text-base leading-tight">Smart Setu</div>
              <div className="text-primary-300 text-xs">Portal</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {publicLinks.map(item => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150
                    ${isActive(item.path) ? 'bg-white/15 text-white' : 'text-primary-200 hover:bg-white/10 hover:text-white'}`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to={user.role === 'admin' ? '/admin' : '/dashboard'}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition-colors"
                >
                  <div className="w-6 h-6 bg-accent rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{user.name?.charAt(0).toUpperCase()}</span>
                  </div>
                  Dashboard
                </Link>
              </div>
            ) : (
              <>
                <Link to="/login" className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-primary-200 hover:bg-white/10 hover:text-white transition-colors">
                  <LogIn className="w-4 h-4" /> Login
                </Link>
                <Link to="/register" className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-accent hover:bg-accent-600 text-white transition-colors shadow-sm">
                  <UserPlus className="w-4 h-4" /> Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-primary-900 border-t border-white/10 px-4 pt-3 pb-4 space-y-1">
          {publicLinks.map(item => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                  ${isActive(item.path) ? 'bg-white/15 text-white' : 'text-primary-200 hover:bg-white/10 hover:text-white'}`}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
          <div className="border-t border-white/10 pt-3 mt-3 space-y-2">
            {user ? (
              <>
                <Link
                  to={user.role === 'admin' ? '/admin' : '/dashboard'}
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2.5 rounded-xl text-sm font-medium text-white bg-accent hover:bg-accent-600 text-center"
                >
                  Go to Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-300 hover:bg-red-500/20 text-left transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsOpen(false)} className="block px-3 py-2.5 rounded-xl text-sm font-medium text-primary-200 hover:bg-white/10 text-center">Login</Link>
                <Link to="/register" onClick={() => setIsOpen(false)} className="block px-3 py-2.5 rounded-xl text-sm font-semibold bg-accent text-white text-center">Register</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
