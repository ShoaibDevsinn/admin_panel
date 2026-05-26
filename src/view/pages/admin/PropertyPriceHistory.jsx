import React, { useState, useEffect, useMemo } from 'react'
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/AdminNavbar";
import { 
  Plus, Calendar, Edit2, Trash2, Save, X, Search, 
  TrendingUp, TrendingDown, Minus, Eye, Clock, 
  CheckCircle, AlertCircle, Layers, MapPin, Building2,
  Database, FileText, History, BarChart3, Sparkles
} from 'lucide-react'
import { adminAPI } from '../../../services/authService'

const PropertyPriceHistory = () => {
  // Layout State
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Main Data State
  const [locations, setLocations] = useState([])
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [priceHistoryLogs, setPriceHistoryLogs] = useState([])
  const [yearDataLoading, setYearDataLoading] = useState(false)
  
  // UI State
  const [activeTab, setActiveTab] = useState('current')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showAddYearModal, setShowAddYearModal] = useState(false)
  const [showDeleteYearConfirm, setShowDeleteYearConfirm] = useState(false)
  const [editingLocation, setEditingLocation] = useState(null)
  const [yearToDelete, setYearToDelete] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterArea, setFilterArea] = useState('All')
  const [selectedYear, setSelectedYear] = useState('2025')
  const [successMessage, setSuccessMessage] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  // const [successMessage, setSuccessMessage] = useState('')
  const [stats, setStats] = useState({
  totalLocations: 0,
  totalRecords: 0,
  locationsWithData: 0,
  yearRange: { min: null, max: null }
})

  // Form States
  const [editPrices, setEditPrices] = useState({})
  const [newLocation, setNewLocation] = useState({
    locationName: '',
    area: '',
    initialYear: '2026',
    prices: { '5_marla': 0, '10_marla': 0, '1_kanal': 0, '2_kanal': 0 }
  })
  const [newYearData, setNewYearData] = useState({
    year: '',
    prices: { '5_marla': 0, '10_marla': 0, '1_kanal': 0, '2_kanal': 0 }
  })

  // Dummy Data with Independent Year Records
  // useEffect(() => {
  //   const dummyLocations = [
  //     {
  //       id: 1,
  //       locationName: 'DHA Phase 6',
  //       area: 'DHA Defence',
  //       city: 'Lahore',
  //       createdAt: '2020-03-15T10:00:00',
  //       yearRecords: {
  //         '2020': { prices: { '5_marla': 7500000, '10_marla': 14500000, '1_kanal': 28000000, '2_kanal': 56000000 }, updatedAt: '2020-03-15T10:00:00', updatedBy: 'Admin' },
  //         '2021': { prices: { '5_marla': 8500000, '10_marla': 16500000, '1_kanal': 32000000, '2_kanal': 65000000 }, updatedAt: '2021-01-10T14:30:00', updatedBy: 'Admin' },
  //         '2022': { prices: { '5_marla': 9500000, '10_marla': 18500000, '1_kanal': 36000000, '2_kanal': 72000000 }, updatedAt: '2022-02-20T09:15:00', updatedBy: 'Admin' },
  //         '2023': { prices: { '5_marla': 11000000, '10_marla': 21000000, '1_kanal': 41000000, '2_kanal': 82000000 }, updatedAt: '2023-03-05T16:45:00', updatedBy: 'Admin' },
  //         '2024': { prices: { '5_marla': 12500000, '10_marla': 24000000, '1_kanal': 47000000, '2_kanal': 94000000 }, updatedAt: '2024-04-12T11:20:00', updatedBy: 'Admin' },
  //         '2025': { prices: { '5_marla': 14000000, '10_marla': 27000000, '1_kanal': 53000000, '2_kanal': 105000000 }, updatedAt: '2025-04-12T14:30:00', updatedBy: 'Admin' }
  //       }
  //     },
  //     {
  //       id: 2,
  //       locationName: 'Bahria Town Lahore',
  //       area: 'Bahria Town',
  //       city: 'Lahore',
  //       createdAt: '2021-06-20T08:00:00',
  //       yearRecords: {
  //         '2021': { prices: { '5_marla': 5500000, '10_marla': 10500000, '1_kanal': 20000000, '2_kanal': 40000000 }, updatedAt: '2021-06-20T08:00:00', updatedBy: 'Admin' },
  //         '2022': { prices: { '5_marla': 6200000, '10_marla': 11800000, '1_kanal': 22500000, '2_kanal': 45000000 }, updatedAt: '2022-07-15T12:00:00', updatedBy: 'Admin' },
  //         '2023': { prices: { '5_marla': 7000000, '10_marla': 13500000, '1_kanal': 25500000, '2_kanal': 51000000 }, updatedAt: '2023-08-10T15:30:00', updatedBy: 'Admin' },
  //         '2024': { prices: { '5_marla': 8000000, '10_marla': 15500000, '1_kanal': 29000000, '2_kanal': 58000000 }, updatedAt: '2024-09-05T10:00:00', updatedBy: 'Admin' },
  //         '2025': { prices: { '5_marla': 9000000, '10_marla': 17500000, '1_kanal': 33000000, '2_kanal': 66000000 }, updatedAt: '2025-04-10T09:15:00', updatedBy: 'Admin' }
  //       }
  //     },
  //     {
  //       id: 3,
  //       locationName: 'Johar Town',
  //       area: 'Johar Town',
  //       city: 'Lahore',
  //       createdAt: '2019-01-10T09:00:00',
  //       yearRecords: {
  //         '2019': { prices: { '5_marla': 3200000, '10_marla': 6000000, '1_kanal': 11000000, '2_kanal': 22000000 }, updatedAt: '2019-01-10T09:00:00', updatedBy: 'Admin' },
  //         '2020': { prices: { '5_marla': 3500000, '10_marla': 6600000, '1_kanal': 12000000, '2_kanal': 24000000 }, updatedAt: '2020-02-15T11:00:00', updatedBy: 'Admin' },
  //         '2021': { prices: { '5_marla': 3800000, '10_marla': 7200000, '1_kanal': 13500000, '2_kanal': 27000000 }, updatedAt: '2021-03-20T14:00:00', updatedBy: 'Admin' },
  //         '2022': { prices: { '5_marla': 4200000, '10_marla': 8000000, '1_kanal': 15000000, '2_kanal': 30000000 }, updatedAt: '2022-04-25T16:00:00', updatedBy: 'Admin' },
  //         '2023': { prices: { '5_marla': 4800000, '10_marla': 9200000, '1_kanal': 17000000, '2_kanal': 34000000 }, updatedAt: '2023-05-30T10:00:00', updatedBy: 'Admin' },
  //         '2024': { prices: { '5_marla': 5500000, '10_marla': 10500000, '1_kanal': 19500000, '2_kanal': 39000000 }, updatedAt: '2024-06-15T13:00:00', updatedBy: 'Admin' },
  //         '2025': { prices: { '5_marla': 6200000, '10_marla': 12000000, '1_kanal': 22000000, '2_kanal': 44000000 }, updatedAt: '2025-04-08T16:45:00', updatedBy: 'Admin' }
  //       }
  //     },
  //     {
  //       id: 4,
  //       locationName: 'Wapda Town',
  //       area: 'Wapda Town',
  //       city: 'Lahore',
  //       createdAt: '2021-03-01T07:00:00',
  //       yearRecords: {
  //         '2021': { prices: { '5_marla': 3200000, '10_marla': 6000000, '1_kanal': 11000000, '2_kanal': 22000000 }, updatedAt: '2021-03-01T07:00:00', updatedBy: 'Admin' },
  //         '2022': { prices: { '5_marla': 3500000, '10_marla': 6800000, '1_kanal': 12500000, '2_kanal': 25000000 }, updatedAt: '2022-04-10T09:00:00', updatedBy: 'Admin' },
  //         '2023': { prices: { '5_marla': 4000000, '10_marla': 7800000, '1_kanal': 14200000, '2_kanal': 28500000 }, updatedAt: '2023-05-20T11:00:00', updatedBy: 'Admin' },
  //         '2024': { prices: { '5_marla': 4600000, '10_marla': 8900000, '1_kanal': 16200000, '2_kanal': 32500000 }, updatedAt: '2024-06-30T14:00:00', updatedBy: 'Admin' },
  //         '2025': { prices: { '5_marla': 5200000, '10_marla': 10000000, '1_kanal': 18500000, '2_kanal': 37000000 }, updatedAt: '2025-04-05T11:20:00', updatedBy: 'Admin' }
  //       }
  //     },
  //     {
  //       id: 5,
  //       locationName: 'Model Town',
  //       area: 'Model Town',
  //       city: 'Lahore',
  //       createdAt: '2018-05-15T06:00:00',
  //       yearRecords: {
  //         '2018': { prices: { '5_marla': 10000000, '10_marla': 19000000, '1_kanal': 37000000, '2_kanal': 74000000 }, updatedAt: '2018-05-15T06:00:00', updatedBy: 'Admin' },
  //         '2019': { prices: { '5_marla': 10800000, '10_marla': 20500000, '1_kanal': 40000000, '2_kanal': 80000000 }, updatedAt: '2019-06-20T08:00:00', updatedBy: 'Admin' },
  //         '2020': { prices: { '5_marla': 11500000, '10_marla': 22000000, '1_kanal': 43000000, '2_kanal': 86000000 }, updatedAt: '2020-07-25T10:00:00', updatedBy: 'Admin' },
  //         '2021': { prices: { '5_marla': 12000000, '10_marla': 23000000, '1_kanal': 45000000, '2_kanal': 90000000 }, updatedAt: '2021-08-30T12:00:00', updatedBy: 'Admin' },
  //         '2022': { prices: { '5_marla': 13000000, '10_marla': 25500000, '1_kanal': 50000000, '2_kanal': 100000000 }, updatedAt: '2022-09-15T14:00:00', updatedBy: 'Admin' },
  //         '2023': { prices: { '5_marla': 14500000, '10_marla': 28000000, '1_kanal': 56000000, '2_kanal': 112000000 }, updatedAt: '2023-10-20T16:00:00', updatedBy: 'Admin' },
  //         '2024': { prices: { '5_marla': 16000000, '10_marla': 31000000, '1_kanal': 62000000, '2_kanal': 125000000 }, updatedAt: '2024-11-25T18:00:00', updatedBy: 'Admin' },
  //         '2025': { prices: { '5_marla': 17500000, '10_marla': 34000000, '1_kanal': 69000000, '2_kanal': 138000000 }, updatedAt: '2025-04-01T08:00:00', updatedBy: 'Admin' }
  //       }
  //     }
  //   ]

  //   const dummyLogs = [
  //     { id: 1, locationId: 1, locationName: 'DHA Phase 6', action: 'year_updated', year: '2025', date: '2025-04-12T14:30:00', updatedBy: 'Admin', details: 'Updated 2025 prices', changes: { '5_marla': { old: 13500000, new: 14000000 } } },
  //     { id: 2, locationId: 2, locationName: 'Bahria Town Lahore', action: 'year_updated', year: '2025', date: '2025-04-10T09:15:00', updatedBy: 'Admin', details: 'Adjusted 2025 rates', changes: { '5_marla': { old: 8500000, new: 9000000 } } },
  //     { id: 3, locationId: 3, locationName: 'Johar Town', action: 'year_updated', year: '2025', date: '2025-04-08T16:45:00', updatedBy: 'Admin', details: 'Quarterly 2025 revision', changes: { '5_marla': { old: 5900000, new: 6200000 } } },
  //     { id: 4, locationId: 3, locationName: 'Johar Town', action: 'year_added', year: '2019', date: '2024-12-01T10:00:00', updatedBy: 'Admin', details: 'Added historical 2019 data' },
  //     { id: 5, locationId: 5, locationName: 'Model Town', action: 'year_added', year: '2018', date: '2024-11-15T09:00:00', updatedBy: 'Admin', details: 'Added historical 2018 records' },
  //     { id: 6, locationId: 1, locationName: 'DHA Phase 6', action: 'year_updated', year: '2024', date: '2024-04-12T11:20:00', updatedBy: 'Admin', details: 'Annual 2024 revision' },
  //   ]

  //   setLocations(dummyLocations)
  //   setPriceHistoryLogs(dummyLogs)
  //   setSelectedLocation(dummyLocations[0])
  // }, [])

// Loading state
const [isLoading, setIsLoading] = useState(true)

// Fetch locations from API
useEffect(() => {
  fetchLocations()
  fetchDashboardStats()
}, [])

// Fetch individual year data when historical tab is active and year selected
// Auto-select first year when location changes and historical tab is active
useEffect(() => {
  if (selectedLocation && activeTab === 'historical') {
    const years = getLocationYears(selectedLocation)
    if (years.length > 0) {
      setSelectedYear(years[0])
      const yr = selectedLocation?.yearRecords
      const firstYear = years[0]
      let needsFetch = true
      
      if (yr && !Array.isArray(yr) && yr[firstYear]) {
        const record = yr[firstYear]
        if (record.prices) {
          const hasValue = Object.values(record.prices).some(v => v && parseFloat(v) > 0)
          if (hasValue) needsFetch = false
        }
      }
      
      if (needsFetch) {
        setTimeout(() => fetchYearDetail(selectedLocation.id, firstYear), 100)
      }
    }
  }
}, [selectedLocation?.id, activeTab])

const fetchLocations = async () => {
  try {
    setIsLoading(true)
    const response = await adminAPI.locationManagement.getLocations()
    
    console.log('API Response data:', response.data)
    
    const data = response.data
    
    let apiLocations = []
    
    if (data?.data && Array.isArray(data.data)) {
      apiLocations = data.data
    } else if (Array.isArray(data)) {
      apiLocations = data
    } else if (data?.results && Array.isArray(data.results)) {
      apiLocations = data.results
    } else {
      console.error('Cannot find locations array in:', data)
      setLocations([])
      setIsLoading(false)
      return
    }
    
    // Format locations first
        const formattedLocations = apiLocations.map(loc => {
      // Build yearRecords from available_years and latest_prices if missing
      let yearRecords = loc.year_records || loc.yearRecords || {}
      
      // If yearRecords is empty but we have available_years, build minimal structure
      if ((Array.isArray(yearRecords) && yearRecords.length === 0) || 
          (!Array.isArray(yearRecords) && Object.keys(yearRecords).length === 0)) {
        if (loc.available_years && loc.available_years.length > 0 && loc.latest_prices) {
          // Create yearRecords object from available data
          yearRecords = {}
          loc.available_years.forEach(year => {
            yearRecords[year] = {
              prices: year === Math.max(...loc.available_years) ? loc.latest_prices : {},
              updatedAt: loc.created_at || new Date().toISOString()
            }
          })
        }
      }
      
      return {
        id: loc.location_rate_id || loc.id || loc._id || loc.pk,
        locationName: loc.location_name || loc.name || loc.locationName || 'Unknown',
        area: loc.area_name || loc.area || 'Unknown',
        city: loc.city || 'Lahore',
        createdAt: loc.created_at || loc.createdAt || new Date().toISOString(),
        yearRecords: yearRecords,
        latestPrices: loc.latest_prices || {},
        availableYears: loc.available_years || [],
        yearsCount: loc.years_count || 0
      }
    })
    
    console.log('Formatted locations:', formattedLocations)
    
    // NOW: Fetch full year records for each location
        setLocations(formattedLocations)
    
   if (formattedLocations.length > 0) {
  setSelectedLocation(prev => {
    if (prev?.id) {
      const stillExists = formattedLocations.find(loc => loc.id === prev.id)
      if (stillExists) return stillExists
    }
    return formattedLocations[0]
  })
  // Fetch logs for current selection
  const currentId = selectedLocation?.id || formattedLocations[0]?.id
  if (currentId) fetchLocationLogs(currentId)
}
  } catch (error) {
    console.error('Error fetching locations:', error)
    showMessage('❌ Failed to load locations')
  } finally {
    setIsLoading(false)
  }
}

const fetchDashboardStats = async () => {
  try {
    const response = await adminAPI.locationManagement.getAdminDashboardStats()
    console.log('Admin stats response.data:', response.data)
    
    const statsData = response.data?.data || response.data
    
    if (statsData) {
      const newStats = {
        totalLocations: statsData.total_locations || locations.length || 0,
        totalRecords: statsData.total_records || 0,
        locationsWithData: statsData.locations_with_data || 0,
        yearRange: statsData.year_range || { min: null, max: null }
      }
      console.log('Setting stats to:', newStats)
      setStats(newStats)
    }
  } catch (error) {
    console.error('Dashboard stats API failed:', error)
  }
}

// Fallback function to compute stats locally
const computeStatsFromLocations = () => {
  const locs = locations
  if (locs.length === 0) return
  
  let totalRecords = 0
  let locsWithData = 0
  const allYears = new Set()
  
 locs.forEach(loc => {
    if (loc.yearRecords) {
      let years = []
      if (Array.isArray(loc.yearRecords)) {
        years = loc.yearRecords
          .map(item => typeof item === 'object' ? (item.year || item.record_year) : item)
          .filter(y => y)
      } else {
        years = Object.keys(loc.yearRecords)
      }
      totalRecords += years.length
      if (years.length > 0) locsWithData++
      years.forEach(y => allYears.add(parseInt(y)))
    }
  })
  
  const yearsArray = Array.from(allYears).sort((a, b) => a - b)
  
  setStats({
    totalLocations: locs.length,
    totalRecords: totalRecords,
    locationsWithData: locsWithData,
    yearRange: yearsArray.length > 0 
      ? { min: yearsArray[0], max: yearsArray[yearsArray.length - 1] }
      : { min: null, max: null }
  })
  
  console.log('Computed stats from locations:', {
    totalLocations: locs.length,
    totalRecords,
    locationsWithData: locsWithData
  })
}

const fetchLocationLogs = async (locationId) => {
  try {
    // Use all logs endpoint when locationId is null
    const url = locationId 
      ? null // Will use getHistoryLogs with locationId
      : null // Will use different approach
    
    let response
    if (locationId) {
      response = await adminAPI.locationManagement.getHistoryLogs(locationId)
    } else {
      // Fetch all logs - use the admin/history endpoint
      const token = localStorage.getItem('admin_access_token')
      response = await fetch(`http://127.0.0.1:8000/api/historical-rates/admin/history`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      response = { data: await response.json() }
    }
    
    console.log('Logs API Response:', response.data)
    
    const data = response.data
    let logs = []
    
    if (data?.data && Array.isArray(data.data)) {
      logs = data.data
    } else if (Array.isArray(data)) {
      logs = data
    } else if (data?.logs && Array.isArray(data.logs)) {
      logs = data.logs
    } else if (data?.results && Array.isArray(data.results)) {
      logs = data.results
    } else {
      logs = []
    }
    
    const formattedLogs = logs.map(log => ({
      id: log.id || log.log_id || Math.random(),
      locationId: log.location_id || log.location_rate_id || locationId,
      locationName: log.location_name || '',
      action: log.action || log.action_type || 'updated',
      year: log.year || log.record_year || null,
      date: log.created_at || log.timestamp || log.date || new Date().toISOString(),
      updatedBy: log.updated_by || log.user || log.performed_by || 'Admin',
      details: log.details || log.description || log.message || 'Record updated',
      changes: log.changes || log.change_data || {}
    }))
    
    setPriceHistoryLogs(formattedLogs)
  } catch (error) {
    console.error('Error fetching logs:', error)
    setPriceHistoryLogs([])
  }
}

const fetchYearDetail = async (locationId, year) => {
  try {
    setYearDataLoading(true)
    const token = localStorage.getItem('admin_access_token')
    const response = await fetch(`http://127.0.0.1:8000/api/historical-rates/admin/locations/${locationId}/year/${year}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await response.json()
    console.log('Year detail for', year, ':', data)
    
    if (data?.success && data?.data) {
      const yearData = data.data
      setSelectedLocation(prev => {
        if (!prev) return prev
        return {
          ...prev,
          yearRecords: {
            ...prev.yearRecords,
            [String(year)]: {
              prices: yearData.prices || yearData,
              updatedAt: yearData.updated_at || new Date().toISOString()
            }
          }
        }
      })
    }
  } catch (error) {
    console.log('Could not fetch year detail for', year, error)
  } finally {
    setYearDataLoading(false)
  }
}

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return 'PKR 0'
    if (amount >= 10000000) return `PKR ${(amount / 10000000).toFixed(2)} Cr`
    if (amount >= 100000) return `PKR ${(amount / 100000).toFixed(2)} Lac`
    return `PKR ${amount.toLocaleString()}`
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', month: 'short', day: 'numeric', 
        hour: '2-digit', minute: '2-digit' 
      })
    } catch (e) {
      return dateString
    }
  }

    // Get price for specific year and size
  const getPriceForYear = (yearRecords, year, size, latestPrices = null) => {
    const yearStr = String(year)
    
    // Check latestPrices if year matches
    if (latestPrices && Object.keys(latestPrices).length > 0) {
      const lpYear = String(latestPrices.year || latestPrices.year_value || '')
      if (lpYear === yearStr) {
        const flatKey = `price_${size}`
        if (latestPrices[flatKey]) return parseFloat(latestPrices[flatKey])
      }
    }
    
    // Check yearRecords object
    if (yearRecords && !Array.isArray(yearRecords) && yearRecords[yearStr]) {
      const record = yearRecords[yearStr]
      // Try prices object with key like '5_marla'
      if (record.prices?.[size]) return parseFloat(record.prices[size])
      // Try flat key inside prices like 'price_5_marla'
      const flatKey = `price_${size}`
      if (record.prices?.[flatKey]) return parseFloat(record.prices[flatKey])
      if (record[flatKey]) return parseFloat(record[flatKey])
    }
    
    // Check yearRecords array
    if (yearRecords && Array.isArray(yearRecords)) {
      const record = yearRecords.find(item => {
        const itemYear = String(item?.year || item?.record_year || item?.year_value || '')
        return itemYear === yearStr
      })
      if (record) {
        if (record.prices?.[size]) return parseFloat(record.prices[size])
        const flatKey = `price_${size}`
        if (record.prices?.[flatKey]) return parseFloat(record.prices[flatKey])
        if (record[flatKey]) return parseFloat(record[flatKey])
      }
    }
    
    return 0
  }

  // Get available years for a location
  const getLocationYears = (location) => {
    if (!location || !location.yearRecords) return []
    
    // Handle both Array and Object formats
    if (Array.isArray(location.yearRecords)) {
      return location.yearRecords
        .map(item => {
          if (typeof item === 'object' && item !== null) {
            return String(item.year || item.year_value || item.record_year || '')
          }
          return String(item)
        })
        .filter(y => y && !isNaN(parseInt(y)))
        .sort((a, b) => parseInt(b) - parseInt(a))
    }
    
    // Object format
    return Object.keys(location.yearRecords).sort((a, b) => parseInt(b) - parseInt(a))
  }

  // Get all unique years across all locations
  const allAvailableYears = useMemo(() => {
    const yearsSet = new Set()
    locations.forEach(loc => {
      if (loc.yearRecords) {
        if (Array.isArray(loc.yearRecords)) {
          loc.yearRecords.forEach(item => {
            const year = typeof item === 'object' ? (item.year || item.record_year) : item
            if (year) yearsSet.add(String(year))
          })
        } else {
          Object.keys(loc.yearRecords).forEach(year => yearsSet.add(year))
        }
      }
    })
    return Array.from(yearsSet)
      .filter(y => y && !isNaN(parseInt(y)))
      .sort((a, b) => parseInt(b) - parseInt(a))
  }, [locations])

  // Calculate percentage change
  const calculateChange = (current, previous) => {
    if (!previous || previous === 0) return { amount: 0, percentage: 0 }
    const amount = current - previous
    const percentage = ((amount / previous) * 100).toFixed(1)
    return { amount, percentage }
  }

  // Get current/latest year prices
  const getCurrentPrices = (location) => {
    if (!location) return {}
    
    // First try latestPrices from API (flat format: price_5_marla, etc.)
    if (location.latestPrices && Object.keys(location.latestPrices).length > 0) {
      return {
        '5_marla': parseFloat(location.latestPrices.price_5_marla) || 0,
        '10_marla': parseFloat(location.latestPrices.price_10_marla) || 0,
        '1_kanal': parseFloat(location.latestPrices.price_1_kanal) || 0,
        '2_kanal': parseFloat(location.latestPrices.price_2_kanal) || 0
      }
    }
    
    if (!location.yearRecords) return {}
    
    if (Array.isArray(location.yearRecords)) {
      const lastItem = location.yearRecords[location.yearRecords.length - 1]
      if (lastItem?.prices) return lastItem.prices
      return {
        '5_marla': parseFloat(lastItem?.price_5_marla) || 0,
        '10_marla': parseFloat(lastItem?.price_10_marla) || 0,
        '1_kanal': parseFloat(lastItem?.price_1_kanal) || 0,
        '2_kanal': parseFloat(lastItem?.price_2_kanal) || 0
      }
    }
    
    const yrKeys = getLocationYears(location)
    if (yrKeys.length === 0) return {}
    const latestYr = yrKeys[0]
    const rec = location.yearRecords[latestYr]
    if (rec?.prices) return rec.prices
    return {
      '5_marla': parseFloat(rec?.price_5_marla) || 0,
      '10_marla': parseFloat(rec?.price_10_marla) || 0,
      '1_kanal': parseFloat(rec?.price_1_kanal) || 0,
      '2_kanal': parseFloat(rec?.price_2_kanal) || 0
    }
  }

  // Get location history logs
  const locationLogs = useMemo(() => {
    if (!selectedLocation) return []
    return priceHistoryLogs
      .filter(log => log.locationId === selectedLocation.id || log.location_id === selectedLocation.id)
      .sort((a, b) => new Date(b.date || b.created_at) - new Date(a.date || a.created_at))
  }, [selectedLocation, priceHistoryLogs])

  // All logs filtered
  const allLogs = useMemo(() => {
    let logs = [...priceHistoryLogs].sort((a, b) => new Date(b.date) - new Date(a.date))
    if (searchTerm && activeTab === 'logs') {
      logs = logs.filter(log => 
        log.locationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    return logs
  }, [priceHistoryLogs, searchTerm, activeTab])

  // Filtered locations
  const filteredLocations = useMemo(() => {
    let result = [...locations]
    if (searchTerm) {
      result = result.filter(loc => 
        loc.locationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loc.area.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    if (filterArea !== 'All') {
      result = result.filter(loc => loc.area === filterArea)
    }
    if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }
    return result
  }, [locations, searchTerm, filterArea, sortConfig])

  const areas = useMemo(() => ['All', ...new Set(locations.map(loc => loc.area))], [locations])
  const sizes = ['5_marla', '10_marla', '1_kanal', '2_kanal']
  const sizeLabels = { '5_marla': '5 Marla', '10_marla': '10 Marla', '1_kanal': '1 Kanal', '2_kanal': '2 Kanal' }
  const marlasMap = { '5_marla': 5, '10_marla': 10, '1_kanal': 20, '2_kanal': 40 }

  // Handle edit location (opens full year editor)
const handleEditClick = async (location) => {
    setEditingLocation(location)
    setShowEditModal(true)
    
    // First, show whatever data we have immediately
    let editableRecords = {}
    const yr = location.yearRecords || {}
    
    if (Array.isArray(yr)) {
      yr.forEach(item => {
        const year = item.year || item.record_year || ''
        if (year) {
          editableRecords[String(year)] = {
            prices: item.prices || {},
            updatedAt: item.updated_at || item.updatedAt || ''
          }
        }
      })
    } else {
      // Copy existing data
      Object.keys(yr).forEach(year => {
        const record = yr[year]
        if (record?.prices) {
          editableRecords[year] = {
            prices: { ...record.prices },
            updatedAt: record.updatedAt || record.updated_at || ''
          }
        } else {
          editableRecords[year] = {
            prices: {},
            updatedAt: ''
          }
        }
      })
    }
    
    setEditPrices(editableRecords)
    
    // Then fetch fresh data from API for each year
    if (location.id) {
      try {
        const token = localStorage.getItem('admin_access_token')
        const years = Object.keys(editableRecords)
        
        for (const year of years) {
          try {
            const response = await fetch(
              `http://127.0.0.1:8000/api/historical-rates/admin/locations/${location.id}/year/${year}`,
              { headers: { Authorization: `Bearer ${token}` } }
            )
            const data = await response.json()
            console.log(`Fetched year ${year} data:`, data)
            
            if (data?.success && data?.data) {
              const yearData = data.data
              setEditPrices(prev => ({
                ...prev,
                [year]: {
                  prices: yearData.prices || yearData || {},
                  updatedAt: yearData.updated_at || yearData.updatedAt || ''
                }
              }))
            }
          } catch (err) {
            console.log(`Could not fetch year ${year}`, err)
          }
        }
      } catch (error) {
        console.error('Error fetching year details:', error)
      }
    }
  }

  // Handle save edit
const handleSaveEdit = async () => {
    if (!editingLocation) return

    try {
      setIsLoading(true)
      const updatePromises = []
      
      for (const year of Object.keys(editPrices)) {
        const oldRecord = editingLocation?.yearRecords?.[year]
        const newRecord = editPrices[year]
        const newPrices = newRecord?.prices || newRecord || {}
        
        // Build payload with ONLY the fields that exist in newPrices
        const payload = { year: parseInt(year) }
        let hasChanges = false
        
        sizes.forEach(size => {
          const flatKey = `price_${size}`
          const newVal = newPrices[size] ?? newPrices[flatKey]
          
          if (newVal !== undefined && newVal !== null && newVal !== '') {
            const oldVal = oldRecord?.prices?.[size] ?? oldRecord?.prices?.[flatKey] ?? oldRecord?.[flatKey]
            
            if (String(newVal) !== String(oldVal || 0)) {
              payload[flatKey] = String(newVal)
              hasChanges = true
            }
          }
        })
        
        if (hasChanges) {
          if (!oldRecord || Object.keys(oldRecord).length === 0) {
            // New year
            updatePromises.push(
              adminAPI.locationManagement.addYear(editingLocation.id, payload)
            )
          } else {
            // Update existing year
            updatePromises.push(
              adminAPI.locationManagement.updateYearRate(editingLocation.id, year, payload)
            )
          }
        }
      }

      if (updatePromises.length > 0) {
        await Promise.all(updatePromises)
      }

      // Update local state - merge edited prices into existing
      const updatedLocation = { ...editingLocation }
      updatedLocation.yearRecords = { ...editingLocation.yearRecords }
      
      Object.keys(editPrices).forEach(year => {
        const newPrices = editPrices[year]?.prices || {}
        updatedLocation.yearRecords[year] = {
          ...(updatedLocation.yearRecords[year] || {}),
          prices: {
            ...(updatedLocation.yearRecords[year]?.prices || {}),
            ...newPrices
          },
          updatedAt: new Date().toISOString()
        }
      })
      
      setLocations(prev => prev.map(loc => 
        loc.id === editingLocation.id ? updatedLocation : loc
      ))
      
      if (selectedLocation?.id === editingLocation.id) {
  // Also update latestPrices if editing 2026
  const updatedLatestPrices = { ...updatedLocation.latestPrices }
  Object.keys(editPrices).forEach(year => {
    if (String(year) === '2026') {
      const p = editPrices[year]?.prices || {}
      sizes.forEach(size => {
        const val = p[size] ?? p[`price_${size}`]
        if (val !== undefined) {
          updatedLatestPrices[`price_${size}`] = String(val)
        }
      })
    }
  })
  
  setSelectedLocation({
    ...updatedLocation,
    latestPrices: updatedLatestPrices
  })
}
      
      await fetchDashboardStats()
      fetchLocationLogs(editingLocation.id)
      
      setShowEditModal(false)
      setSuccessMessage(`✅ Prices updated for ${editingLocation.locationName}`)
      setTimeout(() => setSuccessMessage(''), 4000)
      
    } catch (error) {
      console.error('Error updating:', error)
      const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message
      setSuccessMessage('❌ Failed: ' + errorMsg)
      setTimeout(() => setSuccessMessage(''), 6000)
    } finally {
      setIsLoading(false)
    }
  }
  const setEditYearPrice = (year, size, value) => {
    setEditPrices(prev => ({
      ...prev,
      [year]: {
        ...(prev[year] || {}),
        prices: {
          ...(prev[year]?.prices || {}),
          [size]: value === '' ? 0 : parseFloat(value)
        }
      }
    }))
  }

  // Handle add new location
 const handleAddLocation = async () => {
    if (!newLocation.locationName || !newLocation.area) {
      setSuccessMessage('⚠️ Please fill in all required fields')
      setTimeout(() => setSuccessMessage(''), 4000)
      return
    }

    try {
      setIsLoading(true)
      
      const payload = {
  location_name: newLocation.locationName,
  area_name: newLocation.area,
  city: 'Lahore',
  initial_year: 2026,
price_5_marla: String(newLocation.prices['5_marla'] || 0),
price_10_marla: String(newLocation.prices['10_marla'] || 0),
price_1_kanal: String(newLocation.prices['1_kanal'] || 0),
price_2_kanal: String(newLocation.prices['2_kanal'] || 0)
}

      console.log('Creating location with payload:', JSON.stringify(payload, null, 2))
      
      const response = await adminAPI.locationManagement.createLocation(payload)
      console.log('Create location response:', response.data)
      
      // Refresh data
      await fetchLocations()
await fetchDashboardStats()
// Refresh logs for all locations
fetchLocationLogs(null) // null = all logs
      
      // Reset form
      setNewLocation({
        locationName: '',
        area: '',
        initialYear: '2026',
        prices: { '5_marla': 0, '10_marla': 0, '1_kanal': 0, '2_kanal': 0 }
      })
      
      setShowAddModal(false)
      setSuccessMessage('✅ Location added successfully!')
      setTimeout(() => setSuccessMessage(''), 4000)
      
    } catch (error) {
      console.error('Error creating location:', error)
      console.error('Error response:', error.response)
      
      // Get error details from response
      const errorData = error.response?.data
      console.log('Error data:', errorData)
      console.log('Error data JSON:', JSON.stringify(errorData))
      
      let errorMsg = 'Failed to create location'
      
      if (errorData) {
        if (typeof errorData === 'string') {
          errorMsg = errorData
        } else if (errorData.message) {
          errorMsg = errorData.message
        } else if (errorData.error) {
          errorMsg = errorData.error
        } else if (errorData.detail) {
          errorMsg = errorData.detail
        } else {
          // Show all keys and values
          const details = Object.entries(errorData)
            .map(([key, val]) => `${key}: ${val}`)
            .join(', ')
          if (details) errorMsg = details
        }
      }
      
      setSuccessMessage('❌ ' + errorMsg)
      setTimeout(() => setSuccessMessage(''), 6000)
      
    } finally {
      setIsLoading(false)
    }
  }

  // Handle add a specific year to existing location
  const handleAddYear = async () => {
    if (!selectedLocation || !newYearData.year) {
      setSuccessMessage('⚠️ Please enter a year')
      setTimeout(() => setSuccessMessage(''), 4000)
      return
    }

    if (selectedLocation.yearRecords && selectedLocation.yearRecords[newYearData.year]) {
      setSuccessMessage(`⚠️ Year ${newYearData.year} already exists for this location!`)
      setTimeout(() => setSuccessMessage(''), 4000)
      return
    }

    try {
      setIsLoading(true)
      
      const p = newYearData.prices
const payload = {
  year: parseInt(newYearData.year),
  price_5_marla: p['5_marla'] !== '' && p['5_marla'] !== undefined ? Number(p['5_marla']) : 0,
  price_10_marla: p['10_marla'] !== '' && p['10_marla'] !== undefined ? Number(p['10_marla']) : 0,
  price_1_kanal: p['1_kanal'] !== '' && p['1_kanal'] !== undefined ? Number(p['1_kanal']) : 0,
  price_2_kanal: p['2_kanal'] !== '' && p['2_kanal'] !== undefined ? Number(p['2_kanal']) : 0
}

      console.log('Adding year payload:', JSON.stringify(payload))
      
      const response = await adminAPI.locationManagement.addYear(selectedLocation.id, payload)
      console.log('Add year response:', response.data)
      
      // Add the new year data locally before refreshing
      const newYear = String(payload.year)
      const updatedLocation = { ...selectedLocation }
      updatedLocation.yearRecords = { ...updatedLocation.yearRecords }
      updatedLocation.yearRecords[newYear] = {
        prices: {
          '5_marla': payload.price_5_marla,
          '10_marla': payload.price_10_marla,
          '1_kanal': payload.price_1_kanal,
          '2_kanal': payload.price_2_kanal
        },
        updatedAt: new Date().toISOString()
      }
      
      // Update availableYears
      if (!updatedLocation.availableYears.includes(payload.year)) {
        updatedLocation.availableYears = [...updatedLocation.availableYears, payload.year]
      }
      
      // Update locations state
      // Update locations state immediately
setLocations(prev => prev.map(loc => {
  if (loc.id === editingLocation.id) {
    const updatedLatestPrices = { ...loc.latestPrices }
    Object.keys(editPrices).forEach(year => {
      if (String(year) === '2026') {
        const p = editPrices[year]?.prices || {}
        sizes.forEach(size => {
          const val = p[size] ?? p[`price_${size}`]
          if (val !== undefined) {
            updatedLatestPrices[`price_${size}`] = String(val)
          }
        })
      }
    })
    return {
      ...updatedLocation,
      latestPrices: updatedLatestPrices
    }
  }
  return loc
}))
setSelectedLocation(updatedLocation)

// Refresh stats only, not full location list
await fetchDashboardStats()
      
      if (selectedLocation) {
        fetchLocationLogs(selectedLocation.id)
      }
      
      setShowAddYearModal(false)
      setNewYearData({ 
        year: '', 
        prices: { '5_marla': 0, '10_marla': 0, '1_kanal': 0, '2_kanal': 0 } 
      })
      
      setSuccessMessage(`✅ Year ${newYearData.year} added to ${selectedLocation.locationName}`)
      setTimeout(() => setSuccessMessage(''), 4000)
      
    } catch (error) {
      console.error('Error adding year:', error)
      const errorData = error.response?.data
      let errorMsg = 'Failed to add year'
      
      if (errorData) {
        if (typeof errorData === 'string') {
          errorMsg = errorData
        } else if (errorData.message) {
          errorMsg = errorData.message
        } else if (errorData.error) {
          errorMsg = errorData.error
        } else if (errorData.errors) {
          const details = Object.entries(errorData.errors)
            .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
            .join(' | ')
          if (details) errorMsg = details
        }
      }
      
      setSuccessMessage('❌ ' + errorMsg)
      setTimeout(() => setSuccessMessage(''), 6000)
      
    } finally {
      setIsLoading(false)
    }
  }

  // Handle delete specific year
  const handleDeleteYear = async () => {
    if (!selectedLocation || !yearToDelete) return

    try {
      setIsLoading(true)
      
      console.log('Deleting year:', yearToDelete, 'from location:', selectedLocation.id)
      
      await adminAPI.locationManagement.deleteYearRate(selectedLocation.id, yearToDelete)
      
      // Refresh data
      // Update local state immediately
setLocations(prev => prev.map(loc => {
  if (loc.id === selectedLocation.id) {
    const updatedYearRecords = { ...loc.yearRecords }
    delete updatedYearRecords[String(yearToDelete)]
    const updatedAvailableYears = (loc.availableYears || []).filter(y => y !== parseInt(yearToDelete))
    return { ...loc, yearRecords: updatedYearRecords, availableYears: updatedAvailableYears }
  }
  return loc
}))

setSelectedLocation(prev => {
  if (!prev) return prev
  const updatedYearRecords = { ...prev.yearRecords }
  delete updatedYearRecords[String(yearToDelete)]
  const updatedAvailableYears = (prev.availableYears || []).filter(y => y !== parseInt(yearToDelete))
  return { ...prev, yearRecords: updatedYearRecords, availableYears: updatedAvailableYears }
})

// Refresh stats
await fetchDashboardStats()
      
      if (selectedLocation) {
        fetchLocationLogs(selectedLocation.id)
      }
      
      setShowDeleteYearConfirm(false)
      setYearToDelete(null)
      
      setSuccessMessage(`🗑️ Year ${yearToDelete} removed from ${selectedLocation.locationName}`)
      setTimeout(() => setSuccessMessage(''), 4000)
      
    } catch (error) {
      console.error('Error deleting year:', error)
      console.error('Error response:', error.response?.data)
      
      const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Failed to delete year'
      setSuccessMessage('❌ ' + errorMsg)
      setTimeout(() => setSuccessMessage(''), 6000)
      
    } finally {
      setIsLoading(false)
    }
  }

  // Handle delete location
  const handleDeleteLocation = async () => {
    if (!editingLocation) return

    try {
      await adminAPI.locationManagement.deleteLocation(editingLocation.id)
      
      // Refresh data
     // Update local state
setLocations(prev => prev.filter(loc => loc.id !== editingLocation.id))
fetchLocationLogs(null)


if (selectedLocation?.id === editingLocation.id) {
  setSelectedLocation(null)
}

await fetchDashboardStats()
      
      setShowDeleteConfirm(false)
      setEditingLocation(null)
      showMessage(`🗑️ Location deleted`)
    } catch (error) {
      console.error('Error deleting location:', error)
      showMessage('❌ Failed to delete: ' + (error.response?.data?.message || error.message))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:ml-64">
        <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className="p-4 lg:p-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <Database className="w-7 h-7 text-blue-600" />
                  Price History Management
                </h1>
                <p className="text-gray-500 mt-1">Track and manage independent yearly price records for all locations</p>
              </div>
              <button
                onClick={() => {
  setNewLocation({
    locationName: '',
    area: '',
    initialYear: '2026',
    prices: { '5_marla': 0, '10_marla': 0, '1_kanal': 0, '2_kanal': 0 }
  })
  setShowAddModal(true)
}}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                Add New Location
              </button>
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className={`mb-4 p-4 rounded-xl flex items-center gap-3 shadow-sm ${
              successMessage.startsWith('⚠️') 
                ? 'bg-amber-50 border border-amber-200 text-amber-700'
                : 'bg-green-50 border border-green-200 text-green-700'
            }`}>
              {successMessage.startsWith('⚠️') ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
              <span>{successMessage}</span>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Locations</p>
                  <p className="text-xl font-bold text-gray-800">{stats.totalLocations}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Database className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Year Records</p>
                  <p className="text-xl font-bold text-gray-800">
                   {stats.totalRecords}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Updates</p>
                  <p className="text-xl font-bold text-gray-800">{stats.locationsWithData}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Years Tracked</p>
                  <p className="text-xl font-bold text-gray-800">{stats.yearRange?.min && stats.yearRange?.max 
            ? `${stats.yearRange.min} - ${stats.yearRange.max}` 
            : allAvailableYears.length > 0 
              ? `${Math.min(...allAvailableYears)} - ${Math.max(...allAvailableYears)}`
              : 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* LEFT COLUMN - Location List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-800 mb-3">📍 Locations</h2>
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search locations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <select
                      value={filterArea}
                      onChange={(e) => setFilterArea(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {areas.map(area => (
                        <option key={area} value={area}>{area === 'All' ? '🏘️ All Areas' : area}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
                  {filteredLocations.map(location => {
                    const currentPrices = getCurrentPrices(location)
                    const years = getLocationYears(location)
                    return (
                      <div
                        key={location.id}
                        onClick={() => {
  setSelectedLocation(location)
  fetchLocationLogs(location.id)
}}
                        className={`p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                          selectedLocation?.id === location.id 
                            ? 'bg-blue-50 border-l-4 border-blue-600' 
                            : 'border-l-4 border-transparent'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-semibold text-gray-800">{location.locationName}</h3>
                            <p className="text-xs text-gray-500">{location.area}</p>
                          </div>
                          <span className="text-xs text-gray-400">{years.length} years</span>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
                          <span className="text-gray-500">5M: <span className="font-medium text-gray-700">{formatCurrency(currentPrices['5_marla'])}</span></span>
                          <span className="text-gray-500">10M: <span className="font-medium text-gray-700">{formatCurrency(currentPrices['10_marla'])}</span></span>
                        </div>
                        <div className="mt-1 text-xs text-gray-400">
                          Years: {years.slice(0, 4).join(', ')}{years.length > 4 ? '...' : ''}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN - Details */}
            <div className="lg:col-span-2">
              {selectedLocation ? (
                <div className="space-y-6">
                  
                  {/* Location Header */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex flex-row items-center justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-bold text-gray-800">{selectedLocation.locationName}</h2>
                        <p className="text-sm text-gray-500">
                          {selectedLocation.area} • Created: {formatDate(selectedLocation.createdAt)} • {getLocationYears(selectedLocation).length} year records
                        </p>
                      </div>
                      <div className="flex gap-2 whitespace-nowrap">
                        {/* Add Year - Improved Button */}
                        <button
                          onClick={() => {
                            setNewYearData({ year: '', prices: { '5_marla': 0, '10_marla': 0, '1_kanal': 0, '2_kanal': 0 } })
                            setShowAddYearModal(true)
                          }}
                          className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl text-sm font-medium hover:shadow-md transition-all"
                        >
                          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                          Add Year
                        </button>
                        
                        {/* Edit All - Improved Button */}
                        <button
                          onClick={() => handleEditClick(selectedLocation)}
                          className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-medium hover:shadow-md transition-all"
                        >
                          <Edit2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          Edit All
                        </button>
                        
                        {/* Delete - Improved Button */}
                        <button
                          onClick={() => {
                            setEditingLocation(selectedLocation)
                            setShowDeleteConfirm(true)
                          }}
                          className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl text-sm font-medium hover:shadow-md transition-all"
                        >
                          <Trash2 className="w-4 h-4 group-hover:scale-90 transition-transform" />
                          Delete Location
                        </button>
                      </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 mt-4 border-b border-gray-100 pb-0 flex-wrap">
                      {[
                        { id: 'current', label: 'Current Rates', icon: BarChart3 },
                        { id: 'historical', label: 'Year History', icon: History },
                        { id: 'logs', label: 'Update Logs', icon: Clock }
                      ].map(tab => {
                        const Icon = tab.icon
                        return (
                          <button
                            key={tab.id}
                            onClick={() => {
  setActiveTab(tab.id)
  if (tab.id === 'historical' && selectedLocation) {
    const years = getLocationYears(selectedLocation)
    if (years.length > 0) {
      setSelectedYear(years[0])
      setTimeout(() => fetchYearDetail(selectedLocation.id, years[0]), 100)
    }
  }
}}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-all ${
                              activeTab === tab.id
                                ? 'bg-white text-blue-600 border border-b-white border-gray-100 -mb-px'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* CURRENT RATES TAB */}
                {activeTab === 'current' && (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
    <h3 className="text-lg font-semibold text-gray-800 mb-4">
      Current Market Rates (2026)
    </h3>
    <div className="grid grid-cols-2 gap-4">
     {sizes.map(size => {
  const lp = selectedLocation?.latestPrices
  const yr = selectedLocation?.yearRecords
  
  // Get 2026 price - try multiple sources
  let currentPrice = 0
  
  // 1. Try latestPrices if year is 2026
  if (lp && (lp.year === 2026 || lp.year === '2026')) {
    currentPrice = parseFloat(lp['price_' + size]) || 0
  }
  
  // 2. If still 0, try yearRecords['2026']
  if (currentPrice === 0 && yr && yr['2026']) {
    const r2026 = yr['2026']
    currentPrice = parseFloat(r2026.prices?.[size] || r2026['price_' + size] || 0)
  }
  
  // 3. If still 0, try latestPrices anyway if 2026 exists in availableYears
  if (currentPrice === 0 && lp && selectedLocation?.availableYears?.includes(2026)) {
    currentPrice = parseFloat(lp['price_' + size]) || 0
  }
  
  // Get 2025 price
  let prevPrice = 0
  if (yr && yr['2025']) {
    const r2025 = yr['2025']
    prevPrice = parseFloat(r2025.prices?.[size] || r2025['price_' + size] || 0)
  }
  
  const change = calculateChange(currentPrice, prevPrice)
  {console.log('📍 Location:', selectedLocation?.locationName)}
{console.log('📍 availableYears:', selectedLocation?.availableYears)}
{console.log('📍 latestPrices:', JSON.stringify(selectedLocation?.latestPrices))}
{console.log('📍 yearRecords keys:', selectedLocation?.yearRecords ? Object.keys(selectedLocation.yearRecords) : 'none')}
{console.log('📍 Has 2026 in availableYears?', selectedLocation?.availableYears?.includes(2026))}
  return (
    <div key={size} className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">
          {size === '5_marla' ? '🏠' : size === '10_marla' ? '🏡' : size === '1_kanal' ? '🏘️' : '🏰'}
        </span>
        {prevPrice > 0 && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 ${
            change.amount >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {change.amount >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {change.percentage}%
          </span>
        )}
      </div>
      <p className="text-sm text-gray-600 mb-1">{sizeLabels[size]}</p>
      <p className="text-2xl font-bold text-gray-800 mb-2">{formatCurrency(currentPrice)}</p>
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">Per Marla: {formatCurrency(Math.round(currentPrice / marlasMap[size]))}</span>
        {prevPrice > 0 ? (
          <span className={change.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
            {change.amount >= 0 ? '+' : ''}{formatCurrency(change.amount)} vs 2025
          </span>
        ) : (
          <span className="text-gray-400">No 2025 data</span>
        )}
      </div>
    </div>
  )
})}
    </div>
  </div>
)}

                  {/* YEAR HISTORY TAB with Improved Delete Year Control */}
                 {activeTab === 'historical' && (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <div className="p-6">
      {getLocationYears(selectedLocation).length > 0 ? (
        <>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h3 className="text-lg font-semibold text-gray-800">Year-wise Price Records</h3>
            <div className="flex gap-2 flex-wrap items-center">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={selectedYear}
                  onChange={(e) => {
                    const newYear = e.target.value
                    setSelectedYear(newYear)
                    setYearDataLoading(true)
                    setTimeout(() => fetchYearDetail(selectedLocation?.id, newYear), 50)
                  }}
                  className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {getLocationYears(selectedLocation).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              
              <button
                onClick={() => {
                  setYearToDelete(selectedYear)
                  setShowDeleteYearConfirm(true)
                }}
                className="group flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 hover:border-red-300 transition-all"
              >
                <Trash2 className="w-4 h-4 group-hover:scale-90 transition-transform" />
                Delete This Year
              </button>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap mb-6">
            {getLocationYears(selectedLocation).map(year => (
              <button
                key={year}
                onClick={() => {
                  setSelectedYear(year)
                  setYearDataLoading(true)
                  setTimeout(() => fetchYearDetail(selectedLocation?.id, year), 50)
                }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  selectedYear === year
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {year}
              </button>
            ))}
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-semibold text-gray-700 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                {selectedYear} Prices
              </h4>
            </div>
            
            {yearDataLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-500 text-sm">Loading {selectedYear} data...</span>
              </div>
            ) : (() => {
              const hasData = sizes.some(size => 
                getPriceForYear(selectedLocation?.yearRecords, selectedYear, size, selectedLocation?.latestPrices) > 0
              )
              
              if (!hasData) {
                return (
                  <div className="text-center py-12 text-gray-400">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm font-medium">No data available for {selectedYear}</p>
                    <p className="text-xs mt-1">This location has no price records for the selected year</p>
                  </div>
                )
              }
              
              return (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left p-3 text-xs font-semibold text-gray-600 uppercase">Plot Size</th>
                        <th className="text-left p-3 text-xs font-semibold text-gray-600 uppercase">Price</th>
                        <th className="text-left p-3 text-xs font-semibold text-gray-600 uppercase">Per Marla</th>
                        <th className="text-left p-3 text-xs font-semibold text-gray-600 uppercase">vs Previous Year</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sizes.map(size => {
                        const price = getPriceForYear(selectedLocation?.yearRecords, selectedYear, size, selectedLocation?.latestPrices)
                        const prevYearStr = String(parseInt(selectedYear) - 1)
                        const prevPrice = getPriceForYear(selectedLocation?.yearRecords, prevYearStr, size, selectedLocation?.latestPrices)
                        const change = calculateChange(price, prevPrice)
                        
                        return (
                          <tr key={size} className="border-b border-gray-50 hover:bg-gray-50 transition-colors duration-200">
                            <td className="p-3 text-sm font-medium text-gray-800">{sizeLabels[size]}</td>
                            <td className="p-3 text-sm font-bold text-gray-800 transition-all duration-300">{formatCurrency(price)}</td>
                            <td className="p-3 text-sm text-gray-600 transition-all duration-300">{formatCurrency(Math.round(price / marlasMap[size]))}</td>
                            <td className="p-3">
                              <span className={`inline-flex items-center gap-1 text-sm font-medium transition-all duration-300 ${
                                change.amount > 0 ? 'text-green-600' : change.amount < 0 ? 'text-red-600' : 'text-gray-400'
                              }`}>
                                {change.amount > 0 ? <TrendingUp className="w-3 h-3" /> : change.amount < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                                {change.amount > 0 ? '+' : ''}{change.percentage}%
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )
            })()}
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-gray-400">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm font-medium">No year data available</p>
          <p className="text-xs mt-1">Add a year to view price records for this location</p>
        </div>
      )}
    </div>
  </div>
)}

                  {/* UPDATE LOGS TAB */}
                  {activeTab === 'logs' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-blue-600" />
                            Update History Timeline
                          </h3>
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                              type="text"
                              placeholder="Search logs..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="pl-10 pr-4 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
                            />
                          </div>
                        </div>
                        
                        {locationLogs.length === 0 ? (
                          <div className="text-center py-8 text-gray-400">
                            <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            No update logs for this location
                          </div>
                        ) : (
                          <div className="space-y-0">
                            {locationLogs.map((log, index) => (
                              <div key={log.id || index} className="relative pl-8 pb-6">
                                {index < locationLogs.length - 1 && (
                                  <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-gray-200"></div>
                                )}
                                <div className={`absolute left-1.5 top-1 w-4 h-4 rounded-full border-2 ${
                                  log.action === 'location_added' ? 'bg-green-100 border-green-500' :
                                  log.action === 'location_deleted' ? 'bg-red-100 border-red-500' :
                                  log.action === 'year_added' ? 'bg-teal-100 border-teal-500' :
                                  log.action === 'year_deleted' ? 'bg-orange-100 border-orange-500' :
                                  'bg-blue-100 border-blue-500'
                                }`}>
                                  <div className={`w-2 h-2 rounded-full m-0.5 ${
                                    log.action === 'location_added' ? 'bg-green-500' :
                                    log.action === 'location_deleted' ? 'bg-red-500' :
                                    log.action === 'year_added' ? 'bg-teal-500' :
                                    log.action === 'year_deleted' ? 'bg-orange-500' :
                                    'bg-blue-500'
                                  }`}></div>
                                </div>
                                <div className={`p-4 rounded-lg border ${
                                  log.action === 'location_added' ? 'bg-green-50 border-green-100' :
                                  log.action === 'location_deleted' ? 'bg-red-50 border-red-100' :
                                  log.action === 'year_added' ? 'bg-teal-50 border-teal-100' :
                                  log.action === 'year_deleted' ? 'bg-orange-50 border-orange-100' :
                                  'bg-gray-50 border-gray-100'
                                }`}>
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                        log.action === 'location_added' ? 'bg-green-200 text-green-800' :
                                        log.action === 'location_deleted' ? 'bg-red-200 text-red-800' :
                                        log.action === 'year_added' ? 'bg-teal-200 text-teal-800' :
                                        log.action === 'year_deleted' ? 'bg-orange-200 text-orange-800' :
                                        'bg-blue-200 text-blue-800'
                                      }`}>
                                        {log.action.replace('_', ' ').toUpperCase()}
                                      </span>
                                      {log.year && (
                                        <span className="text-sm font-medium text-gray-600 flex items-center gap-1">
                                          <Calendar className="w-3 h-3" /> Year: {log.year}
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {formatDate(log.date)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600">{log.details}</p>
                                  <p className="text-xs text-gray-400 mt-1">By: {log.updatedBy}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-16 text-center">
                  <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">Select a Location</h3>
                  <p className="text-gray-500">Choose a location from the left panel to view and manage price history</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* EDIT ALL YEARS MODAL - Improved */}
      {showEditModal && editingLocation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 sticky top-0 bg-white border-b border-gray-100 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Edit2 className="w-5 h-5 text-blue-600" />
                    Edit All Year Records
                  </h2>
                  <p className="text-sm text-gray-500">{editingLocation.locationName} • {editingLocation.area}</p>
                </div>
                <button onClick={() => setShowEditModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {Object.keys(editPrices).length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Database className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  No year records. Add a year first.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left p-3 text-xs font-semibold text-gray-600 uppercase">Year</th>
                        <th className="text-left p-3 text-xs font-semibold text-gray-600 uppercase">5 Marla</th>
                        <th className="text-left p-3 text-xs font-semibold text-gray-600 uppercase">10 Marla</th>
                        <th className="text-left p-3 text-xs font-semibold text-gray-600 uppercase">1 Kanal</th>
                        <th className="text-left p-3 text-xs font-semibold text-gray-600 uppercase">2 Kanal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.keys(editPrices).sort((a, b) => parseInt(b) - parseInt(a)).map(year => (
                        <tr key={year} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <td className="p-3 text-sm font-semibold text-gray-800">
                            {year}
                            <div className="text-xs text-gray-400 font-normal">
                              {editPrices[year]?.updatedAt ? formatDate(editPrices[year].updatedAt) : 'New'}
                            </div>
                           </td>
                          {sizes.map(size => {
  const prices = editPrices[year]?.prices || {}
  const currentVal = prices[size] ?? prices[`price_${size}`] ?? 0

  const oldPrices = editingLocation?.yearRecords?.[year]?.prices || {}
  const oldVal = oldPrices[size] ?? oldPrices[`price_${size}`] ?? 0
  const hasChanged = oldVal !== currentVal && editingLocation?.yearRecords?.[year] !== undefined
  
  return (
    <td key={size} className="p-3">
      <input
        type="number"
        value={currentVal}
        onChange={(e) => setEditYearPrice(year, size, e.target.value)}
        className={`w-full px-2 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
          hasChanged ? 'border-amber-400 bg-amber-50' : 'border-gray-200'
        }`}
      />
      {hasChanged && (
        <div className="text-xs mt-1 text-gray-400 line-through">
          {formatCurrency(oldVal)}
        </div>
      )}
    </td>
  )
})}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="flex gap-3 mt-8 pt-4 border-t border-gray-100">
                <button onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button onClick={handleSaveEdit} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-medium hover:shadow-md transition-all flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" />
                  Save All Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD YEAR MODAL - Improved */}
     {/* ADD YEAR MODAL - Improved with Dynamic Year Dropdown */}
{/* ADD YEAR MODAL - With Database-Driven Year Dropdown */}
{showAddYearModal && selectedLocation && (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-600" />
              Add Historical Year
            </h2>
            <p className="text-sm text-gray-500">Add price data for a specific year to {selectedLocation.locationName}</p>
          </div>
          <button onClick={() => setShowAddYearModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Year Dropdown - Shows only years NOT in database */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Year *</label>
          
          {(() => {
  // Get existing years from availableYears array
  const fromAPI = (selectedLocation?.availableYears || []).map(y => parseInt(y))
  
  // Get existing years from yearRecords (could be Array or Object)
  let fromRecords = []
  const yr = selectedLocation?.yearRecords
  
  if (yr) {
    if (Array.isArray(yr)) {
      // If yearRecords is an array, extract years from each item
      fromRecords = yr
        .map(item => parseInt(item.year || item.year_record || item.record_year))
        .filter(y => !isNaN(y))
    } else {
      // If yearRecords is an object, get the keys
      fromRecords = Object.keys(yr).map(y => parseInt(y)).filter(y => !isNaN(y))
    }
  }
  
  const existingYears = [...new Set([...fromAPI, ...fromRecords])]
    .filter(y => !isNaN(y))
    .sort((a, b) => b - a)
  
  console.log('📅 fromAPI raw:', selectedLocation?.availableYears)
  console.log('📅 yearRecords raw:', selectedLocation?.yearRecords)
  console.log('📅 fromRecords extracted:', fromRecords)
  console.log('📅 existingYears:', existingYears)
  
  // All possible years
  const allYears = [2026, 2025, 2024, 2023, 2022, 2021, 2020]
  
  // Only show years NOT in database
  const availableYears = allYears.filter(year => !existingYears.includes(year))
  
  console.log('✅ Available for add:', availableYears)
  
  return (
    <>
      <select
        value={newYearData.year}
        onChange={(e) => setNewYearData(prev => ({ ...prev, year: e.target.value }))}
        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
      >
        <option value="">-- Select a Year --</option>
        {availableYears.length === 0 ? (
          <option value="" disabled>All years already added</option>
        ) : (
          availableYears.map(year => (
            <option key={year} value={year}>{year}</option>
          ))
        )}
      </select>
      
      <div className="mt-2 flex items-center gap-2 flex-wrap">
        <span className="text-xs text-gray-400">Already added:</span>
        {existingYears.length > 0 ? (
          existingYears.map(year => (
            <span key={year} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
              {year}
            </span>
          ))
        ) : (
          <span className="text-xs text-gray-400 italic">None</span>
        )}
      </div>
    </>
  )
})()}
        </div>

        {/* Prices Section - Only show if year selected */}
        {newYearData.year ? (
          <div className="bg-gray-50 rounded-xl p-4 mb-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              Prices for {newYearData.year}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {sizes.map(size => (
                <div key={size}>
                  <label className="block text-xs text-gray-600 mb-1">{sizeLabels[size]}</label>
                  <input
                    type="number"
                    value={newYearData.prices[size]}
                    onChange={(e) => {
  const val = e.target.value
  setNewYearData(prev => ({
    ...prev,
    prices: { ...prev.prices, [size]: val === '' ? '' : Number(val) }
  }))
}}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl p-8 mb-5 text-center">
            <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Select a year to enter prices</p>
          </div>
        )}

        <div className="flex gap-3">
          <button 
            onClick={() => setShowAddYearModal(false)} 
            className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAddYear  }
            disabled={!newYearData.year}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl text-sm font-medium hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Year
          </button>
        </div>
      </div>
    </div>
  </div>
)}

      {/* DELETE YEAR CONFIRMATION MODAL - Improved */}
      {showDeleteYearConfirm && yearToDelete && selectedLocation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Delete Year Record</h2>
                <p className="text-sm text-gray-500 mt-2">
                  Are you sure you want to delete <span className="font-semibold">{yearToDelete}</span> data from <span className="font-semibold">{selectedLocation.locationName}</span>?
                </p>
                <p className="text-xs text-red-500 mt-2 flex items-center justify-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Only this year's record will be removed. Other years will remain untouched.
                </p>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => { setShowDeleteYearConfirm(false); setYearToDelete(null) }} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button onClick={handleDeleteYear} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-all flex items-center justify-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Delete Year
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD LOCATION MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-blue-600" />
                  Add New Location
                </h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location Name *</label>
                  <input type="text" value={newLocation.locationName} onChange={(e) => setNewLocation(prev => ({ ...prev, locationName: e.target.value }))} placeholder="e.g., DHA Phase 9" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Area *</label>
                  <input type="text" value={newLocation.area} onChange={(e) => setNewLocation(prev => ({ ...prev, area: e.target.value }))} placeholder="e.g., DHA" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div className="mb-4">
  <label className="block text-sm font-medium text-gray-700 mb-1">Initial Year *</label>
  <select
    value={newLocation.initialYear}
    onChange={(e) => setNewLocation(prev => ({ ...prev, initialYear: e.target.value }))}
    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    {[2026].map(year => (
      <option key={year} value={year}>{year}</option>
    ))}
  </select>
  <p className="text-xs text-gray-400 mt-1">City will be set to: <span className="font-semibold text-blue-600">Lahore</span></p>
</div>

              <div className="flex gap-3">
                <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">Cancel</button>
                <button onClick={handleAddLocation} disabled={!newLocation.locationName || !newLocation.area} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-medium hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Location
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE LOCATION MODAL */}
      {showDeleteConfirm && editingLocation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Delete Location</h2>
                <p className="text-sm text-gray-500 mt-2">Delete <span className="font-semibold">{editingLocation.locationName}</span>?</p>
                <p className="text-xs text-red-500 mt-2 flex items-center justify-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  All year records and history will be permanently deleted.
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">Cancel</button>
                <button onClick={handleDeleteLocation} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-all flex items-center justify-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PropertyPriceHistory