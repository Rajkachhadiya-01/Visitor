// src/components/NotificationToast.jsx
import React, { useEffect } from 'react';
import { Bell, User, Clock, Building, X, MapPin, Phone } from 'lucide-react';

export const NotificationToast = ({ notification, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(notification.id);
    }, 8000);

    return () => clearTimeout(timer);
  }, [notification.id, onDismiss]);

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