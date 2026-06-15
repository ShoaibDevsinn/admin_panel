import React, { useState, useEffect, useMemo } from 'react'
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/AdminNavbar";
import { adminAPI } from '../../../services/authService'
import ForgotPasswordModal from '../ForgotPasswordModal';
import { toast } from 'sonner'; 
import { useParams, Link, useNavigate } from 'react-router-dom';
import { User, Edit2, Lock, BarChart3, Home, DollarSign, Activity, CheckCircle, Package, Clock, FileText, Mail, Phone, MapPin, Camera, X } from 'lucide-react';

const AdminProfile = () => {
  // Layout State
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate();

  // Profile State
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // UI State
  const [activeTab, setActiveTab] = useState('overview')
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [showChangeAvatar, setShowChangeAvatar] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  // Validation errors state
  const [editErrors, setEditErrors] = useState({})

  // Form States
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    bio: '',
    address: '',
    department: ''
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Stats State
  const [stats, setStats] = useState({
    totalProperties: 156,
    soldProperties: 89,
    activeListings: 45,
    pendingProperties: 22,
    totalRevenue: 285000000,
    monthlyViews: 12500,
    averageRating: 4.8,
    responseRate: 98
  })

  // Recent Properties State
  const [recentProperties, setRecentProperties] = useState([])
  const [soldProperties, setSoldProperties] = useState([])
  const [activityLogs, setActivityLogs] = useState([])
  const [monthlyStats, setMonthlyStats] = useState([])
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [passwordMatchError, setPasswordMatchError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  //  Clear validation error when field changes
  const clearEditError = (fieldName) => {
    if (editErrors[fieldName]) {
      setEditErrors(prev => ({ ...prev, [fieldName]: '' }))
    }
  }

  //  Validate Edit Profile form
  const validateEditProfile = () => {
    const errors = {}
    
    if (!editForm.fullName.trim()) {
      errors.fullName = 'Full name is required'
    } else if (editForm.fullName.length < 2) {
      errors.fullName = 'Full name must be at least 2 characters'
    }
    
    if (!editForm.email.trim()) {
      errors.email = 'Email is required'
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(editForm.email)) {
        errors.email = 'Please enter a valid email address'
      }
    }
    
    if (editForm.phone && !/^[0-9+\-\s()]+$/.test(editForm.phone)) {
      errors.phone = 'Please enter a valid phone number'
    }
    
    setEditErrors(errors)
    return Object.keys(errors).length === 0
  }

  useEffect(() => {
    fetchProfile()
    fetchDashboardStats()
    fetchRecentListings()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/admin/profile', {
        headers: { Authorization: `Bearer ${localStorage.getItem('admin_access_token')}` }
      })
      const data = await response.json()
      if (data?.success && data?.data) {
        const admin = data.data
        setProfile({
          id: admin.admin_id,
          fullName: admin.full_name || admin.username || 'N/A',
          email: admin.email || '',
          phone: admin.phone || 'N/A',
          role: 'Admin',
          username: admin.username || '',
          joinDate: admin.created_at || '',
          lastLogin: admin.last_login || '',
          avatar: admin.profile_image_url || null,
          bio: admin.bio || 'No bio available',
          address: admin.address || 'N/A',
          memberSince: admin.member_since || ''
        })
        setEditForm({
          fullName: admin.full_name || admin.username || '',
          email: admin.email || '',
          phone: admin.phone || '',
          bio: admin.bio || '',
          address: admin.address || '',
          department: 'Management'
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/listings/admin/dashboard-stats', {
        headers: { Authorization: `Bearer ${localStorage.getItem('admin_access_token')}` }
      })
      const data = await response.json()
      if (data?.success && data?.data) {
        const d = data.data
        setStats({
          totalProperties: d.total_properties || 0,
          soldProperties: d.sold_properties || 0,
          activeListings: d.active_listings || 0,
          pendingProperties: d.rent_listings || 0,
          totalRevenue: d.total_revenue || 0,
          monthlyViews: 12500,
          averageRating: 4.8,
          responseRate: 98
        })
        setMonthlyStats((d.monthly_stats || []).map(m => ({
          month: m.month ? new Date(m.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '',
          properties: m.count || 0,
          sold: m.count || 0,
          revenue: m.revenue || 0
        })))
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchRecentListings = async () => {
    try {
      const response = await adminAPI.listings.getListings()
      const listings = response.data?.data || []
      
      setRecentProperties(listings.slice(0, 6).map(l => ({
        id: l.listing_id,
        title: l.title,
        price: l.price,
        status: l.property_status === 'available' ? 'Active' : l.property_status === 'sold' ? 'Sold' : 'Pending',
        type: l.property_type === 'house' ? 'House' : l.property_type === 'plot' ? 'Plot' : 'Commercial',
        size: `${l.area_marla} Marla`,
        location: l.location_name || 'N/A',
        date: l.created_at,
        image: l.primary_image
      })))
      
      const soldListings = listings.filter(l => l.property_status === 'sold')
      setSoldProperties(soldListings.map(l => ({
        id: l.listing_id,
        title: l.title,
        price: l.price,
        type: l.property_type === 'house' ? 'House' : l.property_type === 'plot' ? 'Plot' : 'Commercial',
        location: l.location_name || 'N/A',
        size: `${l.area_marla} Marla`,
        soldDate: l.sold_date || l.updated_at || l.created_at,
        buyer: l.buyer_name || 'N/A',
        profit: l.expected_revenue || 0,
        image: l.primary_image
      })))
      
      console.log('Sold properties loaded:', soldListings.length)
      
    } catch (error) {
      console.error('Error fetching listings:', error)
    }
  }

  const formatCurrency = (amount) => {
    if (amount >=  10000000) return `Rs ${(amount / 10000000).toFixed(2)} Cr`
    if (amount >= 100000) return `Rs ${(amount / 100000).toFixed(2)} Lac`
    return `Rs ${amount.toLocaleString()}`
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    } catch (e) {
      return dateString
    }
  }

  const timeAgo = (dateString) => {
    const now = new Date()
    const date = new Date(dateString)
    const seconds = Math.floor((now - date) / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 30) return formatDate(dateString)
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    if (minutes > 0) return `${minutes} min ago`
    return 'Just now'
  }

  const handleEditProfile = () => {
    setEditForm({
      fullName: profile.fullName,
      email: profile.email,
      phone: profile.phone,
      bio: profile.bio,
      address: profile.address,
      department: profile.department
    })
    setEditErrors({})
    setShowEditProfile(true)
  }

  // Handle Save Profile with validation
  const handleSaveProfile = async () => {
    // Validate before submitting
    if (!validateEditProfile()) {
      const firstError = Object.values(editErrors)[0]
      if (firstError) toast.error(firstError)
      return
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/admin/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('admin_access_token')}`
        },
        body: JSON.stringify({
          username: editForm.fullName,
          email: editForm.email,
          phone: editForm.phone,
          full_name: editForm.fullName,
          address: editForm.address,
          bio: editForm.bio
        })
      })
      const data = await response.json()
      
      if (data?.success) {
        const updated = data.data
        setProfile(prev => ({
          ...prev,
          fullName: updated.full_name || editForm.fullName,
          username: updated.username || editForm.fullName,
          email: updated.email || editForm.email,
          phone: updated.phone || editForm.phone,
          bio: updated.bio || editForm.bio,
          address: updated.address || editForm.address
        }))
        setShowEditProfile(false)
        setEditErrors({})
        showMessage(' Profile updated successfully!')
      } else {
        const errorMsg = data?.errors || 'Update failed'
        if (typeof errorMsg === 'object') {
          const errors = errorMsg
          const newErrors = {}
          for (const [field, messages] of Object.entries(errors)) {
            newErrors[field] = Array.isArray(messages) ? messages[0] : messages
          }
          setEditErrors(newErrors)
          const firstError = Object.values(newErrors)[0]
          if (firstError) toast.error(firstError)
        } else {
          setErrorMessage(errorMsg)
          setTimeout(() => setErrorMessage(''), 4000)
        }
      }
    } catch (error) {
      setErrorMessage('Failed to update profile')
      setTimeout(() => setErrorMessage(''), 4000)
    }
  }

  const handleChangePassword = async () => {
    setPasswordErrors([]);
    setPasswordMatchError(false);
    
    if (!passwordForm.currentPassword) {
      toast.error('Please enter your current password');
      return;
    }
    
    const errors = [];
    if (passwordForm.newPassword.length < 6) {
      errors.push('Password must be at least 6 characters');
    }
    if (!/[A-Z]/.test(passwordForm.newPassword)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[0-9]/.test(passwordForm.newPassword)) {
      errors.push('Password must contain at least one number');
    }
    
    if (errors.length > 0) {
      setPasswordErrors(errors);
      return;
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMatchError(true);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('admin_access_token')}`
        },
        body: JSON.stringify({
          old_password: passwordForm.currentPassword,
          new_password: passwordForm.newPassword,
          confirm_password: passwordForm.confirmPassword
        })
      });
      const data = await response.json();
      
      if (data?.success) {
        setShowChangePassword(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        showMessage('Password changed successfully!');
      } else {
        if (data?.errors?.old_password) {
          toast.error(data.errors.old_password[0]);
        } else if (data?.message) {
          toast.error(data.message);
        } else {
          toast.error('Failed to change password');
        }
      }
    } catch (error) {
      console.error('Password change error:', error);
      toast.error('Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const [avatarFile, setAvatarFile] = useState(null)
  const fileInputRef = React.useRef(null)

  const handleAvatarChange = async () => {
    if (!avatarFile) {
      setErrorMessage('Please select an image first')
      setTimeout(() => setErrorMessage(''), 3000)
      return
    }
    
    try {
      const formData = new FormData()
      formData.append('profile_image', avatarFile)
      
      const response = await fetch('http://127.0.0.1:8000/api/admin/profile/update', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('admin_access_token')}`
        },
        body: formData
      })
      const data = await response.json()
      
      if (data?.success) {
        setProfile(prev => ({
          ...prev,
          avatar: data.data?.profile_image_url || URL.createObjectURL(avatarFile)
        }))
        setShowChangeAvatar(false)
        setAvatarFile(null)
        showMessage('Profile picture updated successfully!')
      } else {
        setErrorMessage('Failed to upload image')
        setTimeout(() => setErrorMessage(''), 4000)
      }
    } catch (error) {
      setErrorMessage('Failed to upload profile picture')
      setTimeout(() => setErrorMessage(''), 4000)
    }
  }

  const showMessage = (message) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(''), 4000)
  }

  const statItems = [
    { label: 'Total Listings', value: stats.totalProperties, icon: Home, color: 'blue' },
    { label: 'Active Properties', value: stats.activeListings, icon: CheckCircle, color: 'green' },
    { label: 'Sold Properties', value: stats.soldProperties, icon: Package, color: 'gray' },
    { label: 'Total Portfolio Value', value: formatCurrency(stats.totalRevenue), icon: DollarSign, color: 'purple' }
  ]

  const getStatusColor = (status) => {
    const colors = {
      'Active': 'bg-green-100 text-green-700',
      'Sold': 'bg-blue-100 text-blue-700',
      'Pending': 'bg-yellow-100 text-yellow-700',
      'Rented': 'bg-purple-100 text-purple-700'
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  const getActivityIcon = (type) => {
    const icons = {
      'add': '➕',
      'update': '✏️',
      'sold': '💰',
      'profile': '👤',
      'security': '🔒',
      'login': '🔑'
    }
    return icons[type] || '📌'
  }

  const getActivityColor = (type) => {
    const colors = {
      'add': 'bg-green-100 border-green-500',
      'update': 'bg-blue-100 border-blue-500',
      'sold': 'bg-purple-100 border-purple-500',
      'profile': 'bg-orange-100 border-orange-500',
      'security': 'bg-red-100 border-red-500',
      'login': 'bg-teal-100 border-teal-500'
    }
    return colors[type] || 'bg-gray-100 border-gray-500'
  }

  const maxRevenue = Math.max(...monthlyStats.map(s => s.revenue), 1)
  
  if (isLoading || !profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="lg:ml-64 flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:ml-64">
        <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className="p-4 lg:p-8">
          {/* Header */}
          <div className="mb-5">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center">
              <User className="w-11 h-9 text-emerald-600" />Admin Profile
            </h1>
            <p className="text-gray-500 mt-1">Manage your profile and view performance statistics</p>
          </div>

          {/* Success/Error Messages */}
          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-3 shadow-sm">
              <CheckCircle className="w-5 h-5" />
              <span>{successMessage}</span>
            </div>
          )}
          {errorMessage && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3 shadow-sm">
              <span>⚠️ {errorMessage}</span>
            </div>
          )}

          {/* Profile Header Card */}
          <div className="bg-white rounded-xl shadow-sm border border-emerald-600 p-6 mb-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center text-white text-4xl font-bold shadow-lg overflow-hidden">
                  {profile.avatar ? (
                    <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    profile.fullName?.charAt(0) || 'A'
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-100 border-2 border-gray-200 rounded-full flex items-center justify-center text-sm hover:bg-green-600 shadow-sm transition-all"
                >
                  <Camera className="w-6 h-6 text-emerald-600" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAvatarFile(e.target.files[0])}
                  className="hidden"
                />
              </div>
              {/* Info */}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-800">{profile.fullName}</h2>
                  <span className="px-3 py-1 bg-blue-100 text-emerald-700 rounded-full text-xs font-semibold w-fit">
                    {profile.role}
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold w-fit">
                    🟢 Active
                  </span>
                </div>
                <p className="text-gray-500 text-sm mb-3">{profile.bio || 'Add bio'}</p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <span className="flex items-center gap-1 text-gray-600">
                    <Mail className="w-4 h-4 text-emerald-600" />
                    {profile.email}
                  </span>
                  <span className="flex items-center gap-1 text-gray-600">
                    <Phone className="w-4 h-4 text-emerald-600" />
                    {profile.phone}
                  </span>
                  <span className="flex items-center gap-1 text-gray-600">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    {profile.address || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={handleEditProfile}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
                <button
                  onClick={() => setShowChangePassword(true)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors border border-emerald-600 flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  Change Password
                </button>
              </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-3 border-t border-gray-100">
              <div className="text-center">
                <p className="text-xs text-gray-500">Member Since</p>
                <p className="text-sm font-semibold text-gray-800">{formatDate(profile.joinDate)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Last Login</p>
                <p className="text-sm font-semibold text-gray-800">{timeAgo(profile.lastLogin)}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-white rounded-xl shadow-sm border border-emerald-600 p-1 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'properties', label: 'My Properties', icon: Home },
              { id: 'sold', label: 'Sold History', icon: DollarSign },
              { id: 'activity', label: 'Activity Log', icon: Activity }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {statItems.map((stat, idx) => {
                  const bgColorClasses = {
                    blue: 'bg-blue-100',
                    green: 'bg-green-100',
                    gray: 'bg-gray-100',
                    purple: 'bg-purple-100'
                  };
                  
                  const iconColorClasses = {
                    blue: 'text-blue-600',
                    green: 'text-green-600',
                    gray: 'text-gray-600',
                    purple: 'text-purple-600'
                  };
                  
                  return (
                    <div key={idx} className="bg-white rounded-xl border border-emerald-500 p-4 shadow-sm hover:shadow-md transition">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
                          <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                        </div>
                        <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${bgColorClasses[stat.color]}`}>
                          {(() => {
                            const Icon = stat.icon;
                            return <Icon className={`w-7 h-7 ${iconColorClasses[stat.color]}`} />;
                          })()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-sm border border-emerald-600 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-emerald-600" />
                    Recent Activity
                  </h3>
                  {activityLogs.length > 0 && (
                    <button onClick={() => setActiveTab('activity')} className="text-sm text-emerald-600 hover:text-emerald-700">
                      View All →
                    </button>
                  )}
                </div>
                
                {activityLogs.length > 0 ? (
                  <div className="space-y-3">
                    {activityLogs.slice(0, 5).map(log => (
                      <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${getActivityColor(log.type)}`}>
                          {getActivityIcon(log.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800">{log.action}</p>
                          <p className="text-xs text-gray-500 truncate">{log.detail}</p>
                        </div>
                        <span className="text-xs text-gray-400 whitespace-nowrap">{timeAgo(log.date)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Clock className="w-6 h-6 text-emerald-600" />
                    </div>
                    <p className="text-gray-700 text-lg">No activity yet</p>
                    <p className="text-xs text-gray-400 mt-1">Activities will appear here when you perform actions</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MY PROPERTIES TAB */}
          {activeTab === 'properties' && (
            <div className="bg-white rounded-xl shadow-sm border border-emerald-600 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Home className="w-5 h-5 text-emerald-600" />
                    My Properties
                  </h3>
                  {recentProperties.length > 0 && (
                    <span className="text-sm text-gray-500">{recentProperties.length} properties</span>
                  )}
                </div>
                
                {recentProperties.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-emerald-600 border-b border-gray-100">
                          <th className="text-left p-3 text-xs font-semibold text-white uppercase">Property</th>
                          <th className="text-left p-3 text-xs font-semibold text-white uppercase">Type</th>
                          <th className="text-left p-3 text-xs font-semibold text-white uppercase">Location</th>
                          <th className="text-left p-3 text-xs font-semibold text-white uppercase">Size</th>
                          <th className="text-left p-3 text-xs font-semibold text-white uppercase">Price</th>
                          <th className="text-left p-3 text-xs font-semibold text-white uppercase">Status</th>
                          <th className="text-left p-3 text-xs font-semibold text-white uppercase">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentProperties.map(property => (
                         <tr 
                            key={property.id} 
                            onClick={() => navigate(`/property/${property.id}`)}
                            className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
                          >
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-lg">
                                  {property.image ? (
                                    <img src={property.image} alt={property.title} className="w-full h-full object-cover rounded-lg" />
                                  ) : (
                                    '🏠'
                                  )}
                                </div>
                                <span className="text-sm font-medium text-gray-800 max-w-[200px] truncate">{property.title}</span>
                              </div>
                            </td>
                            <td className="p-3 text-sm text-gray-600">{property.type}</td>
                            <td className="p-1 text-sm text-gray-600">{property.location}</td>
                            <td className="p-3 text-sm text-gray-600">{property.size}</td>
                            <td className="p-3 text-sm font-semibold text-gray-800">{formatCurrency(property.price)}</td>
                            <td className="p-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
                                {property.status}
                              </span>
                            </td>
                            <td className="p-3 text-sm text-gray-500">{formatDate(property.date)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Home className="w-8 h-8 text-emerald-600" />
                    </div>
                    <p className="text-gray-500 text-base">No properties yet</p>
                    <p className="text-xs text-gray-400 mt-1">Properties will appear here when you add them</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SOLD HISTORY TAB */}
          {activeTab === 'sold' && (
            <div className="bg-white rounded-xl shadow-sm border border-emerald-600 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                    Sold Property History
                  </h3>
                  {soldProperties.length > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500">Total Profit:</span>
                      <span className="font-bold text-green-600">
                       {formatCurrency(stats.totalRevenue)}
                      </span>
                    </div>
                  )}
                </div>
                
                {soldProperties.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-emerald-600 border-b border-gray-100">
                          <th className="text-left p-3 text-xs font-semibold text-white uppercase">Property</th>
                          <th className="text-left p-3 text-xs font-semibold text-white uppercase">Type</th>
                          <th className="text-left p-3 text-xs font-semibold text-white uppercase">Location</th>
                          <th className="text-left p-3 text-xs font-semibold text-white uppercase">Size</th>
                          {/* <th className="text-left p-3 text-xs font-semibold text-white uppercase">Sold Price</th> */}
                          <th className="text-left p-3 text-xs font-semibold text-white uppercase">Buyer</th>
                          <th className="text-left p-3 text-xs font-semibold text-white uppercase">Sold Date</th>
                          <th className="text-left p-3 text-xs font-semibold text-white uppercase">Profit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {soldProperties.map(property => (
                          <tr 
                            key={property.id} 
                            onClick={() => navigate(`/property/${property.id}`)}
                            className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
                          >
                            <td className="p-2">
                              <div className="flex items-center gap-2">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-lg">
                                  {property.image ? (
                                    <img src={property.image} alt={property.title} className="w-full h-full object-cover rounded-lg" />
                                  ) : (
                                    '🏠'
                                  )}
                                </div>
                                <span className="text-sm font-medium text-gray-800 max-w-[200px] truncate">{property.title}</span>
                              </div>
                            </td>
                            <td className="p-3 text-sm text-gray-600">{property.type || 'Property'}</td>
                            <td className="p-3 text-sm text-gray-600">{property.location || 'N/A'}</td>
                            <td className="p-3 text-sm text-gray-600">{property.size || 'N/A'}</td>
                            {/* <td className="p-3 text-sm font-semibold text-gray-800">{formatCurrency(property.price)}</td> */}
                            <td className="p-3 text-sm text-gray-600">{property.buyer}</td>
                            <td className="p-3 text-sm text-gray-500">
                              {property.soldDate ? formatDate(property.soldDate) : 'N/A'}
                            </td>
                            <td className="p-3">
                              <span className="text-sm font-semibold text-green-600">+{formatCurrency(property.profit)}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <DollarSign className="w-8 h-8 text-emerald-600" />
                    </div>
                    <p className="text-gray-500 text-lg">No sold properties yet</p>
                    <p className="text-xs text-gray-400 mt-1">Sold properties will appear here when properties are marked as sold</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ACTIVITY LOG TAB */}
          {activeTab === 'activity' && (
            <div className="bg-white rounded-xl shadow-sm border border-emerald-600 overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  Complete Activity Log
                </h3>
                
                {activityLogs.length > 0 ? (
                  <div className="space-y-0">
                    {activityLogs.map((log, index) => (
                      <div key={log.id} className="relative pl-8 pb-4">
                        {index < activityLogs.length - 1 && (
                          <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-gray-200"></div>
                        )}
                        <div className={`absolute left-1.5 top-1 w-4 h-4 rounded-full border-2 ${getActivityColor(log.type)}`}>
                          <div className="w-2 h-2 rounded-full m-0.5 bg-current"></div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-800">{log.action}</span>
                            <span className="text-xs text-gray-400">{timeAgo(log.date)}</span>
                          </div>
                          <p className="text-xs text-gray-500">{log.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <FileText className="w-8 h-8 text-emerald-600" />
                    </div>
                    <p className="text-gray-500 text-lg">No activity logs found</p>
                    <p className="text-xs text-gray-400 mt-1">Activities will appear here when you perform actions</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* EDIT PROFILE MODAL with Validation */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">✏️ Edit Profile</h2>
                <button 
                  onClick={() => {
                    setShowEditProfile(false)
                    setEditErrors({})
                  }} 
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg text-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input 
                    type="text" 
                    value={editForm.fullName} 
                    onChange={(e) => {
                      setEditForm(prev => ({ ...prev, fullName: e.target.value }))
                      clearEditError('fullName')
                    }} 
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      editErrors.fullName ? 'border-red-500 bg-red-50' : 'border-gray-200'
                    }`}
                  />
                  {editErrors.fullName && (
                    <p className="text-red-500 text-xs mt-1">{editErrors.fullName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input 
                    type="email" 
                    value={editForm.email} 
                    onChange={(e) => {
                      setEditForm(prev => ({ ...prev, email: e.target.value }))
                      clearEditError('email')
                    }} 
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      editErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-200'
                    }`}
                  />
                  {editErrors.email && (
                    <p className="text-red-500 text-xs mt-1">{editErrors.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input 
                    type="text" 
                    value={editForm.phone} 
                    onChange={(e) => {
                      setEditForm(prev => ({ ...prev, phone: e.target.value }))
                      clearEditError('phone')
                    }} 
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      editErrors.phone ? 'border-red-500 bg-red-50' : 'border-gray-200'
                    }`}
                  />
                  {editErrors.phone && (
                    <p className="text-red-500 text-xs mt-1">{editErrors.phone}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea 
                    value={editForm.bio} 
                    onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))} 
                    rows="3" 
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input 
                      type="text" 
                      value={editForm.address} 
                      onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))} 
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <input 
                      type="text" 
                      value={editForm.department} 
                      onChange={(e) => setEditForm(prev => ({ ...prev, department: e.target.value }))} 
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => {
                    setShowEditProfile(false)
                    setEditErrors({})
                  }} 
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveProfile} 
                  className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700"
                >
                  💾 Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CHANGE PASSWORD MODAL */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-emerald-600" />
                  Change Password
                </h2>
                <button 
                  onClick={() => {
                    setShowChangePassword(false);
                    setPasswordErrors([]);
                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }} 
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Password *</label>
                  <input 
                    type="password" 
                    value={passwordForm.currentPassword} 
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))} 
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Enter current password"
                  />
                </div>
                
                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password *</label>
                  <input 
                    type="password" 
                    value={passwordForm.newPassword} 
                    onChange={(e) => {
                      setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }));
                      setPasswordErrors([]);
                    }} 
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                      passwordErrors.length > 0 ? 'border-red-500 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="Min 6 chars, 1 uppercase, 1 number"
                  />
                  {passwordErrors.length > 0 && (
                    <div className="mt-1 space-y-0.5">
                      {passwordErrors.map((err, idx) => (
                        <p key={idx} className="text-xs text-red-500">• {err}</p>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Confirm New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password *</label>
                  <input 
                    type="password" 
                    value={passwordForm.confirmPassword} 
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))} 
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                      passwordMatchError ? 'border-red-500 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="Confirm new password"
                  />
                  {passwordMatchError && (
                    <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                  )}
                </div>
                
                {/* Forgot Password Link */}
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setShowChangePassword(false);
                      setShowForgotPassword(true);
                      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      setPasswordErrors([]);
                      setPasswordMatchError(false);
                    }}
                    className="text-sm text-red-500 hover:text-red-600 transition-all cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => {
                    setShowChangePassword(false);
                    setPasswordErrors([]);
                    setPasswordMatchError(false);
                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }} 
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleChangePassword} 
                  disabled={isLoading}
                  className={`flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg text-sm font-medium hover:shadow-md transition-all flex items-center justify-center gap-2 ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Update Password
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CHANGE AVATAR MODAL */}
      {showChangeAvatar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
            <div className="p-6 text-center">
              <h2 className="text-xl font-bold text-gray-800 mb-4">📷 Update Profile Picture</h2>
              
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center text-white text-4xl font-bold shadow-lg overflow-hidden">
                {profile.avatar ? (
                  <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  profile.fullName?.charAt(0) || 'A'
                )}
              </div>
              
              <p className="text-sm text-gray-500 mb-4">
                {avatarFile ? avatarFile.name : 'Select a profile photo'}
              </p>
              
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={(e) => setAvatarFile(e.target.files[0])}
                className="hidden"
              />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 mb-2 w-full"
              >
                📁 Choose Photo
              </button>
              
              {avatarFile && (
                <button
                  onClick={handleAvatarChange}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 mb-2 w-full"
                >
                  Upload & Save
                </button>
              )}
              
              <button
                onClick={() => { setShowChangeAvatar(false); setAvatarFile(null) }}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 w-full"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      <ForgotPasswordModal 
        isOpen={showForgotPassword} 
        onClose={() => setShowForgotPassword(false)} 
      />
    </div>
  )
}

export default AdminProfile