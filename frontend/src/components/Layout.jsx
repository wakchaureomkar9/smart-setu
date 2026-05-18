import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { Menu } from 'lucide-react';

// Pages that use sidebar layout (authenticated)
const SIDEBAR_PATHS = ['/dashboard', '/vault', '/schemes', '/applications', '/profile', '/admin'];

const Layout = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const usesSidebar = user && SIDEBAR_PATHS.some(p => location.pathname.startsWith(p));

  if (usesSidebar) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar isOpen={mobileOpen} setIsOpen={setMobileOpen} />
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile top bar */}
          <header className="lg:hidden bg-primary text-white px-4 py-3.5 flex items-center gap-3 sticky top-0 z-30 shadow-sm">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-accent rounded-lg flex items-center justify-center">
                <span className="font-black text-white text-xs">SS</span>
              </div>
              <span className="font-bold text-sm">Smart Setu</span>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-screen-xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>
    );
  }

  // Public layout: Navbar + Content + Footer
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans text-gray-800">
      <Navbar />
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
