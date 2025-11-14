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

// ===========================
// VISITORS COLLECTION
// ===========================

export const addVisitor = async (visitorData) => {
  try {
    const docRef = await addDoc(collection(db, 'visitors'), {
      ...visitorData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    console.log("✅ Visitor added with ID:", docRef.id);
    return { id: docRef.id, ...visitorData };
  } catch (error) {
    console.error("❌ Error adding visitor:", error);
    throw error;
  }
};

export const updateVisitor = async (visitorId, updates) => {
  try {
    const visitorRef = doc(db, 'visitors', visitorId);
    await updateDoc(visitorRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
    console.log("✅ Visitor updated:", visitorId);
  } catch (error) {
    console.error("❌ Error updating visitor:", error);
    throw error;
  }
};

export const getAllVisitors = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'visitors'));
    const visitors = [];
    querySnapshot.forEach((doc) => {
      visitors.push({ id: doc.id, ...doc.data() });
    });
    console.log("✅ Fetched visitors:", visitors.length);
    return visitors;
  } catch (error) {
    console.error("❌ Error fetching visitors:", error);
    throw error;
  }
};

export const listenToVisitors = (callback) => {
  const q = query(collection(db, 'visitors'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (querySnapshot) => {
    const visitors = [];
    querySnapshot.forEach((doc) => {
      visitors.push({ id: doc.id, ...doc.data() });
    });
    callback(visitors);
  });
};

// ===========================
// APPROVALS COLLECTION
// ===========================

export const addApproval = async (approvalData) => {
  try {
    const docRef = await addDoc(collection(db, 'approvals'), {
      ...approvalData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    console.log("✅ Approval added with ID:", docRef.id);
    return { id: docRef.id, ...approvalData };
  } catch (error) {
    console.error("❌ Error adding approval:", error);
    throw error;
  }
};

export const updateApproval = async (approvalId, updates) => {
  try {
    const approvalRef = doc(db, 'approvals', approvalId);
    await updateDoc(approvalRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
    console.log("✅ Approval updated:", approvalId);
  } catch (error) {
    console.error("❌ Error updating approval:", error);
    throw error;
  }
};

export const deleteApproval = async (approvalId) => {
  try {
    await deleteDoc(doc(db, 'approvals', approvalId));
    console.log("✅ Approval deleted:", approvalId);
  } catch (error) {
    console.error("❌ Error deleting approval:", error);
    throw error;
  }
};

export const listenToApprovals = (callback) => {
  const q = query(collection(db, 'approvals'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (querySnapshot) => {
    const approvals = [];
    querySnapshot.forEach((doc) => {
      approvals.push({ id: doc.id, ...doc.data() });
    });
    callback(approvals);
  });
};

// ===========================
// ACTIVITIES COLLECTION
// ===========================

export const addActivity = async (activityData) => {
  try {
    const docRef = await addDoc(collection(db, 'activities'), {
      ...activityData,
      createdAt: Timestamp.now()
    });
    console.log("✅ Activity logged with ID:", docRef.id);
    return { id: docRef.id, ...activityData };
  } catch (error) {
    console.error("❌ Error adding activity:", error);
    throw error;
  }
};

export const listenToActivities = (callback) => {
  const q = query(collection(db, 'activities'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (querySnapshot) => {
    const activities = [];
    querySnapshot.forEach((doc) => {
      activities.push({ id: doc.id, ...doc.data() });
    });
    callback(activities);
  });
};

// ===========================
// PHOTO UPLOAD TO STORAGE
// ===========================

// From uploadVisitorPhoto (firebaseService.js Line 174-193)
// Replace the uploadVisitorPhoto function in firebaseService.js with this corrected version:

export const uploadVisitorPhoto = async (photoDataUrl, visitorId) => {
  try {
    // Convert base64 to blob
    const response = await fetch(photoDataUrl);
    const blob = await response.blob();
    
    // Upload to Firebase Storage
    const storageRef = ref(storage, `visitors/${visitorId}_${Date.now()}.jpg`);
    const snapshot = await uploadBytes(storageRef, blob);
    
    // Get downloadable URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;  // ✅ Returns: "https://firebasestorage.googleapis.com/..."
  } catch (error) {
    console.error("❌ Error uploading photo:", error);
    throw error;
  }
};

// ===========================
// RESIDENTS & SECURITY (Static for now)
// ===========================

export const getResidents = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'residents'));
    const residents = [];
    querySnapshot.forEach((doc) => {
      residents.push({ id: doc.id, ...doc.data() });
    });
    return residents;
  } catch (error) {
    console.error("❌ Error fetching residents:", error);
    return [];
  }
};

export const getSecurityGuards = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'security'));
    const guards = [];
    querySnapshot.forEach((doc) => {
      guards.push({ id: doc.id, ...doc.data() });
    });
    return guards;
  } catch (error) {
    console.error("❌ Error fetching security guards:", error);
    return [];
  }
};

// ===========================
// DEFAULT DATA MANAGEMENT
// ===========================

export const initializeDefaultData = async () => {
  try {
    // Check if default data already exists
    const defaultResidentsRef = collection(db, 'defaultData/residents/list');
    const snapshot = await getDocs(defaultResidentsRef);
    
    if (snapshot.empty) {
      console.log("🔄 Initializing default data...");
      
      // Add default residents
      const defaultResidents = [
        { name: 'Amit Kumar', flat: 'A-101', mobile: '6353872412' },
        { name: 'Priya Sharma', flat: 'B-205', mobile: '6483829372' },
        { name: 'Rajesh Gupta', flat: 'C-304', mobile: '8937354908' },
        { name: 'Neha Patel', flat: 'A-203', mobile: '9876543210' },
        { name: 'Vikram Singh', flat: 'B-401', mobile: '9823456789' },
      ];
      
      for (const resident of defaultResidents) {
        await addDoc(collection(db, 'defaultData/residents/list'), resident);
      }
      
      // Add default security guards
      const defaultGuards = [
        { name: 'Shyamlal', gate: 'Main-Gate', mobile: '6353872413' },
        { name: 'Jagwinder Singh', gate: 'Exit-Gate', mobile: '9193647382' },
        { name: 'Vikas Yadav', gate: 'Parking-Gate', mobile: '9012345678' },
      ];
      
      for (const guard of defaultGuards) {
        await addDoc(collection(db, 'defaultData/security/list'), guard);
      }
      
      console.log("✅ Default data initialized successfully");
    }
  } catch (error) {
    console.error("❌ Error initializing default data:", error);
  }
};

export const getDefaultResidents = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'defaultData/residents/list'));
    const residents = [];
    querySnapshot.forEach((doc) => {
      residents.push({ id: doc.id, ...doc.data() });
    });
    return residents;
  } catch (error) {
    console.error("❌ Error fetching default residents:", error);
    return [];
  }
};

export const getDefaultSecurityGuards = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'defaultData/security/list'));
    const guards = [];
    querySnapshot.forEach((doc) => {
      guards.push({ id: doc.id, ...doc.data() });
    });
    return guards;
  } catch (error) {
    console.error("❌ Error fetching default security guards:", error);
    return [];
  }
};
// ===========================
// INITIALIZE DEFAULT DATA (ONE-TIME SETUP)
// ===========================

export const seedDefaultData = async () => {
  try {
    console.log("🌱 Seeding default data to Firebase...");
    
    // Check if data already exists
    const visitorsSnapshot = await getDocs(collection(db, 'visitors'));
    if (!visitorsSnapshot.empty) {
      console.log("✅ Data already exists. Skipping seed.");
      return;
    }
    
    // Default Visitors
    const defaultVisitors = [
      {
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
      },
      {
        name: 'Sunita Devi',
        phone: '9876543211',
        flat: 'B-205',
        purpose: 'Domestic Help',
        vehicle: '',
        checkIn: '08:00 AM',
        status: 'inside',
        approvalStatus: 'approved',
        photo: null,
        createdAt: Timestamp.now()
      }
    ];
    
    // Add visitors
    for (const visitor of defaultVisitors) {
      await addDoc(collection(db, 'visitors'), visitor);
    }
    
    // Default Approvals
    const defaultApprovals = [
      {
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
      }
    ];
    
    // Add approvals
    for (const approval of defaultApprovals) {
      await addDoc(collection(db, 'approvals'), approval);
    }
    
    // Default Activities
    const defaultActivities = [
      {
        timestamp: '08:00 AM',
        action: 'Pre-Approved Visitor Added',
        performedBy: 'Resident - Flat A-101',
        visitorName: 'Radha Bai',
        flat: 'A-101',
        status: 'Awaiting Arrival',
        date: new Date().toLocaleDateString(),
        createdAt: Timestamp.now()
      }
    ];
    
    // Add activities
    for (const activity of defaultActivities) {
      await addDoc(collection(db, 'activities'), activity);
    }
    
    console.log("✅ Default data seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding default data:", error);
  }
};