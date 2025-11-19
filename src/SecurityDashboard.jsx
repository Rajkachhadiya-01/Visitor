// src/SecurityDashboard.jsx 
import React, { useState } from 'react';
import {
  Users, UserPlus, Search, CheckCircle, XCircle, Clock, Bell, X, Calendar
} from 'lucide-react';

const SOCIETY_NAME = "Harmony Residency";

const SecurityDashboard = ({
  visitors = [],
  approvals = [],
  securityData,
  firebaseNotifications = [],
  onLogout,
  onCheckIn,
  onSearch,
  onCheckOut,
  onMarkArrived,
}) => {
  const [activeStatCard, setActiveStatCard] = useState(null);
  const [statCardFilter, setStatCardFilter] = useState('all');
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);

  // Helper to safely parse Firebase Timestamp
  const getDateFromItem = (item) => {
    if (!item) return null;
    
    // Check for Firebase Timestamp object
    if (item.createdAt && typeof item.createdAt === 'object' && item.createdAt.seconds) {
      return new Date(item.createdAt.seconds * 1000);
    }
    
    // Check for ISO string
    if (item.createdAt && typeof item.createdAt === 'string') {
      return new Date(item.createdAt);
    }
    
    // Fallback to checkIn or requestTime
    if (item.checkIn) return new Date(item.checkIn);
    if (item.requestTime) return new Date(item.requestTime);
    
    return new Date();
  };

  // Get today's start
  const getTodayStart = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  // Get today's items
  const getTodayItems = (items) => {
    const todayStart = getTodayStart();
    return items.filter(item => {
      const itemDate = getDateFromItem(item);
      return itemDate && itemDate >= todayStart;
    });
  };

  // Calculate base stats
  const pendingVisitors = visitors.filter(v => v && v.status === 'pending');
  const insideVisitors = visitors.filter(v => v && v.status === 'inside');
  const outVisitors = visitors.filter(v => v && v.status === 'out');
  const pendingApprovals = approvals.filter(a =>
    a &&
    a.approved &&
    a.status === 'Pre-Approved' &&
    (!a.arrivalStatus || a.arrivalStatus === 'Not Arrived Yet')
  );
  const cancelledApprovals = approvals.filter(a =>
    a &&
    (a.status === 'Cancelled' || a.arrivalStatus === 'Expired' || a.arrivalStatus === 'Cancelled by Resident')
  );

  // Filter by date range
  const filterByDateRange = (items) => {
    if (!customDateRange.start || !customDateRange.end) return items;
    
    const start = new Date(customDateRange.start);
    start.setHours(0, 0, 0, 0);
    const end = new Date(customDateRange.end);
    end.setHours(23, 59, 59, 999);
    
    return items.filter(item => {
      const itemDate = getDateFromItem(item);
      return itemDate && itemDate >= start && itemDate <= end;
    });
  };

  // Get filtered data based on active stat card
  const getStatCardFilteredData = () => {
    if (!activeStatCard) return [];

    let baseData = [];
    
    if (activeStatCard === 'pending') {
      if (statCardFilter === 'custom') {
        baseData = filterByDateRange(pendingVisitors);
      } else {
        baseData = pendingVisitors;
      }
    }
    
    if (activeStatCard === 'inside') {
      const todayInside = getTodayItems(insideVisitors);
      
      if (statCardFilter === 'custom') {
        baseData = filterByDateRange(insideVisitors);
      } else {
        baseData = todayInside;
      }
    }
    
    if (activeStatCard === 'total') {
      const todayVisitors = getTodayItems(visitors);

      switch(statCardFilter) {
        case 'inside':
          baseData = getTodayItems(insideVisitors);
          break;
        case 'out':
          baseData = getTodayItems(outVisitors);
          break;
        case 'cancelled':
          baseData = getTodayItems(cancelledApprovals);
          break;
        case 'expired':
          baseData = cancelledApprovals.filter(a => a.arrivalStatus === 'Expired');
          break;
        case 'coming':
          baseData = getTodayItems(pendingApprovals);
          break;
        case 'custom':
          baseData = filterByDateRange(visitors);
          break;
        default:
          baseData = todayVisitors;
      }
    }
    
    if (activeStatCard === 'out') {
      const todayOut = getTodayItems(outVisitors);
      
      if (statCardFilter === 'custom') {
        baseData = filterByDateRange(outVisitors);
      } else {
        baseData = todayOut;
      }
    }

    return baseData;
  };

  const filteredData = getStatCardFilteredData();

  // Stat card configurations
  const statCards = [
    {
      id: 'pending',
      title: 'Pending',
      value: pendingVisitors.length,
      icon: Clock,
      color: '#ffb37a',
      filters: [
        { label: 'All Pending', value: 'all' },
        { label: 'Custom Date Range', value: 'custom' }
      ]
    },
    {
      id: 'inside',
      title: 'Inside Now',
      value: getTodayItems(insideVisitors).length,
      icon: Users,
      color: '#7ddf85',
      filters: [
        { label: "Today's Inside", value: 'all' },
        { label: 'Custom Date Range', value: 'custom' }
      ]
    },
    {
      id: 'total',
      title: 'Total Today',
      value: getTodayItems(visitors).length,
      icon: CheckCircle,
      color: '#84b6f4',
      filters: [
        { label: 'All', value: 'all' },
        { label: 'Inside', value: 'inside' },
        { label: 'Out', value: 'out' },
        { label: 'Coming (Pre-Approved)', value: 'coming' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Expired', value: 'expired' },
        { label: 'Custom Date Range', value: 'custom' }
      ]
    },
    {
      id: 'out',
      title: 'Checked Out',
      value: getTodayItems(outVisitors).length,
      icon: XCircle,
      color: '#c79df2',
      filters: [
        { label: "Today's Checked Out", value: 'all' },
        { label: 'Custom Date Range', value: 'custom' }
      ]
    }
  ];

  const closeStatCardFilter = () => {
    setActiveStatCard(null);
    setStatCardFilter('all');
    setShowCustomDatePicker(false);
    setCustomDateRange({ start: '', end: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-4 md:p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">{SOCIETY_NAME}</h1>
            <h2 className="text-lg md:text-xl">Security Dashboard</h2>
            <p className="text-sm md:text-base opacity-90">{securityData?.name || 'Security'} - {securityData?.gate || 'Main Gate'}</p>
          </div>
          
          {/* Logout Button Only */}
          <div className="flex items-center gap-4">
            <button 
              onClick={onLogout} 
              className="bg-red-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-800 transition-all shadow-md"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Alerts */}
        {pendingVisitors.length > 0 && (
          <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-6 rounded-lg shadow-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <p className="font-semibold text-orange-800">
                {pendingVisitors.length} visitor(s) waiting for resident approval
              </p>
            </div>
          </div>
        )}

        {pendingApprovals.length > 0 && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded-lg shadow-sm">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" />
              <p className="font-semibold text-blue-800">
                {pendingApprovals.length} pre-approved visitor(s) awaiting arrival
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={onCheckIn}
            className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-xl shadow-md hover:shadow-xl flex items-center justify-center gap-3 transition-all transform hover:scale-105"
          >
            <UserPlus className="w-8 h-8" />
            <span className="text-xl font-bold">Check-In Visitor</span>
          </button>

          <button
            onClick={onSearch}
            className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-xl shadow-md hover:shadow-xl flex items-center justify-center gap-3 transition-all transform hover:scale-105"
          >
            <Search className="w-8 h-8" />
            <span className="text-xl font-bold">Search Visitor</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map(card => {
            const Icon = card.icon;
            const isActive = activeStatCard === card.id;
            
            return (
              <div
                key={card.id}
                onClick={() => setActiveStatCard(isActive ? null : card.id)}
                className={`bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer transform hover:scale-105 ${
                  isActive ? 'ring-2 ring-indigo-500' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    style={{ backgroundColor: card.color }}
                    className="p-3 rounded-lg"
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-600 text-sm font-medium">{card.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stat Card Filter Panel */}
        {activeStatCard && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-2 border-indigo-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {statCards.find(c => c.id === activeStatCard)?.title} - Detailed View
              </h3>
              <button onClick={closeStatCardFilter} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Filter Options */}
            <div className="flex flex-wrap gap-2 mb-4">
              {statCards.find(c => c.id === activeStatCard)?.filters.map(filter => (
                <button
                  key={filter.value}
                  onClick={() => {
                    setStatCardFilter(filter.value);
                    setShowCustomDatePicker(filter.value === 'custom');
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    statCardFilter === filter.value
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Custom Date Picker */}
            {showCustomDatePicker && (
              <div className="flex flex-col md:flex-row gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={customDateRange.start}
                    onChange={(e) => setCustomDateRange({ ...customDateRange, start: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    End Date
                  </label>
                  <input
                    type="date"
                    value={customDateRange.end}
                    onChange={(e) => setCustomDateRange({ ...customDateRange, end: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            {/* Filtered Results */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredData.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No records found for selected filter</p>
              ) : (
                filteredData.map(item => {
                  const isVisitor = item.name && (item.phone || item.flat || item.purpose);
                  
                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-lg border ${
                        item.status === 'pending'
                          ? 'bg-orange-50 border-orange-200'
                          : item.status === 'inside'
                          ? 'bg-green-50 border-green-200'
                          : item.status === 'out'
                          ? 'bg-gray-50 border-gray-200'
                          : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-semibold text-lg">{item.name}</p>
                          {isVisitor ? (
                            <>
                              <p className="text-sm text-gray-600">Flat: {item.flat} • {item.purpose}</p>
                              <p className="text-xs text-gray-500">
                                In: {item.checkIn} {item.checkOut && `| Out: ${item.checkOut}`}
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="text-sm text-gray-600">Pre-Approval • Flat: {item.flat} • {item.type}</p>
                              <p className="text-xs text-gray-500">
                                Code: {item.preApprovalCode} • {item.frequency}
                              </p>
                            </>
                          )}
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                            item.status === 'pending'
                              ? 'bg-orange-100 text-orange-700'
                              : item.status === 'inside'
                              ? 'bg-green-100 text-green-700'
                              : item.status === 'out'
                              ? 'bg-gray-200 text-gray-800'
                              : item.status === 'Pre-Approved'
                              ? 'bg-blue-200 text-blue-700'
                              : 'bg-red-200 text-red-700'
                          }`}
                        >
                          {item.status === 'pending' ? 'Waiting' :
                           item.status === 'inside' ? 'Inside' :
                           item.status === 'out' ? 'Checked Out' :
                           item.status === 'Pre-Approved' ? 'Coming' :
                           item.arrivalStatus || item.status}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Waiting for Approval */}
        {pendingVisitors.length > 0 && (
          <div className="bg-white rounded-xl shadow-md mb-6">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Waiting for Approval</h2>
            </div>
            <div className="p-6 space-y-3">
              {pendingVisitors.map(v => (
                <div key={v.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-orange-50 rounded-lg border border-orange-200 gap-3">
                  <div className="flex items-center gap-4">
                    {v.photo && (
                      <img
                        src={v.photo}
                        alt={v.name}
                        className="w-16 h-16 rounded-lg object-cover border-2 border-gray-300"
                      />
                    )}
                    <div>
                      <p className="font-semibold">{v.name}</p>
                      <p className="text-sm text-gray-600">Flat: {v.flat} • {v.purpose}</p>
                      <p className="text-xs text-gray-500">Arrived: {v.checkIn}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 whitespace-nowrap">
                    Waiting Approval
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pre-Approvals Awaiting Arrival */}
        {pendingApprovals.length > 0 && (
          <div className="bg-white rounded-xl shadow-md mb-6">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Pre-Approvals Awaiting Arrival</h2>
              <p className="text-sm text-gray-600 mt-1">Verify code when visitor arrives</p>
            </div>
            <div className="p-6 space-y-3">
              {pendingApprovals.map(a => (
                <div key={a.id} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex flex-col md:flex-row justify-between items-start mb-3 gap-3">
                    <div className="flex-1">
                      <p className="font-semibold text-lg">{a.name}</p>
                      <p className="text-sm text-gray-600 mt-1">Flat: {a.flat} • {a.type} • {a.frequency}</p>
                      <p className="text-xs text-gray-500 mt-1">Expected: {a.requestTime}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 whitespace-nowrap">
                      {a.arrivalStatus || 'Not Arrived Yet'}
                    </span>
                  </div>
                  {(!a.arrivalStatus || a.arrivalStatus === 'Not Arrived Yet') && (
                    <div>
                      <input
                        type="text"
                        maxLength="6"
                        placeholder="Enter 6-digit code"
                        className="w-full mb-2 px-3 py-2 border rounded-lg text-center tracking-widest focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                        id={`code-${a.id}`}
                      />
                      <button
                        onClick={() => {
                          const codeInput = document.getElementById(`code-${a.id}`);
                          const enteredCode = codeInput.value;

                          if (enteredCode === a.preApprovalCode) {
                            onMarkArrived(a.id);
                            codeInput.value = '';
                          } else {
                            alert('❌ Invalid Code - The verification code does not match.');
                          }
                        }}
                        className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-all"
                      >
                        ✓ Verify & Allow Entry
                      </button>
                      <p className="text-xs text-gray-500 mt-1 text-center">
                        Code required for entry verification
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityDashboard;