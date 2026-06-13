import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Navbar from '../../components/AdminNavbar'
import axios from 'axios'
import { toast } from 'sonner'
import { CheckCircle, Package, DollarSign, Home as HomeIcon, TrendingUp } from 'lucide-react';

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
    total_value: 0,
    total_revenue: 0  
  })

  const getAuthToken = () => {
    return localStorage.getItem('admin_access_token')
  }

  // Fetch admin's own listings from admin endpoint
  const fetchListings = async () => {
    setLoading(true)
    try {
      const token = getAuthToken()
      
      if (!token) {
        console.log('No token found, redirecting to login...')
        navigate('/sign_in')
        return
      }
      
      // Fetch listings
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
        
        //  NEW: Calculate total revenue from sold properties (using expected_revenue)
        const totalRevenue = listings
          .filter(h => h.property_status === 'sold' && h.expected_revenue)
          .reduce((sum, h) => sum + (parseFloat(h.expected_revenue) || 0), 0)
        
        setStats({
          total_listings: listings.length,
          active_properties: activeCount,
          sold_properties: soldCount,
          total_value: totalValue,
          total_revenue: totalRevenue  
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

const formatPrice = (price, type) => {
    if (!price) return '₨ 0'
    const numPrice = parseFloat(price)
    if (numPrice >= 10000000) {
      return `₨ ${(numPrice / 10000000).toFixed(1)} Cr`
    }
    if (numPrice >= 100000) {
      return `₨ ${(numPrice / 100000).toFixed(1)} Lac`
    }
    return `₨ ${numPrice.toLocaleString()}`
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

  const statItems = [
    { label: 'Total Listings', value: stats.total_listings, icon: HomeIcon, color: 'blue' },
    { label: 'Active Properties', value: stats.active_properties, icon: CheckCircle, color: 'green' },
    { label: 'Sold Properties', value: stats.sold_properties, icon: Package, color: 'gray' },
    // { label: 'Total Portfolio Value', value: formatNumber(stats.total_value), icon: DollarSign, color: 'purple' },
    { label: 'Total Revenue / Profit', value: formatNumber(stats.total_revenue), icon: TrendingUp, color: 'emerald' }
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

          {/* Stats Grid - Now with 5 cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statItems.map((stat, idx) => {
              const bgColorClasses = {
                blue: 'bg-blue-100',
                green: 'bg-green-100',
                gray: 'bg-gray-100',
                purple: 'bg-purple-100',
                emerald: 'bg-emerald-100'  
              };
              
              const iconColorClasses = {
                blue: 'text-blue-600',
                green: 'text-green-600',
                gray: 'text-gray-600',
                purple: 'text-purple-600',
                emerald: 'text-emerald-600'  
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

          {/* Filters Bar */}
          <div className="bg-white rounded-xl border border-emerald-500 p-4 mb-6 shadow-sm">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex-1 flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                <div className="flex-1 relative">
                  <svg className="absolute left-3 top-2.5 w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by property name or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
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
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {filteredHouses.length === 0 ? (
    <div className="col-span-full text-center py-12">
      <div className="inline-block">
        <HomeIcon className="w-17 h-17 text-emerald-500 mx-auto" />
      </div>
      <p className="text-gray-500 text-xl">No properties found</p>
    </div>
  ) : (
    filteredHouses.map((house) => (
     <Link 
  key={house.listing_id} 
  to={`/property/${house.listing_id}`}
  className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition overflow-hidden block group"
>
        {/* Image Section */}
        <div className="h-36 bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-5xl flex-shrink-0 relative">
          {house.primary_image ? (
            <img src={house.primary_image} alt={house.title} className="w-full h-full object-cover" />
          ) : (
            <span className="text-4xl">{getPropertyIcon(house.title)}</span>
          )}
          
          {/* Status Badge - SOLD */}
         {house.property_status === 'sold' && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full shadow-md">
              SOLD
            </div>
          )}
          {house.property_status === 'available' && (
            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-md">
              AVAILABLE
            </div>
          )}
          
          {/* Profit Badge */}
          {house.property_status === 'sold' && house.expected_revenue && (
            <div className="absolute bottom-2 right-2 bg-emerald-600 text-white text-xs px-2 py-1 rounded-full font-semibold shadow-md">
              Profit: {formatPrice(house.expected_revenue)}
            </div>
          )}

          {/* Buyer Name Badge */}
          {house.property_status === 'sold' && house.buyer_name && (
            <div className="absolute bottom-2 left-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full shadow-md font-medium">
              {house.buyer_name}
            </div>
          )}
        </div>
        
        <div className="p-3 flex flex-col flex-1">
          <div>
            <h3 className="text-base font-semibold text-gray-900 line-clamp-1">{house.title}</h3>
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{house.location_name || 'N/A'}</p>
          </div>
          
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-gray-600">{house.bedrooms || 0} beds</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
            <span className="text-xs text-gray-600">{house.bathrooms || 0} baths</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
            <span className="text-xs text-gray-600">{house.area_marla || 0} Marla</span>
          </div>
          
          <div className="mt-3 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-emerald-600">{formatPrice(house.price)}</p>
                {/* <span className="text-xs text-gray-400">
                  {house.property_status === 'sold' ? 'Sold' : 
                   house.property_status === 'rent' ? 'For Rent' : 'For Sale'}
                </span> */}
              </div>
              {/* <div className="flex gap-1">
                <span className="px-2 py-1 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded transition cursor-pointer">
                  EDIT
                </span>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    deleteProperty(house.listing_id);
                  }}
                  className="px-2 py-1 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 rounded transition"
                >
                  DELETE
                </button>
              </div> */}
            </div>
            
            {/* Show buyer name for sold properties */}
            {/* {house.property_status === 'sold' && house.buyer_name && (
              <p className="text-xs text-gray-500 mt-2">
                Buyer: {house.buyer_name}
              </p>
            )} */}
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