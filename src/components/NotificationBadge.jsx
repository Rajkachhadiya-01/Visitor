// src/components/NotificationBadge.jsx
import React, { useState } from 'react';
import { Bell, Check, Clock, User, Phone, MapPin, Building } from 'lucide-react';
import { markNotificationAsRead, markMultipleNotificationsAsRead } from '../utils/notificationService';

/**
 * Notification Badge Component
 * Shows unread count and displays notification list
 */
export const NotificationBadge = ({ 
  notifications = [], 
  userRole = 'resident',
  onNotificationRead 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => n.status === true).length;

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      if (onNotificationRead) {
        onNotificationRead(notificationId);
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadIds = notifications
        .filter(n => n.status === true)
        .map(n => n.id);
      
      if (unreadIds.length > 0) {
        await markMultipleNotificationsAsRead(unreadIds);
        if (onNotificationRead) {
          unreadIds.forEach(id => onNotificationRead(id));
        }
      }
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  return (
    <div className="relative">
      {/* Bell Icon with Badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition"
      >
        <Bell className="w-6 h-6 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Notification Panel */}
          <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-[80vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-blue-50">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
                <p className="text-sm text-gray-600">
                  {unreadCount} unread {unreadCount === 1 ? 'message' : 'messages'}
                </p>
              </div>
              
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700 transition flex items-center gap-1"
                >
                  <Check className="w-3 h-3" />
                  Mark all read
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition ${
                        notification.status ? 'bg-blue-50' : 'bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-full ${
                            notification.status 
                              ? 'bg-orange-100' 
                              : 'bg-gray-100'
                          }`}>
                            <Bell className={`w-4 h-4 ${
                              notification.status 
                                ? 'text-orange-600' 
                                : 'text-gray-400'
                            }`} />
                          </div>
                          <h4 className="font-semibold text-gray-900">
                            {notification.requestType === 'visitor-checkin' 
                              ? 'Visitor at Gate' 
                              : 'Pre-Approved Visitor'}
                          </h4>
                        </div>

                        {notification.status && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            Mark read
                          </button>
                        )}
                      </div>

                      <div className="space-y-1.5 ml-10">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="font-semibold text-gray-900">
                            {notification.visitorName}
                          </span>
                        </div>

                        {notification.mobileNumber && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span>{notification.mobileNumber}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span>
                            Flat {notification.flatNumber}
                            {notification.ownerName && ` - ${notification.ownerName}`}
                          </span>
                        </div>

                        {(notification.purpose || notification.type) && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Building className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span>{notification.purpose || notification.type}</span>
                          </div>
                        )}

                        {notification.vehicleNumber && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="text-gray-400">🚗</span>
                            <span>{notification.vehicleNumber}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                          <Clock className="w-3 h-3" />
                          <span>{notification.receivedTime}</span>
                        </div>
                      </div>

                      {notification.status && (
                        <div className="mt-3 ml-10">
                          <span className="inline-block px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                            New
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};