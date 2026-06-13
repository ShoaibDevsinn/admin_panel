import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, Toaster } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { setAdminAuth } from '../../services/authService';

// Forgot Password Modal Component
const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(() => {
    // Try to restore from sessionStorage
    const savedStep = sessionStorage.getItem('forgotPassword_step');
    return savedStep ? parseInt(savedStep) : 1;
  });
  const [email, setEmail] = useState(() => {
    return sessionStorage.getItem('forgotPassword_email') || '';
  });
  const [otp, setOtp] = useState(() => {
    return sessionStorage.getItem('forgotPassword_otp') || '';
  });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [resendCount, setResendCount] = useState(() => {
    const saved = sessionStorage.getItem('forgotPassword_resendCount');
    return saved ? parseInt(saved) : 0;
  });
  const [error, setError] = useState('');

  // Save state to sessionStorage when it changes
  React.useEffect(() => {
    sessionStorage.setItem('forgotPassword_step', step.toString());
    sessionStorage.setItem('forgotPassword_email', email);
    sessionStorage.setItem('forgotPassword_otp', otp);
    sessionStorage.setItem('forgotPassword_resendCount', resendCount.toString());
  }, [step, email, otp, resendCount]);

  // Reset modal when opened
  React.useEffect(() => {
    if (isOpen) {
      // Only reset if coming from closed state
      if (!sessionStorage.getItem('forgotPassword_active')) {
        setStep(1);
        setEmail('');
        setOtp('');
        setNewPassword('');
        setConfirmPassword('');
        setError('');
        setCountdown(0);
        setResendCount(0);
        sessionStorage.removeItem('forgotPassword_step');
        sessionStorage.removeItem('forgotPassword_email');
        sessionStorage.removeItem('forgotPassword_otp');
        sessionStorage.removeItem('forgotPassword_resendCount');
      }
      sessionStorage.setItem('forgotPassword_active', 'true');
    } else {
      sessionStorage.removeItem('forgotPassword_active');
    }
  }, [isOpen]);

  React.useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOTP = async () => {
    if (!email) {
      setError('Please enter your email');
      return;
    }
    
    setError('');
    setLoading(true);
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/admin/forgot-password/', { email });
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
      setError(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter valid 6-digit OTP');
      return;
    }
    
    setError('');
    setLoading(true);
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/admin/verify-otp/', { email, otp });
      if (response.data.success) {
        toast.success('OTP verified!');
        setStep(3);
      } else {
        setError(response.data.message || 'Invalid OTP');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setError('');
    setLoading(true);
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/admin/reset-password/', { 
        email, 
        new_password: newPassword, 
        confirm_password: confirmPassword 
      });
      if (response.data.success) {
        toast.success('Password reset successfully! Please login with your new password.');
        // Clear session storage
        sessionStorage.removeItem('forgotPassword_step');
        sessionStorage.removeItem('forgotPassword_email');
        sessionStorage.removeItem('forgotPassword_otp');
        sessionStorage.removeItem('forgotPassword_resendCount');
        sessionStorage.removeItem('forgotPassword_active');
        // Close modal after success
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError(response.data.message || 'Failed to reset password');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to reset password');
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

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      // Clear session storage when closing
      sessionStorage.removeItem('forgotPassword_step');
      sessionStorage.removeItem('forgotPassword_email');
      sessionStorage.removeItem('forgotPassword_otp');
      sessionStorage.removeItem('forgotPassword_resendCount');
      sessionStorage.removeItem('forgotPassword_active');
      onClose();
    }
  };

  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  const handleManualClose = () => {
    sessionStorage.removeItem('forgotPassword_step');
    sessionStorage.removeItem('forgotPassword_email');
    sessionStorage.removeItem('forgotPassword_otp');
    sessionStorage.removeItem('forgotPassword_resendCount');
    sessionStorage.removeItem('forgotPassword_active');
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl"
        onClick={handleModalClick}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {step === 1 && 'Forgot Password'}
            {step === 2 && 'Verify OTP'}
            {step === 3 && 'Reset Password'}
          </h2>
          <button 
            type="button" 
            onClick={handleManualClose} 
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
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              className="w-full mt-3 mb-3 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 caret-emerald-400"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendOTP();
                  }
                }}
              />
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleSendOTP();
              }}
              disabled={loading}
              className="w-full py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-semibold"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-gray-600 text-sm">
              Enter the 6-digit code sent to {email}
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                OTP Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit code"
              className="w-full mt-3 mb-3 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 caret-emerald-400"
                maxLength={6}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleVerifyOTP();
                  }
                }}
              />
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleVerifyOTP();
              }}
              disabled={loading}
              className="w-full py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-semibold"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <div className="text-center">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleResendOTP();
                }}
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
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 characters)"
              className="w-full mt-3 mb-3 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 caret-emerald-400"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleResetPassword();
                  }
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              className="w-full mt-3 mb-3 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 caret-emerald-400"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleResetPassword();
                  }
                }}
              />
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleResetPassword();
              }}
              disabled={loading}
              className="w-full py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-semibold"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default function SignIn({ setIsLoggedIn, setAdminData }) {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    username_or_email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);

    if (!formData.username_or_email.trim()) {
      toast.error("Please enter username or email");
      setLoading(false);
      return;
    }

    if (!formData.password) {
      toast.error("Please enter password");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/admin/login", {
        username_or_email: formData.username_or_email.trim(),
        password: formData.password,
      });

      console.log("Admin Login Response:", response.data);

      if (response.data.success) {
        const { access_token, refresh_token, admin } = response.data.data;

        setAdminAuth(access_token, refresh_token, admin);
        
        if (setIsLoggedIn) setIsLoggedIn(true);
        if (setAdminData) setAdminData(admin);
        
        toast.success("Login successful! Redirecting to dashboard...");
        
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        toast.error(response.data.message || "Login failed");
      }

    } catch (error) {
      console.error("Admin Login Error:", error.response?.data);
      
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        if (typeof errors === 'string') {
          toast.error(errors);
        } else if (errors.non_field_errors) {
          toast.error(errors.non_field_errors[0]);
        } else {
          toast.error("Invalid username/email or password");
        }
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Login failed. Please check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    const isLoggedIn = localStorage.getItem("isAdminLoggedIn");
    const token = localStorage.getItem("admin_access_token");
    
    if (isLoggedIn === "true" && token) {
      const verifyToken = async () => {
        try {
          const response = await axios.get("http://127.0.0.1:8000/api/admin/profile/", {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.status === 200) {
            navigate("/dashboard");
          }
        } catch (error) {
          console.error("Token verification failed:", error);
          localStorage.removeItem("admin_access_token");
          localStorage.removeItem("admin_refresh_token");
          localStorage.removeItem("isAdminLoggedIn");
          localStorage.removeItem("adminData");
        }
      };
      verifyToken();
    }
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-start w-full font-poppins">
      <Toaster position="top-center" richColors />
      
      <div className="bg-white p-5 rounded-2xl shadow-xl w-110 text-center mt-20">
        <h2 className="text-2xl font-semibold text-emerald-600 mb-1">Admin Welcome</h2>
        <p className="text-gray-500 text-sm mb-3">
          Login to access admin dashboard
        </p>
        
        {/* Login Form */}
        <form onSubmit={handleSubmit} className="text-left">
          <div>
            <label className="font-medium text-gray-700">Username or Email</label>
            <input
              type="text"
              name="username_or_email"
              placeholder="Enter username or email"
              value={formData.username_or_email}
              onChange={handleChange}
              required
              className="w-full mt-3 mb-3 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 caret-emerald-400"
            />
          </div>
          
          <div>
            <label className="font-medium text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full mt-3 mb-3 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 caret-emerald-400"
            />
          </div>
          
          {/* Forgot Password Button */}
          <div className="text-right mb-4 -mt-2">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-emerald-600 hover:text-emerald-700 transition-all"
            >
              Forgot Password?
            </button>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-emerald-600 text-white py-3 rounded-xl text-lg font-medium transition 
            ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-emerald-700"}`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="text-gray-500 text-sm mt-5 text-center">
            Don't have an admin account?
            <span
              onClick={() => navigate("/sign_up")}
              className="text-emerald-600 font-semibold ml-1 cursor-pointer hover:underline"
            >
              Sign up
            </span>
          </p>
        </form>
      </div>
      
      {/* Forgot Password Modal */}
      <ForgotPasswordModal 
        isOpen={showForgotPassword} 
        onClose={() => setShowForgotPassword(false)} 
      />
    </div>
  );
}
export { ForgotPasswordModal };