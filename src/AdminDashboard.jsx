// src/AdminDashboard.jsx
import React, { useState } from 'react';
import {
  Users, Activity, UserPlus, Shield, Menu, Home, ClipboardList, 
  UserCheck, Ban, X
} from 'lucide-react';

const SOCIETY_NAME = "Harmony Residency";

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

  const stats = {
    totalVisitors: visitors.length,
    activeVisitors: visitors.filter(v => v?.status === "inside").length,
    residents: residents.length,
    securityStaff: securityGuards.length
  };

  const activityList = (activities || []).sort((a, b) => {
    const dateA = new Date(a.createdAt || a.timestamp || 0);
    const dateB = new Date(b.createdAt || b.timestamp || 0);
    return dateB - dateA;
  });

  const insideVisitors = visitors.filter(v => v?.status === "inside");
  const rejectedVisitors = visitors.filter(v => v?.status === "rejected");

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

        {/* Stats Cards */}
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

        {/* Content Area */}
        <div className="p-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h3 className="text-2xl font-semibold mb-6 text-gray-900">
              {activeTab === 'overview' && 'Recent Activity'}
              {activeTab === 'visitors' && `All Visitors (${visitors.length})`}
              {activeTab === 'approvals' && `Pre-Approved Visitors (${approvals.length})`}
              {activeTab === 'inside' && `Currently Inside (${insideVisitors.length})`}
              {activeTab === 'residents' && `Residents (${residents.length})`}
              {activeTab === 'security' && `Security Staff (${securityGuards.length})`}
              {activeTab === 'activity' && 'Activity Log'}
              {activeTab === 'rejected' && `Rejected Visitors (${rejectedVisitors.length})`}
            </h3>

            {/* Overview/Activity */}
            {(activeTab === 'overview' || activeTab === 'activity') && (
              <div className="space-y-3">
                {activityList.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No activity recorded yet</p>
                ) : (
                  activityList.slice(0, 15).map((activity) => (
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
                {visitors.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No visitors found</p>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="p-3 text-left text-sm font-semibold">Name</th>
                        <th className="p-3 text-left text-sm font-semibold">Flat</th>
                        <th className="p-3 text-left text-sm font-semibold">Purpose</th>
                        <th className="p-3 text-left text-sm font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visitors.map(v => (
                        <tr key={v.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">{v.name}</td>
                          <td className="p-3">{v.flat}</td>
                          <td className="p-3">{v.purpose}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 text-xs rounded ${getStatusColor(v.status)}`}>
                              {v.status}
                            </span>
                          </td>
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
                {approvals.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No pre-approved visitors</p>
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
                      {approvals.map(a => (
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
                  <p className="text-gray-500 text-center py-8">No visitors currently inside</p>
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
                {residents.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No residents registered</p>
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
                      {residents.map(r => (
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
                {securityGuards.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No security staff registered</p>
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
                      {securityGuards.map(s => (
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
                  <p className="text-gray-500 text-center py-8">No rejected visitors</p>
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