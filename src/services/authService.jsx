import axios from 'axios';

// Base URL for API
const API_BASE_URL = 'http://127.0.0.1:8000';

/**
 * Setup Axios Interceptors
 * - Adds auth token to requests
 * - Handles token expiration
 * - Handles unauthorized access
 */
export const setupAxiosInterceptors = () => {
  // Request interceptor - Add token to all requests
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('admin_access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor - Handle token expiration
  axios.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      // If 401 error and not already retrying
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        // Try to refresh the token
        const refreshToken = localStorage.getItem('admin_refresh_token');
        
        if (refreshToken) {
          try {
            // FIXED: Use correct JWT refresh endpoint
            const response = await axios.post(`${API_BASE_URL}/api/token/refresh/`, {
              refresh: refreshToken
            });

            if (response.data.access) {
              // Update the access token
              localStorage.setItem('admin_access_token', response.data.access);
              
              // Retry the original request with new token
              originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
              return axios(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed - logout user
            clearAdminAuth();
            window.location.href = '/sign_in';
            return Promise.reject(refreshError);
          }
        } else {
          // No refresh token - logout
          clearAdminAuth();
          window.location.href = '/sign_in';
        }
      }

      // Handle 403 Forbidden - Admin trying to access wrong portal
      if (error.response?.status === 403) {
        console.error('Access denied:', error.response.data);
      }

      return Promise.reject(error);
    }
  );
};

/**
 * Check if admin is logged in
 */
export const isAdminLoggedIn = () => {
  const isLoggedIn = localStorage.getItem('isAdminLoggedIn');
  const token = localStorage.getItem('admin_access_token');
  
  if (isLoggedIn === 'true' && token) {
    return true;
  }
  
  return false;
};

/**
 * Get admin data from localStorage
 */
export const getAdminData = () => {
  try {
    const adminData = localStorage.getItem('adminData');
    if (adminData) {
      return JSON.parse(adminData);
    }
  } catch (error) {
    console.error('Error parsing admin data:', error);
    clearAdminAuth();
  }
  return null;
};

/**
 * Get admin token
 */
export const getAdminToken = () => {
  return localStorage.getItem('admin_access_token');
};

/**
 * Get admin refresh token
 */
export const getAdminRefreshToken = () => {
  return localStorage.getItem('admin_refresh_token');
};

/**
 * Save admin authentication data
 * FIXED: Token key names match JWT response
 */
export const setAdminAuth = (accessToken, refreshToken, adminData) => {
  localStorage.setItem('admin_access_token', accessToken);
  localStorage.setItem('admin_refresh_token', refreshToken);
  localStorage.setItem('isAdminLoggedIn', 'true');
  localStorage.setItem('adminData', JSON.stringify(adminData));
};

/**
 * Clear admin authentication data (Logout)
 */
export const clearAdminAuth = () => {
  localStorage.removeItem('admin_access_token');
  localStorage.removeItem('admin_refresh_token');
  localStorage.removeItem('isAdminLoggedIn');
  localStorage.removeItem('adminData');
};

/**
 * Verify if current token is valid
 */
