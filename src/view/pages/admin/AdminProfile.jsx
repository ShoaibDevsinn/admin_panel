import React, { useState, useEffect, useMemo } from 'react'
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/AdminNavbar";
import { adminAPI } from '../../../services/authService'


const AdminProfile = () => {
  // Layout State
  const [sidebarOpen, setSidebarOpen] = useState(false)

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

  // // Load Dummy Data
  // useEffect(() => {
  //   const dummyRecentProperties = [
  //     { id: 1, title: '5 Marla House DHA Phase 6', price: 14000000, status: 'Active', type: 'House', size: '5 Marla', location: 'DHA Phase 6', date: '2025-04-12', image: null },
  //     { id: 2, title: '10 Marla Plot Bahria Town', price: 17500000, status: 'Active', type: 'Plot', size: '10 Marla', location: 'Bahria Town', date: '2025-04-10', image: null },
  //     { id: 3, title: '1 Kanal House Johar Town', price: 22000000, status: 'Pending', type: 'House', size: '1 Kanal', location: 'Johar Town', date: '2025-04-08', image: null },
  //     { id: 4, title: '2 Kanal Luxury Villa Model Town', price: 138000000, status: 'Active', type: 'Villa', size: '2 Kanal', location: 'Model Town', date: '2025-04-05', image: null },
  //     { id: 5, title: '5 Marla Commercial Plot Wapda Town', price: 8500000, status: 'Sold', type: 'Commercial', size: '5 Marla', location: 'Wapda Town', date: '2025-04-01', image: null },
  //     { id: 6, title: '10 Marla House Gulberg', price: 43000000, status: 'Active', type: 'House', size: '10 Marla', location: 'Gulberg', date: '2025-03-28', image: null }
  //   ]

  //   const dummySoldProperties = [
  //     { id: 1, title: '5 Marla House DHA Phase 5', price: 13500000, soldDate: '2025-03-15', buyer: 'Usman Raza', profit: 1500000 },
  //     { id: 2, title: '10 Marla Plot Bahria Town', price: 16500000, soldDate: '2025-03-10', buyer: 'Fatima Ali', profit: 2000000 },
  //     { id: 3, title: '1 Kanal House Johar Town', price: 21000000, soldDate: '2025-02-28', buyer: 'Bilal Hassan', profit: 3000000 },
  //     { id: 4, title: '5 Marla Commercial Wapda Town', price: 8500000, soldDate: '2025-02-15', buyer: 'Sara Ahmed', profit: 800000 },
  //     { id: 5, title: '2 Kanal Villa Model Town', price: 125000000, soldDate: '2025-01-20', buyer: 'Hassan Riaz', profit: 15000000 }
  //   ]

  //   const dummyActivityLogs = [
  //     { id: 1, action: 'Added Property', detail: 'Added "5 Marla House DHA Phase 6"', date: '2025-04-12T14:30:00', type: 'add' },
  //     { id: 2, action: 'Updated Price', detail: 'Updated price for "10 Marla Plot Bahria Town"', date: '2025-04-10T09:15:00', type: 'update' },
  //     { id: 3, action: 'Sold Property', detail: 'Marked "5 Marla House DHA Phase 5" as sold', date: '2025-04-08T16:45:00', type: 'sold' },
  //     { id: 4, action: 'Profile Updated', detail: 'Updated profile information', date: '2025-04-05T11:20:00', type: 'profile' },
  //     { id: 5, action: 'Password Changed', detail: 'Changed account password', date: '2025-04-01T08:00:00', type: 'security' },
  //     { id: 6, action: 'Added Property', detail: 'Added "2 Kanal Luxury Villa Model Town"', date: '2025-03-28T15:30:00', type: 'add' },
  //     { id: 7, action: 'Login', detail: 'Logged in from new device', date: '2025-03-25T10:00:00', type: 'login' },
  //     { id: 8, action: 'Sold Property', detail: 'Marked "1 Kanal House Johar Town" as sold', date: '2025-03-20T14:00:00', type: 'sold' }
  //   ]

  //   const dummyMonthlyStats = [
  //     { month: 'Nov 2024', properties: 12, sold: 8, revenue: 45000000 },
  //     { month: 'Dec 2024', properties: 15, sold: 10, revenue: 55000000 },
  //     { month: 'Jan 2025', properties: 18, sold: 12, revenue: 65000000 },
  //     { month: 'Feb 2025', properties: 14, sold: 9, revenue: 50000000 },
  //     { month: 'Mar 2025', properties: 20, sold: 15, revenue: 75000000 },
  //     { month: 'Apr 2025', properties: 22, sold: 11, revenue: 70000000 }
  //   ]

  //   setRecentProperties(dummyRecentProperties)
  //   setSoldProperties(dummySoldProperties)
  //   setActivityLogs(dummyActivityLogs)
  //   setMonthlyStats(dummyMonthlyStats)

  //   // Initialize edit form
  //   setEditForm({
  //     fullName: profile.fullName,
  //     email: profile.email,
  //     phone: profile.phone,
  //     bio: profile.bio,
  //     address: profile.address,
  //     department: profile.department
  //   })
  // }, [])
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
      type: 'Property',
      size: `${l.area_marla} Marla`,
      location: l.location_name || 'N/A',
      date: l.created_at,
      image: l.primary_image
    })))
    setSoldProperties(listings.filter(l => l.property_status === 'sold').map(l => ({
      id: l.listing_id,
      title: l.title,
      price: l.price,
      soldDate: l.updated_at,
      buyer: 'N/A',
      profit: 0
    })))
  } catch (error) {
    console.error('Error fetching listings:', error)
  }
}

  // Format currency
  const formatCurrency = (amount) => {
    if (amount >= 10000000) return `PKR ${(amount / 10000000).toFixed(2)} Cr`
    if (amount >= 100000) return `PKR ${(amount / 100000).toFixed(2)} Lac`
    return `PKR ${amount.toLocaleString()}`
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    } catch (e) {
      return dateString
    }
  }

  // Format time ago
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

  // Handle Edit Profile
  const handleEditProfile = () => {
    setEditForm({
      fullName: profile.fullName,
      email: profile.email,
      phone: profile.phone,
      bio: profile.bio,
      address: profile.address,
      department: profile.department
    })
    setShowEditProfile(true)
  }

  // Handle Save Profile
  const handleSaveProfile = async () => {
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
        showMessage('✅ Profile updated successfully!')
      } else {
        setErrorMessage(data?.errors || 'Update failed')
        setTimeout(() => setErrorMessage(''), 4000)
      }
    } catch (error) {
      setErrorMessage('Failed to update profile')
      setTimeout(() => setErrorMessage(''), 4000)
    }
  }

  // Handle Change Password
  const handleChangePassword = async () => {
    console.log('Password change payload:', JSON.stringify({
  old_password: passwordForm.currentPassword,
  new_password: passwordForm.newPassword,
  confirm_password: passwordForm.confirmPassword
}))
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      body: JSON.stringify({
  old_password: passwordForm.currentPassword,
  new_password: passwordForm.newPassword,
  confirm_password: passwordForm.confirmPassword
})
      setErrorMessage('Passwords do not match!')
      setTimeout(() => setErrorMessage(''), 3000)
      return
    }
    
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
      })
      const data = await response.json()
      
      if (data?.success) {
        setShowChangePassword(false)
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
        showMessage('✅ Password changed successfully!')
      } else {
        setErrorMessage(data?.errors ? JSON.stringify(data.errors) : 'Failed')
        setTimeout(() => setErrorMessage(''), 4000)
      }
    } catch (error) {
      setErrorMessage('Failed to change password')
      setTimeout(() => setErrorMessage(''), 4000)
    }
  }

  // Handle Avatar Change
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
        showMessage('✅ Profile picture updated successfully!')
      } else {
        setErrorMessage('Failed to upload image')
        setTimeout(() => setErrorMessage(''), 4000)
      }
    } catch (error) {
      setErrorMessage('Failed to upload profile picture')
      setTimeout(() => setErrorMessage(''), 4000)
    }
  }

  // Show message
  const showMessage = (message) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(''), 4000)
  }

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      'Active': 'bg-green-100 text-green-700',
      'Sold': 'bg-blue-100 text-blue-700',
      'Pending': 'bg-yellow-100 text-yellow-700',
      'Rented': 'bg-purple-100 text-purple-700'
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  // Get activity icon
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

  // Get activity color
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

  // Calculate chart max height
  const maxRevenue = Math.max(...monthlyStats.map(s => s.revenue), 1)
  if (isLoading || !profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="lg:ml-64 flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
          <div className="mb-6">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <span>👤</span> Admin Profile
            </h1>
            <p className="text-gray-500 mt-1">Manage your profile and view performance statistics</p>
          </div>

          {/* Success/Error Messages */}
          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-3 shadow-sm">
              <span>{successMessage}</span>
            </div>
          )}
          {errorMessage && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3 shadow-sm">
              <span>⚠️ {errorMessage}</span>
            </div>
          )}

          {/* Profile Header Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
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
    onClick={() => setShowChangeAvatar(true)}
    className="absolute -bottom-2 -right-2 w-8 h-8 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center text-sm hover:bg-gray-50 shadow-sm transition-all"
  >
    📷
  </button>
</div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-800">{profile.fullName}</h2>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold w-fit">
                    {profile.role}
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold w-fit">
                    🟢 Active
                  </span>
                </div>
                <p className="text-gray-500 text-sm mb-3">{profile.bio || 'Add bio'}</p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <span className="flex items-center gap-1 text-gray-600">📧 {profile.email}</span>
                  <span className="flex items-center gap-1 text-gray-600">📱 {profile.phone}</span>
                 <span className="flex items-center gap-1 text-gray-600">📍 {profile.address || 'N/A'}</span>
                  {/* <span className="flex items-center gap-1 text-gray-600">🏢 {profile.department}</span> */}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={handleEditProfile}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  ✏️ Edit Profile
                </button>
                <button
                  onClick={() => setShowChangePassword(true)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  🔒 Change Password
                </button>
              </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-6 border-t border-gray-100">
              <div className="text-center">
                <p className="text-xs text-gray-500">Member Since</p>
                <p className="text-sm font-semibold text-gray-800">{formatDate(profile.joinDate)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Last Login</p>
                <p className="text-sm font-semibold text-gray-800">{timeAgo(profile.lastLogin)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Response Rate</p>
                <p className="text-sm font-semibold text-green-600">{stats.responseRate}%</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Avg Rating</p>
                <p className="text-sm font-semibold text-yellow-600">⭐ {stats.averageRating}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-white rounded-xl shadow-sm border border-gray-100 p-1 overflow-x-auto">
            {[
              { id: 'overview', label: '📊 Overview' },
              { id: 'properties', label: '🏠 My Properties' },
              { id: 'sold', label: '💰 Sold History' },
              { id: 'activity', label: '📝 Activity Log' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
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
              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">🏠</div>
                    <span className="text-xs text-green-600 font-semibold">+12%</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">Total Properties</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.totalProperties}</p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">💰</div>
                    <span className="text-xs text-green-600 font-semibold">+8%</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">Sold Properties</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.soldProperties}</p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl">📋</div>
                    <span className="text-xs text-green-600 font-semibold">+5%</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">Active Listings</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.activeListings}</p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center text-2xl">⏳</div>
                    <span className="text-xs text-red-600 font-semibold">-3%</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">Pending</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.pendingProperties}</p>
                </div>
              </div>

              {/* Revenue & Views */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Total Revenue Generated</p>
                  <p className="text-3xl font-bold text-gray-800 mb-2">{formatCurrency(stats.totalRevenue)}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">78% of annual target</p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Monthly Views</p>
                  <p className="text-3xl font-bold text-gray-800 mb-2">{stats.monthlyViews.toLocaleString()}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">+15% from last month</p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Performance Score</p>
                  <p className="text-3xl font-bold text-gray-800 mb-2">92/100</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Excellent performance</p>
                </div>
              </div>

              {/* Monthly Stats Chart */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">📈 Monthly Performance</h3>
                <div className="space-y-4">
                  {monthlyStats.map(stat => (
                    <div key={stat.month} className="flex items-center gap-4">
                      <span className="text-xs text-gray-500 w-20">{stat.month}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                              style={{ width: `${(stat.revenue / maxRevenue) * 100}%` }}
                            >
                              <span className="text-xs text-white font-semibold">{formatCurrency(stat.revenue)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-4 text-xs text-gray-400">
                          <span>🏠 {stat.properties} properties</span>
                          <span>💰 {stat.sold} sold</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">🕐 Recent Activity</h3>
                  <button onClick={() => setActiveTab('activity')} className="text-sm text-blue-600 hover:text-blue-700">
                    View All →
                  </button>
                </div>
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
              </div>
            </div>
          )}

          {/* MY PROPERTIES TAB */}
          {activeTab === 'properties' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">🏠 My Properties</h3>
                  <span className="text-sm text-gray-500">{recentProperties.length} properties</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left p-3 text-xs font-semibold text-gray-600 uppercase">Property</th>
                        <th className="text-left p-3 text-xs font-semibold text-gray-600 uppercase">Type</th>
                        <th className="text-left p-3 text-xs font-semibold text-gray-600 uppercase">Location</th>
                        <th className="text-left p-3 text-xs font-semibold text-gray-600 uppercase">Size</th>
                        <th className="text-left p-3 text-xs font-semibold text-gray-600 uppercase">Price</th>
                        <th className="text-left p-3 text-xs font-semibold text-gray-600 uppercase">Status</th>
                        <th className="text-left p-3 text-xs font-semibold text-gray-600 uppercase">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentProperties.map(property => (
                        <tr key={property.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center text-lg">
                                {property.type === 'House' ? '🏠' : property.type === 'Plot' ? '🏗️' : property.type === 'Villa' ? '🏰' : '🏢'}
                              </div>
                              <span className="text-sm font-medium text-gray-800">{property.title}</span>
                            </div>
                          </td>
                          <td className="p-3 text-sm text-gray-600">{property.type}</td>
                          <td className="p-3 text-sm text-gray-600">{property.location}</td>
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
              </div>
            </div>
          )}

          {/* SOLD HISTORY TAB */}
          {activeTab === 'sold' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">💰 Sold Property History</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500">Total Profit:</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(soldProperties.reduce((sum, p) => sum + p.profit, 0))}
                    </span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left p-3 text-xs font-semibold text-gray-600 uppercase">Property</th>
                        <th className="text-left p-3 text-xs font-semibold text-gray-600 uppercase">Sold Price</th>
                        <th className="text-left p-3 text-xs font-semibold text-gray-600 uppercase">Buyer</th>
                        <th className="text-left p-3 text-xs font-semibold text-gray-600 uppercase">Sold Date</th>
                        <th className="text-left p-3 text-xs font-semibold text-gray-600 uppercase">Profit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {soldProperties.map(property => (
                        <tr key={property.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-lg">🏠</div>
                              <span className="text-sm font-medium text-gray-800">{property.title}</span>
                            </div>
                          </td>
                          <td className="p-3 text-sm font-semibold text-gray-800">{formatCurrency(property.price)}</td>
                          <td className="p-3 text-sm text-gray-600">{property.buyer}</td>
                          <td className="p-3 text-sm text-gray-500">{formatDate(property.soldDate)}</td>
                          <td className="p-3">
                            <span className="text-sm font-semibold text-green-600">+{formatCurrency(property.profit)}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ACTIVITY LOG TAB */}
          {activeTab === 'activity' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">📝 Complete Activity Log</h3>
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
              </div>
            </div>
          )}

        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">✏️ Edit Profile</h2>
                <button onClick={() => setShowEditProfile(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg text-xl">✕</button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input type="text" value={editForm.fullName} onChange={(e) => setEditForm(prev => ({ ...prev, fullName: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={editForm.email} onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="text" value={editForm.phone} onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea value={editForm.bio} onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))} rows="3" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input type="text" value={editForm.address} onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <input type="text" value={editForm.department} onChange={(e) => setEditForm(prev => ({ ...prev, department: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowEditProfile(false)} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
                <button onClick={handleSaveProfile} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">💾 Save Changes</button>
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
                <h2 className="text-xl font-bold text-gray-800">🔒 Change Password</h2>
                <button onClick={() => setShowChangePassword(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg text-xl">✕</button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <input type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <input type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowChangePassword(false)} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
                <button onClick={handleChangePassword} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">🔒 Update Password</button>
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
            ✅ Upload & Save
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
    </div>
  )
}

export default AdminProfile