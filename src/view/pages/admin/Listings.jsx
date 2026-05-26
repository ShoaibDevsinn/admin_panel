import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Navbar from '../../components/AdminNavbar'
import axios from 'axios'
import { toast } from 'sonner'

const Listings = () => {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [viewMode, setViewMode] = useState('grid')
  const [loading, setLoading] = useState(true)
  const [properties, setProperties] = useState([])

  const getAuthToken = () => {
    return localStorage.getItem('admin_access_token')
  }

  // ✅ Fetch admin's own listings from API
  const fetchProperties = async () => {
    setLoading(true)
    try {
      const token = getAuthToken()
      
      if (!token) {
        toast.error('Please login again')
        navigate('/sign_in')
        return
      }
      
      const response = await axios.get('http://127.0.0.1:8000/api/listings/admin/listings', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.data.success && response.data.data) {
        setProperties(response.data.data)
      } else {
        setProperties([])
      }
    } catch (error) {
      console.error('Error fetching properties:', error)
      if (error.response?.status === 401) {
        localStorage.clear()
        toast.error('Session expired. Please login again.')
        navigate('/sign_in')
      } else {
        toast.error('Failed to load properties')
        setProperties([])
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProperties()
  }, [])

  // ✅ Delete property
  const deleteProperty = async (listingId) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return

    try {
      const token = getAuthToken()
      await axios.delete(`http://127.0.0.1:8000/api/listings/admin/listings/delete/${listingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('Property deleted successfully')
      setProperties(properties.filter(p => p.listing_id !== listingId))
    } catch (error) {
      toast.error('Failed to delete property')
    }
  }

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

  const getPropertyIcon = (title) => {
    const icons = ['🏡', '🏞️', '🏙️', '🏢', '🏖️', '🏠', '🏘️', '🏚️']
    const index = (title?.length || 0) % icons.length
    return icons[index]
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
      localStorage.clear()
      toast.success('Logged out successfully')
      navigate('/sign_in')
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="lg:ml-64">
          <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} onLogout={handleLogout} />
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading listings...</p>
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
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Your Listings</h1>
              <p className="text-sm text-gray-500 mt-1">Manage and view all your property listings</p>
            </div>
            <div className="flex gap-2 mt-3 sm:mt-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
              <Link to="/add-property">
                <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 transition ml-2">
                  + Add New
                </button>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-xl">🏠</div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Total Listings</p>
                  <p className="text-2xl font-bold text-gray-900">{properties.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-xl">🏘️</div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">For Rent</p>
                  <p className="text-2xl font-bold text-gray-900">{properties.filter(p => p.property_status === 'rent').length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-xl">💰</div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">For Sale</p>
                  <p className="text-2xl font-bold text-gray-900">{properties.filter(p => p.property_status === 'available').length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center text-xl">⭐</div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Active</p>
                  <p className="text-2xl font-bold text-gray-900">{properties.filter(p => p.property_status === 'available' || p.property_status === 'rent').length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <div className="text-6xl mb-4">🏠</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No listings yet</h3>
                  <p className="text-gray-500 mb-4">Get started by adding your first property</p>
                  <Link
                    to="/add-property"
                    className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm"
                  >
                    + Add New Property
                  </Link>
                </div>
              ) : (
                properties.map((property) => (
                  <div key={property.listing_id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col h-full">
                    <div className="h-40 bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-5xl flex-shrink-0">
                      {property.primary_image ? (
                        <img src={property.primary_image} alt={property.title} className="w-full h-full object-cover" />
                      ) : (
                        getPropertyIcon(property.title)
                      )}
                    </div>
                    
                    <div className="p-4 flex flex-col flex-1">
                      <div>
                        <h3 className="text-base font-semibold text-gray-900 line-clamp-1">{property.title}</h3>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{property.location_name || 'N/A'}</p>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-600">{property.bedrooms || 0} beds</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span className="text-xs text-gray-600">{property.bathrooms || 0} baths</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span className="text-xs text-gray-600">{property.area_marla || 0} Marla</span>
                      </div>
                      
                      <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-emerald-600">{formatPrice(property.price)}</p>
                          <span className="text-xs text-gray-400">
                            {property.property_status === 'rent' ? '/month' : property.property_status === 'sold' ? 'Sold' : 'For Sale'}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <Link
                            to={`/edit-property/${property.listing_id}`}
                            className="px-2 py-1 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded transition"
                          >
                            EDIT
                          </Link>
                          <button
                            onClick={() => deleteProperty(property.listing_id)}
                            className="px-2 py-1 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 rounded transition"
                          >
                            DELETE
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              {properties.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🏠</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No listings yet</h3>
                  <p className="text-gray-500 mb-4">Get started by adding your first property</p>
                  <Link
                    to="/add-property"
                    className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm"
                  >
                    + Add New Property
                  </Link>
                </div>
              ) : (
                properties.map((property) => (
                  <div key={property.listing_id} className="flex items-center justify-between p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-xl flex-shrink-0">
                        {property.primary_image ? (
                          <img src={property.primary_image} alt={property.title} className="w-full h-full rounded-lg object-cover" />
                        ) : (
                          getPropertyIcon(property.title)
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 text-sm truncate">{property.title}</h3>
                        <p className="text-xs text-gray-500 truncate">{property.location_name || 'N/A'}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-500">{property.bedrooms || 0} beds</span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                          <span className="text-xs text-gray-500">{property.bathrooms || 0} baths</span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                          <span className="text-xs font-medium text-emerald-600">{formatPrice(property.price)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0 ml-2">
                      <Link
                        to={`/edit-property/${property.listing_id}`}
                        className="px-2 py-1 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded transition"
                      >
                        EDIT
                      </Link>
                      <button
                        onClick={() => deleteProperty(property.listing_id)}
                        className="px-2 py-1 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 rounded transition"
                      >
                        DELETE
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400">© 2026 Lahore House Price Prediction System. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Listings