export const verifyAdminToken = async () => {
  try {
    const token = getAdminToken();
    if (!token) return false;

    const response = await axios.get(`${API_BASE_URL}/api/admin/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return response.status === 200;
  } catch (error) {
    console.error('Token verification failed:', error);
    return false;
  }
};

/**
 * Logout admin
 */
export const logoutAdmin = async () => {
  try {
    const refreshToken = getAdminRefreshToken();
    
    // Call logout API
    if (refreshToken) {
      await axios.post(`${API_BASE_URL}/api/admin/logout`, {
        refresh_token: refreshToken
      });
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Clear local storage regardless of API call success
    clearAdminAuth();
  }
};

/**
 * API Helper Functions
 */
export const adminAPI = {
  // ==========================================
  // ADMIN AUTHENTICATION
  // ==========================================
  
  // Admin Login
  adminLogin: (credentials) => {
    return axios.post(`${API_BASE_URL}/api/admin/login`, {
      username_or_email: credentials.username_or_email,
      password: credentials.password
    });
  },

  // Admin Profile
  getProfile: () => {
    return axios.get(`${API_BASE_URL}/api/admin/profile`);
  },

  // Change Password
  changePassword: (data) => {
    return axios.post(`${API_BASE_URL}/api/admin/change-password`, {
      old_password: data.old_password,
      new_password: data.new_password,
      confirm_password: data.confirm_password
    });
  },

  // Admin Logout
  logout: () => {
    const refreshToken = localStorage.getItem('admin_refresh_token');
    return axios.post(`${API_BASE_URL}/api/admin/logout`, {
      refresh_token: refreshToken
    });
  },

  // ==========================================
  // USER MANAGEMENT (Admin only)
  // ==========================================

  // Get all users with filters
 // Get all users with filters
  getUsers: (params = {}) => {
    return axios.get(`${API_BASE_URL}/api/admin/users/`, { params });
  },

  // Get dashboard stats
  getDashboardStats: () => {
    return axios.get(`${API_BASE_URL}/api/admin/users/stats/`);
  },

  // Get single user details
  getUserDetails: (userId) => {
    return axios.get(`${API_BASE_URL}/api/admin/users/${userId}/`);
  },

  // Create new user/admin
  createUser: (data) => {
    return axios.post(`${API_BASE_URL}/api/admin/users/create/`, data);
  },

  // Update user
  updateUser: (userId, data) => {
    return axios.put(`${API_BASE_URL}/api/admin/users/update/${userId}/`, data);
  },

  // Delete user
  deleteUser: (userId) => {
    return axios.delete(`${API_BASE_URL}/api/admin/users/delete/${userId}/`);
  },

  // Change user status (activate/deactivate)
  changeUserStatus: (userId, status) => {
    return axios.post(`${API_BASE_URL}/api/admin/users/change-status/${userId}/`, { status });
  },

  // Change user role (admin/user)
  changeUserRole: (userId, role) => {
    return axios.post(`${API_BASE_URL}/api/admin/users/change-role/${userId}/`, { role });
  },

  // Bulk user actions
  bulkUserAction: (data) => {
    return axios.post(`${API_BASE_URL}/api/admin/users/bulk-action/`, data);
  },

  // ==========================================
  // HISTORICAL RATES (Public - No Auth)
  // ==========================================

  historicalRates: {
    // Get dashboard statistics
    getDashboardStats: () => {
      return axios.get(`${API_BASE_URL}/api/historical-rates/public/stats`);
    },

    // Get all locations with current rates
    getLocations: (params = {}) => {
      return axios.get(`${API_BASE_URL}/api/historical-rates/public/locations`, { params });
    },

    addYear: (locationId, data) => {
  console.log('🔵 API Call - addYear:', { locationId, data })
  return axios.post(`${API_BASE_URL}/api/historical-rates/admin/locations/${locationId}/add-year`, data)
},

    // Get single location details with all historical data
    getLocationDetail: (locationId) => {
      return axios.get(`${API_BASE_URL}/api/historical-rates/public/locations/${locationId}`);
    },

    // Get available years for a location
    getLocationYears: (locationId) => {
      return axios.get(`${API_BASE_URL}/api/historical-rates/public/locations/${locationId}/years`);
    },

    // Compare prices between two years
    compareYears: (locationId, year1, year2) => {
      return axios.get(`${API_BASE_URL}/api/historical-rates/public/locations/${locationId}/compare-years`, {
        params: { year1, year2 }
      });
    },
  },

  // ==========================================
  // LOCATION MANAGEMENT (Admin only)
  // ==========================================

  locationManagement: {
    // Get all locations (admin view)
    getLocations: (params = {}) => {
      return axios.get(`${API_BASE_URL}/api/historical-rates/admin/locations`, { params });
    },

    // Get single location details
    getLocationDetail: (locationId) => {
      return axios.get(`${API_BASE_URL}/api/historical-rates/admin/locations/${locationId}`);
    },

    // Create new location
    createLocation: (data) => {
      return axios.post(`${API_BASE_URL}/api/historical-rates/admin/locations/create`, data);
    },

    // Update location
    updateLocation: (locationId, data) => {
      return axios.put(`${API_BASE_URL}/api/historical-rates/admin/locations/${locationId}`, data);
    },

    // Delete location
    deleteLocation: (locationId) => {
      return axios.delete(`${API_BASE_URL}/api/historical-rates/admin/locations/${locationId}`);
    },

    // Add year to location
    addYear: (locationId, data) => {
      return axios.post(`${API_BASE_URL}/api/historical-rates/admin/locations/${locationId}/add-year`, data);
    },

    // Update year rates
    updateYearRate: (locationId, year, data) => {
      return axios.put(`${API_BASE_URL}/api/historical-rates/admin/locations/${locationId}/year/${year}`, data);
    },

    // Delete year rate
    deleteYearRate: (locationId, year) => {
      return axios.delete(`${API_BASE_URL}/api/historical-rates/admin/locations/${locationId}/year/${year}`);
    },

    // Bulk update years
    bulkUpdateYears: (locationId, data) => {
      return axios.post(`${API_BASE_URL}/api/historical-rates/admin/locations/${locationId}/bulk-years`, data);
    },

    // Get location year range
    getLocationYears: (locationId) => {
      return axios.get(`${API_BASE_URL}/api/historical-rates/admin/locations/${locationId}/years`);
    },

    // Compare years
    compareYears: (locationId, year1, year2) => {
      return axios.get(`${API_BASE_URL}/api/historical-rates/admin/locations/${locationId}/compare-years`, {
        params: { year1, year2 }
      });
    },

    // Get price history logs
    getHistoryLogs: (locationId = null, params = {}) => {
      const url = locationId 
        ? `${API_BASE_URL}/api/historical-rates/admin/locations/${locationId}/history`
        : `${API_BASE_URL}/api/historical-rates/admin/history`;
      return axios.get(url, { params });
    },

    // Export data
    exportData: (type = 'all', format = 'csv', locationId = null) => {
      let url = `${API_BASE_URL}/api/historical-rates/admin/export?type=${type}&format=${format}`;
      if (locationId) {
        url += `&location_id=${locationId}`;
      }
      return axios.get(url, { responseType: 'blob' });
    },

    // Get dashboard stats (admin)
    getAdminDashboardStats: () => {
      return axios.get(`${API_BASE_URL}/api/historical-rates/admin/dashboard/stats`);
    },

    // Get area statistics
    getAreaStatistics: () => {
      return axios.get(`${API_BASE_URL}/api/historical-rates/admin/area-statistics`);
    },
  },

  // ==========================================
  // LISTINGS MANAGEMENT
  // ==========================================

  listings: {
    // Get all listings
    getListings: (params = {}) => {
      return axios.get(`${API_BASE_URL}/api/listings/admin/listings`, { params });
    },

    // Get single listing
    getListingDetails: (listingId) => {
      return axios.get(`${API_BASE_URL}/api/listings/admin/listings/${listingId}`);
    },

    // Create listing
    createListing: (data) => {
      return axios.post(`${API_BASE_URL}/api/listings/admin/add`, data);
    },

    // Update listing
    updateListing: (listingId, data) => {
      return axios.put(`${API_BASE_URL}/api/listings/admin/update/${listingId}`, data);
    },

    // Delete listing
    deleteListing: (listingId) => {
      return axios.delete(`${API_BASE_URL}/api/listings/admin/delete/${listingId}`);
    },

    // Get locations for dropdown
    getLocations: () => {
      return axios.get(`${API_BASE_URL}/api/locations/`);
    },
  },

  // ==========================================
  // USER (Regular User) APIs
  // ==========================================

  user: {
    // Register new user
    register: (data) => {
      return axios.post(`${API_BASE_URL}/api/register/`, {
        username: data.username,
        email: data.email,
        password: data.password,
        password2: data.confirm_password,
        phone: data.phone || ''
      });
    },

    // User login
    login: (credentials) => {
      return axios.post(`${API_BASE_URL}/api/login/`, {
        email: credentials.email,
        password: credentials.password
      });
    },

    // Get user profile
    getProfile: () => {
      return axios.get(`${API_BASE_URL}/api/user/profile`);
    },

    // Update user profile
    updateProfile: (data) => {
      return axios.put(`${API_BASE_URL}/api/user/profile`, data);
    },

    // Change password
    changePassword: (data) => {
      return axios.post(`${API_BASE_URL}/api/user/change-password`, {
        old_password: data.old_password,
        new_password: data.new_password,
        confirm_password: data.confirm_password
      });
    },

    // Get user's prediction history
    getPredictionHistory: () => {
      return axios.get(`${API_BASE_URL}/api/user/predictions`);
    },
  },

  // ==========================================
  // PREDICTIONS
  // ==========================================

  predictions: {
    // Make price prediction
    predict: (data) => {
      return axios.post(`${API_BASE_URL}/api/predict`, data);
    },

    // Save prediction request
    savePrediction: (data) => {
      return axios.post(`${API_BASE_URL}/api/predict/save`, data);
    },
  },
};

export default adminAPI;