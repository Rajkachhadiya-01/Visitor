// src/ResidentDashboard.jsx 
import React, { useState } from 'react';
import { Bell, UserPlus, CheckCircle, Clock, Calendar, X } from 'lucide-react';

const SOCIETY_NAME = "Harmony Residency";

const ResidentDashboard = ({
  visitors = [],
  approvals = [],
  currentResident,
  residentInfo,
  firebaseNotifications = [],
  onLogout,
  onAddApproval,
  onApproveVisitor,
  onRejectVisitor,
  onCancelApproval,
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

  // Filter visitors for current resident
  const myVisitors = visitors.filter(v => v && v.flat === currentResident);
  const myApprovals = approvals.filter(a =>
    a &&
    a.flat === currentResident &&
    a.approved &&
    a.status === 'Pre-Approved' &&
    (!a.arrivalStatus || a.arrivalStatus === 'Not Arrived Yet')
  );
  const pendingVisitors = visitors.filter(v => v && v.flat === currentResident && v.status === 'pending');
  const insideVisitors = myVisitors.filter(v => v && v.status === 'inside');
  const cancelledApprovals = approvals.filter(a =>
    a &&
    a.flat === currentResident &&
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

  // Get today's items
  const getTodayItems = (items) => {
    const todayStart = getTodayStart();
    return items.filter(item => {
      const itemDate = getDateFromItem(item);
      return itemDate && itemDate >= todayStart;
    });
  };

  // Get filtered data based on active stat card
  const getStatCardFilteredData = () => {
    if (!activeStatCard) return [];

    let baseData = [];
    
    if (activeStatCard === 'todayVisitors') {
      const todayVisitors = getTodayItems(myVisitors);

      switch(statCardFilter) {
        case 'inside':
          baseData = todayVisitors.filter(v => v.status === 'inside');
          break;
        case 'out':
          baseData = todayVisitors.filter(v => v.status === 'out');
          break;
        case 'preapproval':
          const todayApprovals = getTodayItems(approvals.filter(a => 
            a.flat === currentResident && a.status === 'Pre-Approved'
          ));
          baseData = todayApprovals;
          break;
        case 'custom':
          baseData = filterByDateRange(myVisitors);
          break;
        default:
          baseData = todayVisitors;
      }
    }
    
    if (activeStatCard === 'activeApprovals') {
      switch(statCardFilter) {
        case 'coming':
          baseData = myApprovals;
          break;
        case 'expired':
          baseData = cancelledApprovals.filter(a => a.arrivalStatus === 'Expired');
          break;
        default:
          baseData = myApprovals;
      }
    }
    
    if (activeStatCard === 'currentlyInside') {
      const todayInside = getTodayItems(insideVisitors);

      if (statCardFilter === 'custom') {
        baseData = filterByDateRange(insideVisitors);
      } else {
        baseData = todayInside;
      }
    }

    return baseData;
  };

  const filteredData = getStatCardFilteredData();

  // Stat card configurations
  const statCards = [
    {
      id: 'todayVisitors',
      title: "Today's Visitors",
      value: getTodayItems(myVisitors).length,
      icon: CheckCircle,
      color: 'green',
      filters: [
        { label: 'All', value: 'all' },
        { label: 'Inside', value: 'inside' },
        { label: 'Out', value: 'out' },
        { label: 'Pre-Approval Coming', value: 'preapproval' },
        { label: 'Custom Date Range', value: 'custom' }
      ]
    },
    {
      id: 'activeApprovals',
      title: 'Active Approvals',
      value: myApprovals.length,
      icon: UserPlus,
      color: 'blue',
      filters: [
        { label: 'All Coming', value: 'all' },
        { label: 'Coming Today', value: 'coming' },
        { label: 'Expired (24h)', value: 'expired' }
      ]
    },
    {
      id: 'currentlyInside',
      title: 'Currently Inside',
      value: getTodayItems(insideVisitors).length,
      icon: Clock,
      color: 'purple',
      filters: [
        { label: "Today's Inside", value: 'all' },
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
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-4 md:p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">{SOCIETY_NAME}</h1>
            <h2 className="text-lg md:text-xl">Resident Dashboard</h2>
            <p className="text-sm md:text-base opacity-90">Flat {currentResident} - {residentInfo?.name || 'Resident'}</p>
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
        {/* Pending Visitors Alert */}
        {pendingVisitors.length > 0 && (
          <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-6 rounded-lg shadow-sm">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-600 animate-pulse" />
              <p className="font-semibold text-orange-800">
                {pendingVisitors.length} visitor(s) waiting at gate for your approval!
              </p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
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
                  <div className={`bg-${card.color}-100 p-3 rounded-lg`}>
                    <Icon className={`w-6 h-6 text-${card.color}-600`} />
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
                  const isVisitor = item.name && (item.phone || item.purpose);
                  
                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-lg border ${
                        item.status === 'inside'
                          ? 'bg-green-50 border-green-200'
                          : item.status === 'out'
                          ? 'bg-gray-50 border-gray-200'
                          : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-lg">{item.name}</p>
                          {isVisitor ? (
                            <>
                              <p className="text-sm text-gray-600">Purpose: {item.purpose}</p>
                              <p className="text-xs text-gray-500">
                                In: {item.checkIn} {item.checkOut && `| Out: ${item.checkOut}`}
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="text-sm text-gray-600">Pre-Approval • {item.type}</p>
                              <p className="text-xs text-gray-500">
                                Code: {item.preApprovalCode} • {item.frequency}
                              </p>
                            </>
                          )}
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            item.status === 'inside'
                              ? 'bg-green-100 text-green-700'
                              : item.status === 'out'
                              ? 'bg-gray-200 text-gray-800'
                              : item.status === 'Pre-Approved'
                              ? 'bg-blue-200 text-blue-700'
                              : 'bg-red-200 text-red-700'
                          }`}
                        >
                          {item.status === 'inside' ? 'Inside' :
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

        {/* Visitors Waiting for Approval */}
        {pendingVisitors.length > 0 && (
          <div className="bg-white rounded-xl shadow-md mb-6">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Visitors Waiting for Approval</h2>
            </div>
            <div className="p-6 space-y-3">
              {pendingVisitors.map(v => (
                <div key={v.id} className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-3">
                    {v.photo && (
                      <img
                        src={v.photo}
                        alt={v.name}
                        className="w-16 h-16 rounded-lg object-cover border-2 border-gray-300"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-lg">{v.name}</p>
                      <p className="text-sm text-gray-600">Phone: {v.phone}</p>
                      <p className="text-sm text-gray-600">Purpose: {v.purpose}</p>
                      <p className="text-xs text-gray-500">Arrived: {v.checkIn}</p>
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row gap-2">
                    <button
                      onClick={() => onApproveVisitor(v.id)}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-all"
                    >
                      Approve Entry
                    </button>
                    <button
                      onClick={() => onRejectVisitor(v.id)}
                      className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition-all"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pre-Approved Visitors */}
        <div className="bg-white rounded-xl shadow-md mb-6">
          <div className="p-6 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="text-xl font-bold">Pre-Approved Visitors</h2>
            <button
              onClick={onAddApproval}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-all w-full md:w-auto justify-center shadow-md"
            >
              <UserPlus className="w-4 h-4" />
              Add
            </button>
          </div>

          <div className="p-6">
            <div className="space-y-3">
              {myApprovals.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No pre-approved visitors found
                </p>
              ) : (
                myApprovals.map(a => (
                  <div key={a.id} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex flex-col md:flex-row justify-between items-start mb-2 gap-2">
                      <div className="flex-1">
                        <p className="font-semibold text-lg">{a.name}</p>
                        <p className="text-sm text-gray-600">Type: {a.type}</p>
                        <p className="text-sm text-gray-600">Frequency: {a.frequency}</p>
                        <p className="text-sm text-gray-600">Requested: {a.requestTime}</p>
                        <div className="flex items-center gap-2 mt-1 relative">
                          <p className="text-xs text-gray-500">Code: {a.preApprovalCode}</p>
                          <button
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(a.preApprovalCode);
                                const tooltip = document.getElementById(`tooltip-${a.id}`);
                                if (tooltip) {
                                  tooltip.classList.remove("opacity-0", "invisible");
                                  setTimeout(() => {
                                    tooltip.classList.add("opacity-0", "invisible");
                                  }, 1500);
                                }
                              } catch (err) {
                                console.error('Copy failed');
                              }
                            }}
                            className="text-blue-600 text-xs underline hover:text-blue-800"
                          >
                            Copy
                          </button>
                          <span
                            id={`tooltip-${a.id}`}
                            className="absolute top-6 left-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 invisible transition-all"
                          >
                            Copied!
                          </span>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                          a.arrivalStatus === 'Arrived at Gate'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {a.arrivalStatus || 'Not Arrived Yet'}
                      </span>
                    </div>
                    <button
                      onClick={() => onCancelApproval(a.id, a.flat)}
                      className="mt-3 bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-semibold w-full hover:bg-red-700 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResidentDashboard;