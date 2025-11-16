// src/SecurityDashboard.jsx
import React, { useState } from 'react';
import {
  Users, UserPlus, Search, CheckCircle, XCircle, Clock, Bell, Calendar} from 'lucide-react';

const SOCIETY_NAME = "Harmony Residency";

/**
 * Security Dashboard Component
 * Displays visitor management interface for security personnel
 */
const SecurityDashboard = ({
  visitors = [],
  approvals = [],
  securityData,
  onLogout,
  onCheckIn,
  onSearch,
  onCheckOut,
  onMarkArrived,
  notifications = [],
  onDismissNotification
}) => {
  // Filter states for visitor history
  const [statusFilter, setStatusFilter] = useState('all'); // all, inside, out, other
  const [timeFilter, setTimeFilter] = useState('today'); // today, yesterday, week, month, custom
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);

  // Calculate stats
  const inside = visitors.filter(v => v.status === 'inside');
  const pending = visitors.filter(v => v.status === 'pending');
  const pendingApprovals = approvals.filter(a =>
    a.approved &&
    a.status === 'Pre-Approved' &&
    (!a.arrivalStatus || a.arrivalStatus === 'Not Arrived Yet')
  );
  const cancelledApprovals = approvals.filter(a =>
    a.status === 'Cancelled' || a.arrivalStatus === 'Expired' || a.arrivalStatus === 'Cancelled by Resident'
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
        filtered = visitors.filter(v => v.status === 'inside');
        break;
      case 'out':
        filtered = visitors.filter(v => v.status === 'out');
        break;
      case 'other':
        filtered = [...visitors.filter(v => v.status === 'rejected'), ...cancelledApprovals];
        break;
      case 'all':
      default:
        filtered = [...visitors, ...cancelledApprovals];
        break;
    }

    return filterByTime(filtered);
  };

  const filteredHistory = getFilteredHistory();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-800 text-white p-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{SOCIETY_NAME}</h1>
            <h2 className="text-xl">Security Dashboard</h2>
            <p>{securityData?.name || 'Security'} - {securityData?.gate || 'Main Gate'}</p>
          </div>
          <button onClick={onLogout} className="bg-white text-gray-800 px-4 py-2 rounded-lg font-semibold">
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Alerts */}
        {pending.length > 0 && (
          <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-6 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <p className="font-semibold text-orange-800">
                {pending.length} visitor(s) waiting for resident approval
              </p>
            </div>
          </div>
        )}

        {pendingApprovals.length > 0 && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded-lg">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" />
              <p className="font-semibold text-blue-800">
                {pendingApprovals.length} pre-approved visitor(s) awaiting arrival
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={onCheckIn}
            className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-xl shadow flex items-center justify-center gap-3"
          >
            <UserPlus className="w-8 h-8" />
            <span className="text-xl font-bold">Check-In Visitor</span>
          </button>

          <button
            onClick={onSearch}
            className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-xl shadow flex items-center justify-center gap-3"
          >
            <Search className="w-8 h-8" />
            <span className="text-xl font-bold">Search Visitor</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-xl shadow">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Pending</p>
                <p className="text-2xl font-bold">{pending.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Inside Now</p>
                <p className="text-2xl font-bold">{inside.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Total Today</p>
                <p className="text-2xl font-bold">{visitors.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-3 rounded-lg">
                <XCircle className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Checked Out</p>
                <p className="text-2xl font-bold">{visitors.filter(v => v.status === 'out').length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Waiting for Approval */}
        {pending.length > 0 && (
          <div className="bg-white rounded-xl shadow mb-6">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Waiting for Approval</h2>
            </div>
            <div className="p-6 space-y-3">
              {pending.map(v => (
                <div key={v.id} className="flex justify-between items-center p-4 bg-orange-50 rounded-lg border border-orange-200">
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
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                    Waiting Approval
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pre-Approvals Awaiting Arrival */}
        {pendingApprovals.length > 0 && (
          <div className="bg-white rounded-xl shadow mb-6">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Pre-Approvals Awaiting Arrival</h2>
              <p className="text-sm text-gray-600 mt-1">Verify code when visitor arrives</p>
            </div>
            <div className="p-6 space-y-3">
              {pendingApprovals.map(a => (
                <div key={a.id} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <p className="font-semibold text-lg">{a.name}</p>
                      <p className="text-sm text-gray-600 mt-1">Flat: {a.flat} • {a.type} • {a.frequency}</p>
                      <p className="text-xs text-gray-500 mt-1">Expected: {a.requestTime}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 whitespace-nowrap ml-2">
                      {a.arrivalStatus || 'Not Arrived Yet'}
                    </span>
                  </div>
                  {(!a.arrivalStatus || a.arrivalStatus === 'Not Arrived Yet') && (
                    <div>
                      <input
                        type="text"
                        maxLength="6"
                        placeholder="Enter 6-digit code"
                        className="w-full mb-2 px-3 py-2 border rounded-lg text-center tracking-widest"
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
                        className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition"
                      >
                        ✓ Verify & Allow Entry
                      </button>
                      <p className="text-xs text-gray-500 mt-1 text-center">
                        Code required for entry verification
                      </p>
                    </div>
                  )}
                  {a.arrivalStatus === 'Arrived at Gate' && (
                    <div className="w-full bg-green-50 text-green-700 py-2 rounded-lg font-semibold text-center border border-green-200">
                      ✓ Visitor has arrived at gate
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Visitor History with Filters */}
        <div className="bg-white rounded-xl shadow mt-6">
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
                          <p className="text-sm text-gray-600">Flat: {item.flat} • {item.purpose}</p>
                          <p className="text-xs text-gray-500">
                            In: {item.checkIn} {item.checkOut && `| Out: ${item.checkOut}`}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm text-gray-600">Pre-Approval • Flat: {item.flat}</p>
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
              className="bg-white rounded-lg shadow-2xl border-l-4 border-blue-500 p-4 w-96"
            >
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-full flex-shrink-0">
                  <Bell className="w-5 h-5 text-blue-600" />
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

export default SecurityDashboard;