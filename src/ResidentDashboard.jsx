// src/ResidentDashboard.jsx - Updated with History Filters
import React, { useState } from 'react';
import { Bell, UserPlus, CheckCircle, Clock, Calendar } from 'lucide-react';

const SOCIETY_NAME = "Harmony Residency";

/**
 * Resident Dashboard Component
 * Displays visitor management interface for residents
 */
const ResidentDashboard = ({
  visitors = [],
  approvals = [],
  currentResident,
  residentInfo,
  onLogout,
  onAddApproval,
  onApproveVisitor,
  onRejectVisitor,
  onCancelApproval,
  notifications = [],
  onDismissNotification
}) => {
  // Filter states for visitor history
  const [statusFilter, setStatusFilter] = useState('all'); // all, inside, out, other
  const [timeFilter, setTimeFilter] = useState('today'); // today, yesterday, week, month, custom
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);

  // Filter visitors for current resident
  const myVisitors = visitors.filter(v => v.flat === currentResident);
  const myApprovals = approvals.filter(a =>
    a.flat === currentResident &&
    a.approved &&
    a.status === 'Pre-Approved' &&
    (!a.arrivalStatus || a.arrivalStatus === 'Not Arrived Yet')
  );
  const pendingVisitors = visitors.filter(v => v.flat === currentResident && v.status === 'pending');
  const inside = myVisitors.filter(v => v.status === 'inside').length;
  const cancelledApprovals = approvals.filter(a =>
    a.flat === currentResident &&
    (a.status === 'Cancelled' || a.arrivalStatus === 'Expired' || a.arrivalStatus === 'Cancelled by Resident')
  );

  /**
   * Filter visitors by time range
   */
  const filterByTime = (visitorList) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    return visitorList.filter(v => {
      const visitorDate = v.createdAt ? new Date(v.createdAt) : new Date();
      
      switch (timeFilter) {
        case 'today':
          return visitorDate >= today;
        case 'yesterday':
          return visitorDate >= yesterday && visitorDate < today;
        case 'week':
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return visitorDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return visitorDate >= monthAgo;
        case 'custom':
          if (customDateRange.start && customDateRange.end) {
            const start = new Date(customDateRange.start);
            const end = new Date(customDateRange.end);
            end.setHours(23, 59, 59, 999);
            return visitorDate >= start && visitorDate <= end;
          }
          return true;
        default:
          return true;
      }
    });
  };

  /**
   * Get filtered history based on status and time
   */
  const getFilteredHistory = () => {
    let filtered = [];

    switch (statusFilter) {
      case 'inside':
        filtered = myVisitors.filter(v => v.status === 'inside');
        break;
      case 'out':
        filtered = myVisitors.filter(v => v.status === 'out');
        break;
      case 'other':
        filtered = [...myVisitors.filter(v => v.status === 'rejected'), ...cancelledApprovals];
        break;
      case 'all':
      default:
        filtered = [...myVisitors, ...cancelledApprovals];
        break;
    }

    return filterByTime(filtered);
  };

  const filteredHistory = getFilteredHistory();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-indigo-600 text-white p-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{SOCIETY_NAME}</h1>
            <h2 className="text-xl">Resident Dashboard</h2>
            <p>Flat {currentResident} - {residentInfo?.name || 'Resident'}</p>
          </div>
          <button onClick={onLogout} className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold">
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Pending Visitors Alert */}
        {pendingVisitors.length > 0 && (
          <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-6 rounded-lg">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-600 animate-pulse" />
              <p className="font-semibold text-orange-800">
                {pendingVisitors.length} visitor(s) waiting at gate for your approval!
              </p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-6 rounded-xl shadow">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Today's Visitors</p>
                <p className="text-2xl font-bold">{myVisitors.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <UserPlus className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Active Approvals</p>
                <p className="text-2xl font-bold">{myApprovals.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Currently Inside</p>
                <p className="text-2xl font-bold">{inside}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Visitors Waiting for Approval */}
        {pendingVisitors.length > 0 && (
          <div className="bg-white rounded-xl shadow mb-6">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Visitors Waiting for Approval</h2>
            </div>
            <div className="p-6 space-y-3">
              {pendingVisitors.map(v => (
                <div key={v.id} className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-4 mb-3">
                    {v.photo && (
                      <img
                        src={v.photo}
                        alt={v.name}
                        className="w-16 h-16 rounded-lg object-cover border-2 border-gray-300"
                      />
                    )}
                    <div>
                      <p className="font-semibold text-lg">{v.name}</p>
                      <p className="text-sm text-gray-600">Phone: {v.phone}</p>
                      <p className="text-sm text-gray-600">Purpose: {v.purpose}</p>
                      <p className="text-xs text-gray-500">Arrived: {v.checkIn}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onApproveVisitor(v.id)}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700"
                    >
                      Approve Entry
                    </button>
                    <button
                      onClick={() => onRejectVisitor(v.id)}
                      className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700"
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
        <div className="bg-white rounded-xl shadow mb-6">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold">Pre-Approved Visitors</h2>
            <button
              onClick={onAddApproval}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700"
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
                    <div className="flex justify-between items-start mb-2">
                      <div>
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
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
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
                      className="mt-3 bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-semibold w-full hover:bg-red-700"
                    >
                      Cancel
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Visitor History with Filters */}
        <div className="bg-white rounded-xl shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold mb-4">Visitor History</h2>
            
            {/* Status Filter */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  statusFilter === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('inside')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  statusFilter === 'inside'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Inside
              </button>
              <button
                onClick={() => setStatusFilter('out')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  statusFilter === 'out'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Out
              </button>
              <button
                onClick={() => setStatusFilter('other')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  statusFilter === 'other'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Other
              </button>
            </div>

            {/* Time Filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => { setTimeFilter('today'); setShowCustomDatePicker(false); }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  timeFilter === 'today'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => { setTimeFilter('yesterday'); setShowCustomDatePicker(false); }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  timeFilter === 'yesterday'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Yesterday
              </button>
              <button
                onClick={() => { setTimeFilter('week'); setShowCustomDatePicker(false); }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  timeFilter === 'week'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                This Week
              </button>
              <button
                onClick={() => { setTimeFilter('month'); setShowCustomDatePicker(false); }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  timeFilter === 'month'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                This Month
              </button>
              <button
                onClick={() => { setTimeFilter('custom'); setShowCustomDatePicker(true); }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1 ${
                  timeFilter === 'custom'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Calendar className="w-4 h-4" />
                Custom
              </button>
            </div>

            {/* Custom Date Picker */}
            {showCustomDatePicker && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg flex gap-4 items-center">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={customDateRange.start}
                    onChange={(e) => setCustomDateRange({ ...customDateRange, start: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={customDateRange.end}
                    onChange={(e) => setCustomDateRange({ ...customDateRange, end: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="p-6 space-y-3">
            {filteredHistory.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No records found</p>
            ) : (
              filteredHistory.map(item => {
                // Check if item is a visitor or approval
                const isVisitor = item.name && item.phone;
                
                return (
                  <div
                    key={item.id}
                    className={`flex justify-between items-center p-4 rounded-lg ${
                      item.status === 'inside'
                        ? 'bg-green-50'
                        : item.status === 'out'
                        ? 'bg-gray-50'
                        : 'bg-red-50'
                    }`}
                  >
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      {isVisitor ? (
                        <>
                          <p className="text-sm text-gray-600">Purpose: {item.purpose}</p>
                          <p className="text-xs text-gray-500">
                            In: {item.checkIn} {item.checkOut && `| Out: ${item.checkOut}`}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm text-gray-600">Pre-Approval</p>
                          <p className="text-xs text-gray-500">
                            Code: {item.preApprovalCode} • {item.cancelledAt ? `Cancelled: ${item.cancelledAt}` : 'Expired'}
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
                          : 'bg-red-200 text-red-700'
                      }`}
                    >
                      {item.status === 'inside'
                        ? 'Inside'
                        : item.status === 'out'
                        ? 'Checked Out'
                        : item.arrivalStatus === 'Expired'
                        ? 'Expired'
                        : item.status === 'rejected'
                        ? 'Rejected'
                        : 'Cancelled'}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Notification Container */}
      {notifications.length > 0 && (
        <div className="fixed top-20 right-4 z-50 space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="bg-white rounded-lg shadow-2xl border-l-4 border-orange-500 p-4 w-96"
            >
              <div className="flex items-start gap-3">
                <div className="bg-orange-100 p-2 rounded-full flex-shrink-0">
                  <Bell className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">{notification.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{notification.visitorName}</p>
                </div>
                <button
                  onClick={() => onDismissNotification(notification.id)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResidentDashboard;