// src/hooks/useNotifications.js
import { useState, useEffect } from 'react';

export const useNotificationManager = () => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = (data) => {
    const newNotification = {
      id: crypto.randomUUID(),
      title: data.title || 'New Notification',
      visitorName: data.visitorName,
      phone: data.phone,
      flat: data.flat,
      purpose: data.purpose,
      timestamp: new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };

    setNotifications(prev => [...prev, newNotification]);

    // Play sound
    try {
      const audio = new Audio('/alert.mp3');
      audio.play().catch(err => console.log('Audio play failed:', err));
    } catch (err) {
      console.error('Audio error:', err);
    }

    // Browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(data.title || 'Visitor Alert', {
        body: `${data.visitorName} - Flat ${data.flat}`,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        vibrate: [200, 100, 200]
      });
    }
  };

  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return {
    notifications,
    showNotification,
    dismissNotification
  };
};