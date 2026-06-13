import React, { useState, useEffect, useMemo } from 'react'
import { Search, Plus, Edit2, Trash2, Eye, EyeOff, ChevronLeft, ChevronRight, X, Check, Shield, Users, UserPlus, AlertCircle } from 'lucide-react'
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/AdminNavbar";
import { adminAPI } from '../../../services/authService'
import { toast, Toaster } from 'sonner'

const UserManagement = () => {
  // Layout State
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // User Management State
  const [users, setUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({ role: 'All', status: 'All' })
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [notification, setNotification] = useState(null)
  
  //  Validation errors state
  const [validationErrors, setValidationErrors] = useState({})
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    role: 'user',
    status: 'Active'
  })
  
  const itemsPerPage = 5

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    toast[type === 'error' ? 'error' : 'success'](message)
    setTimeout(() => setNotification(null), 4000)
  }

  //  Clear validation error when field changes
  const clearFieldError = (fieldName) => {
    if (validationErrors[fieldName]) {
      setValidationErrors(prev => ({ ...prev, [fieldName]: '' }))
    }
  }

  //  Validate Add User form
  const validateAddUser = () => {
    const errors = {}
    
    if (!formData.username.trim()) {
      errors.username = 'Username is required'
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters'
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        errors.email = 'Please enter a valid email address'
      }
    }
    
    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }
    
    if (!formData.role) {
      errors.role = 'Role is required'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  //  Validate Edit User form
  const validateEditUser = () => {
    const errors = {}
    
    if (!formData.username.trim()) {
      errors.username = 'Username is required'
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters'
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        errors.email = 'Please enter a valid email address'
      }
    }
    
    // Password is optional in edit mode
    if (formData.password && formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }
    
    if (!formData.role) {
      errors.role = 'Role is required'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Fetch Users from API
  useEffect(() => {
    fetchUsers()
    fetchStats()
  }, [])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const response = await adminAPI.getUsers()
      const apiUsers = response.data?.data || response.data || []
      
      const formattedUsers = apiUsers.map(user => ({
        id: user.user_id,
        fullName: user.full_name || user.username || 'N/A',
        email: user.email,
        username: user.username,
        role: user.role === 'admin' ? 'Admin' : 'User',
        status: user.status === 'active' ? 'Active' : user.status === 'inactive' ? 'Inactive' : 'Suspended',
        registrationDate: user.created_at ? new Date(user.created_at).toISOString().split('T')[0] : 'N/A',
        lastLogin: user.last_login,
        phone: user.phone || ''
      }))
      
      setUsers(formattedUsers)
    } catch (error) {
      console.error('Error fetching users:', error)
      showNotification('Failed to load users', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const [stats, setStats] = useState({
    totalUsers: 0, activeAccounts: 0, totalAdmins: 0, inactiveAccounts: 0
  })

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getDashboardStats()
      const data = response.data?.data || response.data || {}
      setStats({
        totalUsers: data.total_accounts || 0,
        activeAccounts: data.active_accounts || 0,
        totalAdmins: data.total_admins || 0,
        inactiveAccounts: data.inactive_accounts || 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  // Filter and Search Logic
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRole = filters.role === 'All' || user.role === filters.role
      const matchesStatus = filters.status === 'All' || user.status === filters.status
      return matchesSearch && matchesRole && matchesStatus
    })
  }, [users, searchTerm, filters])

  // Pagination Logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Toggle User Status
  const toggleStatus = async (userId) => {
    const user = users.find(u => u.id === userId)
    const newStatus = user.status === 'Active' ? 'inactive' : 'active'
    
    try {
      await adminAPI.changeUserStatus(userId, newStatus)
      await fetchUsers()
      await fetchStats()
      showNotification(`User ${newStatus === 'active' ? 'activated' : 'deactivated'}`)
    } catch (error) {
      showNotification('Failed to change status', 'error')
    }
  }

  // Handle Add User
  const handleAddUser = async () => {
    //  Validate before submitting
    if (!validateAddUser()) {
      const firstError = Object.values(validationErrors)[0]
      if (firstError) toast.error(firstError)
      return
    }

    try {
      setIsLoading(true)
      const payload = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirm_password: formData.password,
        role: formData.role === 'Admin' ? 'admin' : 'user'
      }
      
      await adminAPI.createUser(payload)
      await fetchUsers()
      await fetchStats()
      
      setShowAddModal(false)
      resetForm()
      setValidationErrors({})
      showNotification('User created successfully')
    } catch (error) {
      console.log('Add error response:', error.response?.data)
      
      // Handle backend validation errors
      if (error.response?.data?.errors) {
        const backendErrors = error.response.data.errors
        const newErrors = {}
        for (const [field, messages] of Object.entries(backendErrors)) {
          newErrors[field] = Array.isArray(messages) ? messages[0] : messages
        }
        setValidationErrors(newErrors)
        const firstError = Object.values(newErrors)[0]
        if (firstError) toast.error(firstError)
      } else {
        const errMsg = error.response?.data?.message || 'Failed to create user'
        showNotification(errMsg, 'error')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Edit User
  const handleEditUser = async () => {
    // Validate before submitting
    if (!validateEditUser()) {
      const firstError = Object.values(validationErrors)[0]
      if (firstError) toast.error(firstError)
      return
    }

    try {
      setIsLoading(true)
      const payload = {
        full_name: formData.fullName,
        username: formData.username,
        email: formData.email,
        role: formData.role === 'Admin' ? 'admin' : 'user',
        status: formData.status === 'Active' ? 'active' : 'inactive'
      }
      
      if (formData.password?.trim()) {
        payload.password = formData.password
        payload.confirm_password = formData.password
      }
      
      await adminAPI.updateUser(selectedUser.id, payload)
      await fetchUsers()
      await fetchStats()
      setShowEditModal(false)
      resetForm()
      setValidationErrors({})
      showNotification('User updated successfully')
    } catch (error) {
      console.error('Edit error:', error)
      
      // Handle backend validation errors
      if (error.response?.data?.errors) {
        const backendErrors = error.response.data.errors
        const newErrors = {}
        for (const [field, messages] of Object.entries(backendErrors)) {
          newErrors[field] = Array.isArray(messages) ? messages[0] : messages
        }
        setValidationErrors(newErrors)
        const firstError = Object.values(newErrors)[0]
        if (firstError) toast.error(firstError)
      } else {
        const msg = error?.response?.data?.message || 'Failed to update user'
        showNotification(msg, 'error')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Delete User
  const handleDeleteUser = async () => {
    if (!selectedUser) return
    try {
      setIsLoading(true)
      await adminAPI.deleteUser(selectedUser.id)
      await fetchUsers()
      await fetchStats()
      setShowDeleteModal(false)
      setSelectedUser(null)
      showNotification('User deleted successfully')
    } catch (error) {
      console.error('Delete error:', error)
      const msg = error.response?.data?.message || 'Failed to delete user'
      showNotification(msg, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      username: '',
      password: '',
      role: 'user',
      status: 'Active'
    })
    setValidationErrors({})
    setShowPassword(false)
  }

  // Open Edit Modal
  const openEditModal = (user) => {
    setSelectedUser(user)
    setFormData({
      fullName: user.fullName,
      email: user.email,
      username: user.username,
      password: '',
      role: user.role,
      status: user.status
    })
    setValidationErrors({})
    setShowEditModal(true)
  }

  // Form Input Handler
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    clearFieldError(name)
  }

  const getAdminName = () => {
    const storedData = localStorage.getItem('adminData')
    if (storedData) {
      try {
        const data = JSON.parse(storedData)
        return data.username || 'Admin'
      } catch (e) {
        return 'Admin'
      }
    }
    return 'Admin'
  }

  const handleLogout = async () => {
    try {
      const refresh_token = localStorage.getItem('admin_refresh_token')
      const token = localStorage.getItem('admin_access_token')
      if (token && refresh_token) {
        await fetch('http://127.0.0.1:8000/api/admin/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ refresh_token })
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.clear()
      window.location.href = '/sign_in'
    }
  }

  if (isLoading && users.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="lg:ml-64">
          <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} adminName={getAdminName()} onLogout={handleLogout} />
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading users...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" richColors />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:ml-64">
        <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} adminName={getAdminName()} onLogout={handleLogout} />
        
        <div className="p-4 lg:p-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Users className="w-8 h-8 text-emerald-600" />
              User Management
            </h1>
            <p className="text-gray-500 mt-1">Manage all users and their permissions</p>
          </div>
          
          {notification && (
            <div className={`mb-4 p-4 rounded-xl flex items-center gap-3 shadow-sm ${notification.type === 'error' ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'}`}>
              <AlertCircle className="w-5 h-5" /> 
              <span>{notification.message}</span>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-emerald-600 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-900">Total Users</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.totalUsers}</p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Users className="w-7 h-7 text-emerald-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-emerald-600 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-900">Active Users</p>
                  <p className="text-2xl font-bold text-green-600">{stats.activeAccounts}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-7 h-7 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-emerald-600 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-900">Admins</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.totalAdmins}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <UserPlus className="w-7 h-7 text-purple-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-emerald-600 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-900">Inactive</p>
                  <p className="text-2xl font-bold text-red-600">{stats.inactiveAccounts}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <X className="w-7 h-7 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-xl shadow-sm border border-emerald-600">
            {/* Toolbar */}
            <div className="p-4 lg:p-6 border-b border-gray-100">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-emerald-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-2">
                  <select 
                    value={filters.role} 
                    onChange={(e) => { setFilters(prev => ({ ...prev, role: e.target.value })); setCurrentPage(1) }}
                    className="px-3 py-2 border border-emerald-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="All">All Roles</option>
                    <option value="Admin">Admin</option>
                    <option value="User">User</option>
                  </select>
                  <select
                    value={filters.status}
                    onChange={(e) => { setFilters(prev => ({ ...prev, status: e.target.value })); setCurrentPage(1) }}
                    className="px-3 py-2 border border-emerald-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer"
                  >
                    <option value="All">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <button
                  onClick={() => { resetForm(); setShowAddModal(true); setShowPassword(false) }}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors duration-200 whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  Add New User
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-emerald-600 border-b border-gray-100">
                    <th className="text-left p-4 text-xs font-semibold text-white uppercase tracking-wider">ID</th>
                    <th className="text-left p-4 text-xs font-semibold text-white uppercase tracking-wider">User</th>
                    <th className="text-left p-4 text-xs font-semibold text-white uppercase tracking-wider">Email</th>
                    <th className="text-left p-4 text-xs font-semibold text-white uppercase tracking-wider">Role</th>
                    <th className="text-left p-4 text-xs font-semibold text-white uppercase tracking-wider">Status</th>
                    <th className="text-left p-4 text-xs font-semibold text-white uppercase tracking-wider">Date</th>
                    <th className="text-left p-4 text-xs font-semibold text-white uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <Users className="w-12 h-12 text-gray-300" />
                          <p className="text-gray-500">No users found</p>
                        </div>
                       </td>
                    </tr>
                  ) : (
                    paginatedUsers.map((user, index) => (
                      <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors duration-150">
                        <td className="p-4 text-sm text-gray-600 font-mono font-medium">
                          #{((currentPage - 1) * itemsPerPage) + index + 1}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center text-emerald-600 font-semibold text-sm">
                              {user.fullName.charAt(0)}
                            </div>
                            <span className="text-sm font-medium text-gray-800">{user.fullName}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-gray-600">{user.email}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => toggleStatus(user.id)}
                            className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                              user.status === 'Active' ? 'bg-green-500' : 'bg-gray-300'
                            }`}
                          >
                            <span className="sr-only">Toggle status</span>
                            <span className={`inline-block w-4 h-4 transform transition-transform duration-200 bg-white rounded-full ${
                              user.status === 'Active' ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </button>
                        </td>
                        <td className="p-4 text-sm text-gray-600">{user.registrationDate}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setSelectedUser(user)
                                setShowViewModal(true)
                              }}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openEditModal(user)}
                              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
                              title="Edit User"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedUser(user)
                                setShowDeleteModal(true)
                              }}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-gray-100">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-gray-100 transition-all duration-200"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-all duration-200 ${
                          currentPage === page
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-gray-100 transition-all duration-200"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add User Modal with Validation */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Add New User</h2>
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setValidationErrors({})
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent ${
                      validationErrors.fullName ? 'border-red-500 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="Enter full name"
                  />
                  {validationErrors.fullName && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.fullName}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent ${
                      validationErrors.username ? 'border-red-500 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="Enter username"
                  />
                  {validationErrors.username && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.username}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent ${
                      validationErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="Enter email"
                  />
                  {validationErrors.email && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      name="password" 
                      value={formData.password} 
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 pr-10 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent ${
                        validationErrors.password ? 'border-red-500 bg-red-50' : 'border-gray-200'
                      }`}
                      placeholder="Enter password" 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)} 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>
                  {validationErrors.password && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.password}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">Minimum 6 characters</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                  <select 
                    name="role" 
                    value={formData.role} 
                    onChange={handleInputChange} 
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent ${
                      validationErrors.role ? 'border-red-500 bg-red-50' : 'border-gray-200'
                    }`}
                  >
                    <option value="user">User</option>
                    <option value="Admin">Admin</option>
                  </select>
                  {validationErrors.role && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.role}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setValidationErrors({})
                  }}
                  className="flex-1 px-4 py-2 border border-emerald-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddUser}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors duration-200 disabled:opacity-50"
                >
                  {isLoading ? 'Adding...' : 'Add User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal with Validation */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Edit User</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setValidationErrors({})
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent ${
                      validationErrors.fullName ? 'border-red-500 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="Enter full name"
                  />
                  {validationErrors.fullName && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.fullName}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent ${
                      validationErrors.username ? 'border-red-500 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="Enter username"
                  />
                  {validationErrors.username && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.username}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent ${
                      validationErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="Enter email"
                  />
                  {validationErrors.email && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password {showEditModal && '(leave blank to keep unchanged)'}
                  </label>
                  <div className="relative">
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      name="password" 
                      value={formData.password} 
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 pr-10 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent ${
                        validationErrors.password ? 'border-red-500 bg-red-50' : 'border-gray-200'
                      }`}
                      placeholder="New password (optional)" 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)} 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>
                  {validationErrors.password && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.password}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">Minimum 6 characters if changing</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                  <select 
                    name="role" 
                    value={formData.role} 
                    onChange={handleInputChange} 
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent ${
                      validationErrors.role ? 'border-red-500 bg-red-50' : 'border-gray-200'
                    }`}
                  >
                    <option value="user">User</option>
                    <option value="Admin">Admin</option>
                  </select>
                  {validationErrors.role && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.role}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select 
                    name="status" 
                    value={formData.status} 
                    onChange={handleInputChange} 
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setValidationErrors({})
                  }}
                  className="flex-1 px-4 py-2 border border-emerald-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditUser}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors duration-200 disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">User Details</h2>
                <button onClick={() => setShowViewModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                    <span className="text-3xl font-bold text-blue-600">
                      {selectedUser.fullName?.charAt(0) || '?'}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-500">Full Name</span>
                  <span className="text-sm font-medium text-gray-800">{selectedUser.fullName}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-500">Username</span>
                  <span className="text-sm font-medium text-gray-800">{selectedUser.username}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-500">Email</span>
                  <span className="text-sm font-medium text-gray-800">{selectedUser.email}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-500">Role</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    selectedUser.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                  }`}>{selectedUser.role}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-500">Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    selectedUser.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>{selectedUser.status}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-500">Registration Date</span>
                  <span className="text-sm font-medium text-gray-800">{selectedUser.registrationDate}</span>
                </div>
              </div>

              <button onClick={() => setShowViewModal(false)} className="w-full mt-6 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all">
            <div className="p-6">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-gray-800 text-center mb-2">Delete User</h2>
              <p className="text-sm text-gray-500 text-center mb-6">
                Are you sure you want to delete <span className="font-semibold text-gray-800">{selectedUser.fullName}</span>? This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors duration-200 disabled:opacity-50"
                >
                  {isLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserManagement