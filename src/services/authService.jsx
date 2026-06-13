import axios from 'axios';

// Base URL for API
const API_BASE_URL = 'http://127.0.0.1:8000';

/**
 * Check if admin token is expired
 */
export const isAdminTokenExpired = () => {
  const token = localStorage.getItem('admin_access_token');
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiryTime = payload.exp * 1000;
    return Date.now() >= expiryTime;
  } catch (e) {
    console.error('Token parse error:', e);
    return true;
  }
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
 * Setup Axios Interceptors
 */
export const setupAxiosInterceptors = (navigate) => {
  // Clear existing interceptors to avoid duplicates
  axios.interceptors.request.clear?.();
  axios.interceptors.response.clear?.();
  
  // Request interceptor
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('admin_access_token');
      if (token && !isAdminTokenExpired()) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor - NO window.location.href
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // If 401 error and not already retrying
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        const refreshToken = localStorage.getItem('admin_refresh_token');
        
        if (refreshToken) {
          try {
            const response = await axios.post(`${API_BASE_URL}/api/token/refresh/`, {
              refresh: refreshToken
            });

            if (response.data.access) {
              localStorage.setItem('admin_access_token', response.data.access);
              originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
              return axios(originalRequest);
            }
          } catch (refreshError) {
            console.error('Refresh failed:', refreshError);
            clearAdminAuth();
          }
        } else {
          clearAdminAuth();
        }
      }

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
  
  if (isLoggedIn === 'true' && token && !isAdminTokenExpired()) {
    return true;
  }
  
  if (token && isAdminTokenExpired()) {
    clearAdminAuth();
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
  const token = localStorage.getItem('admin_access_token');
  if (token && isAdminTokenExpired()) {
    clearAdminAuth();
    return null;
  }
  return token;
};

/**
 * Get admin refresh token
 */
export const getAdminRefreshToken = () => {
  return localStorage.getItem('admin_refresh_token');
};

/**
 * Save admin authentication data
 */
export const setAdminAuth = (accessToken, refreshToken, adminData) => {
  localStorage.setItem('admin_access_token', accessToken);
  localStorage.setItem('admin_refresh_token', refreshToken);
  localStorage.setItem('isAdminLoggedIn', 'true');
  localStorage.setItem('adminData', JSON.stringify(adminData));
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
    const accessToken = getAdminToken();
    
    if (refreshToken && accessToken) {
      await axios.post(`${API_BASE_URL}/api/admin/logout`, {
        refresh_token: refreshToken
      }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    clearAdminAuth();
  }
};

export const logoutAdminWithNavigate = (navigate) => {
  clearAdminAuth();
  if (navigate) {
    navigate('/sign_in');
  }
};

/**
 * API Helper Functions
 */
export const adminAPI = {
  adminLogin: (credentials) => {
    return axios.post(`${API_BASE_URL}/api/admin/login`, {
      username_or_email: credentials.username_or_email,
      password: credentials.password
    });
  },

  getProfile: () => {
    return axios.get(`${API_BASE_URL}/api/admin/profile`);
  },

  changePassword: (data) => {
    return axios.post(`${API_BASE_URL}/api/admin/change-password`, {
      old_password: data.old_password,
      new_password: data.new_password,
      confirm_password: data.confirm_password
    });
  },

  logout: () => {
    const refreshToken = localStorage.getItem('admin_refresh_token');
    return axios.post(`${API_BASE_URL}/api/admin/logout`, {
      refresh_token: refreshToken
    });
  },

  adminForgotPassword: (email) => {
    return axios.post(`${API_BASE_URL}/api/admin/forgot-password/`, { email });
  },

  adminVerifyOTP: (email, otp) => {
    return axios.post(`${API_BASE_URL}/api/admin/verify-otp/`, { email, otp });
  },

  adminResetPassword: (email, newPassword, confirmPassword) => {
    return axios.post(`${API_BASE_URL}/api/admin/reset-password/`, { 
      email, 
      new_password: newPassword, 
      confirm_password: confirmPassword 
    });
  },

  adminSignup: (data) => {
    return axios.post(`${API_BASE_URL}/api/admin/signup`, {
      username: data.username,
      email: data.email,
      phone: data.phone || '',
      password: data.password,
      confirm_password: data.confirm_password
    });
  },

  // ... rest of your adminAPI methods remain the same
  getUsers: (params = {}) => {
    return axios.get(`${API_BASE_URL}/api/admin/users/`, { params });
  },

  getDashboardStats: () => {
    return axios.get(`${API_BASE_URL}/api/admin/users/stats/`);
  },

  getUserDetails: (userId) => {
    return axios.get(`${API_BASE_URL}/api/admin/users/${userId}/`);
  },

  createUser: (data) => {
    return axios.post(`${API_BASE_URL}/api/admin/users/create/`, data);
  },

  updateUser: (userId, data) => {
    return axios.put(`${API_BASE_URL}/api/admin/users/update/${userId}/`, data);
  },

  deleteUser: (userId) => {
    return axios.delete(`${API_BASE_URL}/api/admin/users/delete/${userId}/`);
  },

  changeUserStatus: (userId, status) => {
    return axios.post(`${API_BASE_URL}/api/admin/users/change-status/${userId}/`, { status });
  },

  changeUserRole: (userId, role) => {
    return axios.post(`${API_BASE_URL}/api/admin/users/change-role/${userId}/`, { role });
  },

  bulkUserAction: (data) => {
    return axios.post(`${API_BASE_URL}/api/admin/users/bulk-action/`, data);
  },

  historicalRates: {
    getDashboardStats: () => {
      return axios.get(`${API_BASE_URL}/api/historical-rates/public/stats`);
    },
    getLocations: (params = {}) => {
      return axios.get(`${API_BASE_URL}/api/historical-rates/public/locations`, { params });
    },
    addYear: (locationId, data) => {
      return axios.post(`${API_BASE_URL}/api/historical-rates/admin/locations/${locationId}/add-year`, data)
    },
    getLocationDetail: (locationId) => {
      return axios.get(`${API_BASE_URL}/api/historical-rates/public/locations/${locationId}`);
    },
    getLocationYears: (locationId) => {
      return axios.get(`${API_BASE_URL}/api/historical-rates/public/locations/${locationId}/years`);
    },
    compareYears: (locationId, year1, year2) => {
      return axios.get(`${API_BASE_URL}/api/historical-rates/public/locations/${locationId}/compare-years`, {
        params: { year1, year2 }
      });
    },
  },

  locationManagement: {
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

  // LISTINGS MANAGEMENT

  listings: {
    getListings: (params = {}) => {
      return axios.get(`${API_BASE_URL}/api/listings/admin/listings`, { params });
    },
    getListingDetails: (listingId) => {
      return axios.get(`${API_BASE_URL}/api/listings/admin/listings/${listingId}`);
    },
    createListing: (data) => {
      return axios.post(`${API_BASE_URL}/api/listings/admin/add`, data);
    },
    updateListing: (listingId, data) => {
      return axios.put(`${API_BASE_URL}/api/listings/admin/update/${listingId}`, data);
    },
    deleteListing: (listingId) => {
      return axios.delete(`${API_BASE_URL}/api/listings/admin/delete/${listingId}`);
    },
    getLocations: () => {
      return axios.get(`${API_BASE_URL}/api/locations/`);
    },
  },

  user: {
    register: (data) => {
      return axios.post(`${API_BASE_URL}/api/register/`, {
        username: data.username,
        email: data.email,
        password: data.password,
        password2: data.confirm_password,
        phone: data.phone || ''
      });
    },
    login: (credentials) => {
      return axios.post(`${API_BASE_URL}/api/login/`, {
        email: credentials.email,
        password: credentials.password
      });
    },
    getProfile: () => {
      return axios.get(`${API_BASE_URL}/api/user/profile`);
    },
    updateProfile: (data) => {
      return axios.put(`${API_BASE_URL}/api/user/profile`, data);
    },
    changePassword: (data) => {
      return axios.post(`${API_BASE_URL}/api/user/change-password`, {
        old_password: data.old_password,
        new_password: data.new_password,
        confirm_password: data.confirm_password
      });
    },
    getPredictionHistory: () => {
      return axios.get(`${API_BASE_URL}/api/user/predictions`);
    },
  },

  predictions: {
    predict: (data) => {
      return axios.post(`${API_BASE_URL}/api/predict`, data);
    },
    savePrediction: (data) => {
      return axios.post(`${API_BASE_URL}/api/predict/save`, data);
    },
  },
};

export default adminAPI;