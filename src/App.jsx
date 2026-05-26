import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './view/pages/admin/Dashboard';
import AddProperty from './view/pages/admin/AddProperty';
import EditProperty from './view/pages/admin/EditProperty';
import Listings from './view/pages/admin/Listings';
import UserManagement from './view/pages/admin/UserManagement';
import PropertyPriceHistory from './view/pages/admin/PropertyPriceHistory';
import AdminProfile from './view/pages/admin/AdminProfile';
import SignIn from './view/pages/SignIn';
import SignUp from './view/pages/SignUp';
import { setupAxiosInterceptors, isAdminLoggedIn, getAdminData } from './services/authService';

// ✅ Protected Route Component - Only accessible when logged in
const ProtectedRoute = ({ children }) => {
  const isLoggedIn = isAdminLoggedIn();
  
  if (!isLoggedIn) {
    // Redirect to login page if not authenticated
    return <Navigate to="/sign_in" replace />;
  }
  
  return children;
};

// ✅ Public Route Component - Redirect to dashboard if already logged in
const PublicRoute = ({ children }) => {
  const isLoggedIn = isAdminLoggedIn();
  
  if (isLoggedIn) {
    // Redirect to dashboard if already logged in
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ Setup axios interceptors for token handling
    setupAxiosInterceptors();
    
    // ✅ Check authentication status on app load
    const loggedIn = isAdminLoggedIn();
    setIsLoggedIn(loggedIn);
    
    if (loggedIn) {
      const data = getAdminData();
      setAdminData(data);
    }
    
    setLoading(false);
  }, []);

  // ✅ Handle login
  const handleLogin = (userData) => {
    setIsLoggedIn(true);
    setAdminData(userData);
  };

  // ✅ Handle logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setAdminData(null);
  };

  if (loading) {
    // Show loading spinner while checking authentication
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* ✅ Public Routes - No authentication required */}
        <Route 
          path="/sign_in" 
          element={
            <PublicRoute>
              <SignIn setIsLoggedIn={handleLogin} setAdminData={setAdminData} />
            </PublicRoute>
          } 
        />
        <Route 
          path="/sign_up" 
          element={
            <PublicRoute>
              <SignUp />
            </PublicRoute>
          } 
        />
        
        {/* ✅ Protected Routes - Require admin authentication */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Navigate to="/dashboard" replace />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard adminData={adminData} onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/add-property" 
          element={
            <ProtectedRoute>
              <AddProperty adminData={adminData} />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/properties" 
          element={
            <ProtectedRoute>
              <Listings adminData={adminData} />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/listings" 
          element={
            <ProtectedRoute>
              <Listings adminData={adminData} />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/edit-property/:id" 
          element={
            <ProtectedRoute>
              <EditProperty adminData={adminData} />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/market-trends" 
          element={
            <ProtectedRoute>
              <PropertyPriceHistory adminData={adminData} />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/property-prices" 
          element={
            <ProtectedRoute>
              <PropertyPriceHistory adminData={adminData} />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/user-management" 
          element={
            <ProtectedRoute>
              <UserManagement adminData={adminData} />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin-profile" 
          element={
            <ProtectedRoute>
              <AdminProfile adminData={adminData} onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <AdminProfile adminData={adminData} onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />
        
        {/* ✅ Catch all - redirect to login or dashboard based on auth status */}
        <Route 
          path="*" 
          element={
            isLoggedIn ? 
              <Navigate to="/dashboard" replace /> : 
              <Navigate to="/sign_in" replace />
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;