import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Phone, Mail, MapPin, ExternalLink } from 'lucide-react';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-primary text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center shadow">
                <span className="font-black text-white text-sm">SS</span>
              </div>
              <div>
                <div className="font-bold text-white text-base">Smart Setu</div>
                <div className="text-primary-300 text-xs">Digital Portal</div>
              </div>
            </div>
            <p className="text-primary-300 text-sm leading-relaxed">
              Empowering citizens with digital governance. Access government services anytime, anywhere.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-primary-400">
              <Shield className="w-3.5 h-3.5 text-accent" />
              <span>Secure & Government Verified</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { label: 'Home', to: '/' },
                { label: 'About', to: '/about' },
                { label: 'Schemes', to: '/schemes' },
                { label: 'Contact', to: '/contact' },
                { label: 'Login', to: '/login' },
                { label: 'Register', to: '/register' },
              ].map(item => (
                <li key={item.label}>
                  <Link to={item.to} className="text-primary-300 hover:text-accent text-sm transition-colors duration-150">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Services</h4>
            <ul className="space-y-2">
              {[
                'Document Vault',
                'Scheme Applications',
                'Application Tracking',
                'Digital Certificates',
                'Admin Portal',
              ].map(item => (
                <li key={item}>
                  <span className="text-primary-300 text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-primary-300">
                <Mail className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                <span>support@smartsetu.gov.in</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-primary-300">
                <Phone className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                <span>1800-XXX-XXXX (Toll Free)</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-primary-300">
                <MapPin className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                <span>Ministry of Digital Affairs, New Delhi — 110001</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-primary-400 text-xs">
            © {year} Smart Setu Portal. Government of India. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-primary-400">
            <Link to="#" className="hover:text-accent transition-colors">Privacy Policy</Link>
            <span className="text-primary-600">•</span>
            <Link to="#" className="hover:text-accent transition-colors">Terms of Use</Link>
            <span className="text-primary-600">•</span>
            <Link to="#" className="hover:text-accent transition-colors">Accessibility</Link>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/10">
          <p className="text-primary-400 text-xs text-center">
            <strong className="text-primary-300">Disclaimer:</strong> This portal is a demonstration project. All data is fictional and for educational purposes only. Not affiliated with any government body.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
