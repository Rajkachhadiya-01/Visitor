// src/AdminDashboard.jsx
import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Users, Activity, UserPlus, Shield, Menu, Home, ClipboardList, 
  UserCheck, Ban, X, Filter, Search
} from 'lucide-react';

const SOCIETY_NAME = "Harmony Residency";

// FilterDropdown Component
const FilterDropdown = ({
  options = [],
  value = '',
  onChange,
  placeholder = 'Type to search...',
  noDataText = 'No matches',
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(0);
  const ref = useRef(null);

  const filtered = useMemo(() => {
    if (!query) return options;
    const q = query.toLowerCase();
    return options.filter(o =>
      String(o.label).toLowerCase().includes(q) ||
      String(o.value).toLowerCase().includes(q)
    );
  }, [options, query]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (highlight >= filtered.length) setHighlight(0);
  }, [filtered.length, highlight]);

  const currentLabel = options.find(o => o.value === value)?.label || '';

  return (
    <div className="relative" ref={ref}>
      <div
        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white cursor-text hover:border-indigo-400 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-200"
        onClick={() => setOpen(true)}
      >
        <Filter className="w-4 h-4 text-gray-500" />
        <input
          type="text"
          value={query || currentLabel}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setHighlight((h) => Math.min(h + 1, filtered.length - 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setHighlight((h) => Math.max(h - 1, 0));
            } else if (e.key === 'Enter') {
              e.preventDefault();
              if (filtered[highlight]) {
                onChange(filtered[highlight].value);
                setQuery('');
                setOpen(false);
              }
            } else if (e.key === 'Escape') {
              setOpen(false);
              setQuery('');
            }
          }}
          placeholder={placeholder}
          className="flex-1 focus:outline-none bg-transparent"
        />
        <span className="text-gray-400">▾</span>
      </div>
      
      {open && (
        <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg">
          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">{noDataText}</div>
          ) : (
            filtered.map((o, idx) => (
              <div
                key={o.value}
                className={`px-4 py-2 cursor-pointer text-sm ${
                  highlight === idx ? 'bg-indigo-50' : 'hover:bg-gray-50'
                } ${value === o.value ? 'bg-indigo-100 font-semibold' : ''}`}
                onMouseEnter={() => setHighlight(idx)}
                onClick={() => {
                  onChange(o.value);
                  setQuery('');
                  setOpen(false);
                }}
              >
                {o.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

const AdminDashboard = ({ 
  visitors = [], 
  approvals = [], 
  activities = [], 
  residents = [], 
  securityGuards = [], 
  adminData = {}, 
  onLogout 
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [timeFilter, setTimeFilter] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = [
    { key: 'overview', label: 'Overview', icon: Home },
    { key: 'visitors', label: 'Visitors', icon: Users },
    { key: 'approvals', label: 'Pre-Approved', icon: ClipboardList },
    { key: 'inside', label: 'Inside Now', icon: UserCheck },
    { key: 'residents', label: 'Residents', icon: UserPlus },
    { key: 'security', label: 'Security', icon: Shield },
    { key: 'activity', label: 'Activity Log', icon: Activity },
    { key: 'rejected', label: 'Rejected', icon: Ban }
  ];

  const getStatusColor = (status) => {
    const s = (status || "").toString().toLowerCase();
    if (s.includes("approved") || s.includes("inside")) return "bg-green-100 text-green-800";
    if (s.includes("reject")) return "bg-red-100 text-red-800";
    if (s.includes("pending") || s.includes("await")) return "bg-yellow-100 text-yellow-800";
    if (s.includes("arrived") || s.includes("gate")) return "bg-blue-100 text-blue-800";
    if (s === "out" || s === "checked out") return "bg-gray-200 text-gray-700";
    return "bg-gray-100 text-gray-600";
  };

  // Time filter options
  const timeFilterOptions = [
    { label: 'All Time', value: 'all' },
    { label: 'Today', value: 'today' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'Custom Range', value: 'custom' }
  ];

  // Filter visitors by time
  const filterByTime = (items) => {
    if (timeFilter === 'all') return items;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    return items.filter(item => {
      const itemDate = new Date(item.checkIn || item.createdAt || item.timestamp || 0);
      
      switch(timeFilter) {
        case 'today':
          return itemDate >= today;
        case 'yesterday':
          return itemDate >= yesterday && itemDate < today;
        case 'week':
          return itemDate >= weekStart;
        case 'month':
          return itemDate >= monthStart;
        case 'custom':
          if (customStartDate && customEndDate) {
            const start = new Date(customStartDate);
            const end = new Date(customEndDate);
            end.setHours(23, 59, 59, 999);
            return itemDate >= start && itemDate <= end;
          }
          return true;
        default:
          return true;
      }
    });
  };

  // Filter by search query
  const filterBySearch = (items, fields) => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(item => 
      fields.some(field => 
        String(item[field] || '').toLowerCase().includes(query)
      )
    );
  };

  const filteredVisitors = filterBySearch(filterByTime(visitors), ['name', 'flat', 'purpose', 'status']);
  const filteredApprovals = filterBySearch(approvals, ['name', 'flat', 'type', 'status']);
  const insideVisitors = filterBySearch(filterByTime(visitors), ['name', 'flat', 'purpose']).filter(v => v?.status === "inside");
  const rejectedVisitors = filterBySearch(filterByTime(visitors), ['name', 'flat', 'purpose']).filter(v => v?.status === "rejected");
  const filteredResidents = filterBySearch(residents, ['name', 'flat', 'mobile']);
  const filteredSecurity = filterBySearch(securityGuards, ['name', 'gate', 'mobile']);

  const stats = {
    totalVisitors: filteredVisitors.length,
    activeVisitors: insideVisitors.length,
    residents: residents.length,
    securityStaff: securityGuards.length
  };

  const activityList = (activities || []).sort((a, b) => {
    const dateA = new Date(a.createdAt || a.timestamp || 0);
    const dateB = new Date(b.createdAt || b.timestamp || 0);
    return dateB - dateA;
  });

  const filteredActivities = filterByTime(activityList);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-white shadow-lg rounded-lg p-2 border border-gray-200"
      >
        <Menu className="w-6 h-6 text-gray-700" />
      </button>

      {/* Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-50 w-64 h-screen bg-gradient-to-b from-indigo-700 to-indigo-900 text-white shadow-2xl transform transition-transform duration-300 overflow-y-auto ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:sticky`}>
        <div className="h-full py-6 px-4 flex flex-col">
          <div className="flex items-center justify-between mb-8 px-2">
            <h1 className="text-2xl font-bold">{SOCIETY_NAME}</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white hover:bg-indigo-600 p-1 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-2 flex-1">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => {
                  setActiveTab(key);
                  setSidebarOpen(false);
                }}
                className={`flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === key
                    ? "bg-white text-indigo-700 shadow-lg"
                    : "text-white hover:bg-indigo-600"
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {label}
              </button>
            ))}
          </nav>

          <div className="mt-8 pt-6 border-t border-indigo-600">
            <button
              onClick={onLogout}
              className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0 lg:ml-0">
        {/* Header */}
        <div className="bg-white shadow-sm p-6 border-b sticky top-0 z-30">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">Complete Society Overview - {adminData?.name || "Rajesh Patel"}</p>
            </div>
            <div className="mt-2 lg:mt-0">
              <button
                onClick={onLogout}
                className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards - Only visible on Overview tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500 hover:shadow-md transition">
              <p className="text-sm text-gray-600 font-medium mb-1">Total Visitors</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalVisitors}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500 hover:shadow-md transition">
              <p className="text-sm text-gray-600 font-medium mb-1">Inside Now</p>
              <p className="text-3xl font-bold text-gray-900">{stats.activeVisitors}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500 hover:shadow-md transition">
              <p className="text-sm text-gray-600 font-medium mb-1">Residents</p>
              <p className="text-3xl font-bold text-gray-900">{stats.residents}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-orange-500 hover:shadow-md transition">
              <p className="text-sm text-gray-600 font-medium mb-1">Security Staff</p>
              <p className="text-3xl font-bold text-gray-900">{stats.securityStaff}</p>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="p-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            {/* Header with Search and Filter */}
            <div className="flex flex-col gap-4 mb-6">
              <h3 className="text-2xl font-semibold text-gray-900">
                {activeTab === 'overview' && 'Recent Activity'}
                {activeTab === 'visitors' && `All Visitors (${filteredVisitors.length})`}
                {activeTab === 'approvals' && `Pre-Approved Visitors (${filteredApprovals.length})`}
                {activeTab === 'inside' && `Currently Inside (${insideVisitors.length})`}
                {activeTab === 'residents' && `Residents (${filteredResidents.length})`}
                {activeTab === 'security' && `Security Staff (${filteredSecurity.length})`}
                {activeTab === 'activity' && 'Activity Log'}
                {activeTab === 'rejected' && `Rejected Visitors (${rejectedVisitors.length})`}
              </h3>

              {/* Search Bar and Filter Row */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search Bar */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search ${
                      activeTab === 'residents' ? 'residents by name, flat, or phone' :
                      activeTab === 'security' ? 'security staff by name, gate, or phone' :
                      activeTab === 'approvals' ? 'pre-approved visitors by name, flat, or type' :
                      'visitors by name, flat, or purpose'
                    }...`}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 bg-white"
                  />
                </div>

                {/* Time Filter - Show for visitors, activity, inside, and rejected tabs */}
                {(['visitors', 'activity', 'inside', 'rejected', 'overview'].includes(activeTab)) && (
                  <div className="w-full sm:w-64">
                    <FilterDropdown
                      options={timeFilterOptions}
                      value={timeFilter}
                      onChange={setTimeFilter}
                      placeholder="Select time range"
                    />
                  </div>
                )}
              </div>

              {/* Custom Date Range */}
              {timeFilter === 'custom' && ['visitors', 'activity', 'inside', 'rejected', 'overview'].includes(activeTab) && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Overview/Activity */}
            {(activeTab === 'overview' || activeTab === 'activity') && (
              <div className="space-y-3">
                {filteredActivities.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No activity recorded yet</p>
                ) : (
                  filteredActivities.slice(0, 15).map((activity) => (
                    <div key={activity.id} className="p-5 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="font-semibold text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {activity.performedBy} • {activity.visitorName} • {activity.flat}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.timestamp || 'N/A'} • {activity.date}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Visitors Table */}
            {activeTab === 'visitors' && (
              <div className="overflow-x-auto">
                {filteredVisitors.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No visitors found for selected time period</p>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="p-3 text-left text-sm font-semibold">Name</th>
                        <th className="p-3 text-left text-sm font-semibold">Flat</th>
                        <th className="p-3 text-left text-sm font-semibold">Purpose</th>
                        <th className="p-3 text-left text-sm font-semibold">Status</th>
                        <th className="p-3 text-left text-sm font-semibold">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredVisitors.map(v => (
                        <tr key={v.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">{v.name}</td>
                          <td className="p-3">{v.flat}</td>
                          <td className="p-3">{v.purpose}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 text-xs rounded ${getStatusColor(v.status)}`}>
                              {v.status}
                            </span>
                          </td>
                          <td className="p-3 text-sm text-gray-600">{v.checkIn || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Approvals Table */}
            {activeTab === 'approvals' && (
              <div className="overflow-x-auto">
                {filteredApprovals.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No pre-approved visitors found</p>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="p-3 text-left text-sm font-semibold">Name</th>
                        <th className="p-3 text-left text-sm font-semibold">Flat</th>
                        <th className="p-3 text-left text-sm font-semibold">Type</th>
                        <th className="p-3 text-left text-sm font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredApprovals.map(a => (
                        <tr key={a.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">{a.name}</td>
                          <td className="p-3">{a.flat}</td>
                          <td className="p-3">{a.type}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 text-xs rounded ${getStatusColor(a.status)}`}>
                              {a.arrivalStatus || a.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Inside Now */}
            {activeTab === 'inside' && (
              <div className="space-y-3">
                {insideVisitors.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No visitors currently inside for selected time period</p>
                ) : (
                  insideVisitors.map(v => (
                    <div key={v.id} className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-lg">{v.name}</p>
                          <p className="text-sm text-gray-600">Flat: {v.flat} • {v.purpose}</p>
                          <p className="text-xs text-gray-500">Check-in: {v.checkIn}</p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          Inside
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Residents Table */}
            {activeTab === 'residents' && (
              <div className="overflow-x-auto">
                {filteredResidents.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No residents found</p>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="p-3 text-left text-sm font-semibold">Name</th>
                        <th className="p-3 text-left text-sm font-semibold">Flat</th>
                        <th className="p-3 text-left text-sm font-semibold">Phone</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredResidents.map(r => (
                        <tr key={r.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">{r.name}</td>
                          <td className="p-3">{r.flat}</td>
                          <td className="p-3">{r.mobile}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Security Table */}
            {activeTab === 'security' && (
              <div className="overflow-x-auto">
                {filteredSecurity.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No security staff found</p>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="p-3 text-left text-sm font-semibold">Name</th>
                        <th className="p-3 text-left text-sm font-semibold">Gate</th>
                        <th className="p-3 text-left text-sm font-semibold">Phone</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSecurity.map(s => (
                        <tr key={s.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">{s.name}</td>
                          <td className="p-3">{s.gate}</td>
                          <td className="p-3">{s.mobile}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Rejected Visitors */}
            {activeTab === 'rejected' && (
              <div className="space-y-3">
                {rejectedVisitors.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No rejected visitors for selected time period</p>
                ) : (
                  rejectedVisitors.map(v => (
                    <div key={v.id} className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-lg">{v.name}</p>
                          <p className="text-sm text-gray-600">Flat: {v.flat} • {v.purpose}</p>
                          <p className="text-xs text-gray-500">Rejected at: {v.checkIn}</p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-200 text-red-700">
                          Rejected
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;