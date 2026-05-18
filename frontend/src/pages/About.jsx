import React from 'react';
import { Shield, Users, Globe, Award, Target, Eye, Heart } from 'lucide-react';

const About = () => {
  const values = [
    { icon: Shield, title: 'Security', desc: 'All data is encrypted with industry-standard security protocols to protect citizen information.' },
    { icon: Globe, title: 'Accessibility', desc: 'Designed for every citizen — accessible across all devices, browsers, and connectivity levels.' },
    { icon: Heart, title: 'Citizen First', desc: 'Every feature is designed with the citizen experience at its core, reducing friction and confusion.' },
    { icon: Award, title: 'Transparency', desc: 'Real-time status updates keep citizens informed at every stage of their application process.' },
  ];

  const team = [
    { name: 'Omkar', role: 'Full Stack Developer', initials: 'O' },
  ];

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-accent-50 text-accent px-3 py-1 rounded-full text-sm font-semibold mb-5">
          <Eye className="w-4 h-4" /> About Smart Setu
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-5">
          Bridging Citizens &<br />
          <span className="text-accent">Digital Governance</span>
        </h1>
        <p className="text-gray-500 text-lg leading-relaxed">
          Smart Setu Portal was built to simplify access to government services for every Indian citizen.
          Our mission is to eliminate paperwork, reduce wait times, and make governance transparent and efficient.
        </p>
      </section>

      {/* Mission & Vision */}
      <section className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-primary to-primary-800 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
          <div className="relative">
            <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-5 shadow-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-extrabold mb-3">Our Mission</h2>
            <p className="text-primary-200 leading-relaxed">
              To empower every Indian citizen with seamless digital access to government services —
              reducing corruption, delays, and paperwork through technology.
            </p>
          </div>
        </div>
        <div className="bg-accent-50 border border-accent/20 rounded-2xl p-8">
          <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-5 shadow-sm">
            <Eye className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-3">Our Vision</h2>
          <p className="text-gray-600 leading-relaxed">
            A Digital India where every citizen can access any government service from their home —
            with full transparency, security, and efficiency.
          </p>
        </div>
      </section>

      {/* Values */}
      <section>
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Our Core Values</h2>
          <p className="text-gray-500">The principles that guide every decision we make.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {values.map((v, i) => {
            const Icon = v.icon;
            return (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                <div className="w-12 h-12 bg-primary-50 text-primary rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{v.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Built With</h2>
        <div className="flex flex-wrap gap-3">
          {['React.js', 'Node.js', 'Express.js', 'MySQL', 'TailwindCSS', 'JWT Auth', 'Nodemailer', 'Multer', 'Axios'].map(tech => (
            <span key={tech} className="bg-primary-50 text-primary text-sm font-semibold px-4 py-2 rounded-xl border border-primary-100">
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <section className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
        <h3 className="font-bold text-amber-800 mb-2 text-sm uppercase tracking-wide">Academic Disclaimer</h3>
        <p className="text-amber-700 text-sm leading-relaxed">
          Smart Setu Portal is a demonstration/academic project developed for learning purposes. All data, schemes, and services shown are fictional and do not represent any actual government program or body.
        </p>
      </section>
    </div>
  );
};

export default About;
