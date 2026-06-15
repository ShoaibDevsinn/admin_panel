import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Navbar from '../../components/AdminNavbar'
import axios from 'axios'
import { toast } from 'sonner'

const AddProperty = () => {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [locations, setLocations] = useState([])
  const [locationsLoading, setLocationsLoading] = useState(true)
  const [selectedImageForPreview, setSelectedImageForPreview] = useState(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverErrors, setServerErrors] = useState({}); 
  
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    area_marla: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    kitchens: '',
    property_type: '',  
    property_status: 'available', 
    rent_price: '',
    construction_year: '',
    number_of_floors: '',
    servant_rooms: '',
    store_rooms: '',
    current_per_marla_rate: '',
    
    expected_revenue: '',
    buyer_name: '',
    
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
    
    custom_features: '',
    description: '',
  })

  const [images, setImages] = useState([])
  const [imagePreview, setImagePreview] = useState([])

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
      toast.error('Failed to load locations. Using default list.')
    } finally {
      setLocationsLoading(false)
    }
  }

  useEffect(() => {
    fetchLocations()
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: "" }));
    }
    if (serverErrors[name]) {
      setServerErrors(prev => ({ ...prev, [name]: "" }));
    }
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    
    if (files.length + images.length > 6) {
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

  const isRevenueValid = () => {
    if (!formData.expected_revenue || !formData.price) return true;
    return parseFloat(formData.expected_revenue) <= parseFloat(formData.price);
  };

  const isBuyerNameRequired = formData.property_status === 'sold';

  // ✅ Determine if property type is Plot
  const isPlot = formData.property_type === 'plot';
  const isHouse = formData.property_type === 'house';

  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Property title is required';
    }
    
    if (!formData.location) {
      errors.location = 'Please select a location';
    }
    
    if (!formData.price || formData.price <= 0) {
      errors.price = 'Valid price is required';
    }
    
    if (!formData.area_marla || formData.area_marla <= 0) {
      errors.area_marla = 'Valid area in Marla is required';
    }
    
    if (!formData.property_type) {
      errors.property_type = 'Please select property type';
    }
    
    if (images.length === 0) {
      errors.images = 'At least 1 image is required';
    }
    
    if (formData.expected_revenue && parseFloat(formData.expected_revenue) > parseFloat(formData.price)) {
      errors.expected_revenue = 'Expected revenue cannot be greater than property price';
    }
    
    if (formData.property_status === 'sold' && !formData.buyer_name?.trim()) {
      errors.buyer_name = 'Buyer name is required when marking property as sold';
    }
    
    if (formData.property_type === 'rent' && (!formData.rent_price || formData.rent_price <= 0)) {
      errors.rent_price = 'Rent price is required for rental properties';
    }

    // ✅ Conditional validation: only validate house-specific fields if property type is 'house'
    if (isHouse) {
      if (!formData.bedrooms || formData.bedrooms <= 0) {
        errors.bedrooms = 'Number of bedrooms is required for houses';
      }
      if (!formData.bathrooms || formData.bathrooms <= 0) {
        errors.bathrooms = 'Number of bathrooms is required for houses';
      }
      if (!formData.kitchens || formData.kitchens <= 0) {
        errors.kitchens = 'Number of kitchens is required for houses';
      }
      if (!formData.construction_year) {
        errors.construction_year = 'Construction year is required for houses';
      } else if (formData.construction_year < 1900 || formData.construction_year > 2026) {
        errors.construction_year = 'Please enter a valid construction year (1900-2026)';
      }
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const displayBackendErrors = (errors) => {
    const newServerErrors = {};
    let firstErrorMessage = '';
    
    for (const [field, messages] of Object.entries(errors)) {
      const errorMsg = Array.isArray(messages) ? messages[0] : messages;
      newServerErrors[field] = errorMsg;
      if (!firstErrorMessage) firstErrorMessage = errorMsg;
    }
    
    setServerErrors(newServerErrors);
    setFieldErrors(prev => ({ ...prev, ...newServerErrors }));
    
    if (firstErrorMessage) {
      toast.error(firstErrorMessage);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setServerErrors({});
    
    if (!validateForm()) {
      const firstError = Object.values(fieldErrors)[0];
      if (firstError) toast.error(firstError);
      setLoading(false);
      return;
    }
    
    setLoading(true);

    try {
      const token = localStorage.getItem('admin_access_token')
      
      if (!token) {
        toast.error('Please login again')
        navigate('/sign_in')
        return
      }
      
      const fd = new FormData()
      
      // Required fields
      fd.append('title', formData.title.trim())
      fd.append('location', formData.location)
      fd.append('area_marla', formData.area_marla.toString())
      fd.append('price', formData.price.toString())
      fd.append('property_status', formData.property_status)
      fd.append('property_type', formData.property_type)
      fd.append('description', formData.description.trim() || ' ')
      
      // ✅ Conditional field values: For plots, send default zero values
      if (isHouse) {
        fd.append('bedrooms', (formData.bedrooms || '1').toString())
        fd.append('bathrooms', (formData.bathrooms || '1').toString())
        fd.append('kitchens', (formData.kitchens || '1').toString())
        fd.append('construction_year', (formData.construction_year || '').toString())
        fd.append('number_of_floors', (formData.number_of_floors || '1').toString())
        fd.append('servant_rooms', (formData.servant_rooms || '0').toString())
        fd.append('store_rooms', (formData.store_rooms || '0').toString())
      } else {
        // For plots, send zeros or empty strings to avoid database errors
        fd.append('bedrooms', '0')
        fd.append('bathrooms', '0')
        fd.append('kitchens', '0')
        fd.append('construction_year', '')
        fd.append('number_of_floors', '0')
        fd.append('servant_rooms', '0')
        fd.append('store_rooms', '0')
      }
      
      if (formData.expected_revenue) {
        fd.append('expected_revenue', formData.expected_revenue.toString())
      }
      if (formData.buyer_name) {
        fd.append('buyer_name', formData.buyer_name.trim())
      }
      
      if (formData.rent_price) {
        fd.append('rent_price', formData.rent_price.toString())
      }
      if (formData.current_per_marla_rate) {
        fd.append('current_per_marla_rate', formData.current_per_marla_rate.toString())
      }
      if (formData.custom_features.trim()) {
        fd.append('custom_features', formData.custom_features.trim())
      }
      
      const booleanFields = [
        'has_lawn', 'has_parking', 'has_security', 'has_servant_quarter',
        'has_study_room', 'has_gym', 'has_swimming_pool', 'is_furnished',
        'has_dining_room', 'has_living_room', 'has_electricity_backup',
        'is_corner_plot', 'is_facing_park'
      ]
      
      booleanFields.forEach(field => {
        fd.append(field, formData[field] ? 'true' : 'false')
      })
      
      images.forEach(image => {
        fd.append('images', image)
      })
      
      const response = await axios.post(
        'http://127.0.0.1:8000/api/listings/admin/add',
        fd,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )
      
      if (response.data.success) {
        toast.success('Property added successfully!')
        
        setFormData({
          title: '',
          location: '',
          area_marla: '',
          price: '',
          bedrooms: '',
          bathrooms: '',
          kitchens: '',
          property_type: '',
          property_status: 'available',
          rent_price: '',
          construction_year: '',
          number_of_floors: '',
          servant_rooms: '',
          store_rooms: '',
          current_per_marla_rate: '',
          expected_revenue: '',
          buyer_name: '',
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
          custom_features: '',
          description: ''
        })
        setImages([])
        setImagePreview([])
        setFieldErrors({})
        setServerErrors({})
        
        setTimeout(() => {
          navigate('/listings')
        }, 1500)
      } else {
        toast.error(response.data.message || 'Failed to add property')
        if (response.data.errors) {
          displayBackendErrors(response.data.errors);
        }
      }
    } catch (error) {
      console.error('Error adding property:', error)
      
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.')
        localStorage.removeItem('admin_access_token')
        localStorage.removeItem('admin_refresh_token')
        localStorage.removeItem('isAdminLoggedIn')
        localStorage.removeItem('adminData')
        setTimeout(() => navigate('/sign_in'), 1500)
      } else if (error.response?.status === 403) {
        toast.error('Access denied. Admin privileges required.')
      } else if (error.response?.data?.errors) {
        displayBackendErrors(error.response.data.errors);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.code === 'ERR_NETWORK') {
        toast.error('Network error. Please check your connection.')
      } else {
        toast.error('Failed to add property. Please try again.')
      }
    } finally {
      setLoading(false)
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

  const handleLogout = async () => {
    try {
      const refresh_token = localStorage.getItem('admin_refresh_token')
      const token = localStorage.getItem('admin_access_token')
      
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
      toast.success('Logged out successfully')
      navigate('/sign_in')
    }
  }

  const openImagePreview = (imageUrl) => {
    setSelectedImageForPreview(imageUrl);
    setIsPreviewModalOpen(true);
  };

  const closeImagePreview = () => {
    setSelectedImageForPreview(null);
    setIsPreviewModalOpen(false);
  };

  const ImagePreviewModal = ({ isOpen, imageUrl, onClose }) => {
    if (!isOpen) return null;
    
    return (
      <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="relative w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10 bg-black/50 rounded-full p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="flex items-center justify-center w-full h-full">
            <img 
              src={imageUrl} 
              alt="Preview" 
              className="max-w-full max-h-full object-contain"
            />
          </div>
          
          <div className="absolute bottom-4 left-0 right-0 text-center">
            <p className="text-white/70 text-sm">Click outside or press ESC to close</p>
          </div>
        </div>
      </div>
    );
  };

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
            <h1 className="text-2xl font-bold text-gray-900">Create a Listing</h1>
            <p className="text-gray-500 mt-1">Add new property to your listings</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Image Upload Section (unchanged) */}
            <div className="bg-white rounded-xl border border-emerald-500 pl-6 pr-6 pt-3 pb-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800">Property Images</h2>
              <p className="text-sm text-gray-500 mb-3">The first image will be the cover (max 6)</p>
              
              <div 
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
                  images.length >= 6 
                    ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60' 
                    : 'border-gray-300 hover:border-emerald-500 hover:bg-emerald-50/30'
                }`}
                onClick={() => images.length < 6 && document.getElementById('image-upload').click()}
              >
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                  disabled={images.length >= 6}
                />
                <div className="flex flex-col items-center justify-center">
                  <svg 
                    className={`w-12 h-12 mb-3 ${images.length >= 6 ? 'text-gray-400' : 'text-emerald-500'}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm font-medium text-gray-700">
                    {images.length >= 6 ? 'Maximum 6 images reached' : 'Click to upload images'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {images.length > 0 ? `${images.length} / 6 files selected` : 'JPG, PNG or WebP (max 5MB each)'}
                  </p>
                </div>
              </div>
              {fieldErrors.images && (
                <p className="text-red-500 text-xs mt-2">{fieldErrors.images}</p>
              )}

              {imagePreview.length > 0 && (
                <div className="mt-6">
                  <div className="flex flex-wrap gap-4">
                    {imagePreview.map((preview, index) => (
                      <div key={index} className="relative group" style={{ width: '150px' }}>
                        <div 
                          className="bg-gray-100 rounded-lg border border-gray-200 cursor-pointer overflow-hidden"
                          onClick={() => openImagePreview(preview)}
                        >
                          <img 
                            src={preview} 
                            alt={`Preview ${index + 1}`} 
                            className="w-full h-auto object-contain"
                            style={{ maxHeight: '150px' }}
                          />
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all rounded-lg">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m-3-3h6" />
                            </svg>
                          </div>
                        </div>
                        
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(index);
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-600 z-10 flex items-center justify-center shadow-md"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        
                        {index === 0 && (
                          <div className="absolute bottom-0 left-0 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs px-2 py-1 rounded-tr-md rounded-bl-md">
                            📌 Cover
                          </div>
                        )}
                        
                        <div className="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded-full z-10">
                          {index + 1}/{imagePreview.length}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <ImagePreviewModal 
              isOpen={isPreviewModalOpen} 
              imageUrl={selectedImageForPreview} 
              onClose={closeImagePreview} 
            />

            {/* Property Details Section */}
            <div className="bg-white rounded-xl border border-emerald-600 pt-3 pb-6 pl-6 pr-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Property Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title, Location, Area, Price, Status, Expected Revenue, Buyer Name (unchanged) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Property Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., 5 Marla House in DHA"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm ${
                      (fieldErrors.title || serverErrors.title) ? 'border-red-500 bg-red-50' : 'border-gray-200'
                    }`}
                    required
                  />
                  {(fieldErrors.title || serverErrors.title) && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.title || serverErrors.title}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                  <select
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm ${
                      (fieldErrors.location || serverErrors.location) ? 'border-red-500 bg-red-50' : 'border-gray-200'
                    }`}
                    required
                  >
                    <option value="">Select Location</option>
                    {locationsLoading ? (
                      <option disabled>Loading locations...</option>
                    ) : (
                      locations.map(loc => (
                        <option key={loc.location_id} value={loc.location_id}>
                          {loc.location_name}{loc.city ? ` - ${loc.city}` : ''}
                        </option>
                      ))
                    )}
                  </select>
                  {(fieldErrors.location || serverErrors.location) && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.location || serverErrors.location}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Area (Marla) *</label>
                  <input
                    type="number"
                    step="0.5"
                    name="area_marla"
                    value={formData.area_marla}
                    onChange={handleChange}
                    placeholder="e.g., 5"
                    min="0.5"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm ${
                      (fieldErrors.area_marla || serverErrors.area_marla) ? 'border-red-500 bg-red-50' : 'border-gray-200'
                    }`}
                    required
                  />
                  {(fieldErrors.area_marla || serverErrors.area_marla) && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.area_marla || serverErrors.area_marla}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (PKR) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="e.g., 25000000"
                    min="0"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm ${
                      (fieldErrors.price || serverErrors.price) ? 'border-red-500 bg-red-50' : 'border-gray-200'
                    }`}
                    required
                  />
                  {(fieldErrors.price || serverErrors.price) && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.price || serverErrors.price}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Property Status</label>
                  <select
                    name="property_status"
                    value={formData.property_status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                  >
                    <option value="available">Available</option>
                    <option value="sold">Sold</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Revenue / Profit
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="expected_revenue"
                    value={formData.expected_revenue}
                    onChange={handleChange}
                    placeholder="Enter expected profit from this deal"
                    min="0"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm ${
                      (fieldErrors.expected_revenue || serverErrors.expected_revenue) ? 'border-red-500 bg-red-50' : 
                      (!isRevenueValid() && formData.expected_revenue ? 'border-red-500 bg-red-50' : 'border-gray-200')
                    }`}
                  />
                  {(fieldErrors.expected_revenue || serverErrors.expected_revenue) && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.expected_revenue || serverErrors.expected_revenue}</p>
                  )}
                  {!isRevenueValid() && !fieldErrors.expected_revenue && !serverErrors.expected_revenue && formData.expected_revenue && (
                    <p className="text-red-500 text-xs mt-1">
                      ⚠️ Revenue cannot exceed property price ({parseFloat(formData.price).toLocaleString()} PKR)
                    </p>
                  )}
                  <p className="text-gray-400 text-xs mt-1">
                    Only sold properties will contribute to total revenue statistics
                  </p>
                </div>

                {isBuyerNameRequired && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Buyer Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="buyer_name"
                      value={formData.buyer_name}
                      onChange={handleChange}
                      placeholder="Enter buyer's full name"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm ${
                        (fieldErrors.buyer_name || serverErrors.buyer_name) ? 'border-red-500 bg-red-50' : 'border-gray-200'
                      }`}
                      required={isBuyerNameRequired}
                    />
                    {(fieldErrors.buyer_name || serverErrors.buyer_name) && (
                      <p className="text-red-500 text-xs mt-1">{fieldErrors.buyer_name || serverErrors.buyer_name}</p>
                    )}
                    <p className="text-gray-400 text-xs mt-1">
                      Required when marking property as sold
                    </p>
                  </div>
                )}
                
                {/* ✅ House-specific fields - only shown when property type is 'house' */}
                {isHouse && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms *</label>
                      <input
                        type="number"
                        name="bedrooms"
                        value={formData.bedrooms}
                        onChange={handleChange}
                        placeholder="3"
                        min="1"
                        max="10"
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm ${
                          (fieldErrors.bedrooms || serverErrors.bedrooms) ? 'border-red-500 bg-red-50' : 'border-gray-200'
                        }`}
                      />
                      {(fieldErrors.bedrooms || serverErrors.bedrooms) && (
                        <p className="text-red-500 text-xs mt-1">{fieldErrors.bedrooms || serverErrors.bedrooms}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms *</label>
                      <input
                        type="number"
                        name="bathrooms"
                        value={formData.bathrooms}
                        onChange={handleChange}
                        placeholder="3"
                        min="1"
                        max="10"
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm ${
                          (fieldErrors.bathrooms || serverErrors.bathrooms) ? 'border-red-500 bg-red-50' : 'border-gray-200'
                        }`}
                      />
                      {(fieldErrors.bathrooms || serverErrors.bathrooms) && (
                        <p className="text-red-500 text-xs mt-1">{fieldErrors.bathrooms || serverErrors.bathrooms}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Kitchens *</label>
                      <input
                        type="number"
                        name="kitchens"
                        value={formData.kitchens}
                        onChange={handleChange}
                        placeholder="1"
                        min="1"
                        max="5"
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm ${
                          (fieldErrors.kitchens || serverErrors.kitchens) ? 'border-red-500 bg-red-50' : 'border-gray-200'
                        }`}
                      />
                      {(fieldErrors.kitchens || serverErrors.kitchens) && (
                        <p className="text-red-500 text-xs mt-1">{fieldErrors.kitchens || serverErrors.kitchens}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Construction Year *</label>
                      <input
                        type="number"
                        name="construction_year"
                        value={formData.construction_year}
                        onChange={handleChange}
                        placeholder="e.g., 2020"
                        min="1900"
                        max="2026"
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm ${
                          (fieldErrors.construction_year || serverErrors.construction_year) ? 'border-red-500 bg-red-50' : 'border-gray-200'
                        }`}
                      />
                      {(fieldErrors.construction_year || serverErrors.construction_year) && (
                        <p className="text-red-500 text-xs mt-1">{fieldErrors.construction_year || serverErrors.construction_year}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Number of Floors</label>
                      <input
                        type="number"
                        name="number_of_floors"
                        value={formData.number_of_floors}
                        onChange={handleChange}
                        placeholder="1"
                        min="1"
                        max="10"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Servant Rooms</label>
                      <input
                        type="number"
                        name="servant_rooms"
                        value={formData.servant_rooms}
                        onChange={handleChange}
                        placeholder="0"
                        min="0"
                        max="5"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Store Rooms</label>
                      <input
                        type="number"
                        name="store_rooms"
                        value={formData.store_rooms}
                        onChange={handleChange}
                        placeholder="0"
                        min="0"
                        max="5"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Per Marla Rate (PKR)</label>
                  <input
                    type="number"
                    name="current_per_marla_rate"
                    value={formData.current_per_marla_rate}
                    onChange={handleChange}
                    placeholder="e.g., 2800000"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Property Type *</label>
                  <select
                    name="property_type"
                    value={formData.property_type}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm ${
                      (fieldErrors.property_type || serverErrors.property_type) ? 'border-red-500 bg-red-50' : 'border-gray-200'
                    }`}
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="house">House</option>
                    <option value="plot">Plot</option>
                  </select>
                  {(fieldErrors.property_type || serverErrors.property_type) && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.property_type || serverErrors.property_type}</p>
                  )}
                </div>

                {/* Description Field */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe the property in detail..."
                    rows="4"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm ${
                      (fieldErrors.description || serverErrors.description) ? 'border-red-500 bg-red-50' : 'border-gray-200'
                    }`}
                    required
                  />
                  {(fieldErrors.description || serverErrors.description) && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.description || serverErrors.description}</p>
                  )}
                </div>
              </div>
                {isPlot && (
                  <div className="md:col-span-2">
                    <div className="bg-red-50 p-3 rounded-lg text-red-700 text-sm mt-3">
                      <p> Plot details: Bedrooms, bathrooms, kitchens, construction year, floors, servant rooms, and store rooms are not applicable for plots.</p>
                    </div>
                  </div>
                )}
            </div>

            {/* Amenities Section (unchanged) */}
            <div className="bg-white rounded-xl border border-emerald-600 pt-3 pb-6 pl-6 pr-6 shadow-sm">
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
                    <input 
                      type="checkbox" 
                      name={amenity.name} 
                      checked={formData[amenity.name]} 
                      onChange={handleChange} 
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500" 
                    />
                    <span className="text-sm text-gray-700">{amenity.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Special Features Section (unchanged) */}
            <div className="bg-white rounded-xl border border-emerald-600 pt-3 pb-6 pl-6 pr-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Special Features</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition">
                  <input 
                    type="checkbox" 
                    name="is_corner_plot" 
                    checked={formData.is_corner_plot} 
                    onChange={handleChange} 
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500" 
                  />
                  <span className="text-sm text-gray-700">Corner Plot</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition">
                  <input 
                    type="checkbox" 
                    name="is_facing_park" 
                    checked={formData.is_facing_park} 
                    onChange={handleChange} 
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500" 
                  />
                  <span className="text-sm text-gray-700">Facing Park</span>
                </label>
              </div>
            </div>

            {/* Custom Features Section (unchanged) */}
            <div className="bg-white rounded-xl border border-emerald-600 pt-3 pb-6 pl-6 pr-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Additional Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Custom Features
                  </label>
                  <textarea
                    name="custom_features"
                    value={formData.custom_features}
                    onChange={handleChange}
                    placeholder="Separate features with commas (e.g., Central AC, Smart Home, Solar Panels)"
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons (unchanged) */}
            <div className="flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate('/listings')}
                className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition border-emerald-600 border"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`inline-flex items-center px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg transition ${
                  loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-emerald-700'
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  'Create Listing'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddProperty