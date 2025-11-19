// src/utils/notificationService.js
import { 
  collection, 
  addDoc, 
  updateDoc,
  doc, 
  query, 
  where,
  onSnapshot,
  orderBy,
  Timestamp,
  getDocs,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../firebase';

/* =====================================================
   NOTIFICATIONS COLLECTION
   
   Notification Structure:
   {
     visitorName: string,
     mobileNumber: string,
     flatNumber: string,
     ownerName: string (for visitor check-in - resident name),
     purpose: string (for visitor check-in: Delivery, Domestic Help, Service Provider, Personal Visit),
     type: string (for pre-approval: Domestic Help, Service Provider, Guest),
     vehicleNumber: string (optional - for visitor check-in),
     receiverRole: string ('resident' | 'security'),
     receiverFlat: string (for resident notifications),
     status: boolean (true = unread, false = read),
     requestType: string ('pre-approval' | 'visitor-checkin'),
     createdAt: Timestamp,
     receivedTime: string,
     readAt: Timestamp (optional)
   }
===================================================== */

/**
 * Add notification when resident creates pre-approval
 * This notifies security about new pre-approved visitor
 */
export const addPreApprovalNotification = async (approvalData) => {
  try {
    const notification = {
      visitorName: approvalData.name,
      mobileNumber: approvalData.contactNumber,
      flatNumber: approvalData.flat,
      ownerName: null, // Not needed for pre-approvals
      purpose: null, // Not needed for pre-approvals
      type: approvalData.type, // Domestic Help, Service Provider, Guest
      vehicleNumber: null,
      receiverRole: 'security',
      receiverFlat: null, // Security sees all
      status: true, // Unread
      requestType: 'pre-approval',
      createdAt: Timestamp.now(),
      receivedTime: new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    };

    const docRef = await addDoc(collection(db, 'notifications'), notification);
    console.log("✅ Pre-approval notification created:", docRef.id);
    return { id: docRef.id, ...notification };
  } catch (error) {
    console.error("❌ Error creating pre-approval notification:", error);
    throw error;
  }
};

/**
 * Add notification when security checks in a visitor
 * This notifies the resident about visitor at gate
 */
export const addVisitorCheckinNotification = async (visitorData, ownerName) => {
  try {
    const notification = {
      visitorName: visitorData.name,
      mobileNumber: visitorData.phone,
      flatNumber: visitorData.flat,
      ownerName: ownerName, // Resident's name
      purpose: visitorData.purpose, // Delivery, Domestic Help, Service Provider, Personal Visit
      type: null, // Not needed for visitor check-ins
      vehicleNumber: visitorData.vehicle || null,
      receiverRole: 'resident',
      receiverFlat: visitorData.flat, // Only this resident should see it
      status: true, // Unread
      requestType: 'visitor-checkin',
      createdAt: Timestamp.now(),
      receivedTime: new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    };

    const docRef = await addDoc(collection(db, 'notifications'), notification);
    console.log("✅ Visitor check-in notification created:", docRef.id);
    return { id: docRef.id, ...notification };
  } catch (error) {
    console.error("❌ Error creating visitor check-in notification:", error);
    throw error;
  }
};

/**
 * Mark notification as read (status = false)
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    await updateDoc(doc(db, 'notifications', notificationId), {
      status: false,
      readAt: Timestamp.now()
    });
    console.log("✅ Notification marked as read:", notificationId);
  } catch (error) {
    console.error("❌ Error marking notification as read:", error);
    throw error;
  }
};

/**
 * Mark multiple notifications as read
 */
export const markMultipleNotificationsAsRead = async (notificationIds) => {
  try {
    const promises = notificationIds.map(id => 
      updateDoc(doc(db, 'notifications', id), {
        status: false,
        readAt: Timestamp.now()
      })
    );
    await Promise.all(promises);
    console.log(`✅ ${notificationIds.length} notifications marked as read`);
  } catch (error) {
    console.error("❌ Error marking multiple notifications as read:", error);
    throw error;
  }
};

/**
 * Listen to unread notifications for a resident (specific flat)
 */
export const listenToResidentNotifications = (flatNumber, callback) => {
  const q = query(
    collection(db, 'notifications'),
    where('receiverRole', '==', 'resident'),
    where('receiverFlat', '==', flatNumber),
    where('status', '==', true),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`📬 Resident (Flat ${flatNumber}) has ${notifications.length} unread notifications`);
    callback(notifications);
  });
};

/**
 * Listen to unread notifications for security (all pre-approvals)
 */
export const listenToSecurityNotifications = (callback) => {
  const q = query(
    collection(db, 'notifications'),
    where('receiverRole', '==', 'security'),
    where('status', '==', true),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`🛡️ Security has ${notifications.length} unread notifications`);
    callback(notifications);
  });
};

/**
 * Get all notifications for a resident (including read ones)
 */
export const getResidentAllNotifications = async (flatNumber) => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('receiverRole', '==', 'resident'),
      where('receiverFlat', '==', flatNumber),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("❌ Error getting resident notifications:", error);
    return [];
  }
};

/**
 * Get all notifications for security (including read ones)
 */
export const getSecurityAllNotifications = async () => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('receiverRole', '==', 'security'),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("❌ Error getting security notifications:", error);
    return [];
  }
};

/**
 * Delete a notification (optional - for cleanup)
 */
export const deleteNotification = async (notificationId) => {
  try {
    await deleteDoc(doc(db, 'notifications', notificationId));
    console.log("✅ Notification deleted:", notificationId);
  } catch (error) {
    console.error("❌ Error deleting notification:", error);
    throw error;
  }
};

/**
 * Get unread count for resident
 */
export const getResidentUnreadCount = async (flatNumber) => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('receiverRole', '==', 'resident'),
      where('receiverFlat', '==', flatNumber),
      where('status', '==', true)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error("❌ Error getting unread count:", error);
    return 0;
  }
};

/**
 * Get unread count for security
 */
export const getSecurityUnreadCount = async () => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('receiverRole', '==', 'security'),
      where('status', '==', true)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error("❌ Error getting unread count:", error);
    return 0;
  }
};