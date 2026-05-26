import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Navbar from '../../components/AdminNavbar'
import axios from 'axios'
import { toast } from 'sonner'

const Dashboard = ({ adminData, onLogout }) => {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  
  const [loading, setLoading] = useState(true)
  const [houses, setHouses] = useState([])
  const [stats, setStats] = useState({
    total_listings: 0,
    active_properties: 0,
    sold_properties: 0,
    total_value: 0
  })

  const getAuthToken = () => {
    return localStorage.getItem('admin_access_token')
  }

  // ✅ CORRECTED: Fetch admin's own listings from admin endpoint
  const fetchListings = async () => {
    setLoading(true)
    try {
      const token = getAuthToken()
      
      if (!token) {
        console.log('No token found, redirecting to login...')
        navigate('/sign_in')
        return
      }
      
      // ✅ Use admin listings endpoint - returns only this admin's listings
      const response = await axios.get('http://127.0.0.1:8000/api/listings/admin/listings', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      console.log('Admin Listings Response:', response.data)
      
      if (response.data.success) {
        const listings = response.data.data || []
        setHouses(listings)
        
        // Calculate stats from admin's own listings
        const activeCount = listings.filter(h => h.property_status === 'available').length
        const soldCount = listings.filter(h => h.property_status === 'sold').length
        const totalValue = listings.reduce((sum, h) => sum + (parseFloat(h.price) || 0), 0)
        
        setStats({
          total_listings: listings.length,
          active_properties: activeCount,
          sold_properties: soldCount,
          total_value: totalValue
        })
      } else {
        toast.error('Failed to load listings')
        setHouses([])
      }
    } catch (error) {
      console.error('Error fetching listings:', error)
      
      if (error.response?.status === 401) {
        localStorage.removeItem('admin_access_token')
        localStorage.removeItem('admin_refresh_token')
        localStorage.removeItem('isAdminLoggedIn')
        localStorage.removeItem('adminData')
        toast.error('Session expired. Please login again.')
        navigate('/sign_in')
      } else if (error.response?.status === 403) {
        toast.error('Access denied. Admin privileges required.')
      } else {
        toast.error('Failed to load properties')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchListings()
  }, [])

  const formatPrice = (price) => {
    if (!price) return '₨ 0'
    const numPrice = parseFloat(price)
    const inCrores = numPrice / 10000000
    if (inCrores >= 1) {
      return `₨ ${inCrores.toFixed(1)} Cr`
    }
    const inLacs = numPrice / 100000
    return `₨ ${inLacs.toFixed(1)} Lac`
  }

  const formatNumber = (num) => {
    if (!num) return '₨ 0'
    if (num >= 10000000) {
      return `₨ ${(num / 10000000).toFixed(1)} Cr`
    }
    if (num >= 100000) {
      return `₨ ${(num / 100000).toFixed(1)} Lac`
    }
    return `₨ ${num.toLocaleString()}`
  }

  const getStatusBadge = (status) => {
    switch(status) {
      case 'available':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">● Active</span>
      case 'sold':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">● Sold</span>
      case 'rent':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">● For Rent</span>
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">● {status || 'Unknown'}</span>
    }
  }

  const getPropertyIcon = (title) => {
    const icons = ['🏡', '🏘️', '🏚️', '🏠', '🏢', '🏛️']
    const index = (title?.length || 0) % icons.length
    return icons[index]
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
    return adminData?.username || 'Admin'
  }

  const handleLogout = async () => {
    try {
      const refresh_token = localStorage.getItem('admin_refresh_token')
      const token = getAuthToken()
      
      if (token && refresh_token) {
        await axios.post('http://127.0.0.1:8000/api/admin/logout', 
          { refresh_token },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('admin_access_token')
      localStorage.removeItem('admin_refresh_token')
      localStorage.removeItem('isAdminLoggedIn')
      localStorage.removeItem('adminData')
      if (onLogout) onLogout()
      toast.success('Logged out successfully')
      navigate('/sign_in')
    }
  }

  const statCards = [
    { label: 'Total Listings', value: stats.total_listings, icon: '🏠', color: 'blue' },
    { label: 'Active Properties', value: stats.active_properties, icon: '✅', color: 'green' },
    { label: 'Sold Properties', value: stats.sold_properties, icon: '📦', color: 'gray' },
    { label: 'Total Portfolio Value', value: formatNumber(stats.total_value), icon: '💰', color: 'purple' },
  ]

  const filteredHouses = houses.filter(house => {
    const matchesSearch = 
      house.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      house.location_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    let matchesStatus = true
    if (selectedStatus === 'active') {
      matchesStatus = house.property_status === 'available'
    } else if (selectedStatus === 'sold') {
      matchesStatus = house.property_status === 'sold'
    }
    
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="lg:ml-64">
          <Navbar 
            toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
            onLogout={handleLogout}
          />
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:ml-64">
        <Navbar 
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
          adminName={getAdminName()}
          onLogout={handleLogout}
        />
        
        <div className="p-4 lg:p-8">
          
          {/* Welcome Section */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {getAdminName()}! 👋
            </h1>
            <p className="text-gray-500 mt-1">Here's what's happening with your properties today.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((stat, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-opacity-10 flex items-center justify-center text-xl">
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Filters Bar */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 shadow-sm">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex-1 flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                <div className="flex-1 relative">
                  <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by property name or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  {['all', 'active', 'sold'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setSelectedStatus(status)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        selectedStatus === status
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {status === 'all' ? 'All Properties' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              <Link to="/add-property">
                <button className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition whitespace-nowrap">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add New Property
                </button>
              </Link>
            </div>
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHouses.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="text-4xl mb-3">🏠</div>
                <p className="text-gray-500">No properties found</p>
                <Link to="/add-property">
                  <button className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 transition">
                    Add Your First Property
                  </button>
                </Link>
              </div>
            ) : (
              filteredHouses.map((house) => (
                <Link 
                  key={house.listing_id} 
                  to={`/edit-property/${house.listing_id}`}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition overflow-hidden block group"
                >
                  {/* Image Section */}
                  <div className="h-40 bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-5xl relative">
                    {house.primary_image ? (
                      <img 
                        src={house.primary_image} 
                        alt={house.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      getPropertyIcon(house.title)
                    )}
                    <div className="absolute top-2 right-2">
                      {getStatusBadge(house.property_status)}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{house.title}</h3>
                        <p className="text-sm text-gray-500 mt-0.5">{house.location_name || 'Location not specified'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-sm text-gray-600">{house.bedrooms || 0} beds</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span className="text-sm text-gray-600">{house.bathrooms || 0} baths</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span className="text-sm text-gray-600">{house.area_marla || 0} Marla</span>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xl font-bold text-emerald-600">{formatPrice(house.price)}</p>
                      {house.property_status === 'rent' && house.rent_price && (
                        <p className="text-sm text-blue-600 mt-1">Rent: {formatPrice(house.rent_price)}/month</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400">© 2026 Lahore House Price Prediction System. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard