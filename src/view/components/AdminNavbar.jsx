import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Navbar = ({ toggleSidebar }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [profile, setProfile] = useState({ fullName: 'Admin', email: '', initial: 'A', avatar: null })
  const navigate = useNavigate()

  useEffect(() => {
    fetchProfile()
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
          fullName: admin.full_name || admin.username || 'Admin',
          email: admin.email || '',
          initial: (admin.full_name || admin.username || 'A').charAt(0).toUpperCase(),
          avatar: admin.profile_image_url || null
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('admin_refresh_token')
      if (refreshToken) {
        await fetch('http://127.0.0.1:8000/api/admin/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken })
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('admin_access_token')
      localStorage.removeItem('admin_refresh_token')
      localStorage.removeItem('isAdminLoggedIn')
      localStorage.removeItem('adminData')
      navigate('/sign_in')
    }
  }

  return (
    <nav className="bg-emerald-600 border-b border-gray-200 sticky top-0 z-30">
      <div className="px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          <div className="flex items-center gap-4">
            <button onClick={toggleSidebar} className="p-2 rounded-lg text-white hover:bg-emerald-700 lg:hidden">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-semibold text-white">Property Listings</h1>
              <p className="text-sm text-gray-100 hidden sm:block">Manage all your property listings in one place</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-2 p-1 rounded-lg hover:bg-emerald-700 transition whitespace-nowrap">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-emerald-600 text-sm font-medium overflow-hidden">
                  {profile.avatar ? (
                    <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    profile.initial
                  )}
                </div>
                <span className="hidden sm:block text-sm text-gray-100">{profile.fullName}</span>
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isProfileOpen && (
                <>
                 <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20">
  <div className="px-4 py-2 border-b border-gray-100">
    <p className="text-sm font-medium text-gray-800 truncate max-w-[200px]" title={profile.fullName}>
      {profile.fullName}
    </p>
    <p className="text-xs text-gray-500 truncate max-w-[200px]" title={profile.email}>
      {profile.email}
    </p>
  </div>
  <button onClick={() => { navigate('/admin-profile'); setIsProfileOpen(false) }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
    <span>Profile</span>
  </button>
  <div className="border-t border-gray-100"></div>
  <button onClick={() => { setIsProfileOpen(false); handleLogout() }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2">
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
    <span>Logout</span>
  </button>
</div>
<div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)}></div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar