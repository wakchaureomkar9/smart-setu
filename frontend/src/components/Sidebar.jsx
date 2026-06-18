import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, FileText, FileBadge, Vault, User, LogOut,
  Shield, ChevronLeft, ChevronRight, Menu, X, Settings,
  BookOpen, Users, Home, PieChart
} from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const citizenLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Schemes', path: '/schemes', icon: BookOpen },
    { name: 'Applications', path: '/applications', icon: FileBadge },
    { name: 'Document Vault', path: '/vault', icon: Vault },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const adminLinks = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Applications', path: '/admin', icon: FileBadge },
    { name: 'Manage Schemes', path: '/admin/schemes', icon: BookOpen },
    { name: 'Manage Users', path: '/admin/users', icon: Users },
    { name: 'Reports', path: '/admin/reports', icon: PieChart },
  ];

  const navLinks = user?.role === 'admin' ? adminLinks : citizenLinks;

  const isActive = (path) => {
    if (path === '/admin' && location.pathname === '/admin') return true;
    if (path !== '/admin') return location.pathname === path;
    return false;
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center ${collapsed ? 'justify-center px-3' : 'px-5'} py-5 border-b border-white/10`}>
        <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center shadow-lg shrink-0">
          <span className="font-black text-white text-base">SS</span>
        </div>
        {!collapsed && (
          <div className="ml-3 overflow-hidden">
            <div className="font-bold text-white text-sm leading-tight">Smart Setu</div>
            <div className="text-primary-300 text-xs">Digital Portal</div>
          </div>
        )}
        {/* Collapse toggle - desktop only */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex ml-auto items-center justify-center w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </div>

      {/* User Info */}
      {!collapsed && (
        <div className="px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-accent/20 border border-accent/30 rounded-xl flex items-center justify-center shrink-0">
              <span className="font-bold text-accent text-sm">{user?.name?.charAt(0).toUpperCase()}</span>
            </div>
            <div className="overflow-hidden">
              <div className="text-white font-semibold text-sm truncate">{user?.name}</div>
              <div className="text-primary-300 text-xs capitalize flex items-center gap-1">
                {user?.role === 'admin' && <Shield className="w-3 h-3" />}
                {user?.role}
              </div>
            </div>
          </div>
        </div>
      )}
      {collapsed && (
        <div className="flex justify-center py-4 border-b border-white/10">
          <div className="w-9 h-9 bg-accent/20 border border-accent/30 rounded-xl flex items-center justify-center">
            <span className="font-bold text-accent text-sm">{user?.name?.charAt(0).toUpperCase()}</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {!collapsed && (
          <div className="px-2 mb-3 text-primary-400 text-xs font-semibold uppercase tracking-wider">
            {user?.role === 'admin' ? 'Admin Panel' : 'Navigation'}
          </div>
        )}
        {navLinks.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.name}
              to={item.path}
              title={collapsed ? item.name : ''}
              className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group
                ${active
                  ? 'bg-accent text-white shadow-md shadow-accent/25'
                  : 'text-primary-200 hover:bg-white/10 hover:text-white'
                }`}
            >
              <Icon className={`w-4.5 h-4.5 shrink-0 ${active ? 'text-white' : 'text-primary-300 group-hover:text-white'}`} style={{width:'18px',height:'18px'}} />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="px-3 py-4 border-t border-white/10 space-y-1">
        <Link
          to="/"
          className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-xl text-sm font-medium text-primary-200 hover:bg-white/10 hover:text-white transition-all duration-150`}
          title={collapsed ? 'Home' : ''}
        >
          <Home className="shrink-0" style={{width:'18px',height:'18px'}} />
          {!collapsed && <span>Home</span>}
        </Link>
        <button
          onClick={handleLogout}
          className={`w-full flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-xl text-sm font-medium text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all duration-150`}
          title={collapsed ? 'Logout' : ''}
        >
          <LogOut className="shrink-0" style={{width:'18px',height:'18px'}} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-primary h-screen sticky top-0 transition-all duration-300 shrink-0
          ${collapsed ? 'w-16' : 'w-60'}`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed top-0 left-0 z-50 flex flex-col bg-primary h-screen w-64 transition-transform duration-300 lg:hidden
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 text-white"
        >
          <X className="w-4 h-4" />
        </button>
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;
