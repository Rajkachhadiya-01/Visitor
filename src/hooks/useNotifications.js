// src/hooks/useNotifications.js 
import { useState, useRef } from 'react';
import { playNotificationSound } from '../VisitorApp';

/**
 * Custom hook for managing notifications
 * Shows notifications for 5-6 seconds with sound
 */
export const useNotificationManager = () => {
  const [notifications, setNotifications] = useState([]);
  const processedNotificationsRef = useRef(new Set());

  /**
   * Show a notification (auto-dismiss after 6 seconds)
   * @param {Object} data - Notification data
   */
  const showNotification = (data) => {
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
    playNotificationSound();

    // Auto dismiss after 6 seconds
    setTimeout(() => {
      dismissNotification(newNotification.id);
    }, 6000);
  };

  /**
   * Show a toast message (green success or red error)
   * Auto-dismiss after 5 seconds
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

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      dismissNotification(toastNotification.id);
    }, 5000);
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

  return {
    notifications,
    showNotification,
    showToast,
    dismissNotification,
    clearAll
  };
};