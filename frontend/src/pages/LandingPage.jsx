import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, FileCheck, Clock, Download, ArrowRight, Star, Users, Globe, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const { user } = useAuth();

  const features = [
    {
      title: 'Secure Document Vault',
      description: 'Upload and manage your Aadhaar, PAN, certificates, and other documents securely.',
      icon: Shield,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Easy Applications',
      description: 'Apply for government schemes digitally without visiting any office.',
      icon: FileCheck,
      color: 'text-accent',
      bg: 'bg-accent-50',
    },
    {
      title: 'Real-time Tracking',
      description: 'Track your application status instantly with live updates and email notifications.',
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      title: 'Instant Downloads',
      description: 'Download approved certificates and official documents directly to your device.',
      icon: Download,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ];

  const stats = [
    { label: 'Citizens Served', value: '50,000+', icon: Users },
    { label: 'Schemes Available', value: '120+', icon: Globe },
    { label: 'Applications Processed', value: '95,000+', icon: FileCheck },
    { label: 'Success Rate', value: '98.5%', icon: Star },
  ];

  const steps = [
    { step: '01', title: 'Register & Verify', desc: 'Create your citizen account and complete your profile in under 2 minutes.' },
    { step: '02', title: 'Upload Documents', desc: 'Securely store your Aadhaar, PAN card, and other required certificates.' },
    { step: '03', title: 'Apply for Schemes', desc: 'Browse eligible schemes and submit applications with a single click.' },
    { step: '04', title: 'Track & Download', desc: 'Monitor status in real-time and download approved certificates instantly.' },
  ];

  return (
    <div className="space-y-0 -mt-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-800 to-primary-900 text-white py-24 px-4 -mx-4 sm:-mx-6 lg:-mx-8">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-1.5 rounded-full text-sm font-medium mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            Official Digital Governance Portal
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            Your Gateway to{' '}
            <span className="text-accent">Digital Governance</span>
          </h1>
          <p className="text-lg sm:text-xl text-primary-200 mb-10 max-w-3xl mx-auto leading-relaxed">
            Smart Setu Portal is a unified platform for citizens to access government services,
            manage documents securely, and track applications seamlessly — anytime, anywhere.
          </p>

          {!user ? (
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-600 text-white font-bold px-8 py-4 rounded-xl text-base shadow-lg shadow-accent/25 transition-all hover:scale-105 active:scale-95"
              >
                Get Started Free <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-8 py-4 rounded-xl text-base backdrop-blur-sm transition-all"
              >
                Login to Account
              </Link>
            </div>
          ) : (
            <Link
              to={user.role === 'admin' ? '/admin' : '/dashboard'}
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent-600 text-white font-bold px-8 py-4 rounded-xl text-base shadow-lg transition-all hover:scale-105"
            >
              Go to Dashboard <ArrowRight className="w-5 h-5" />
            </Link>
          )}

          <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-primary-300">
            {['Free to use', 'SSL Secured', 'No paperwork', 'Instant notifications'].map(t => (
              <div key={t} className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-accent" />
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-b border-gray-100 py-10 px-4 -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="text-center">
                <div className="text-3xl font-extrabold text-primary mb-1">{stat.value}</div>
                <div className="text-gray-500 text-sm flex items-center justify-center gap-1">
                  <Icon className="w-3.5 h-3.5" />
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              Why Choose Smart Setu?
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">
              Experience a modern, transparent, and efficient way to interact with government services.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 group"
                >
                  <div className={`w-14 h-14 ${feature.bg} ${feature.color} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gradient-to-br from-primary-50 to-accent-50 py-20 px-4 -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Four simple steps to access all government services digitally.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, idx) => (
              <div key={idx} className="relative bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                <div className="text-4xl font-black text-gray-100 mb-4 leading-none">{step.step}</div>
                <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-6 bg-accent rounded-full flex items-center justify-center z-10">
                    <ArrowRight className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-3xl mx-auto bg-gradient-to-br from-primary to-primary-800 rounded-3xl p-10 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-48 h-48 bg-accent/15 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          </div>
          <div className="relative">
            <h2 className="text-3xl font-extrabold text-white mb-4">Ready to Get Started?</h2>
            <p className="text-primary-200 mb-8 text-lg">Join thousands of citizens already using Smart Setu Portal.</p>
            {!user ? (
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/register" className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-600 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg transition-all hover:scale-105">
                  Create Free Account <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/login" className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-8 py-3.5 rounded-xl transition-all">
                  Login
                </Link>
              </div>
            ) : (
              <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="inline-flex items-center gap-2 bg-accent hover:bg-accent-600 text-white font-bold px-8 py-3.5 rounded-xl transition-all">
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
