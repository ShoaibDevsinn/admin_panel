import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, Toaster } from 'sonner';
import Navbar from "../components/AdminNavbar";
import { setAdminAuth } from '../../services/authService';

export default function SignIn({ setIsLoggedIn, setAdminData }) {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
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
      // ✅ Correct API URL based on your Django config
      const response = await axios.post("http://127.0.0.1:8000/api/admin/login", {
        username_or_email: formData.username_or_email.trim(),
        password: formData.password,
      });

      console.log("Admin Login Response:", response.data);

      if (response.data.success) {
        const { access_token, refresh_token, admin } = response.data.data;

        // ✅ Use authService to save tokens
        setAdminAuth(access_token, refresh_token, admin);
        
        // Update parent component state
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
      // Verify token is still valid
      const verifyToken = async () => {
        try {
          await axios.get("http://127.0.0.1:8000/api/admin/profile", {
            headers: { Authorization: `Bearer ${token}` }
          });
          navigate("/dashboard");
        } catch (error) {
          // Token expired or invalid, clear storage
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
      <Navbar />
      
      <div className="bg-white p-5 rounded-2xl shadow-xl w-110 text-center mt-20">
        <h2 className="text-2xl font-semibold text-emerald-600 mb-1">Admin Welcome</h2>
        <p className="text-gray-500 text-sm mb-3">
          Login to access admin dashboard
        </p>
        
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
              className="w-full mt-3 mb-9 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 caret-emerald-400"
            />
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
    </div>
  );
}