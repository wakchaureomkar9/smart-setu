import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Phone, MapPin, Eye, EyeOff, ArrowRight, CheckCircle, Key } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', address: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState('form'); // 'form' or 'otp'
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const success = await register(formData);
    setIsSubmitting(false);
    if (success) setStep('otp');
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      toast.error('Email address is missing. Please register again.');
      return;
    }
    if (otp.length !== 6) {
      toast.error('Please enter a 6-digit verification code.');
      return;
    }

    setIsVerifying(true);
    try {
      await api.post('/auth/verify-otp', { email: formData.email, otp });
      toast.success('Email verified successfully! You can now log in.');
      navigate('/login');
    } catch (error) {
      const data = error.response?.data;
      const msg = data?.message || data?.errors?.[0]?.msg || 'Verification failed';
      toast.error(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  const resendOtp = () => {
    toast.error('Resend OTP function is coming soon!');
  };

  const benefits = ['Free digital document vault', 'Apply for 120+ schemes', 'Real-time tracking', 'Instant certificates'];

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-start justify-center py-8">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-start">
        {/* Left panel */}
        <div className="hidden lg:block bg-gradient-to-br from-primary to-primary-800 rounded-2xl p-8 text-white h-full min-h-[500px] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-accent/15 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
                <span className="font-black text-white">SS</span>
              </div>
              <div>
                <div className="font-bold text-white">Smart Setu</div>
                <div className="text-primary-300 text-xs">Digital Portal</div>
              </div>
            </div>
            <h2 className="text-2xl font-extrabold mb-3">Join the Digital Revolution</h2>
            <p className="text-primary-200 text-sm leading-relaxed mb-8">
              Create your free account and access all government services digitally — no paperwork, no queues.
            </p>
            <ul className="space-y-3">
              {benefits.map(b => (
                <li key={b} className="flex items-center gap-3 text-sm text-primary-100">
                  <CheckCircle className="w-4 h-4 text-accent shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right panel */}
        <div>
          <div className="text-center lg:text-left mb-6">
            {step === 'form' ? (
              <>
                <h1 className="text-2xl font-extrabold text-gray-900">Create an Account</h1>
                <p className="text-gray-500 mt-1 text-sm">Join Smart Setu to access government services</p>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-extrabold text-gray-900">Verify Your Email</h1>
                <p className="text-gray-500 mt-1 text-sm">Enter the 6-digit code sent to {formData.email}</p>
              </>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7">
            {step === 'form' ? (
              <>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="label-text" htmlFor="name">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <User className="text-gray-400" style={{width:'18px',height:'18px'}} />
                      </div>
                      <input id="name" name="name" type="text" required className="input-field pl-10" placeholder="John Doe" value={formData.name} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label-text" htmlFor="email">Email Address</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Mail className="text-gray-400" style={{width:'18px',height:'18px'}} />
                        </div>
                        <input id="email" name="email" type="email" required className="input-field pl-10" placeholder="you@example.com" value={formData.email} onChange={handleChange} />
                      </div>
                    </div>
                    <div>
                      <label className="label-text" htmlFor="phone">Phone Number</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Phone className="text-gray-400" style={{width:'18px',height:'18px'}} />
                        </div>
                        <input id="phone" name="phone" type="tel" className="input-field pl-10" placeholder="10-digit number" value={formData.phone} onChange={handleChange} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="label-text" htmlFor="address">Address</label>
                    <div className="relative">
                      <div className="absolute top-3 left-3.5 pointer-events-none">
                        <MapPin className="text-gray-400" style={{width:'18px',height:'18px'}} />
                      </div>
                      <textarea id="address" name="address" rows="2" className="input-field pl-10 py-2.5" placeholder="Full address" value={formData.address} onChange={handleChange} />
                    </div>
                  </div>

                  <div>
                    <label className="label-text" htmlFor="password">Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Lock className="text-gray-400" style={{width:'18px',height:'18px'}} />
                      </div>
                      <input
                        id="password" name="password"
                        type={showPassword ? 'text' : 'password'}
                        required minLength="6"
                        className="input-field pl-10 pr-10"
                        placeholder="Min. 6 characters"
                        value={formData.password} onChange={handleChange}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                        {showPassword ? <EyeOff style={{width:'16px',height:'16px'}} /> : <Eye style={{width:'16px',height:'16px'}} />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3 text-base mt-2">
                    {isSubmitting ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>Create Account <ArrowRight className="w-4 h-4 ml-1" /></>
                    )}
                  </button>
                </form>

                <p className="mt-5 text-center text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link to="/login" className="text-accent font-semibold hover:underline">Login here</Link>
                </p>
              </>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div>
                  <label className="label-text" htmlFor="otp">Verification Code (OTP)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Key className="text-gray-400" style={{ width: '18px', height: '18px' }} />
                    </div>
                    <input
                      id="otp"
                      type="text"
                      required
                      maxLength={6}
                      className="input-field pl-10"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isVerifying}
                  className="btn-primary w-full py-3 text-base mt-2"
                >
                  {isVerifying ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>Verify OTP <ArrowRight className="w-4 h-4 ml-1" /></>
                  )}
                </button>

                <div className="mt-6 text-center text-sm text-gray-600">
                  Didn't receive the code?{' '}
                  <button
                    type="button"
                    onClick={resendOtp}
                    className="text-accent font-semibold hover:underline"
                    title="Coming soon"
                  >
                    Resend OTP
                  </button>
                </div>

                <p className="mt-4 text-center text-sm text-gray-600">
                  Or go back to{' '}
                  <button
                    type="button"
                    onClick={() => setStep('form')}
                    className="text-accent font-semibold hover:underline"
                  >
                    Registration
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
