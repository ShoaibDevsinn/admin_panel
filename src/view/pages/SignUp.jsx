import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "sonner";
import { adminAPI, setAdminAuth } from '../../services/authService';

export default function SignUp() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});

    // Validation
    if (!formData.username.trim()) {
      toast.error("Username is required");
      setLoading(false);
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Email is required");
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      setLoading(false);
      return;
    }

    if (!formData.password) {
      toast.error("Password is required");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirm_password) {
      toast.error("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      console.log("Sending signup request:", {
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
      });

      // Use adminAPI instead of direct axios
      const response = await adminAPI.adminSignup({
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone?.trim() || "",
        password: formData.password,
        confirm_password: formData.confirm_password,
      });

      console.log("Signup success:", response.data);

      if (response.data.success) {
        const { access_token, refresh_token, admin } = response.data.data;
        
        //  Use the same auth function as SignIn
        setAdminAuth(access_token, refresh_token, admin);
        
        toast.success(response.data.message || "Admin account created successfully!");

        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        toast.error(response.data.message || "Registration failed");
      }

    } catch (error) {
      console.error("Signup error details:", error.response?.data);
      
      if (error.response) {
        const responseData = error.response.data;
        const statusCode = error.response.status;
        
        // Handle validation errors from backend (format: { success: false, errors: {...} })
        if (responseData?.errors && typeof responseData.errors === 'object') {
          const errors = responseData.errors;
          let errorShown = false;
          
          // Map backend field names to frontend field names
          const fieldMapping = {
            'username': 'username',
            'email': 'email', 
            'phone': 'phone',
            'password': 'password',
            'confirm_password': 'confirm_password'
          };
          
          for (const [backendField, frontendField] of Object.entries(fieldMapping)) {
            if (errors[backendField]) {
              const errorMsg = Array.isArray(errors[backendField]) ? errors[backendField][0] : errors[backendField];
              setFieldErrors(prev => ({ ...prev, [frontendField]: errorMsg }));
              if (!errorShown) toast.error(errorMsg);
              errorShown = true;
            }
          }
          
          // Handle non_field_errors
          if (errors.non_field_errors && !errorShown) {
            const errorMsg = Array.isArray(errors.non_field_errors) ? errors.non_field_errors[0] : errors.non_field_errors;
            toast.error(errorMsg);
            errorShown = true;
          }
          
          // If still no error shown, show the first error from any field
          if (!errorShown && Object.keys(errors).length > 0) {
            const firstKey = Object.keys(errors)[0];
            const firstError = errors[firstKey];
            const errorMsg = Array.isArray(firstError) ? firstError[0] : firstError;
            toast.error(errorMsg);
          }
        } 
        else if (responseData?.message) {
          toast.error(responseData.message);
        }
        else if (typeof responseData === 'string') {
          toast.error(responseData);
        }
        else {
          toast.error(`Registration failed (${statusCode}). Please try again.`);
        }
      } 
      else if (error.request) {
        toast.error("Cannot connect to server. Please make sure the backend is running at http://127.0.0.1:8000");
      } 
      else {
        toast.error("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen w-full font-poppins">
      <Toaster position="top-center" richColors />
      
      <div className="bg-white p-5 rounded-2xl shadow-xl w-110 text-center mt-10">
        <h2 className="text-2xl font-semibold text-emerald-600 mb-1">
          Create Admin Account
        </h2>

        <p className="text-gray-500 text-sm mb-3">
          Sign up to access admin dashboard
        </p>

        <form onSubmit={handleSubmit} className="text-left">
          {/* Username Field */}
          <div>
            <input
              type="text"
              placeholder="Enter username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className={`w-full mt-3 mb-1 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 caret-emerald-500  ${
                fieldErrors.username ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
            {fieldErrors.username && (
              <p className="text-red-500 text-xs mt-0 mb-2 ml-2">{fieldErrors.username}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <input
              type="email"
              placeholder="Enter email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={`w-full mt-3 mb-1 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 caret-emerald-500  ${
                fieldErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
            {fieldErrors.email && (
              <p className="text-red-500 text-xs mt-0 mb-2 ml-2">{fieldErrors.email}</p>
            )}
          </div>

          {/* Phone Field */}
          <div>
            <input
              type="tel"
              placeholder="Enter phone number (optional)"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full mt-3 mb-1 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 caret-emerald-500  ${
                fieldErrors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
            {fieldErrors.phone && (
              <p className="text-red-500 text-xs mt-0 mb-2 ml-2">{fieldErrors.phone}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <input
              type="password"
              placeholder="Enter password (min 6 characters)"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className={`w-full mt-3 mb-1 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 caret-emerald-500  ${
                fieldErrors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
            {fieldErrors.password && (
              <p className="text-red-500 text-xs mt-0 mb-2 ml-2">{fieldErrors.password}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <input
              type="password"
              placeholder="Confirm password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              required
              className={`w-full mt-3 mb-1 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 caret-emerald-500  ${
                fieldErrors.confirm_password ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
            {fieldErrors.confirm_password && (
              <p className="text-red-500 text-xs mt-0 mb-2 ml-2">{fieldErrors.confirm_password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-emerald-600 text-white py-3 rounded-xl hover:bg-emerald-700 transition-colors mt-3 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>

          <p className="text-gray-500 text-sm mt-5 text-center">
            Already have an admin account?
            <span
              onClick={() => navigate("/sign_in")}
              className="text-emerald-600 font-semibold ml-1 cursor-pointer hover:underline"
            >
              Sign in
            </span>
          </p>

        </form>
      </div>
    </div>
  );
}