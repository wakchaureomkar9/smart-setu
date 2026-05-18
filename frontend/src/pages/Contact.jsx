import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, MessageCircle, Send, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    // Simulate submission
    await new Promise(r => setTimeout(r, 1200));
    setSending(false);
    setSubmitted(true);
    toast.success('Message sent! We\'ll get back to you soon.');
  };

  const contacts = [
    { icon: Mail, label: 'Email', value: 'support@smartsetu.gov.in', sub: 'We reply within 24 hours' },
    { icon: Phone, label: 'Toll Free', value: '1800-XXX-XXXX', sub: 'Mon–Fri, 9AM–6PM IST' },
    { icon: MapPin, label: 'Address', value: 'Smart-Setu', sub: 'Pune ,Maharashtra - 411037' },
    { icon: Clock, label: 'Working Hours', value: 'Mon–Fri: 9AM – 6PM', sub: 'Sat: 9AM – 1PM' },
  ];

  return (
    <div className="space-y-10">
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-accent-50 text-accent px-3 py-1 rounded-full text-sm font-semibold mb-4">
          <MessageCircle className="w-4 h-4" /> Contact Us
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-3">Get In Touch</h1>
        <p className="text-gray-500 text-lg">Have questions about our services? We're here to help.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Contact Info */}
        <div className="space-y-4">
          {contacts.map((c, i) => {
            const Icon = c.icon;
            return (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4 hover:shadow-md transition-all">
                <div className="w-11 h-11 bg-primary-50 text-primary rounded-xl flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{c.label}</p>
                  <p className="font-bold text-gray-900">{c.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{c.sub}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7">
          {submitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h3>
              <p className="text-gray-500 text-sm mb-5">We'll get back to you within 24 hours.</p>
              <button onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', subject: '', message: '' }); }} className="btn-outline text-sm">Send Another</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 mb-5">Send a Message</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label-text">Full Name</label>
                  <input type="text" required className="input-field" placeholder="John Doe" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div>
                  <label className="label-text">Email Address</label>
                  <input type="email" required className="input-field" placeholder="you@example.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label-text">Subject</label>
                <input type="text" required className="input-field" placeholder="How can we help?" value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} />
              </div>
              <div>
                <label className="label-text">Message</label>
                <textarea rows="5" required className="input-field py-2.5" placeholder="Describe your issue or query in detail..." value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} />
              </div>
              <button type="submit" disabled={sending} className="btn-primary w-full py-3">
                {sending ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Send className="w-4 h-4 mr-2" />Send Message</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact;
