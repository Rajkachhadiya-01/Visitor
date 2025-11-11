// src/AdminDashboard.jsx
import React, { useState } from 'react';
import { Users, Activity, UserPlus, Search, Filter, Clock, CheckCircle, XCircle, X } from 'lucide-react';

const AdminDashboard = ({ visitors, approvals, residents, securityGuards, activities, adminData, onRejectVisitor, onLogout, onClearData, loginMessage }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [dateFilter, setDateFilter] = useState('today');
  const [activeStatFilter, setActiveStatFilter] = useState(null);

  // Sample activities based on actual visitors
// Activities data
// Use activities prop directly (already sorted by newest first)
const activityList = activities || [];

  const stats = {
    totalVisitors: visitors.length,
    activeVisitors: visitors.filter(v => v.status === 'inside').length,
    residents: residents.length,
    securityStaff: securityGuards.length,
    todayEntries: visitors.filter(v => v.checkIn).length,
    pendingApprovals: visitors.filter(v => v.status === 'pending').length
  };

// Filter data based on active stat card and search term
const getFilteredData = () => {
  let data;
  switch(activeStatFilter) {
    case 'totalVisitors':
      data = visitors;
      break;
    case 'activeVisitors':
      data = visitors.filter(v => v.status === 'active' || v.status === 'inside');
      break;
    case 'residents':
      data = residents;
      break;
    case 'securityStaff':
      data = securityGuards;
      break;
    case 'todayEntries':
      data = visitors.filter(v => v.checkIn);
      break;
    case 'pendingApprovals':
      data = visitors.filter(v => v.status === 'pending');
      break;
    default:
      data = visitors;
  }
  
  // Apply search filter
  if (searchTerm) {
    const query = searchTerm.toLowerCase();
    data = data.filter(item => 
      (item.name && item.name.toLowerCase().includes(query)) ||
      (item.flat && item.flat.toLowerCase().includes(query)) ||
      (item.phone && item.phone.includes(query)) ||
      (item.mobile && item.mobile.includes(query)) ||
      (item.gate && item.gate.toLowerCase().includes(query)) ||
      (item.purpose && item.purpose.toLowerCase().includes(query))
    );
  }
  
  return data;
};

  const handleStatClick = (statType) => {
    setActiveStatFilter(statType);
    // Auto-switch to appropriate tab
    if (statType === 'residents') {
      setActiveTab('residents');
    } else if (statType === 'securityStaff') {
      setActiveTab('security');
    } else {
      setActiveTab('visitors');
    }
  };

  const clearFilter = () => {
    setActiveStatFilter(null);
    setActiveTab('overview');
  };

  const getStatusColor = (status) => {
    const statusLower = String(status || '').toLowerCase();
    
    if (statusLower.includes('approved') || statusLower.includes('inside') || statusLower === 'active' || statusLower === 'on-duty') {
      return 'bg-green-100 text-green-800';
    }
    if (statusLower.includes('reject')) {
      return 'bg-red-100 text-red-800';
    }
    if (statusLower.includes('pending') || statusLower.includes('await')) {
      return 'bg-yellow-100 text-yellow-800';
    }
    if (statusLower.includes('arrived') || statusLower.includes('gate')) {
      return 'bg-blue-100 text-blue-800';
    }
    if (statusLower === 'out' || statusLower === 'completed' || statusLower === 'off-duty') {
      return 'bg-gray-100 text-gray-800';
    }
    return 'bg-gray-50 text-gray-700';
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'entry':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'exit':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'registration':
        return <UserPlus className="w-4 h-4 text-blue-600" />;
      case 'update':
        return <Activity className="w-4 h-4 text-purple-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const filteredData = getFilteredData();

  const StatCard = ({ title, value, color, statKey, icon: Icon }) => (
    <button
      onClick={() => handleStatClick(statKey)}
      className={`bg-white rounded-lg shadow p-4 border-l-4 ${color} hover:shadow-lg transition-all duration-200 text-left w-full ${
        activeStatFilter === statKey ? 'ring-2 ring-blue-500 ring-offset-2' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-600">{title}</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{value}</div>
        </div>
        {Icon && <Icon className="w-8 h-8 text-gray-400" />}
      </div>
      {activeStatFilter === statKey && (
        <div className="text-xs text-blue-600 mt-2 font-medium">Active Filter</div>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <div className="bg-purple-200 dark:bg-purple-800 text-white p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-purple-200">Complete Society Overview - {adminData?.name || 'Admin'}</p>
          </div>
          <button 
            onClick={onLogout}
            className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-purple-50 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {loginMessage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-2 rounded-lg transition-opacity duration-500">
            <p className="font-semibold text-green-800">{loginMessage}</p>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeStatFilter && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">Active Filter Applied</p>
                <p className="text-sm text-blue-700">
                  Showing {filteredData.length} results for: {
                    activeStatFilter === 'totalVisitors' ? 'All Visitors' :
                    activeStatFilter === 'activeVisitors' ? 'Active Visitors' :
                    activeStatFilter === 'residents' ? 'All Residents' :
                    activeStatFilter === 'securityStaff' ? 'Security Staff' :
                    activeStatFilter === 'todayEntries' ? "Today's Entries" :
                    activeStatFilter === 'pendingApprovals' ? 'Pending Approvals' : ''
                  }
                </p>
              </div>
            </div>
            <button
              onClick={clearFilter}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition"
            >
              <X className="w-4 h-4" />
              Clear Filter
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <StatCard
            title="Total Visitors"
            value={stats.totalVisitors}
            color="border-blue-500"
            statKey="totalVisitors"
            icon={Users}
          />
          <StatCard
            title="Inside Now"
            value={stats.activeVisitors}
            color="border-green-500"
            statKey="activeVisitors"
            icon={Activity}
          />
          <StatCard
            title="Residents"
            value={stats.residents}
            color="border-purple-500"
            statKey="residents"
            icon={Users}
          />
          <StatCard
            title="Security Staff"
            value={stats.securityStaff}
            color="border-orange-500"
            statKey="securityStaff"
            icon={Users}
          />
          <StatCard
            title="Today's Entries"
            value={stats.todayEntries}
            color="border-indigo-500"
            statKey="todayEntries"
            icon={CheckCircle}
          />
          <StatCard
            title="Pending"
            value={stats.pendingApprovals}
            color="border-yellow-500"
            statKey="pendingApprovals"
            icon={Clock}
          />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b">
            <nav className="flex space-x-4 px-6">
              {['overview', 'visitors', 'approvals', 'inside', 'residents', 'security', 'activity'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-4 font-medium text-sm transition capitalize ${
                    activeTab === tab
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          {/* Filters */}
          <div className="p-6 border-b bg-gray-50">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, unit, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="entry">Entries</option>
                <option value="exit">Exits</option>
                <option value="registration">Registrations</option>
              </select>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {activityList.slice(0, 15).map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                      <div className="mt-1">{getTypeIcon(activity.type)}</div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{activity.action}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              {activity.performedBy} | Visitor: {activity.visitorName} | Flat: {activity.flat}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Date: {activity.date}</p>
                          </div>
                          <div className="text-right flex flex-col items-end gap-2">
                            <p className="text-sm text-gray-500">{activity.timestamp}</p>
                            <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(activity.status)}`}>
                              {activity.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'visitors' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Visitor List {activeStatFilter && `(${filteredData.length} results)`}
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b">
                      <tr>
                        <th className="text-left p-3 text-sm font-semibold text-gray-700">Visitor Name</th>
                        <th className="text-left p-3 text-sm font-semibold text-gray-700">Phone</th>
                        <th className="text-left p-3 text-sm font-semibold text-gray-700">Unit</th>
                        <th className="text-left p-3 text-sm font-semibold text-gray-700">Purpose</th>
                        <th className="text-left p-3 text-sm font-semibold text-gray-700">Check In</th>
                        <th className="text-left p-3 text-sm font-semibold text-gray-700">Status</th>
                        {/* <th className="text-left p-3 text-sm font-semibold text-gray-700">Actions</th> */}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((visitor) => (
                        <tr key={visitor.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 text-sm font-medium">{visitor.name}</td>
                          <td className="p-3 text-sm text-gray-600">{visitor.phone}</td>
                          <td className="p-3 text-sm">{visitor.flat}</td>
                          <td className="p-3 text-sm">{visitor.purpose}</td>
                          <td className="p-3 text-sm">{visitor.checkIn}</td>
                          <td className="p-3 text-sm">
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(visitor.status)}`}>
                              {visitor.status}
                            </span>
                          </td>
                          {/* <td className="p-3 text-sm">
                            {visitor.status !== 'rejected' && visitor.status !== 'out' && (
                              <button
                                onClick={() => onRejectVisitor(visitor.id)}
                                className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition"
                              >
                                Reject
                              </button>
                            )}
                          </td> */}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'residents' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Resident Management {activeStatFilter === 'residents' && `(${filteredData.length} results)`}
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b">
                      <tr>
                        <th className="text-left p-3 text-sm font-semibold text-gray-700">Name</th>
                        <th className="text-left p-3 text-sm font-semibold text-gray-700">Flat</th>
                        <th className="text-left p-3 text-sm font-semibold text-gray-700">Phone</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(activeStatFilter === 'residents' ? filteredData : residents).map((resident) => (
                        <tr key={resident.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 text-sm font-medium">{resident.name}</td>
                          <td className="p-3 text-sm">{resident.flat}</td>
                          <td className="p-3 text-sm text-gray-600">{resident.mobile}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'approvals' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Pre-Approved Visitors ({approvals.length})
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b">
                      <tr>
                        <th className="text-left p-3 text-sm font-semibold text-gray-700">Visitor Name</th>
                        <th className="text-left p-3 text-sm font-semibold text-gray-700">Flat</th>
                        <th className="text-left p-3 text-sm font-semibold text-gray-700">Type</th>
                        <th className="text-left p-3 text-sm font-semibold text-gray-700">Frequency</th>
                        <th className="text-left p-3 text-sm font-semibold text-gray-700">Expected Time</th>
                        <th className="text-left p-3 text-sm font-semibold text-gray-700">Arrival Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {approvals.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center p-8 text-gray-500">
                            No pre-approved visitors
                          </td>
                        </tr>
                      ) : (
                        approvals.map((approval) => (
                          <tr key={approval.id} className="border-b hover:bg-gray-50">
                            <td className="p-3 text-sm font-medium">{approval.name}</td>
                            <td className="p-3 text-sm">{approval.flat}</td>
                            <td className="p-3 text-sm">{approval.type}</td>
                            <td className="p-3 text-sm">{approval.frequency}</td>
                            <td className="p-3 text-sm">{approval.requestTime}</td>
                            <td className="p-3 text-sm">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                approval.arrivalStatus === 'Arrived at Gate'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {approval.arrivalStatus || 'Not Arrived Yet'}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {activeTab === 'inside' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Currently Inside ({visitors.filter(v => v.status === 'inside').length})
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b">
                      <tr>
                        <th className="text-left p-3 text-sm font-semibold text-gray-700">Visitor Name</th>
                        <th className="text-left p-3 text-sm font-semibold text-gray-700">Phone</th>
                        <th className="text-left p-3 text-sm font-semibold text-gray-700">Flat</th>
                        <th className="text-left p-3 text-sm font-semibold text-gray-700">Purpose</th>
                        <th className="text-left p-3 text-sm font-semibold text-gray-700">Entry Time</th>
                        <th className="text-left p-3 text-sm font-semibold text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visitors.filter(v => v.status === 'inside').length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center p-8 text-gray-500">
                            No visitors currently inside
                          </td>
                        </tr>
                      ) : (
                        visitors.filter(v => v.status === 'inside').map((visitor) => (
                          <tr key={visitor.id} className="border-b hover:bg-gray-50">
                            <td className="p-3 text-sm font-medium">{visitor.name}</td>
                            <td className="p-3 text-sm text-gray-600">{visitor.phone}</td>
                            <td className="p-3 text-sm">{visitor.flat}</td>
                            <td className="p-3 text-sm">{visitor.purpose}</td>
                            <td className="p-3 text-sm">{visitor.checkIn}</td>
                            <td className="p-3 text-sm">
                              <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                Inside
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Security Staff {activeStatFilter === 'securityStaff' && `(${filteredData.length} results)`}
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b">
                      <tr>
                        <th className="text-left p-3 text-sm font-semibold text-gray-700">Name</th>
                        <th className="text-left p-3 text-sm font-semibold text-gray-700">Gate</th>
                        <th className="text-left p-3 text-sm font-semibold text-gray-700">Phone</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(activeStatFilter === 'securityStaff' ? filteredData : securityGuards).map((staff) => (
                        <tr key={staff.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 text-sm font-medium">{staff.name}</td>
                          <td className="p-3 text-sm">{staff.gate}</td>
                          <td className="p-3 text-sm text-gray-600">{staff.mobile}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">All Activity Logs</h3>
                <div className="space-y-3">
                  {activityList.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                      <div className="mt-1">{getTypeIcon(activity.type)}</div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{activity.action}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              {activity.performedBy} | Visitor: {activity.visitorName} | Flat: {activity.flat}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Date: {activity.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">{activity.timestamp}</p>
                            <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${getStatusColor(activity.status)}`}>
                              {activity.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
