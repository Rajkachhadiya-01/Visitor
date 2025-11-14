// src/AdminDashboard.jsx
import React, { useState } from 'react';
import {
  Users, Activity, UserPlus, Search, CheckCircle, XCircle,
  Shield, Menu, Home, ClipboardList, UserCheck, Ban, X
} from 'lucide-react';

const SOCIETY_NAME = "Harmony Residency";
export default function AdminDashboard({
  visitors = [],
  approvals = [],
  residents = [],
  securityGuards = [],
  activities = [],
  adminData = {},
  onRejectVisitor,
  onLogout
}) {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');  // default = All Time
  const [sidebarOpen, setSidebarOpen] = useState(false);

  console.log("📊 Admin Dashboard Data:", {
    visitors: visitors.length,
    approvals: approvals.length,
    residents: residents.length,
    security: securityGuards.length,
    activities: activities.length
  });

  const activityList = (activities || []).sort((a, b) => {
  const dateA = new Date(a.createdAt || a.timestamp || 0);
  const dateB = new Date(b.createdAt || b.timestamp || 0);
  return dateB - dateA;
});

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

  // Helper functions
  const getFilteredByDate = (data) => {
  if (!dateFilter || dateFilter === "all") return data || [];

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  return (data || []).filter(item => {
    const itemDateStr = item?.checkIn || item?.date || item?.timestamp || item?.requestTime || item?.createdAt;
    if (!itemDateStr) return dateFilter === "all";

    const itemDate = new Date(itemDateStr);
    itemDate.setHours(0, 0, 0, 0);

    if (dateFilter === "today") {
      return itemDate.getTime() === now.getTime();
    }
    if (dateFilter === "week") {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return itemDate >= weekAgo;
    }
    if (dateFilter === "month") {
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return itemDate >= monthAgo;
    }

    return true;
  });
};

  const getFilteredData = () => {
    let data = visitors || [];
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      data = data.filter(v =>
        (v?.name && v.name.toLowerCase().includes(q)) ||
        (v?.flat && v.flat.toLowerCase().includes(q)) ||
        (v?.phone && v.phone.includes(q)) ||
        (v?.purpose && v.purpose.toLowerCase().includes(q))
      );
    }
    if (filterType !== "all") data = data.filter(v => v?.status === filterType);
    return getFilteredByDate(data);
  };

  const getStatusColor = (status) => {
    const s = (status || "").toString().toLowerCase();
    if (s.includes("approved") || s.includes("inside")) return "bg-green-100 text-green-800";
    if (s.includes("reject")) return "bg-red-100 text-red-800";
    if (s.includes("pending") || s.includes("await")) return "bg-yellow-100 text-yellow-800";
    if (s.includes("arrived") || s.includes("gate")) return "bg-blue-100 text-blue-800";
    if (s === "out" || s === "checked out") return "bg-gray-200 text-gray-700";
    return "bg-gray-100 text-gray-600";
  };

  const getTypeIcon = (type) => {
    switch ((type || "").toString().toLowerCase()) {
      case "entry": return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "exit": return <XCircle className="w-4 h-4 text-red-600" />;
      case "registration": return <UserPlus className="w-4 h-4 text-blue-600" />;
      case "update": return <Activity className="w-4 h-4 text-purple-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  // UI Components
  const StatCard = ({ title, value, color, icon: Icon }) => (
    <div className={`bg-white p-6 rounded-xl shadow-sm border-l-4 ${color} hover:shadow-md transition-shadow duration-200`}>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-600 font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        {Icon && <Icon className="w-10 h-10 text-gray-400" />}
      </div>
    </div>
  );

  const EmptyState = ({ icon: Icon, message }) => (
    <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 text-center">
      {Icon && <Icon className="w-16 h-16 text-gray-300 mx-auto mb-4" />}
      <p className="text-gray-500 text-lg">{message}</p>
    </div>
  );

  const Sidebar = (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-white shadow-lg rounded-lg p-2 border border-gray-200"
      >
        <Menu className="w-6 h-6 text-gray-700" />
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 w-64 h-full bg-gradient-to-b from-indigo-700 to-indigo-900 text-white shadow-2xl
          transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static`}
      >
        <div className="h-full py-6 px-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-8 px-2">
            <h1 className="text-2xl font-bold">{SOCIETY_NAME}</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white hover:bg-indigo-600 p-1 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-2">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => {
                  setActiveTab(key);
                  setSidebarOpen(false);
                }}
                className={`flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium transition-all
                  ${
                    activeTab === key
                      ? "bg-white text-indigo-700 shadow-lg"
                      : "text-white hover:bg-indigo-600"
                  }
                `}
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
    </>
  );

  const Overlay = sidebarOpen ? (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" 
      onClick={() => setSidebarOpen(false)} 
    />
  ) : null;

  const PageHeader = (
    <div className="bg-white shadow-sm p-6 border-b">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back, {adminData?.name || "Rajesh Patel"}</p>
        </div>
        <button
          onClick={onLogout}
          className="lg:hidden px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
        >
          Logout
        </button>
      </div>
    </div>
  );

  const filteredData = getFilteredData();

  const stats = {
    totalVisitors: (visitors || []).length,
    activeVisitors: (visitors || []).filter(v => v?.status === "inside").length,
    residents: (residents || []).length,
    securityStaff: (securityGuards || []).length
  };

  const StatsSection = (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
      <StatCard title="Total Visitors" value={stats.totalVisitors} color="border-blue-500" icon={Users} />
      <StatCard title="Inside Now" value={stats.activeVisitors} color="border-green-500" icon={Activity} />
      <StatCard title="Residents" value={stats.residents} color="border-purple-500" icon={Users} />
      <StatCard title="Security Staff" value={stats.securityStaff} color="border-orange-500" icon={Shield} />
    </div>
  );

  const FiltersSection = (
    <div className="bg-white border-y p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, flat, or phone..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select 
          className="border border-gray-300 rounded-lg px-4 py-2.5 bg-white focus:ring-2 focus:ring-indigo-500" 
          value={filterType} 
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="inside">Inside</option>
          <option value="out">Checked Out</option>
          <option value="rejected">Rejected</option>
        </select>

        <select 
          className="border border-gray-300 rounded-lg px-4 py-2.5 bg-white focus:ring-2 focus:ring-indigo-500" 
          value={dateFilter} 
          onChange={(e) => setDateFilter(e.target.value)}
        >
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="all">All Time</option>
        </select>
      </div>
    </div>
  );

  // Content Blocks
  const OverviewBlock = (
    <div>
      <h3 className="text-2xl font-semibold mb-6 text-gray-900">Recent Activity</h3>
      {activityList.length === 0 ? (
        <EmptyState icon={Activity} message="No activity recorded yet" />
      ) : (
        <div className="space-y-3">
          {activityList.slice(0, 15).map((activity) => (
            <div key={activity.id} className="p-5 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">{getTypeIcon(activity.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-lg">{activity.action}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {activity.performedBy} • Visitor: {activity.visitorName} • Flat: {activity.flat}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {activity.timestamp || 'N/A'} • {activity.date}
                  </p>
                </div>
                <span className={`px-3 py-1 text-xs rounded-full whitespace-nowrap font-medium ${getStatusColor(activity.status)}`}>
                  {activity.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const VisitorsBlock = (
    <div>
      <h3 className="text-2xl font-semibold mb-6">All Visitors ({filteredData.length})</h3>
      {filteredData.length === 0 ? (
        <EmptyState icon={Users} message="No visitors found" />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-4 text-left text-sm font-semibold text-gray-700">Photo</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-700">Phone</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-700">Flat</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-700">Purpose</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-700">Check In</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map(visitor => (
                  <tr key={visitor.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="p-4">
                      {visitor.photo ? (
                        <img src={visitor.photo} className="w-12 h-12 rounded-lg object-cover border-2 border-gray-200" alt={visitor.name} />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 flex items-center justify-center rounded-lg text-xs text-gray-500">
                          No Photo
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-900">{visitor.name}</td>
                    <td className="p-4 text-sm text-gray-600">{visitor.phone}</td>
                    <td className="p-4 text-sm text-gray-600">{visitor.flat}</td>
                    <td className="p-4 text-sm text-gray-600">{visitor.purpose}</td>
                    <td className="p-4 text-sm text-gray-600">{visitor.checkIn}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(visitor.status)}`}>
                        {visitor.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const ApprovalsBlock = (
    <div>
      <h3 className="text-2xl font-semibold mb-6">Pre-Approved Visitors ({approvals.length})</h3>
      {approvals.length === 0 ? (
        <EmptyState icon={ClipboardList} message="No pre-approved visitors" />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-4 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-700">Flat</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-700">Type</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-700">Frequency</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-700">Code</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredByDate(approvals).map(approval => (
                  <tr key={approval.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="p-4 text-sm font-medium text-gray-900">{approval.name}</td>
                    <td className="p-4 text-sm text-gray-600">{approval.flat}</td>
                    <td className="p-4 text-sm text-gray-600">{approval.type}</td>
                    <td className="p-4 text-sm text-gray-600">{approval.frequency}</td>
                    <td className="p-4 text-sm font-mono text-gray-600">{approval.preApprovalCode || 'N/A'}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                        approval.arrivalStatus === 'Arrived at Gate' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {approval.arrivalStatus || approval.status || "Awaiting"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const InsideBlock = (
    <div>
      <h3 className="text-2xl font-semibold mb-6">
        Currently Inside ({visitors.filter(v => v.status === "inside").length})
      </h3>
      {visitors.filter(v => v.status === "inside").length === 0 ? (
        <EmptyState icon={UserCheck} message="No visitors inside currently" />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-4 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-700">Phone</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-700">Flat</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-700">Purpose</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-700">Entry Time</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {visitors.filter(v => v.status === "inside").map(visitor => (
                  <tr key={visitor.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="p-4 text-sm font-medium text-gray-900">{visitor.name}</td>
                    <td className="p-4 text-sm text-gray-600">{visitor.phone}</td>
                    <td className="p-4 text-sm text-gray-600">{visitor.flat}</td>
                    <td className="p-4 text-sm text-gray-600">{visitor.purpose}</td>
                    <td className="p-4 text-sm text-gray-600">{visitor.checkIn}</td>
                    <td className="p-4">
                      <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-800 font-medium">
                        Inside
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const ResidentsBlock = (
    <div>
      <h3 className="text-2xl font-semibold mb-6">Residents ({residents.length})</h3>
      {residents.length === 0 ? (
        <EmptyState icon={UserPlus} message="No residents registered" />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-4 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-700">Flat</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-700">Phone</th>
                </tr>
              </thead>
              <tbody>
                {residents.map(r => (
                  <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="p-4 text-sm font-medium text-gray-900">{r.name}</td>
                    <td className="p-4 text-sm text-gray-600">{r.flat}</td>
                    <td className="p-4 text-sm text-gray-600">{r.mobile}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const SecurityBlock = (
    <div>
      <h3 className="text-2xl font-semibold mb-6">Security Staff ({securityGuards.length})</h3>
      {securityGuards.length === 0 ? (
        <EmptyState icon={Shield} message="No security staff registered" />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-4 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-700">Gate Assignment</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-700">Phone</th>
                </tr>
              </thead>
              <tbody>
                {securityGuards.map(r => (
                  <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="p-4 text-sm font-medium text-gray-900">{r.name}</td>
                    <td className="p-4 text-sm text-gray-600">{r.gate}</td>
                    <td className="p-4 text-sm text-gray-600">{r.mobile}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const RejectedBlock = (
    <div>
      <h3 className="text-2xl font-semibold mb-6">
        Rejected Visitors ({visitors.filter(v => v.status === "rejected").length})
      </h3>
      {visitors.filter(v => v.status === "rejected").length === 0 ? (
        <EmptyState icon={Ban} message="No rejected visitors" />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-4 text-left text-sm font-semibold text-gray-700">Photo</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-700">Phone</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-700">Flat</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-700">Purpose</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-700">Rejected At</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {visitors.filter(v => v.status === "rejected").map(v => (
                  <tr key={v.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="p-4">
                      {v.photo ? (
                        <img src={v.photo} className="w-12 h-12 rounded-lg object-cover border-2 border-gray-200" alt={v.name} />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 flex items-center justify-center rounded-lg text-xs text-gray-500">
                          No Photo
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-900">{v.name}</td>
                    <td className="p-4 text-sm text-gray-600">{v.phone}</td>
                    <td className="p-4 text-sm text-gray-600">{v.flat}</td>
                    <td className="p-4 text-sm text-gray-600">{v.purpose}</td>
                    <td className="p-4 text-sm text-gray-600">{v.checkOut || v.checkIn}</td>
                    <td className="p-4">
                      <span className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-800 font-medium">
                        Rejected
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const ActivityBlock = OverviewBlock;

  // Final Render
  return (
    <div className="flex min-h-screen bg-gray-50">
      {Sidebar}
      {Overlay}

      <div className="flex-1 min-w-0">
        {PageHeader}
        {StatsSection}
        {FiltersSection}

        <div className="p-6">
          {activeTab === "overview" && OverviewBlock}
          {activeTab === "visitors" && VisitorsBlock}
          {activeTab === "approvals" && ApprovalsBlock}
          {activeTab === "inside" && InsideBlock}
          {activeTab === "residents" && ResidentsBlock}
          {activeTab === "security" && SecurityBlock}
          {activeTab === "activity" && ActivityBlock}
          {activeTab === "rejected" && RejectedBlock}
        </div>
      </div>
    </div>
  );
}