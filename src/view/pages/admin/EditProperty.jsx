import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Navbar from '../../components/AdminNavbar'
import axios from 'axios'
import { toast } from 'sonner'

const EditProperty = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [locations, setLocations] = useState([])
  const [locationsLoading, setLocationsLoading] = useState(true)
  const [images, setImages] = useState([])
  const [imagePreview, setImagePreview] = useState([])
  const [existingImages, setExistingImages] = useState([])

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    area_marla: '',
    price: '',
    property_status: 'available',
    rent_price: '',
    bedrooms: '',
    bathrooms: '',
    kitchens: '',
    construction_year: '',
    number_of_floors: '',
    servant_rooms: '',
    store_rooms: '',
    current_per_marla_rate: '',
    has_lawn: false,
    has_parking: false,
    has_security: false,
    has_servant_quarter: false,
    has_study_room: false,
    has_gym: false,
    has_swimming_pool: false,
    is_furnished: false,
    has_dining_room: false,
    has_living_room: false,
    has_electricity_backup: false,
    is_corner_plot: false,
    is_facing_park: false,
    custom_features: ''
  })

  const getAuthToken = () => {
    return localStorage.getItem('admin_access_token')
  }

  // ✅ Fetch locations
  const fetchLocations = async () => {
    try {
      setLocationsLoading(true)
      const response = await axios.get('http://127.0.0.1:8000/api/listings/locations')
      if (response.data.success && response.data.data.length > 0) {
        setLocations(response.data.data)
      } else {
        setLocations([
          { location_id: 1, location_name: 'DHA Phase 6', city: 'Lahore' },
          { location_id: 2, location_name: 'Gulberg', city: 'Lahore' },
          { location_id: 3, location_name: 'Johar Town', city: 'Lahore' },
          { location_id: 4, location_name: 'Model Town', city: 'Lahore' },
          { location_id: 5, location_name: 'Bahria Town', city: 'Lahore' },
        ])
      }
    } catch (error) {
      console.error('Error fetching locations:', error)
      setLocations([
        { location_id: 1, location_name: 'DHA Phase 6', city: 'Lahore' },
        { location_id: 2, location_name: 'Gulberg', city: 'Lahore' },
        { location_id: 3, location_name: 'Johar Town', city: 'Lahore' },
        { location_id: 4, location_name: 'Model Town', city: 'Lahore' },
        { location_id: 5, location_name: 'Bahria Town', city: 'Lahore' },
      ])
    } finally {
      setLocationsLoading(false)
    }
  }

  // ✅ Fetch property data from API
  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true)
      try {
        const token = getAuthToken()
        if (!token) {
          toast.error('Please login again')
          navigate('/sign_in')
          return
        }

        const response = await axios.get(`http://127.0.0.1:8000/api/listings/admin/listings/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (response.data.success) {
          const property = response.data.data
          setFormData({
            title: property.title || '',
            description: property.description || '',
            location: property.location || '',
            area_marla: property.area_marla || '',
            price: property.price || '',
            property_status: property.property_status || 'available',
            rent_price: property.rent_price || '',
            bedrooms: property.bedrooms || '',
            bathrooms: property.bathrooms || '',
            kitchens: property.kitchens || '',
            construction_year: property.construction_year || '',
            number_of_floors: property.number_of_floors || '',
            servant_rooms: property.servant_rooms || '',
            store_rooms: property.store_rooms || '',
            current_per_marla_rate: property.current_per_marla_rate || '',
            has_lawn: property.has_lawn || false,
            has_parking: property.has_parking || false,
            has_security: property.has_security || false,
            has_servant_quarter: property.has_servant_quarter || false,
            has_study_room: property.has_study_room || false,
            has_gym: property.has_gym || false,
            has_swimming_pool: property.has_swimming_pool || false,
            is_furnished: property.is_furnished || false,
            has_dining_room: property.has_dining_room || false,
            has_living_room: property.has_living_room || false,
            has_electricity_backup: property.has_electricity_backup || false,
            is_corner_plot: property.is_corner_plot || false,
            is_facing_park: property.is_facing_park || false,
            custom_features: property.custom_features || ''
          })

          if (property.images && property.images.length > 0) {
            setExistingImages(property.images)
          }
        } else {
          toast.error('Property not found')
          navigate('/properties')
        }
      } catch (error) {
        console.error('Error fetching property:', error)
        if (error.response?.status === 401) {
          localStorage.clear()
          toast.error('Session expired. Please login again.')
          navigate('/sign_in')
        } else if (error.response?.status === 404) {
          toast.error('Property not found')
          navigate('/properties')
        } else {
          toast.error('Failed to load property')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchProperty()
    fetchLocations()
  }, [id, navigate])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    if (files.length + images.length + existingImages.length > 6) {
      toast.error('Maximum 6 images allowed')
      return
    }
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
    const invalidFiles = files.filter(file => !validTypes.includes(file.type))
    if (invalidFiles.length > 0) {
      toast.error('Only JPG, PNG, and WebP images are allowed')
      return
    }
    const maxSize = 5 * 1024 * 1024
    const largeFiles = files.filter(file => file.size > maxSize)
    if (largeFiles.length > 0) {
      toast.error('Each image must be less than 5MB')
      return
    }
    setImages([...images, ...files])
    const previews = files.map(file => URL.createObjectURL(file))
    setImagePreview([...imagePreview, ...previews])
  }

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index)
    const newPreviews = imagePreview.filter((_, i) => i !== index)
    URL.revokeObjectURL(imagePreview[index])
    setImages(newImages)
    setImagePreview(newPreviews)
  }

  const deleteExistingImage = async (imageId) => {
    if (!window.confirm('Delete this image?')) return
    try {
      const token = getAuthToken()
      await axios.delete(`http://127.0.0.1:8000/api/listings/admin/delete-image/${imageId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setExistingImages(existingImages.filter(img => img.image_id !== imageId))
      toast.success('Image deleted')
    } catch (error) {
      toast.error('Failed to delete image')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    if (!formData.title.trim()) {
      toast.error('Property title is required')
      setSaving(false)
      return
    }

    if (!formData.location) {
      toast.error('Please select a location')
      setSaving(false)
      return
    }

    if (!formData.price || formData.price <= 0) {
      toast.error('Valid price is required')
      setSaving(false)
      return
    }

    if (formData.property_status === 'rent' && (!formData.rent_price || formData.rent_price <= 0)) {
      toast.error('Rent price is required for rental properties')
      setSaving(false)
      return
    }

    try {
      const token = getAuthToken()
      if (!token) {
        toast.error('Please login again')
        navigate('/sign_in')
        return
      }

      const fd = new FormData()
      
      fd.append('title', formData.title.trim())
      fd.append('location', formData.location)
      fd.append('description', formData.description || '')
      fd.append('area_marla', formData.area_marla || '0')
      fd.append('price', formData.price || '0')
      fd.append('property_status', formData.property_status)
      fd.append('bedrooms', formData.bedrooms || '1')
      fd.append('bathrooms', formData.bathrooms || '1')
      fd.append('kitchens', formData.kitchens || '1')
      fd.append('number_of_floors', formData.number_of_floors || '1')
      fd.append('servant_rooms', formData.servant_rooms || '0')
      fd.append('store_rooms', formData.store_rooms || '0')
      
      if (formData.rent_price) fd.append('rent_price', formData.rent_price)
      if (formData.construction_year) fd.append('construction_year', formData.construction_year)
      if (formData.current_per_marla_rate) fd.append('current_per_marla_rate', formData.current_per_marla_rate)
      if (formData.custom_features) fd.append('custom_features', formData.custom_features)
      
      const boolFields = [
        'has_lawn', 'has_parking', 'has_security', 'has_servant_quarter',
        'has_study_room', 'has_gym', 'has_swimming_pool', 'is_furnished',
        'has_dining_room', 'has_living_room', 'has_electricity_backup',
        'is_corner_plot', 'is_facing_park'
      ]
      boolFields.forEach(f => fd.append(f, formData[f] ? 'true' : 'false'))
      
      images.forEach(img => fd.append('images', img))

      const response = await axios.put(
        `http://127.0.0.1:8000/api/listings/admin/listings/update/${id}`,
        fd,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (response.data.success) {
        toast.success('Property updated successfully!')
        setTimeout(() => navigate('/properties'), 1500)
      } else {
        toast.error(response.data.message || 'Failed to update property')
      }
    } catch (error) {
      console.error('Error updating property:', error)
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.')
        localStorage.clear()
        navigate('/sign_in')
      } else if (error.response?.data?.errors) {
        const errors = error.response.data.errors
        const firstErrorKey = Object.keys(errors)[0]
        const firstError = errors[firstErrorKey]
        const errorMsg = Array.isArray(firstError) ? firstError[0] : firstError
        toast.error(errorMsg || 'Validation failed')
      } else {
        toast.error('Failed to update property')
      }
    } finally {
      setSaving(false)
    }
  }

  const getAdminName = () => {
    const storedData = localStorage.getItem('adminData')
    if (storedData) {
      try {
        const data = JSON.parse(storedData)
        return data.username || 'Admin'
      } catch (e) { return 'Admin' }
    }
    return 'Admin'
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
      navigate('/sign_in')
    }
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
              <p className="mt-4 text-gray-600">Loading property...</p>
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
          
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Edit a Listing</h1>
            <p className="text-gray-500 mt-1">Update your property listing details</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Current Images</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {existingImages.map((img) => (
                    <div key={img.image_id} className="relative group">
                      <img src={img.image_url} alt="Property" className="w-full h-24 object-cover rounded-lg border" />
                      <button
                        type="button"
                        onClick={() => deleteExistingImage(img.image_id)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition text-xs hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Image Upload Section */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Add New Images</h2>
              <p className="text-sm text-gray-500 mb-3">The first image will be the cover (max 6 total)</p>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-500 transition">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer inline-flex items-center px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Choose Files
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  {images.length > 0 ? `${images.length} file(s) selected` : 'JPG, PNG or WebP (max 5MB each)'}
                </p>
              </div>

              {imagePreview.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                  {imagePreview.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-24 object-cover rounded-lg border border-gray-200" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition text-xs hover:bg-red-600"
                      >
                        ✕
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-1 left-1 bg-emerald-600 text-white text-xs px-2 py-0.5 rounded">Cover</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Property Details Section */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Property Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Property Title *</label>
                  <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g., 5 Marla House in DHA" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm" required />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                  <select name="location" value={formData.location} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm" required>
                    <option value="">Select Location</option>
                    {locationsLoading ? (
                      <option disabled>Loading locations...</option>
                    ) : (
                      locations.map(loc => (
                        <option key={loc.location_id} value={loc.location_id}>{loc.location_name}{loc.city ? ` - ${loc.city}` : ''}</option>
                      ))
                    )}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Area (Marla) *</label>
                  <input type="number" step="0.5" name="area_marla" value={formData.area_marla} onChange={handleChange} placeholder="e.g., 5" min="0.5" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm" required />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (PKR) *</label>
                  <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="e.g., 25000000" min="0" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm" required />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Property Status</label>
                  <select name="property_status" value={formData.property_status} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm">
                    <option value="available">Available</option>
                    <option value="rent">For Rent</option>
                    <option value="sold">Sold</option>
                  </select>
                </div>
                
                {formData.property_status === 'rent' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rent Price (PKR/Month) *</label>
                    <input type="number" name="rent_price" value={formData.rent_price} onChange={handleChange} placeholder="e.g., 80000" min="0" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm" required />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                  <input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleChange} placeholder="3" min="1" max="10" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                  <input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleChange} placeholder="3" min="1" max="10" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kitchens</label>
                  <input type="number" name="kitchens" value={formData.kitchens} onChange={handleChange} placeholder="1" min="1" max="5" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Construction Year</label>
                  <input type="number" name="construction_year" value={formData.construction_year} onChange={handleChange} placeholder="e.g., 2020" min="1980" max="2026" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Floors</label>
                  <input type="number" name="number_of_floors" value={formData.number_of_floors} onChange={handleChange} placeholder="1" min="1" max="10" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Servant Rooms</label>
                  <input type="number" name="servant_rooms" value={formData.servant_rooms} onChange={handleChange} placeholder="0" min="0" max="5" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Store Rooms</label>
                  <input type="number" name="store_rooms" value={formData.store_rooms} onChange={handleChange} placeholder="0" min="0" max="5" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Per Marla Rate (PKR)</label>
                  <input type="number" name="current_per_marla_rate" value={formData.current_per_marla_rate} onChange={handleChange} placeholder="e.g., 2800000" min="0" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm" />
                </div>
              </div>
            </div>

            {/* Amenities Section */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[
                  { name: 'has_lawn', label: 'Lawn / Garden' },
                  { name: 'has_parking', label: 'Parking' },
                  { name: 'has_security', label: '24/7 Security' },
                  { name: 'has_servant_quarter', label: 'Servant Quarter' },
                  { name: 'has_study_room', label: 'Study Room' },
                  { name: 'has_gym', label: 'Gym' },
                  { name: 'has_swimming_pool', label: 'Swimming Pool' },
                  { name: 'is_furnished', label: 'Furnished' },
                  { name: 'has_dining_room', label: 'Dining Room' },
                  { name: 'has_living_room', label: 'Living Room' },
                  { name: 'has_electricity_backup', label: 'Electricity Backup' },
                ].map(amenity => (
                  <label key={amenity.name} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition">
                    <input type="checkbox" name={amenity.name} checked={formData[amenity.name]} onChange={handleChange} className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500" />
                    <span className="text-sm text-gray-700">{amenity.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Special Features Section */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Special Features</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition">
                  <input type="checkbox" name="is_corner_plot" checked={formData.is_corner_plot} onChange={handleChange} className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500" />
                  <span className="text-sm text-gray-700">Corner Plot</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition">
                  <input type="checkbox" name="is_facing_park" checked={formData.is_facing_park} onChange={handleChange} className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500" />
                  <span className="text-sm text-gray-700">Facing Park</span>
                </label>
              </div>
            </div>

            {/* Custom Features & Description */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Additional Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Custom Features <span className="text-gray-400 font-normal ml-1">(optional)</span></label>
                  <textarea name="custom_features" value={formData.custom_features} onChange={handleChange} placeholder="Separate features with commas (e.g., Central AC, Smart Home, Solar Panels)" rows="2" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-gray-400 font-normal ml-1">(optional)</span></label>
                  <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Describe the property in detail..." rows="4" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm" />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-4">
              <Link to="/properties" className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition">Cancel</Link>
              <button type="submit" disabled={saving} className={`inline-flex items-center px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg transition ${saving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-emerald-700'}`}>
                {saving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Update Listing'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditProperty