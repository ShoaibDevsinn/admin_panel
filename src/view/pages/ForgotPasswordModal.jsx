import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { adminAPI } from '../../services/authService';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [resendCount, setResendCount] = useState(0);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  React.useEffect(() => {
    if (isOpen) {
      setStep(1);
      setEmail('');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      setFieldErrors({});
      setCountdown(0);
      setResendCount(0);
    }
  }, [isOpen]);

  React.useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendOTP = async () => {
    setFieldErrors({});
    
    if (!email) {
      setFieldErrors({ email: 'Email is required' });
      setError('Email is required');
      return;
    }
    
    if (!isValidEmail(email)) {
      setFieldErrors({ email: 'Please enter a valid email address' });
      setError('Please enter a valid email address');
      return;
    }
    
    setError('');
    setLoading(true);
    try {
      const response = await adminAPI.adminForgotPassword(email);
      if (response.data.success) {
        toast.success('OTP sent to your email!');
        setCountdown(60);
        setResendCount(prev => prev + 1);
        setStep(2);
      } else {
        setError(response.data.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Failed to send OTP';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setFieldErrors({});
    
    if (!otp) {
      setFieldErrors({ otp: 'OTP is required' });
      setError('Please enter OTP');
      return;
    }
    
    if (otp.length !== 6) {
      setFieldErrors({ otp: 'OTP must be 6 digits' });
      setError('OTP must be 6 digits');
      return;
    }
    
    if (!/^\d+$/.test(otp)) {
      setFieldErrors({ otp: 'OTP must contain only numbers' });
      setError('OTP must contain only numbers');
      return;
    }
    
    setError('');
    setLoading(true);
    try {
      const response = await adminAPI.adminVerifyOTP(email, otp);
      if (response.data.success) {
        toast.success('OTP verified!');
        setStep(3);
      } else {
        setError(response.data.message || 'Invalid OTP');
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Verification failed';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setFieldErrors({});
    
    if (!newPassword) {
      setFieldErrors({ newPassword: 'Password is required' });
      setError('Please enter a new password');
      return;
    }
    
    if (newPassword.length < 6) {
      setFieldErrors({ newPassword: 'Password must be at least 6 characters' });
      setError('Password must be at least 6 characters');
      return;
    }
    
    if (!confirmPassword) {
      setFieldErrors({ confirmPassword: 'Please confirm your password' });
      setError('Please confirm your password');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setFieldErrors({ confirmPassword: 'Passwords do not match' });
      setError('Passwords do not match');
      return;
    }
    
    setError('');
    setLoading(true);
    try {
      const response = await adminAPI.adminResetPassword(email, newPassword, confirmPassword);
      if (response.data.success) {
        toast.success('Password reset successfully! Please login with your new password.');
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError(response.data.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Failed to reset password';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) {
      toast.info(`Please wait ${countdown} seconds`);
      return;
    }
    if (resendCount >= 3) {
      setError('Maximum resend limit reached. Please try again later.');
      return;
    }
    handleSendOTP();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {step === 1 && 'Forgot Password'}
            {step === 2 && 'Verify OTP'}
            {step === 3 && 'Reset Password'}
          </h2>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <p className="text-gray-600 text-sm">
              Enter your registered email address. We'll send you a verification code.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFieldErrors({});
                  setError('');
                }}
                placeholder="Enter your email"
                className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 caret-emerald-400 ${
                  fieldErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              />
              {fieldErrors.email && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>
              )}
            </div>
            <button
              type="button"
              onClick={handleSendOTP}
              disabled={loading}
              className="w-full py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-semibold disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-gray-600 text-sm">
              Enter the 6-digit code sent to <strong>{email}</strong>
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                OTP Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                  setFieldErrors({});
                  setError('');
                }}
                placeholder="Enter 6-digit code"
                className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 caret-emerald-400 ${
                  fieldErrors.otp ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                maxLength={6}
              />
              {fieldErrors.otp && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.otp}</p>
              )}
            </div>
            <button
              type="button"
              onClick={handleVerifyOTP}
              disabled={loading}
              className="w-full py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-semibold disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <div className="text-center">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={countdown > 0 || resendCount >= 3}
                className={`text-sm ${countdown > 0 || resendCount >= 3 ? 'text-gray-400' : 'text-emerald-600 hover:text-emerald-700'}`}
              >
                {countdown > 0 ? `Resend in ${countdown}s` : 
                 resendCount >= 3 ? 'Maximum resend limit reached' : 'Resend OTP'}
              </button>
              {resendCount > 0 && resendCount < 3 && (
                <p className="text-xs text-gray-400 mt-1">Attempts: {resendCount}/3</p>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <p className="text-gray-600 text-sm">
              Create a new password for your account.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setFieldErrors({});
                  setError('');
                }}
                placeholder="Enter new password (min 6 characters)"
                className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 caret-emerald-400 ${
                  fieldErrors.newPassword ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              />
              {fieldErrors.newPassword && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.newPassword}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setFieldErrors({});
                  setError('');
                }}
                placeholder="Confirm new password"
                className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 caret-emerald-400 ${
                  fieldErrors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              />
              {fieldErrors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.confirmPassword}</p>
              )}
            </div>
            <button
              type="button"
              onClick={handleResetPassword}
              disabled={loading}
              className="w-full py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-semibold disabled:opacity-50"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPasswordModal;