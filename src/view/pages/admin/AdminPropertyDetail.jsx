// src/views/pages/admin/AdminPropertyDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/AdminNavbar';
import { adminAPI } from '../../../services/authService';
import { ArrowLeft, MapPin, Bed, Bath, Home, Calendar, CheckCircle, Users, Warehouse, Building2, Edit2, DollarSign, TrendingUp } from 'lucide-react';
import { toast, Toaster } from 'sonner';

export default function AdminPropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Format price
  const formatPrice = (price) => {
    if (!price) return 'PKR 0';
    const numPrice = parseFloat(price);
    if (numPrice >= 10000000) {
      return `PKR ${(numPrice / 10000000).toFixed(2)} Cr`;
    }
    if (numPrice >= 100000) {
      return `PKR ${(numPrice / 100000).toFixed(2)} Lac`;
    }
    return `PKR ${numPrice.toLocaleString()}`;
  };

  // Get property condition
  const getPropertyCondition = (yearBuilt) => {
    if (!yearBuilt) return { label: 'Unknown', bg: 'bg-gray-100', color: 'text-gray-600' };
    const age = new Date().getFullYear() - yearBuilt;
    if (age <= 5) return { label: 'New Construction', bg: 'bg-green-100', color: 'text-green-700' };
    if (age <= 15) return { label: 'Well Maintained', bg: 'bg-blue-100', color: 'text-blue-700' };
    return { label: 'Established', bg: 'bg-yellow-100', color: 'text-yellow-700' };
  };

  // Fetch property details
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('admin_access_token');
        
        if (!token) {
          toast.error('Please login again');
          navigate('/sign_in');
          return;
        }

        const response = await adminAPI.listings.getListingDetails(id);
        
        if (response.data.success) {
          const data = response.data.data;
          setProperty({
            id: data.listing_id,
            title: data.title,
            location: data.location_name,
            area: data.location_name,
            marla: parseFloat(data.area_marla),
            price: parseFloat(data.price),
            pricePerMarla: parseFloat(data.current_per_marla_rate) || (parseFloat(data.price) / parseFloat(data.area_marla)),
            bedrooms: data.bedrooms || 0,
            bathrooms: data.bathrooms || 0,
            kitchen: data.kitchens || 0,
            yearBuilt: data.construction_year,
            description: data.description,
            propertyType: data.property_type,
            propertyTypeDisplay: data.property_type_display,
            status: data.property_status,
            statusDisplay: data.property_status_display,
            hasGarage: data.has_parking,
            hasGarden: data.has_lawn,
            hasSwimmingPool: data.has_swimming_pool,
            hasGym: data.has_gym,
            hasSecurity: data.has_security,
            hasElectricityBackup: data.has_electricity_backup,
            hasServantQuarter: data.has_servant_quarter,
            furnished: data.is_furnished,
            isCornerPlot: data.is_corner_plot,
            isFacingPark: data.is_facing_park,
            livingRooms: data.has_living_room ? 1 : 0,
            diningRooms: data.has_dining_room ? 1 : 0,
            studyRooms: data.has_study_room ? 1 : 0,
            servantRooms: data.servant_rooms || 0,
            storeRooms: data.store_rooms || 0,
            numberOfFloors: data.number_of_floors || 0,
            customFeatures: data.custom_features,
            primaryImage: data.primary_image,
            images: data.images || [],
            expectedRevenue: data.expected_revenue,
            buyerName: data.buyer_name,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            createdByName: data.created_by_name
          });
        } else {
          setError('Property not found');
        }
      } catch (err) {
        console.error('Error fetching property:', err);
        setError('Failed to load property details');
        toast.error('Failed to load property details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProperty();
    }
  }, [id, navigate]);

  const getAdminName = () => {
    const storedData = localStorage.getItem('adminData');
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        return data.username || 'Admin';
      } catch (e) {
        return 'Admin';
      }
    }
    return 'Admin';
  };

  const handleLogout = async () => {
    try {
      const refresh_token = localStorage.getItem('admin_refresh_token');
      const token = localStorage.getItem('admin_access_token');
      if (token && refresh_token) {
        await fetch('http://127.0.0.1:8000/api/admin/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ refresh_token })
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('admin_access_token');
      localStorage.removeItem('admin_refresh_token');
      localStorage.removeItem('isAdminLoggedIn');
      localStorage.removeItem('adminData');
      toast.success('Logged out successfully');
      navigate('/sign_in');
    }
  };

  const propertyCondition = getPropertyCondition(property?.yearBuilt);
  const propertyAge = property?.yearBuilt ? new Date().getFullYear() - property.yearBuilt : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="lg:ml-64">
          <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} adminName={getAdminName()} onLogout={handleLogout} />
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading property details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="lg:ml-64">
          <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} adminName={getAdminName()} onLogout={handleLogout} />
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="text-center py-12 bg-white rounded-xl shadow-lg">
              <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h2>
              <p className="text-gray-600 mb-6">{error || "The property you're looking for doesn't exist."}</p>
              <Link
                to="/properties"
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Properties
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" richColors />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:ml-64">
        <Navbar 
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
          adminName={getAdminName()}
          onLogout={handleLogout}
        />
        
        <div className="p-2 lg:p-5">
          <div className="max-w-7xl mx-auto">
            {/* Back Button and Edit Button */}
          <div className="flex justify-between items-center mb-6">
  <button
    onClick={() => navigate(-1)}
    className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors"
  >
    <ArrowLeft className="w-5 h-5" />
    Back
  </button>
</div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Image */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="relative h-96">
                    <img
                      src={property.primaryImage || 'https://images.unsplash.com/photo-1622015663381-d2e05ae91b72?w=600'}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 rounded-full font-bold shadow-lg">
                      {property.marla} Marla
                    </div>
                    {property.yearBuilt >= 2025 && (
                      <div className="absolute top-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                        NEW
                      </div>
                    )}
                    {/* Status Badge */}
                    {property.status === 'sold' && (
                      <div className="absolute bottom-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                        SOLD
                      </div>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">{property.title}</h1>
                      <div className="flex items-center gap-2 text-gray-600 mt-1">
                        <MapPin className="w-4 h-4 text-emerald-600" />
                        <span>{property.location}</span>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-semibold ${propertyCondition.bg} ${propertyCondition.color}`}>
                      {propertyCondition.label}
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-emerald-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-emerald-600 mb-1">
                        <Bed className="w-4 h-4" />
                        <span className="font-semibold text-sm">Bedrooms</span>
                      </div>
                      <div className="text-xl font-bold text-gray-900">{property.bedrooms}</div>
                    </div>

                    <div className="bg-teal-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-teal-600 mb-1">
                        <Bath className="w-4 h-4" />
                        <span className="font-semibold text-sm">Bathrooms</span>
                      </div>
                      <div className="text-xl font-bold text-gray-900">{property.bathrooms}</div>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-600 mb-1">
                        <Home className="w-4 h-4" />
                        <span className="font-semibold text-sm">Kitchens</span>
                      </div>
                      <div className="text-xl font-bold text-gray-900">{property.kitchen}</div>
                    </div>

                    {property.yearBuilt && (
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 text-purple-600 mb-1">
                          <Calendar className="w-4 h-4" />
                          <span className="font-semibold text-sm">Year Built</span>
                        </div>
                        <div className="text-xl font-bold text-gray-900">{property.yearBuilt}</div>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="border-t border-gray-200 pt-4">
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
                    <p className="text-gray-600 leading-relaxed">{property.description || 'No description provided.'}</p>
                  </div>

                  {/* Key Features */}
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">Key Features</h2>
                    <div className="grid md:grid-cols-2 gap-3">
                      {property.hasGarage && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <span>Parking/Garage</span>
                        </div>
                      )}
                      {property.hasGarden && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <span>Lawn/Garden</span>
                        </div>
                      )}
                      {property.hasSwimmingPool && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <span>Swimming Pool</span>
                        </div>
                      )}
                      {property.hasGym && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <span>Gym Facility</span>
                        </div>
                      )}
                      {property.hasSecurity && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <span>Security System</span>
                        </div>
                      )}
                      {property.hasElectricityBackup && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <span>Electricity Backup</span>
                        </div>
                      )}
                      {property.hasServantQuarter && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <span>Servant Quarter</span>
                        </div>
                      )}
                      {property.furnished && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <span>Fully Furnished</span>
                        </div>
                      )}
                      {property.isCornerPlot && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <span>Corner Plot</span>
                        </div>
                      )}
                      {property.isFacingPark && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <span>Facing Park</span>
                        </div>
                      )}
                      {property.livingRooms > 0 && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <span>Living Room</span>
                        </div>
                      )}
                      {property.diningRooms > 0 && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <span>Dining Room</span>
                        </div>
                      )}
                      {property.studyRooms > 0 && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <span>Study Room</span>
                        </div>
                      )}
                      {property.customFeatures && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <span>{property.customFeatures}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sold Information */}
                  {property.status === 'sold' && (
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <h2 className="text-lg font-semibold text-gray-900 mb-3">Sale Information</h2>
                      <div className="grid md:grid-cols-2 gap-4 bg-red-50 p-4 rounded-lg">
                        {property.buyerName && (
                          <div>
                            <p className="text-sm text-gray-600">Buyer Name</p>
                            <p className="font-semibold text-gray-900">{property.buyerName}</p>
                          </div>
                        )}
                        {property.expectedRevenue && (
                          <div>
                            <p className="text-sm text-gray-600">Expected Revenue</p>
                            <p className="font-semibold text-emerald-600">{formatPrice(property.expectedRevenue)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
                  <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-1">Total Price</p>
                    <p className="text-2xl font-bold text-emerald-600">{formatPrice(property.price)}</p>
                  </div>

                  <div className="border-t border-gray-200 pt-4 mb-6">
                    <p className="text-sm text-gray-600 mb-1">Per Marla Rate</p>
                    <p className="text-xl font-bold text-teal-600">{formatPrice(property.pricePerMarla)}</p>
                  </div>

                  <div className="border-t border-gray-200 pt-4 mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Property Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Location:</span>
                        <span className="font-medium text-gray-900">{property.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Plot Size:</span>
                        <span className="font-medium text-gray-900">{property.marla} Marla</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bedrooms:</span>
                        <span className="font-medium text-gray-900">{property.bedrooms}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bathrooms:</span>
                        <span className="font-medium text-gray-900">{property.bathrooms}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Property Type:</span>
                        <span className="font-medium text-gray-900">{property.propertyTypeDisplay}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`font-medium ${property.status === 'available' ? 'text-green-600' : 'text-red-600'}`}>
                          {property.statusDisplay}
                        </span>
                      </div>
                      {property.yearBuilt && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Property Age:</span>
                          <span className="font-medium text-gray-900">{propertyAge} years</span>
                        </div>
                      )}
                      {property.numberOfFloors > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Floors:</span>
                          <span className="font-medium text-gray-900">{property.numberOfFloors}</span>
                        </div>
                      )}
                      {property.servantRooms > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Servant Rooms:</span>
                          <span className="font-medium text-gray-900">{property.servantRooms}</span>
                        </div>
                      )}
                      {property.storeRooms > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Store Rooms:</span>
                          <span className="font-medium text-gray-900">{property.storeRooms}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Changed from "View More" to "Edit Property" */}
                  <Link
                    to={`/edit-property/${property.id}`}
                    className="w-full block text-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
                  >
                    Edit Property
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}