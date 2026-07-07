import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Key, Eye, EyeOff, ArrowRight } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('Reset OTP sent to your email!');
      setStep('otp');
    } catch (err) {
      const data = err.response?.data;
      const msg = data?.message || data?.errors?.[0]?.msg || 'Failed to send OTP';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      await api.post('/auth/reset-password', { email, otp, new_password: newPassword });
      toast.success('Password reset successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      const data = err.response?.data;
      const msg = data?.message || data?.errors?.[0]?.msg || 'Failed to reset password';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('New code sent successfully!');
    } catch (err) {
      const data = err.response?.data;
      const msg = data?.message || data?.errors?.[0]?.msg || 'Failed to resend code';
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center py-8">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary rounded-2xl shadow-xl mb-4">
            <span className="font-black text-white text-lg">SS</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            {step === 'email' ? 'Forgot Password' : 'Reset Your Password'}
          </h1>
          <p className="text-gray-500 mt-1 text-sm px-4">
            {step === 'email'
              ? 'Enter your registered email to receive a reset code'
              : `Enter the 6-digit code sent to ${email} and your new password`}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {step === 'email' ? (
            <form onSubmit={handleEmailSubmit} className="space-y-5">
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
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full py-3 text-base mt-2 animate-none"
              >
                {isSubmitting ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>Send Reset Code <ArrowRight className="w-4 h-4 ml-1" /></>
                )}
              </button>

              {error && (
                <p className="text-sm text-red-500 text-center mt-3">{error}</p>
              )}

              <p className="mt-6 text-center text-sm text-gray-600">
                Remember your password?{' '}
                <Link to="/login" className="text-accent font-semibold hover:underline">
                  Back to Login
                </Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleResetSubmit} className="space-y-5">
              <div>
                <label className="label-text" htmlFor="otp">Verification Code (OTP)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Key className="h-4.5 w-4.5 text-gray-400" style={{ width: '18px', height: '18px' }} />
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

              <div>
                <label className="label-text" htmlFor="newPassword">New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="text-gray-400" style={{ width: '18px', height: '18px' }} />
                  </div>
                  <input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    className="input-field pl-10 pr-10"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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
                  <>Reset Password <ArrowRight className="w-4 h-4 ml-1" /></>
                )}
              </button>

              {error && (
                <p className="text-sm text-red-500 text-center mt-3">{error}</p>
              )}

              <div className="mt-6 text-center text-sm text-gray-600">
                Didn't receive the code?{' '}
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="text-accent font-semibold hover:underline"
                >
                  Resend Code
                </button>
              </div>

              <p className="mt-4 text-center text-sm text-gray-600">
                Or go back to{' '}
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="text-accent font-semibold hover:underline"
                >
                  Email Step
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
