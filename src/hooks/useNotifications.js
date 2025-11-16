// src/hooks/useNotifications.js
import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for managing notifications
 * Prevents duplicate notifications on page refresh by tracking processed notifications
 * Only shows notifications for new events after login
 */
export const useNotificationManager = () => {
  const [notifications, setNotifications] = useState([]);
  const processedNotificationsRef = useRef(new Set());
  const isInitialLoadRef = useRef(true); // Track if this is initial page load

  /**
   * Show a notification
   * @param {Object} data - Notification data
   */
  const showNotification = (data) => {
    // Skip notifications during initial load (page refresh)
    if (isInitialLoadRef.current) {
      console.log("⏭️ Skipping notification during initial load:", data.title);
      return;
    }

    // Create unique ID based on notification content
    const notificationKey = `${data.type}-${data.visitorName}-${data.flat}-${data.timestamp || Date.now()}`;
    
    // Check if this notification was already shown
    if (processedNotificationsRef.current.has(notificationKey)) {
      console.log("⏭️ Skipping duplicate notification:", notificationKey);
      return;
    }

    // Mark as processed
    processedNotificationsRef.current.add(notificationKey);

    const newNotification = {
      id: crypto.randomUUID(),
      title: data.title || 'New Notification',
      visitorName: data.visitorName,
      phone: data.phone,
      flat: data.flat,
      purpose: data.purpose,
      type: data.type || 'info',
      timestamp: new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };

    setNotifications(prev => [...prev, newNotification]);
    console.log("🔔 Showing notification:", newNotification.title);

    // Play sound
    try {
      const audio = new Audio('/alert.mp3');
      audio.play().catch(err => console.log('Audio play failed:', err));
    } catch (err) {
      console.error('Audio error:', err);
    }

    // Browser notification (if permission granted)
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(data.title || 'Visitor Alert', {
        body: `${data.visitorName} - Flat ${data.flat}`,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        vibrate: [200, 100, 200]
      });
    }

    // Auto dismiss after 8 seconds
    setTimeout(() => {
      dismissNotification(newNotification.id);
    }, 8000);
  };

  /**
   * Show a toast message (green success or red error)
   * @param {string} message - Message to display
   * @param {string} type - Type of toast (success/error)
   */
  const showToast = (message, type = 'success') => {
    const toastNotification = {
      id: crypto.randomUUID(),
      title: message,
      type: type,
      isToast: true,
      timestamp: new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };

    setNotifications(prev => [...prev, toastNotification]);

    // Auto dismiss after 3 seconds
    setTimeout(() => {
      dismissNotification(toastNotification.id);
    }, 3000);
  };

  /**
   * Dismiss a specific notification
   * @param {string} id - Notification ID to dismiss
   */
  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  /**
   * Clear all notifications
   */
  const clearAll = () => {
    setNotifications([]);
  };

  /**
   * Enable notifications after initial load
   * This prevents showing notifications for existing data on page load
   * Call this after login is complete
   */
  const enableNotifications = () => {
    console.log("✅ Notifications enabled - will show for new events only");
    isInitialLoadRef.current = false;
  };

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return {
    notifications,
    showNotification,
    showToast,
    dismissNotification,
    clearAll,
    enableNotifications // Export this so it can be called after login
  };
};