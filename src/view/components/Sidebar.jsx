import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home as HomeIcon, LayoutDashboard, List, Plus, TrendingUp, Users, LogOut } from 'lucide-react';


const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation()
  const navigate = useNavigate()
  
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Manage Lists', icon: List, path: '/properties' },
    { name: 'Add Property', icon: Plus, path: '/add-property' },
    { name: 'Market Trends', icon: TrendingUp, path: '/property-prices' },
    { name: 'User Management', icon: Users, path: '/user-management' },
  ]

    const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard'
    }
    return location.pathname === path
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
    <>
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-64 bg-gray-50 shadow-lg z-50
        transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
        overflow-y-auto
      `}>
        <div className="pl-5 pr-5">
          {/* Logo */}
          <div className="flex items-center gap-3 mt-2 mb-5 border-b border-emerald-500 pb-3">
              <div className="inline-block ">
        <HomeIcon className="w-11 h-11 text-emerald-500 mx-auto" />
      {/* </div> */}
            </div>
            <div>
              <h2 className="font-bold text-gray-800 text-lg" >Lahore Property</h2>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>

          {/* Close Button - Mobile Only */}
          <button 
            onClick={onClose}
            className="lg:hidden absolute top-5 right-5 p-1 rounded-lg text-gray-400 hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {/* Menu Items */}
          <nav className="space-y-1 mt-8 lg:mt-0">
            {menuItems.map((item, index) => {
              const Icon = item.icon
              const active = isActive(item.path)
              return (
              <Link
                  key={index}
                  to={item.path}
                  onClick={onClose}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg 
                    ${active 
                    ? 'bg-emerald-500 text-white' 
                    : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
                  }
                `}
              >
                 <Icon className="w-5 h-5" />
                  <span className="text-sl font-medium">{item.name}</span>
              </Link>
            )
            })}
          </nav>

          {/* Logout Button */}
          <div className="absolute bottom-6 left-0 right-0 px-5">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 text-gray-500 hover:text-red-600 w-full px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-red-50"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sl font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overlay - Mobile Only */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
    </>
  )
}

export default Sidebar