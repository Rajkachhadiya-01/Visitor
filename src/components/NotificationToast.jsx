// src/components/NotificationToast.jsx
import React, { useEffect } from 'react';
import { Bell, User, Clock, Building, X, MapPin, Phone, CheckCircle, AlertCircle } from 'lucide-react';

/**
 * NotificationToast Component
 * Displays individual notification or toast message
 * @param {Object} notification - Notification data
 * @param {Function} onDismiss - Callback to dismiss notification
 */
export const NotificationToast = ({ notification, onDismiss }) => {
  useEffect(() => {
    // Auto dismiss after set time
    const dismissTime = notification.isToast ? 3000 : 8000;
    const timer = setTimeout(() => {
      onDismiss(notification.id);
    }, dismissTime);

    return () => clearTimeout(timer);
  }, [notification.id, notification.isToast, onDismiss]);

  // If it's a simple toast message (login success, etc.)
  if (notification.isToast) {
    const isSuccess = notification.type === 'success';
    
    return (
      <div
        className={`rounded-lg shadow-2xl border-l-4 p-4 mb-3 animate-slide-in w-96 ${
          isSuccess 
            ? 'bg-green-50 border-green-500' 
            : 'bg-red-50 border-red-500'
        }`}
        style={{ animation: 'slideIn 0.3s ease-out' }}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full flex-shrink-0 ${
            isSuccess ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {isSuccess ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className={`font-semibold ${
              isSuccess ? 'text-green-800' : 'text-red-800'
            }`}>
              {notification.title}
            </p>
          </div>

          <button 
            onClick={() => onDismiss(notification.id)}
            className={`transition ${
              isSuccess 
                ? 'text-green-400 hover:text-green-600' 
                : 'text-red-400 hover:text-red-600'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // Regular notification with visitor details
  return (
    <div
      className="bg-white rounded-lg shadow-2xl border-l-4 border-orange-500 p-4 mb-3 animate-slide-in w-96"
      style={{ animation: 'slideIn 0.3s ease-out' }}
    >
      <div className="flex items-start gap-3">
        <div className="bg-orange-100 p-2 rounded-full flex-shrink-0">
          <Bell className="w-5 h-5 text-orange-600" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold text-gray-900">
              {notification.title}
            </h3>
            <button 
              onClick={() => onDismiss(notification.id)}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="font-semibold text-gray-900">{notification.visitorName}</span>
            </div>

            {notification.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>{notification.phone}</span>
              </div>
            )}

            {notification.flat && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>Flat {notification.flat}</span>
              </div>
            )}

            {notification.purpose && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Building className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>{notification.purpose}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
              <Clock className="w-3 h-3" />
              <span>{notification.timestamp}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * NotificationContainer Component
 * Container for all notifications with responsive positioning
 * @param {Array} notifications - Array of notifications to display
 * @param {Function} onDismiss - Callback to dismiss notification
 */
export const NotificationContainer = ({ notifications, onDismiss }) => {
  return (
    <>
      {/* Desktop notifications */}
      <div className="hidden md:block fixed top-20 right-4 z-50 space-y-3">
        {notifications.map((notification) => (
          <NotificationToast
            key={notification.id}
            notification={notification}
            onDismiss={onDismiss}
          />
        ))}
      </div>

      {/* Mobile notifications */}
      <div className="md:hidden fixed top-16 left-4 right-4 z-50 space-y-3">
        {notifications.map((notification) => (
          <NotificationToast
            key={notification.id}
            notification={notification}
            onDismiss={onDismiss}
          />
        ))}
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @media (max-width: 768px) {
          @keyframes slideIn {
            from {
              transform: translateY(-100px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
        }
      `}</style>
    </>
  );
};