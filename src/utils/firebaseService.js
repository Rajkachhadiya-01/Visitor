// src/utils/firebaseService.js
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  doc, 
  getDocs, 
  query, 
  onSnapshot,
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';

/* =====================================================
   VISITORS COLLECTION
===================================================== */

export const addVisitor = async (visitorData) => {
  try {
    const docRef = await addDoc(collection(db, 'visitors'), {
      ...visitorData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return { id: docRef.id, ...visitorData };
  } catch (error) {
    console.error("❌ Error adding visitor:", error);
    throw error;
  }
};

export const updateVisitor = async (visitorId, updates) => {
  try {
    await updateDoc(doc(db, 'visitors', visitorId), {
      ...updates,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error("❌ Error updating visitor:", error);
    throw error;
  }
};

export const listenToVisitors = (callback) => {
  const q = query(collection(db, 'visitors'), orderBy('createdAt', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data()
    }));

    callback(data);
  });
};

/* =====================================================
   APPROVALS COLLECTION
===================================================== */

export const addApproval = async (approvalData) => {
  try {
    const docRef = await addDoc(collection(db, 'approvals'), {
      ...approvalData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return { id: docRef.id, ...approvalData };
  } catch (error) {
    console.error("❌ Error adding approval:", error);
    throw error;
  }
};

export const updateApproval = async (approvalId, updates) => {
  try {
    await updateDoc(doc(db, 'approvals', approvalId), {
      ...updates,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error("❌ Error updating approval:", error);
    throw error;
  }
};

export const deleteApproval = async (approvalId) => {
  try {
    await deleteDoc(doc(db, 'approvals', approvalId));
  } catch (error) {
    console.error("❌ Error deleting approval:", error);
    throw error;
  }
};

export const listenToApprovals = (callback) => {
  const q = query(collection(db, 'approvals'), orderBy('createdAt', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const approvals = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(approvals);
  });
};

/* =====================================================
   ACTIVITIES COLLECTION
===================================================== */

export const addActivity = async (activityData) => {
  try {
    const docRef = await addDoc(collection(db, 'activities'), {
      ...activityData,
      createdAt: Timestamp.now()
    });
    return { id: docRef.id, ...activityData };
  } catch (error) {
    console.error("❌ Error adding activity:", error);
    throw error;
  }
};

export const listenToActivities = (callback) => {
  const q = query(collection(db, 'activities'), orderBy('createdAt', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const activities = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));

    callback(activities);
  });
};

/* =====================================================
   PHOTO UPLOAD
===================================================== */

export const uploadVisitorPhoto = async (photoDataUrl, visitorId) => {
  try {
    const response = await fetch(photoDataUrl);
    const blob = await response.blob();
    
    const storageRef = ref(storage, `visitors/${visitorId}_${Date.now()}.jpg`);
    const snapshot = await uploadBytes(storageRef, blob);
    return await getDownloadURL(snapshot.ref);

  } catch (error) {
    console.error("❌ Error uploading photo:", error);
    throw error;
  }
};

/* =====================================================
   RESIDENTS + SECURITY (STATIC COLLECTIONS)
===================================================== */

export const getResidents = async () => {
  try {
    const snap = await getDocs(collection(db, 'residents'));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error("❌ Error fetching residents:", error);
    return [];
  }
};

export const getSecurityGuards = async () => {
  try {
    const snap = await getDocs(collection(db, 'security'));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error("❌ Error fetching security:", error);
    return [];
  }
};

/* =====================================================
   DEFAULT DATA SEEDING
===================================================== */

export const seedDefaultData = async () => {
  try {
    console.log("🌱 Seeding default data...");

    const visitors = await getDocs(collection(db, 'visitors'));
    if (!visitors.empty) {
      console.log("⚠ Data already exists. Skipping seed.");
      return;
    }

    // Visitors
    await addDoc(collection(db, 'visitors'), {
      name: 'Ramesh Verma',
      phone: '9876543210',
      flat: 'A-101',
      purpose: 'Personal Visit',
      vehicle: 'GJ-01-AB-1234',
      checkIn: '09:30 AM',
      checkOut: '11:45 AM',
      status: 'out',
      approvalStatus: 'approved',
      photo: null,
      createdAt: Timestamp.now()
    });

    // Approvals
    await addDoc(collection(db, 'approvals'), {
      name: 'Radha Bai',
      type: 'Domestic Help',
      frequency: 'daily',
      flat: 'A-101',
      approved: true,
      requestTime: '08:00 AM',
      status: 'Pre-Approved',
      preApprovalCode: '123456',
      arrivalStatus: 'Not Arrived Yet',
      createdAt: Timestamp.now()
    });

    // Activities
    await addDoc(collection(db, 'activities'), {
      timestamp: '08:00 AM',
      action: 'Pre-Approved Visitor Added',
      performedBy: 'Resident - Flat A-101',
      visitorName: 'Radha Bai',
      flat: 'A-101',
      status: 'Awaiting Arrival',
      date: new Date().toLocaleDateString(),
      createdAt: Timestamp.now()
    });

    console.log("✅ Default data seeded!");

  } catch (error) {
    console.error("❌ Error seeding:", error);
  }
};
