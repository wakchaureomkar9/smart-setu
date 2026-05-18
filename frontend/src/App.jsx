import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';
import Contact from './pages/Contact';

import Dashboard from './pages/Dashboard';
import DocumentVault from './pages/DocumentVault';
import Schemes from './pages/Schemes';
import Applications from './pages/Applications';
import ProfileSettings from './pages/ProfileSettings';

import AdminDashboard from './pages/AdminDashboard';
import ManageSchemes from './pages/ManageSchemes';
import ManageUsers from './pages/ManageUsers';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#1e293b',
              boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '500',
              padding: '12px 16px',
              border: '1px solid #f1f5f9',
            },
            success: {
              iconTheme: { primary: '#009B8D', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<LandingPage />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />

            <Route element={<ProtectedRoute allowedRoles={['citizen']} />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="vault" element={<DocumentVault />} />
              <Route path="schemes" element={<Schemes />} />
              <Route path="applications" element={<Applications />} />
              <Route path="profile" element={<ProfileSettings />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="admin" element={<AdminDashboard />} />
              <Route path="admin/schemes" element={<ManageSchemes />} />
              <Route path="admin/users" element={<ManageUsers />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
