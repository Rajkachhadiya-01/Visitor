// src/AdminDashboard.jsx
import React, { useState } from 'react';
import { Users, Activity, UserPlus, Search, Filter, Calendar, Clock, CheckCircle, XCircle, Eye, Download, X } from 'lucide-react';

const AdminDashboard = () => {
const [activeTab, setActiveTab] = useState('overview');
const [searchTerm, setSearchTerm] = useState('');
const [filterType, setFilterType] = useState('all');
const [dateFilter, setDateFilter] = useState('today');
const [activeStatFilter, setActiveStatFilter] = useState(null);

// Sample data - expanded for better filtering
const allVisitors = [
{ id: 1, name: 'Mike Johnson', phone: '+1 234-567-8901', unit: 'A-405', host: 'Sarah Smith', purpose: 'Personal Visit', checkIn: '10:30 AM', checkOut: '-', status: 'active', date: 'today' },
{ id: 2, name: 'Emma Wilson', phone: '+1 234-567-8902', unit: 'B-302', host: 'John Davis', purpose: 'Delivery', checkIn: '10:15 AM', checkOut: '-', status: 'pending', date: 'today' },
{ id: 3, name: 'Robert Brown', phone: '+1 234-567-8903', unit: 'C-101', host: 'Lisa Johnson', purpose: 'Maintenance', checkIn: '09:30 AM', checkOut: '10:00 AM', status: 'completed', date: 'today' },
{ id: 4, name: 'Anna Taylor', phone: '+1 234-567-8904', unit: 'D-201', host: 'Tom Harris', purpose: 'Business', checkIn: '11:00 AM', checkOut: '-', status: 'active', date: 'today' },
{ id: 5, name: 'James Wilson', phone: '+1 234-567-8905', unit: 'A-105', host: 'Mary Jones', purpose: 'Personal Visit', checkIn: '08:45 AM', checkOut: '-', status: 'active', date: 'today' },
{ id: 6, name: 'Patricia Moore', phone: '+1 234-567-8906', unit: 'C-305', host: 'David Lee', purpose: 'Delivery', checkIn: '09:15 AM', checkOut: '09:30 AM', status: 'completed', date: 'today' },
{ id: 7, name: 'Michael Davis', phone: '+1 234-567-8907', unit: 'B-408', host: 'Susan Clark', purpose: 'Contractor', checkIn: '07:30 AM', checkOut: '-', status: 'active', date: 'today' },
{ id: 8, name: 'Jennifer Garcia', phone: '+1 234-567-8908', unit: 'D-502', host: 'Robert White', purpose: 'Personal Visit', checkIn: '10:45 AM', checkOut: '-', status: 'pending', date: 'today' },
];

const stats = {
totalVisitors: allVisitors.length,
activeVisitors: allVisitors.filter(v => v.status === 'active').length,
residents: 342,
securityStaff: 12,
todayEntries: allVisitors.filter(v => v.date === 'today').length,
pendingApprovals: allVisitors.filter(v => v.status === 'pending').length
};

const activities = [
{ id: 1, type: 'entry', user: 'Security - John Doe', action: 'Checked in visitor', visitor: 'Mike Johnson', unit: 'A-405', time: '10:30 AM', status: 'approved' },
{ id: 2, type: 'registration', user: 'Resident - Sarah Smith', action: 'Pre-registered visitor', visitor: 'Emma Wilson', unit: 'B-302', time: '10:15 AM', status: 'pending' },
{ id: 3, type: 'exit', user: 'Security - Jane Miller', action: 'Checked out visitor', visitor: 'Robert Brown', unit: 'C-101', time: '10:00 AM', status: 'completed' },
{ id: 4, type: 'entry', user: 'Security - John Doe', action: 'Checked in visitor', visitor: 'Lisa Davis', unit: 'A-205', time: '09:45 AM', status: 'approved' },
{ id: 5, type: 'registration', user: 'Resident - Tom Harris', action: 'Pre-registered visitor', visitor: 'David Lee', unit: 'D-508', time: '09:30 AM', status: 'approved' },
{ id: 6, type: 'update', user: 'Admin - System', action: 'Updated security protocols', visitor: '-', unit: 'All Units', time: '09:00 AM', status: 'completed' },
{ id: 7, type: 'entry', user: 'Security - Jane Miller', action: 'Checked in visitor', visitor: 'Anna Taylor', unit: 'D-201', time: '11:00 AM', status: 'approved' },
{ id: 8, type: 'entry', user: 'Security - John Doe', action: 'Checked in visitor', visitor: 'James Wilson', unit: 'A-105', time: '08:45 AM', status: 'approved' },
];

const residents = [
{ id: 1, name: 'Sarah Smith', unit: 'A-405', phone: '+1 234-567-8910', email: 'sarah.smith@email.com', visitors: 12, status: 'active' },
{ id: 2, name: 'John Davis', unit: 'B-302', phone: '+1 234-567-8911', email: 'john.davis@email.com', visitors: 8, status: 'active' },
{ id: 3, name: 'Lisa Johnson', unit: 'C-101', phone: '+1 234-567-8912', email: 'lisa.j@email.com', visitors: 15, status: 'active' },
{ id: 4, name: 'Tom Harris', unit: 'D-201', phone: '+1 234-567-8913', email: 'tom.h@email.com', visitors: 9, status: 'active' },
{ id: 5, name: 'Mary Jones', unit: 'A-105', phone: '+1 234-567-8914', email: 'mary.j@email.com', visitors: 11, status: 'active' },
];

const securityStaff = [
{ id: 1, name: 'John Doe', shift: 'Morning (6AM-2PM)', phone: '+1 234-567-8920', status: 'on-duty', activities: 45 },
{ id: 2, name: 'Jane Miller', shift: 'Afternoon (2PM-10PM)', phone: '+1 234-567-8921', status: 'on-duty', activities: 38 },
{ id: 3, name: 'Bob Wilson', shift: 'Night (10PM-6AM)', phone: '+1 234-567-8922', status: 'off-duty', activities: 22 },
];

// Filter data based on active stat card
const getFilteredData = () => {
switch(activeStatFilter) {
case 'totalVisitors':
return allVisitors;
case 'activeVisitors':
return allVisitors.filter(v => v.status === 'active');
case 'residents':
return residents;
case 'securityStaff':
return securityStaff;
case 'todayEntries':
return allVisitors.filter(v => v.date === 'today');
case 'pendingApprovals':
return allVisitors.filter(v => v.status === 'pending');
default:
return allVisitors;
}
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
switch(status) {
case 'active': case 'approved': case 'on-duty': return 'bg-green-100 text-green-800';
case 'pending': return 'bg-yellow-100 text-yellow-800';
case 'completed': case 'off-duty': return 'bg-gray-100 text-gray-800';
default: return 'bg-blue-100 text-blue-800';
}
};

const getTypeIcon = (type) => {
switch(type) {
case 'entry': return <CheckCircle className="w-4 h-4 text-green-600" />;
case 'exit': return <XCircle className="w-4 h-4 text-red-600" />;
case 'registration': return <UserPlus className="w-4 h-4 text-blue-600" />;
case 'update': return <Activity className="w-4 h-4 text-purple-600" />;
default: return <Activity className="w-4 h-4 text-gray-600" />;
}
};

const filteredData = getFilteredData();

const StatCard = ({ title, value, color, statKey, icon: Icon }) => (
<button
onClick={() => handleStatClick(statKey)}
className={`bg-white rounded-lg shadow p-4 border-l-4 ${color} hover:shadow-lg transition-all duration-200 text-left w-full ${activeStatFilter === statKey ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
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
{/* Header */}
<div className="bg-white shadow-sm border-b">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
<div className="flex justify-between items-center">
<div>
<h1 className="text-2xl font-bold text-gray-900">Visitor Management System</h1>
<p className="text-sm text-gray-600 mt-1">Admin Dashboard</p>
</div>
<div className="flex items-center gap-4">
<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
<Download className="w-4 h-4" />
Export Report
</button>
</div>
</div>
</div>
</div>


  {/* Stats Overview */}
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    {/* Active Filter Banner */}
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
        title="Active Now"
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
          {['overview', 'visitors', 'residents', 'security', 'activity'].map((tab) => (
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
              {activities.slice(0, 10).map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div className="mt-1">{getTypeIcon(activity.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{activity.action}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          By: {activity.user} | Visitor: {activity.visitor} | Unit: {activity.unit}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">{activity.time}</p>
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

        {activeTab === 'visitors' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Visitor List {activeStatFilter && '(${filteredData.length} results)'}
              </h3>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Register New Visitor
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="text-left p-3 text-sm font-semibold text-gray-700">Visitor Name</th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-700">Phone</th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-700">Unit</th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-700">Host</th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-700">Purpose</th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-700">Check In</th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((visitor) => (
                    <tr key={visitor.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 text-sm font-medium">{visitor.name}</td>
                      <td className="p-3 text-sm text-gray-600">{visitor.phone}</td>
                      <td className="p-3 text-sm">{visitor.unit}</td>
                      <td className="p-3 text-sm">{visitor.host}</td>
                      <td className="p-3 text-sm">{visitor.purpose}</td>
                      <td className="p-3 text-sm">{visitor.checkIn}</td>
                      <td className="p-3 text-sm">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(visitor.status)}`}>
                          {visitor.status}
                        </span>
                      </td>
                      <td className="p-3 text-sm">
                        <button className="text-blue-600 hover:text-blue-800">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
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
                Resident Management {activeStatFilter === 'residents' && '(${filteredData.length} results)'}
              </h3>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Add Resident
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="text-left p-3 text-sm font-semibold text-gray-700">Name</th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-700">Unit</th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-700">Phone</th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-700">Email</th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-700">Total Visitors</th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(activeStatFilter === 'residents' ? filteredData : residents).map((resident) => (
                    <tr key={resident.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 text-sm font-medium">{resident.name}</td>
                      <td className="p-3 text-sm">{resident.unit}</td>
                      <td className="p-3 text-sm text-gray-600">{resident.phone}</td>
                      <td className="p-3 text-sm text-gray-600">{resident.email}</td>
                      <td className="p-3 text-sm">{resident.visitors}</td>
                      <td className="p-3 text-sm">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(resident.status)}`}>
                          {resident.status}
                        </span>

                      </td>
                      <td className="p-3 text-sm">
                        <button className="text-blue-600 hover:text-blue-800">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Security Staff {activeStatFilter === 'securityStaff' && '(${filteredData.length} results)'}
              </h3>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Add Staff Member
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="text-left p-3 text-sm font-semibold text-gray-700">Name</th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-700">Shift</th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-700">Phone</th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-700">Activities Today</th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(activeStatFilter === 'securityStaff' ? filteredData : securityStaff).map((staff) => (
                    <tr key={staff.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 text-sm font-medium">{staff.name}</td>
                      <td className="p-3 text-sm">{staff.shift}</td>
                      <td className="p-3 text-sm text-gray-600">{staff.phone}</td>
                      <td className="p-3 text-sm">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(staff.status)}`}>
                          {staff.status}
                        </span>
                      </td>
                      <td className="p-3 text-sm">{staff.activities}</td>
                      <td className="p-3 text-sm">
                        <button className="text-blue-600 hover:text-blue-800">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
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
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div className="mt-1">{getTypeIcon(activity.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{activity.action}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          By: {activity.user} | Visitor: {activity.visitor} | Unit: {activity.unit}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">{activity.time}</p>
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