import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Dashboard from './view/pages/admin/Dashboard';
import AddProperty from './view/pages/admin/AddProperty';
import EditProperty from './view/pages/admin/EditProperty';
import Listings from './view/pages/admin/Listings';
import UserManagement from './view/pages/admin/UserManagement';
import PropertyPriceHistory from './view/pages/admin/PropertyPriceHistory';
import AdminProfile from './view/pages/admin/AdminProfile';
import SignIn from './view/pages/SignIn';
import SignUp from './view/pages/SignUp';
import AdminPropertyDetail from './view/pages/admin/AdminPropertyDetail';
import { setupAxiosInterceptors, isAdminLoggedIn, getAdminData } from './services/authService';

// Create a wrapper component to use useNavigate hook
const AppContent = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Pass navigate to interceptors
    setupAxiosInterceptors(navigate);
    
    const loggedIn = isAdminLoggedIn();
    setIsLoggedIn(loggedIn);
    
    if (loggedIn) {
      const data = getAdminData();
      setAdminData(data);
    }
    
    setLoading(false);
  }, [navigate]);

  const handleLogin = (userData) => {
    setIsLoggedIn(true);
    setAdminData(userData);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setAdminData(null);
  };

  if (loading) {
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
    <Routes>
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
        path="/property/:id" 
        element={
          <ProtectedRoute>
            <AdminPropertyDetail />
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
      
      <Route 
        path="*" 
        element={
          isLoggedIn ? 
            <Navigate to="/dashboard" replace /> : 
            <Navigate to="/sign_in" replace />
        } 
      />
    </Routes>
    
  );
};

// ProtectedRoute component
const ProtectedRoute = ({ children }) => {
  const isLoggedIn = isAdminLoggedIn();
  
  if (!isLoggedIn) {
    return <Navigate to="/sign_in" replace />;
  }
  
  return children;
};

// PublicRoute component
const PublicRoute = ({ children }) => {
  const isLoggedIn = isAdminLoggedIn();
  
  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Main App component
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;