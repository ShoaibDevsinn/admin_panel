import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, Toaster } from "sonner";
import Navbar from '../components/AdminNavbar'

export default function SignUp() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

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

    // Email format validation
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
      console.log("Sending signup request with data:", {
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        password: "******",
        confirm_password: "******"
      });

      // ✅ CORRECTED API URL based on your Django configuration
      const res = await axios.post("http://127.0.0.1:8000/api/admin/signup", {
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone?.trim() || "",
        password: formData.password,
        confirm_password: formData.confirm_password,
      });

      console.log("Signup success response:", res.data);

      // Store tokens if returned
      if (res.data?.data?.access_token) {
        localStorage.setItem("adminAccessToken", res.data.data.access_token);
        localStorage.setItem("adminRefreshToken", res.data.data.refresh_token);
        if (res.data.data.admin) {
          localStorage.setItem("adminData", JSON.stringify(res.data.data.admin));
        }
      }

      toast.success(res.data?.message || "Admin account created successfully!");

      // Redirect to login page after successful signup
      setTimeout(() => {
        navigate("/sign_in");
      }, 1500);

    } catch (error) {
      // ✅ DETAILED ERROR LOGGING
      console.log("Full error object:", error);
      console.log("Error response:", error.response);
      console.log("Error response data:", error.response?.data);
      console.log("Error response status:", error.response?.status);
      console.log("Error message:", error.message);
      console.log("Error code:", error.code);
      
      // Handle different error scenarios
      if (error.response) {
        // Server responded with an error status
        const responseData = error.response.data;
        const statusCode = error.response.status;
        
        console.log("Server error response:", responseData);
        
        // Check for validation errors
        if (responseData?.errors) {
          const errors = responseData.errors;
          console.log("Validation errors:", errors);
          
          // Handle field-specific errors
          if (errors.username) {
            const errorMsg = Array.isArray(errors.username) 
              ? errors.username[0] 
              : errors.username;
            toast.error(errorMsg);
          } else if (errors.email) {
            const errorMsg = Array.isArray(errors.email) 
              ? errors.email[0] 
              : errors.email;
            toast.error(errorMsg);
          } else if (errors.password) {
            const errorMsg = Array.isArray(errors.password) 
              ? errors.password[0] 
              : errors.password;
            toast.error(errorMsg);
          } else if (errors.confirm_password) {
            const errorMsg = Array.isArray(errors.confirm_password) 
              ? errors.confirm_password[0] 
              : errors.confirm_password;
            toast.error(errorMsg);
          } else if (errors.phone) {
            const errorMsg = Array.isArray(errors.phone) 
              ? errors.phone[0] 
              : errors.phone;
            toast.error(errorMsg);
          } else if (errors.non_field_errors) {
            const errorMsg = Array.isArray(errors.non_field_errors) 
              ? errors.non_field_errors[0] 
              : errors.non_field_errors;
            toast.error(errorMsg);
          } else {
            // Get the first error message from any field
            const firstErrorKey = Object.keys(errors)[0];
            const firstError = errors[firstErrorKey];
            const errorMsg = Array.isArray(firstError) ? firstError[0] : firstError;
            toast.error(errorMsg || "Validation failed");
          }
        } else if (responseData?.message) {
          // General error message
          toast.error(responseData.message);
        } else if (typeof responseData === 'string') {
          // String error response
          toast.error(responseData);
        } else {
          // Unknown error format
          toast.error(`Server error (${statusCode}). Please try again.`);
        }
      } else if (error.request) {
        // Request was made but no response received
        console.log("No response received:", error.request);
        toast.error("Cannot connect to server. Please make sure the backend is running at http://127.0.0.1:8000");
      } else {
        // Something happened in setting up the request
        console.log("Request setup error:", error.message);
        toast.error("Failed to send request. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen w-full font-poppins">
      <Toaster position="top-center" richColors />
      <Navbar />

      <div className="bg-white p-5 rounded-2xl shadow-xl w-110 text-center mt-10">
        <h2 className="text-2xl font-semibold text-emerald-600 mb-1">
          Create Admin Account
        </h2>

        <p className="text-gray-500 text-sm mb-3">
          Sign up to access admin dashboard
        </p>

        <form onSubmit={handleSubmit} className="text-left">

          <input
            type="text"
            placeholder="Enter username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            className="w-full mt-3 mb-3 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />

          <input
            type="email"
            placeholder="Enter email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full mt-3 mb-3 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />

          <input
            type="tel"
            placeholder="Enter phone number (optional)"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full mt-3 mb-3 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />

          <input
            type="password"
            placeholder="Enter password (min 6 characters)"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full mt-3 mb-3 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />

          <input
            type="password"
            placeholder="Confirm password"
            name="confirm_password"
            value={formData.confirm_password}
            onChange={handleChange}
            required
            className="w-full mt-3 mb-9 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-emerald-600 text-white py-3 rounded-xl hover:bg-emerald-700 transition-colors ${
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