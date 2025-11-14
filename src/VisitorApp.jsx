// src/VisitorApp.jsx
import {addVisitor, updateVisitor, listenToVisitors, addApproval, updateApproval, deleteApproval, listenToApprovals, addActivity, listenToActivities, uploadVisitorPhoto, seedDefaultData} from './utils/firebaseService';
import AdminDashboard from './AdminDashboard';
import { loadData } from './utils/storage';
import React, { useState, useRef, useEffect } from 'react';
import {Users, Shield, Home, Bell, UserPlus, Search, CheckCircle, XCircle, Clock, Camera} from 'lucide-react';
import FilterDropdown from './components/FilterDropdown';
import { useNotificationManager } from './hooks/useNotifications';
import { NotificationContainer } from './components/NotificationToast';
import { useAuth } from "./context/AuthContext";
// import { Navigate } from "react-router-dom";

const SOCIETY_NAME = "Harmony Residency";
// Generate 6-digit unique verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Notification sound using HTML5 Audio (simpler and more reliable)
let audioInstance = null;

export const initAudioContext = () => {
  try {
    if (!audioInstance) {
      audioInstance = new Audio('/alert.mp3');
      audioInstance.preload = 'auto';
      console.log("✅ Audio initialized and preloaded");
    }
  } catch (err) {
    console.error("❌ Audio initialization failed:", err);
  }
};

export const playNotificationSound = async () => {
  try {
    if (!audioInstance) {
      initAudioContext();
    }
    
    // Reset audio to start if it's already playing
    audioInstance.currentTime = 0;
    
    // Play the audio
    const playPromise = audioInstance.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log("🔔 Sound played successfully");
        })
        .catch((err) => {
          console.error("❌ Audio playback failed:", err);
          // If autoplay is blocked, user interaction is required
          console.log("💡 User interaction required for audio. Click anywhere to enable sound.");
        });
    }
  } catch (err) {
    console.error("❌ Audio playback error:", err);
  }
};

// Allow manual console testing
window.playNotificationSound = playNotificationSound;
window.initAudioContext = initAudioContext;

// Initialize audio on first user interaction
let audioInitialized = false;
const initOnInteraction = () => {
  if (!audioInitialized) {
    initAudioContext();
    audioInitialized = true;
    console.log("🔊 Audio enabled after user interaction");
  }
};

// Use { once: false } to allow multiple initializations if needed
document.addEventListener('click', initOnInteraction);
document.addEventListener('touchstart', initOnInteraction);

// Demo data with safe temporary storage
const defaultResidents = [
  { id: 1, name: 'Amit Kumar', flat: 'A-101', mobile: '6353872412' },
  { id: 2, name: 'Priya Sharma', flat: 'B-205', mobile: '6483829372' },
  { id: 3, name: 'Rajesh Gupta', flat: 'C-304', mobile: '8937354908' },
  { id: 4, name: 'Neha Patel', flat: 'A-203', mobile: '9876543210' },
  { id: 5, name: 'Vikram Singh', flat: 'B-401', mobile: '9823456789' },
];

const defaultGuards = [
  { id: 1, name: 'Shyamlal', gate: 'Main-Gate', mobile: '6353872413' },
  { id: 2, name: 'Jagwinder Singh', gate: 'Exit-Gate', mobile: '9193647382' },
  { id: 3, name: 'Vikas Yadav', gate: 'Parking-Gate', mobile: '9012345678' },
];

const defaultAdmins = [
  { id: 1, name: 'Rajesh Patel', mobile: '6353872411', role: 'Admin' },
];

// const defaultVisitors = [
//   {
//     id: 1001,
//     name: 'Ramesh Verma',
//     phone: '9876543210',
//     flat: 'A-101',
//     purpose: 'Personal Visit',
//     vehicle: 'GJ-01-AB-1234',
//     checkIn: '09:30 AM',
//     checkOut: '11:45 AM',
//     status: 'out',
//     approvalStatus: 'approved',
//     photo: null
//   },
//   {
//     id: 1002,
//     name: 'Sunita Devi',
//     phone: '9876543211',
//     flat: 'B-205',
//     purpose: 'Domestic Help',
//     vehicle: '',
//     checkIn: '08:00 AM',
//     status: 'inside',
//     approvalStatus: 'approved',
//     photo: null
//   },
//   {
//     id: 1003,
//     name: 'Vikram Malhotra',
//     phone: '9876543212',
//     flat: 'C-304',
//     purpose: 'Delivery',
//     vehicle: 'GJ-02-XY-5678',
//     checkIn: '10:15 AM',
//     status: 'pending',
//     approvalStatus: 'pending',
//     photo: null
//   },
//   {
//     id: 1004,
//     name: 'Deepak Kumar',
//     phone: '9876543213',
//     flat: 'A-101',
//     purpose: 'Service Provider',
//     vehicle: '',
//     checkIn: '02:30 PM',
//     status: 'inside',
//     approvalStatus: 'approved',
//     photo: null
//   },
//   {
//     id: 1005,
//     name: 'Anjali Sharma',
//     phone: '9876543214',
//     flat: 'B-205',
//     purpose: 'Personal Visit',
//     vehicle: 'GJ-01-CD-9012',
//     checkIn: '11:00 AM',
//     checkOut: '01:30 PM',
//     status: 'out',
//     approvalStatus: 'approved',
//     photo: null
//   },
//   {
//     id: 1006,
//     name: 'Kiran Bhai',
//     phone: '9876543215',
//     flat: 'A-203',
//     purpose: 'Domestic Help',
//     vehicle: '',
//     checkIn: '07:00 AM',
//     status: 'inside',
//     approvalStatus: 'approved',
//     photo: null
//   },
//   {
//     id: 1007,
//     name: 'Manish Gupta',
//     phone: '9876543216',
//     flat: 'B-401',
//     purpose: 'Personal Visit',
//     vehicle: 'GJ-05-PQ-3456',
//     checkIn: '03:45 PM',
//     status: 'inside',
//     approvalStatus: 'approved',
//     photo: null
//   }
// ];

// const defaultApprovals = [
//   {
//     id: 2001,
//     name: 'Radha Bai',
//     type: 'Domestic Help',
//     frequency: 'daily',
//     flat: 'A-101',
//     approved: true,
//     requestTime: '08:00 AM',
//     status: 'Pre-Approved'
//   },
//   {
//     id: 2002,
//     name: 'Rajesh Patel',
//     type: 'Service',
//     frequency: 'once',
//     flat: 'B-205',
//     approved: false,
//     requestTime: '09:45 AM',
//     status: 'Pending'
//   },
//   {
//     id: 2003,
//     name: 'Mohan Das',
//     type: 'Service',
//     frequency: 'once',
//     flat: 'C-304',
//     approved: true,
//     requestTime: '10:30 AM',
//     status: 'Pre-Approved'
//   },
//   {
//     id: 2004,
//     name: 'Kamlesh Bhai',
//     type: 'Service',
//     frequency: 'weekly',
//     flat: 'A-203',
//     approved: true,
//     requestTime: '07:15 AM',
//     status: 'Pre-Approved'
//   }
// ];
// const defaultActivities = [
//   {
//     id: 1,
//     timestamp: '08:00 AM',
//     action: 'Pre-Approved Visitor Added',
//     performedBy: 'Resident - Flat A-101',
//     visitorName: 'Radha Bai',
//     flat: 'A-101',
//     status: 'Awaiting Arrival',
//     date: new Date().toLocaleDateString()
//   }
// ];

const LoginScreen = ({ onLogin }) => {
  const [userType, setUserType] = useState(null);
  const [step, setStep] = useState('select');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [notice, setNotice] = useState({ type: '', text: '' });

  useEffect(() => {
    if (notice.text) {
      const timer = setTimeout(() => {
        setNotice({ type: '', text: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notice]);

const [residents] = useState(() => loadData('residents', defaultResidents));
const [securityGuards] = useState(() => loadData('securityGuards', defaultGuards));
const [admins] = useState(() => loadData('admins', defaultAdmins));
// Restore login state on page refresh by delegating to parent via onLogin
// useEffect(() => {
//   const savedLoginState = localStorage.getItem('visitorAppLoginState');
//   if (!savedLoginState) return;

//   try {
//     const loginState = JSON.parse(savedLoginState);
//     // call parent handler to restore the app state
//     if (loginState && loginState.role) {
//       onLogin(loginState.role, loginState.identifier, loginState.userData);
//     }
//   } catch (error) {
//     console.error('Error restoring login state:', error);
//     localStorage.removeItem('visitorAppLoginState');
//   }
//   // eslint-disable-next-line react-hooks/exhaustive-deps
// }, []);

const handleSendOtp = () => {
  if (mobile.length !== 10) {
    setNotice({ type: 'error', text: 'Please enter a valid 10 digit mobile number' });
    return;
  }

  const userData = userType === 'resident'
    ? residents.find(r => r.mobile === mobile)
    : userType === 'security'
    ? securityGuards.find(s => s.mobile === mobile)
    : admins.find(a => a.mobile === mobile);

  if (!userData) {
    setNotice({ type: 'error', text: 'Mobile number not registered' });
    return;
  }

  setSelectedUser(userData);
  setStep('otp');
  setNotice({ type: '', text: '' });
};

  const handleVerifyOtp = () => {
  if (otp === '1234') {
    if (userType === 'resident') {
      onLogin('resident', selectedUser.flat, selectedUser);
    } else if (userType === 'security') {
      onLogin('security', selectedUser.gate, selectedUser);
    } else {
      onLogin('admin', null, selectedUser);
    }
  } else {
    setNotice({ type: 'error', text: 'Invalid OTP. Please try again.' });
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-block p-4 bg-indigo-100 rounded-full mb-4">
            <Home className="w-12 h-12 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Society Visitor Manager</h1>
          <p className="text-gray-600 mt-2">Secure Entry System</p>
        </div>

        {/* Inline notice visible on all steps */}
        {notice?.text && (
          <div className={`mb-4 p-3 rounded-lg border ${
            notice.type === 'error'
              ? 'bg-red-50 text-red-700 border-red-200'
              : 'bg-green-50 text-green-700 border-green-200'
          }`}>
            {notice.text}
          </div>
        )}

        {step === 'select' && (
          <>
            <div className="space-y-4">
              <button
                onClick={() => { setUserType('resident'); setStep('mobile'); }}
                className="w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition"
              >
                <Users className="w-6 h-6" />
                Login as Resident
              </button>
<button
  onClick={() => { setUserType('security'); setStep('mobile'); }}
  className="w-full flex items-center justify-center gap-3 bg-gray-700 hover:bg-gray-800 text-white font-semibold py-4 px-6 rounded-xl transition"
>
  <Shield className="w-6 h-6" />
  Login as Security
</button>

<button
  onClick={() => { setUserType('admin'); setStep('mobile'); }}
  className="w-full flex items-center justify-center gap-3 bg-purple-200 dark:bg-purple-800 hover:bg-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition"
>
  <Users className="w-6 h-6" />
  Login as Admin
</button>
            </div>
          </>
        )}

        {step === 'mobile' && (
          <div className="space-y-4">
            <button
              onClick={() => { setStep('select'); setUserType(null); setMobile(''); setNotice({ type: '', text: '' }); }}
              className="text-gray-600 hover:text-gray-800 mb-2 flex items-center gap-2"
            >
              ← Back
            </button>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {userType === 'resident' ? 'Resident Mobile Number' : 
                userType === 'security' ? 'Security Mobile Number' : 
                'Admin Mobile Number'}
              </label>
              <input
                type="tel"
                maxLength="10"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 10-digit mobile number"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <button
              onClick={handleSendOtp}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition"
            >
              Send OTP
            </button>
          </div>
        )}

        {step === 'otp' && (
          <div className="space-y-4">
            <button
              onClick={() => { setStep('mobile'); setOtp(''); setNotice({ type: '', text: '' }); }}
              className="text-gray-600 hover:text-gray-800 mb-2 flex items-center gap-2"
            >
              ← Back
            </button>

            <div className="text-center mb-4">
              <p className="text-sm text-gray-600">OTP sent to</p>
              <p className="text-lg font-semibold text-gray-800">{mobile}</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Enter OTP
              </label>
              <input
                type="password"
                maxLength="4"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 4-digit OTP"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-center tracking-widest focus:border-indigo-500 focus:outline-none"
                style={{ letterSpacing: '0.5em' }}
              />
            </div>

            <button
              onClick={handleVerifyOtp}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-xl transition"
            >
              Verify OTP
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const ResidentDashboard = ({visitors, approvals, currentResident, residentInfo, onLogout, onClearData, onAddApproval, onApproveRequest, onApproveVisitor, onRejectVisitor, onCancelApproval, residentNotifications, onDismissResidentNotification}) => {
  const myVisitors = visitors.filter(v => v.flat === currentResident);
// const cancelledApprovals = approvals.filter(a => 
//   a.flat === currentResident && 
//   (a.status === 'Cancelled' || a.arrivalStatus === 'Expired' || a.arrivalStatus === 'Cancelled by Resident')
// );
  const myApprovals = approvals.filter(a => 
  a.flat === currentResident && 
  a.approved && 
  a.status === 'Pre-Approved' && 
  (!a.arrivalStatus || a.arrivalStatus === 'Not Arrived Yet')
);
  const pendingRequests = approvals.filter(a => a.flat === currentResident && !a.approved);
  const pendingVisitors = visitors.filter(v => v.flat === currentResident && v.status === 'pending');
  const inside = myVisitors.filter(v => v.status === 'inside').length;


// 🔔 Detect new visitor check-in requests (play sound only when new request is added)
const prevPendingIdsRef = useRef(null);

useEffect(() => {
  if (prevPendingIdsRef.current === null) {
    prevPendingIdsRef.current = pendingVisitors.map(v => v.id);
    return;
  }

  const currentIds = pendingVisitors.map(v => v.id);
  const newRequests = currentIds.filter(id => !prevPendingIdsRef.current.includes(id));

  if (newRequests.length > 0) {
    console.log("🔔 New visitor request detected:", newRequests);
    initAudioContext(); // ensure audio resumed
    playNotificationSound();
  }

  prevPendingIdsRef.current = currentIds;
}, [pendingVisitors]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-indigo-600 text-white p-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{SOCIETY_NAME}</h1>
            <h2 className="text-xl">Resident Dashboard </h2>
            <p>Flat {currentResident} - {residentInfo?.name || 'Amit Kumar'}</p>
          </div>
            <div className="flex gap-2">
              {/* do not change with this button Resident Dashboard*/}
              {/* <button 
                onClick={onClearData}
                className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600"
              >
                Clear Data
              </button> */}
              <button onClick={onLogout} className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold">
                Logout
              </button>
            </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto p-6">
        {pendingVisitors.length > 0 && (
          <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-6 rounded-lg">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-600 animate-pulse" />
              <p className="font-semibold text-orange-800">
                {pendingVisitors.length} visitor(s) waiting at gate for your approval!
              </p>
            </div>
          </div>
        )}

        {pendingRequests.length > 0 && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded-lg">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" />
              <p className="font-semibold text-blue-800">
                You have {pendingRequests.length} pending pre-approval request(s)
              </p>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-6 rounded-xl shadow">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Today's Visitors</p>
                <p className="text-2xl font-bold">{myVisitors.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <UserPlus className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Active Approvals</p>
                <p className="text-2xl font-bold">{myApprovals.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Currently Inside</p>
                <p className="text-2xl font-bold">{inside}</p>
              </div>
            </div>
          </div>
        </div>

        {pendingVisitors.length > 0 && (
          <div className="bg-white rounded-xl shadow mb-6">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Visitors Waiting for Approval</h2>
            </div>
            <div className="p-6 space-y-3">
              {pendingVisitors.map(v => (
                <div key={v.id} className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-4 mb-3">
                    {v.photo && (
                      <img src={v.photo} alt={v.name} className="w-16 h-16 rounded-lg object-cover border-2 border-gray-300" />
                    )}
                    <div>
                      <p className="font-semibold text-lg">{v.name}</p>
                      <p className="text-sm text-gray-600">Phone: {v.phone}</p>
                      <p className="text-sm text-gray-600">Flat: {v.flat} • {v.purpose}</p>
                      <p className="text-xs text-gray-500">In: {v.checkIn} {v.checkOut && `| Out: ${v.checkOut}`}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onApproveVisitor(v.id)}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700"
                    >
                      Approve Entry
                    </button>
                    <button
                      onClick={() => onRejectVisitor(v.id)}
                      className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {pendingRequests.length > 0 && (
          <div className="bg-white rounded-xl shadow mb-6">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Pending Approval Requests</h2>
            </div>
            <div className="p-6 space-y-3">
              {pendingRequests.map(a => (
                <div key={a.id} className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-lg">{a.name}</p>
                      <p className="text-sm text-gray-600">{a.type} • {a.frequency}</p>
                      <p className="text-xs text-gray-500 mt-1">Requested: {a.requestTime}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                      {a.status || 'Pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow mb-6">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold">Pre-Approved Visitors</h2>
            <button
              onClick={onAddApproval}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700"
            >
              <UserPlus className="w-4 h-4" />
              Add
            </button>
          </div>
          <div className="mt-8">
            <div className="space-y-3">
              {myApprovals.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No pre-approved visitors found
                </p>
              ) : (
                myApprovals.map(a => (
                  <div key={a.id} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-lg">{a.name}</p>
                        <p className="text-sm text-gray-600">
                          Flat: {a.flat} • {a.type}
                        </p>

                        <div className="flex items-center gap-2 mt-1 relative">
                          <p className="text-xs text-gray-500">Code: {a.preApprovalCode}</p>

                          <button
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(a.preApprovalCode);
                                const tooltip = document.getElementById(`tooltip-${a.id}`);
                                tooltip.classList.remove("opacity-0", "invisible");
                                setTimeout(() => {
                                  tooltip.classList.add("opacity-0", "invisible");
                                }, 1500);
                              } catch (err) {
                                alert("Failed to copy");
                              }
                            }}
                            className="text-blue-600 text-xs underline hover:text-blue-800"
                          >
                            Copy
                          </button>

                          <span
                            id={`tooltip-${a.id}`}
                            className="absolute top-6 left-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 invisible transition-all duration-300"
                          >
                            Copied!
                          </span>
                        </div>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          a.arrivalStatus === 'Arrived at Gate'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {a.arrivalStatus || 'Not Arrived Yet'}
                      </span>
                    </div>

                    <button
                      onClick={() => onCancelApproval(a.id, a.flat)}
                      className="mt-3 bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-semibold w-full"
                    >
                      Cancel
                    </button>

                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      <NotificationContainer
        notifications={residentNotifications}
        onDismiss={onDismissResidentNotification}
      />
    </div>
  );
};

const SecurityDashboard = ({visitors, approvals, securityData, onLogout, onClearData, onCheckIn, onSearch, onCheckOut, onMarkArrived, securityNotifications, onDismissSecurityNotification}) => {  
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-800 text-white p-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{SOCIETY_NAME}</h1>
            <h2 className="text-xl">{securityData ? `Security Dashboard - ${securityData.name} - ${securityData.gate}` : 'Security Dashboard - Main Gate'}</h2>
          </div>
            <div className="flex gap-2">
              {/* do not change with this button */}
              {/* <button 
                onClick={onClearData}
                className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600"
              >
                Clear Data
              </button> */}
              <button onClick={onLogout} className="bg-white text-gray-800 px-4 py-2 rounded-lg font-semibold">
                Logout
              </button>
            </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto p-6">
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
                {pendingApprovals.length} pre-approval request(s) waiting for resident confirmation
              </p>
            </div>
          </div>
        )}

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
                      <img src={v.photo} alt={v.name} className="w-16 h-16 rounded-lg object-cover" />
                    )}
                    <div>
                      <p className="font-semibold">{v.name}</p>
                      <p className="text-sm text-gray-600">Flat: {v.flat} • {v.purpose}</p>
                      <p className="text-xs text-gray-500">Arrived: {v.checkIn} {v.vehicle && `• ${v.vehicle}`}</p>
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

        {pendingApprovals.length > 0 && (
          <div className="bg-white rounded-xl shadow mb-6">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Pre-Approvals Awaiting Arrival</h2>
              <p className="text-sm text-gray-600 mt-1">Click "Come In" when visitor arrives at gate</p>
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
        {/* Visitor History Section */}
        <div className="bg-white rounded-xl shadow mt-6">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">Visitor History</h2>
          </div>

          <div className="p-6 space-y-3">

            {/* Checked-out visitors */}
            {visitors
              .filter(v => v.status === 'out' || v.status === 'rejected')
              .map(v => (
                <div key={v.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold">{v.name}</p>
                    <p className="text-sm text-gray-600">Flat: {v.flat} • {v.purpose}</p>
                    <p className="text-xs text-gray-500">
                      In: {v.checkIn} {v.checkOut && `| Out: ${v.checkOut}`}
                    </p>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    v.status === 'out' ? 'bg-gray-200 text-gray-800' : 'bg-red-200 text-red-700'
                  }`}>
                    {v.status === 'out' ? 'Checked Out' : 'Rejected'}
                  </span>
                </div>
              ))}

            {/* Cancelled / expired approvals */}
            {cancelledApprovals.map(a => (
              <div key={a.id} className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
                <div>
                  <p className="font-semibold">{a.name}</p>
                  <p className="text-sm text-gray-600">Pre-Approval • Flat: {a.flat}</p>
                  <p className="text-xs text-gray-500">
                    Code: {a.preApprovalCode} • {a.cancelledAt ? `Cancelled: ${a.cancelledAt}` : 'Expired'}
                  </p>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-200 text-red-700">
                  {a.arrivalStatus === 'Expired' ? 'Expired' : 'Cancelled'}
                </span>
              </div>
            ))}

          </div>
        </div>
      </div>
      <NotificationContainer
        notifications={securityNotifications}
        onDismiss={onDismissSecurityNotification}
      />

    </div>
  );
};

const CheckInForm = ({ onSubmit, onCancel, residents }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [flat, setFlat] = useState('');
  const [purpose, setPurpose] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [photo, setPhoto] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState('user');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async (mode = facingMode) => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      setStream(mediaStream);
      setShowCamera(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (err) {
      console.error("Camera error:", err);
      alert("Unable to access camera. Please check permissions.");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      const photoData = canvas.toDataURL('image/jpeg');
      setPhoto(photoData);
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const retakePhoto = () => {
    setPhoto(null);
    startCamera();
  };

  const handleSubmit = () => {
    if (name && phone && flat && purpose) {
      onSubmit({ name, phone, flat, purpose, vehicle, photo });
    } else {
      const errorMsg = document.createElement('div');
      errorMsg.className = 'bg-red-50 border-l-4 border-red-400 p-3 rounded-lg mb-4';
      errorMsg.innerHTML = '<p class="text-red-800 font-semibold">Please fill all required fields</p>';
      document.querySelector('.bg-white.rounded-xl.shadow.p-8').prepend(errorMsg);
      setTimeout(() => errorMsg.remove(), 3000);
      return;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <button onClick={onCancel} className="text-gray-600 mb-4 hover:text-gray-800">
          ← Back
        </button>

        <div className="bg-white rounded-xl shadow p-8">
          <h2 className="text-2xl font-bold mb-6">Visitor Check-In</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Visitor Photo *</label>
              {!photo && !showCamera && (
                <button
                  onClick={() => startCamera()}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-indigo-400 hover:bg-indigo-50 transition flex flex-col items-center gap-2"
                >
                  <Camera className="w-12 h-12 text-gray-400" />
                  <span className="text-gray-600 font-semibold">Capture Photo</span>
                </button>
              )}

              {showCamera && (
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    onLoadedMetadata={(e) => {
                      e.target.play().catch(err => console.error("Play failed:", err));
                    }}
                    className="w-full rounded-lg bg-black"
                    style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }}
                  />
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={capturePhoto}
                      className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700"
                    >
                      📸 Capture
                    </button>
                    <button
                      onClick={() => {
                        stopCamera();
                        setTimeout(() => {
                          const newMode = facingMode === 'user' ? 'environment' : 'user';
                          setFacingMode(newMode);
                          startCamera(newMode);
                        }, 300);
                      }}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
                    >
                      🔄 Flip
                    </button>
                    <button
                      onClick={stopCamera}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300"
                    >
                      ✖ Close
                    </button>
                  </div>
                </div>
              )}
              {photo && (
                <div className="relative">
                  <img src={photo} alt="Visitor" className="w-full rounded-lg" />
                  <button
                    onClick={retakePhoto}
                    className="mt-3 w-full bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300"
                  >
                    Retake Photo
                  </button>
                </div>
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg"
                placeholder="Visitor name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phone *</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg"
                placeholder="Phone number"
                maxLength="10"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Flat *</label>
              <FilterDropdown
                options={residents.map(r => ({ label: `${r.flat} - ${r.name}`, value: r.flat }))}
                value={flat}
                onChange={setFlat}
                placeholder="Type to search flats..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Purpose *</label>
              <FilterDropdown
                options={[
                  { label: 'Personal Visit', value: 'Personal Visit' },
                  { label: 'Delivery', value: 'Delivery' },
                  { label: 'Service Provider', value: 'Service Provider' },
                  { label: 'Domestic Help', value: 'Domestic Help' },
                ]}
                value={purpose}
                onChange={setPurpose}
                placeholder="Type to search purpose..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Vehicle (Optional)</label>
              <input
                type="text"
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg"
                placeholder="MH-01-AB-1234"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSubmit}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700"
              >
                Check In
              </button>
              <button
                onClick={onCancel}
                className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AddApprovalForm = ({ onSubmit, onCancel }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [frequency, setFrequency] = useState('');

  const handleSubmit = () => {
  if (name && type && frequency && contactNumber && contactNumber.length === 10) {
    onSubmit({ name, type, frequency, contactNumber });
  } else {
    const errorMsg = document.createElement('div');
    errorMsg.className = 'bg-red-50 border-l-4 border-red-400 p-3 rounded-lg mb-4';
    errorMsg.innerHTML = '<p class="text-red-800 font-semibold">Please fill all required fields with valid contact number</p>';
    document.querySelector('.bg-white.rounded-xl.shadow.p-8').prepend(errorMsg);
    setTimeout(() => errorMsg.remove(), 3000);
    return;
  }
};

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <button onClick={onCancel} className="text-gray-600 mb-4 hover:text-gray-800">
          ← Back
        </button>

        <div className="bg-white rounded-xl shadow p-8">
          <h2 className="text-2xl font-bold mb-6">Add Pre-Approval</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg"
                placeholder="Visitor name"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Visitor Contact Number *</label>
              <input
                type="tel"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value.replace(/\D/g, ''))}
                maxLength="10"
                className="w-full px-4 py-3 border rounded-lg"
                placeholder="Enter 10-digit mobile number"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Type *</label>
              <FilterDropdown
                options={[
                  { label: 'Domestic Help', value: 'Domestic Help' },
                  { label: 'Service Provider', value: 'Service' },
                  { label: 'Guest', value: 'Guest' },
                ]}
                value={type}
                onChange={setType}
                placeholder="Type to search type..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Frequency *</label>
              <FilterDropdown
                options={[
                  { label: 'One Time', value: 'once' },
                  { label: 'Daily', value: 'daily' },
                  { label: 'Weekly', value: 'weekly' },
                ]}
                value={frequency}
                onChange={setFrequency}
                placeholder="Type to search frequency..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSubmit}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700"
              >
                Add Approval
              </button>
              <button
                onClick={onCancel}
                className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SearchView = ({ visitors, approvals = [], onBack, onCheckOut }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // const [searchCategory, setSearchCategory] = useState('all');
  
const filtered = visitors.filter(v => {
  const query = searchTerm.toLowerCase();
  const matchesSearch = 
    v.name.toLowerCase().includes(query) ||
    v.phone.includes(searchTerm) ||
    v.flat.toLowerCase().includes(query) ||
    (v.purpose && v.purpose.toLowerCase().includes(query)) ||
    (v.preApprovalCode && v.preApprovalCode.toString().includes(searchTerm));
  
  return matchesSearch;
});

// Also add search for approvals
// const filteredApprovals = approvals.filter(a => {
//   const query = searchTerm.toLowerCase();
//   return (
//     a.name.toLowerCase().includes(query) ||
//     a.flat.toLowerCase().includes(query) ||
//     (a.preApprovalCode && a.preApprovalCode.toString().includes(searchTerm))
//   );
// });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <button onClick={onBack} className="text-gray-600 mb-4 hover:text-gray-800">
          ← Back
        </button>
{/* <div className="flex gap-2 mb-4">
            <button
              onClick={() => setSearchCategory('all')}
              className={`px-4 py-2 rounded-lg font-semibold ${
                searchCategory === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSearchCategory('inside')}
              className={`px-4 py-2 rounded-lg font-semibold ${
                searchCategory === 'inside' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Inside Only
            </button>
            <button
              onClick={() => setSearchCategory('preapproved')}
              className={`px-4 py-2 rounded-lg font-semibold ${
                searchCategory === 'preapproved' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Pre-Approved
            </button>
          </div> */}
        <div className="bg-white rounded-xl shadow p-8">
          <h2 className="text-2xl font-bold mb-6">Search Visitor</h2>

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg mb-6"
            placeholder="Search by name, phone, or flat..."
          />

          <div className="space-y-3">
            {filtered.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No results</p>
            ) : (
              filtered.map(v => (
                <div key={v.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-lg">{v.name}</p>
                      <p className="text-sm text-gray-600">Phone: {v.phone}</p>
                      <p className="text-sm text-gray-600">Flat: {v.flat} • {v.purpose}</p>
                      <p className="text-xs text-gray-500">In: {v.checkIn} {v.checkOut && `| Out: ${v.checkOut}`}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      v.status === 'inside' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {v.status === 'inside' ? 'Inside' : 'Out'}
                    </span>
                  </div>
                  {v.status === 'inside' && (
                    <button
                      onClick={() => onCheckOut(v.id)}
                      className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 font-semibold"
                    >
                      Check Out
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function VisitorApp() {
  // const { notifications, showNotification, dismissNotification } = useNotificationManager();
  // Resident notifications
const {
  notifications: residentNotifications,
  showNotification: showResidentNotification,
  dismissNotification: dismissResidentNotification
} = useNotificationManager();

// Security notifications
const {
  notifications: securityNotifications,
  showNotification: showSecurityNotification,
  dismissNotification: dismissSecurityNotification
} = useNotificationManager();


  // ✅ MUST ADD THIS
  const { user, view, login, logout, setView } = useAuth();
  const [currentResident, setCurrentResident] = useState(null);
  const [residentData, setResidentData] = useState(null);
  const [securityData, setSecurityData] = useState(null);
  const [adminData, setAdminData] = useState(null);

  // 👉 RESTORE USER DATA FROM AUTHCONTEXT ON PAGE REFRESH
useEffect(() => {
  if (user && user.role) {
    if (user.role === 'resident') {
      setCurrentResident(user.identifier);
      setResidentData(user.data);
    } else if (user.role === 'security') {
      setSecurityData(user.data);
    } else if (user.role === 'admin') {
      setAdminData(user.data);
    }
  }
}, [user]);

  const [visitors, setVisitors] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [activities, setActivities] = useState([]);
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);
  // const [loginMessage, setLoginMessage] = useState('');
  // const [residentNotification, setResidentNotification] = useState({ type: '', message: '' });
  const [setResidentNotification] = useState({ type: '', message: '' });
  const [setSecurityNotification] = useState({ type: '', message: '' });
  // const [securityNotification, setSecurityNotification] = useState({ type: '', message: '' });
  const [residents] = useState(() => loadData('residents', defaultResidents));
  // eslint-disable-next-line no-unused-vars
  const [admins] = useState(() => loadData('admins', defaultAdmins));
  const [securityGuards] = useState(() => loadData('securityGuards', defaultGuards));

  // 🔔 Detect new pending visitors (GLOBAL)
const prevPendingCount = useRef(0);

useEffect(() => {
  const pendingVisitors = visitors.filter(v => v.status === 'pending');

  if (pendingVisitors.length > prevPendingCount.current) {
    // const newVisitor = pendingVisitors[0];

    // showNotification({
    //   title: 'Visitor Waiting for Approval!',
    //   visitorName: newVisitor.name,
    //   phone: newVisitor.phone,
    //   flat: newVisitor.flat,
    //   purpose: newVisitor.purpose
    // });
  }

  prevPendingCount.current = pendingVisitors.length;
}, [visitors]);

// Auto-cancel expired pre-approvals (24-hour rule)
useEffect(() => {
  if (!firebaseInitialized) return;
  
  const checkExpiredApprovals = async () => {
    const now = new Date().toISOString();
    
    for (const approval of approvals) {
      if (approval.expiresAt && approval.expiresAt < now && approval.status === 'Pre-Approved') {
        try {
          // Update status in Firebase
          await updateApproval(approval.id, {
            status: 'Cancelled',
            arrivalStatus: 'Expired'
          });
          
          // Log activity
          await addActivity({
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            action: 'Pre-Approval Auto-Cancelled (24hr expired)',
            performedBy: 'System',
            visitorName: approval.name,
            flat: approval.flat,
            status: 'Expired',
            date: new Date().toLocaleDateString()
          });
        } catch (error) {
          console.error("Error auto-cancelling approval:", error);
        }
      }
    }
  };

// // 🔔 Detect new pending visitors (GLOBAL)
// const prevPendingCount = useRef(0);

// useEffect(() => {
//   const pendingVisitors = visitors.filter(v => v.status === 'pending');

//   if (pendingVisitors.length > prevPendingCount.current) {
//     const newVisitor = pendingVisitors[0];

//     showNotification({
//       title: 'Visitor Waiting for Approval!',
//       visitorName: newVisitor.name,
//       phone: newVisitor.phone,
//       flat: newVisitor.flat,
//       purpose: newVisitor.purpose
//     });
//   }

//   prevPendingCount.current = pendingVisitors.length;
// }, [visitors]);
  
  // Check every minute
  const interval = setInterval(checkExpiredApprovals, 60000);
  checkExpiredApprovals(); // Check immediately on mount
  
  return () => clearInterval(interval);
}, [approvals, firebaseInitialized]);
 
const handleCheckIn = async (data) => {
  try {
    // Upload photo to Firebase Storage if exists
    let photoUrl = null;
    if (data.photo) {
      const tempId = `visitor_${Date.now()}`;
      photoUrl = await uploadVisitorPhoto(data.photo, tempId);
    }
    
// From handleCheckIn (Line 1314-1349)
const newVisitor = {
  name: data.name,
  phone: data.phone,
  flat: data.flat,
  purpose: data.purpose,
  vehicle: data.vehicle || '',
  photo: photoUrl,  // ✅ Photo URL from Firebase Storage
  checkIn: new Date().toLocaleTimeString(),
  checkOut: null,
  status: 'pending',
  approvalStatus: 'pending'
};

// ✅ Saved to Firebase automatically
await addVisitor(newVisitor);

    // Log activity
    await addActivity({
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      action: 'Visitor Check-In Requested',
      performedBy: `Security - ${securityData?.name || 'Gate'}`,
      visitorName: data.name,
      flat: data.flat,
      status: 'Awaiting Resident Approval',
      date: new Date().toLocaleDateString()
    });
    
    setView('security-dash');
    setSecurityNotification({
        type: 'success',
        message: `Visitor ${data.name} checked in successfully. Awaiting resident approval.`
      });

      setTimeout(() => {
        setSecurityNotification({ type: '', message: '' });
      }, 3000);

  } catch (error) {
    console.error("Error checking in visitor:", error);
    alert("Failed to check in visitor. Please try again.");
  }
};

const handleApproveVisitor = async (visitorId) => {
  try {
    const visitor = visitors.find(v => v.id === visitorId);
    
    // Update visitor status in Firebase
    await updateVisitor(visitorId, {
      status: 'inside',
      approvalStatus: 'approved'
    });
    
    // Log activity
    if (visitor) {
      await addActivity({
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        action: 'Visitor Entry Approved',
        performedBy: `Resident - Flat ${currentResident}`,
        visitorName: visitor.name,
        flat: visitor.flat,
        status: 'Approved - Inside',
        date: new Date().toLocaleDateString()
      });
    }
  } catch (error) {
    console.error("Error approving visitor:", error);
    setResidentNotification({
      type: 'error',
      message: 'Failed to approve visitor. Please try again.'
    });
    setTimeout(() => {
      setResidentNotification({ type: '', message: '' });
    }, 5000);
  }
};

const handleRejectVisitor = async (visitorId) => {
  try {
    const visitor = visitors.find(v => v.id === visitorId);
    
    // Update visitor status in Firebase
    await updateVisitor(visitorId, {
      status: 'rejected',
      approvalStatus: 'rejected'
    });
    
    // Log activity
    if (visitor) {
      await addActivity({
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        action: 'Visitor Entry Rejected',
        performedBy: `Resident - Flat ${currentResident}`,
        visitorName: visitor.name,
        flat: visitor.flat,
        status: 'Rejected',
        date: new Date().toLocaleDateString()
      });
    }
  } catch (error) {
    console.error("Error rejecting visitor:", error);
    setResidentNotification({
      type: 'error',
      message: 'Failed to reject visitor. Please try again.'
    });
    setTimeout(() => {
      setResidentNotification({ type: '', message: '' });
    }, 5000);
  }
};

const handleCheckOut = async (id) => {
  try {
    const visitor = visitors.find(v => v.id === id);
    
    // Update visitor in Firebase
    await updateVisitor(id, {
      status: 'out',
      checkOut: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    });
    
    // Log activity
    if (visitor) {
      await addActivity({
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        action: 'Visitor Checked Out',
        performedBy: `Security - ${securityData?.name || 'Gate'}`,
        visitorName: visitor.name,
        flat: visitor.flat,
        status: 'Completed',
        date: new Date().toLocaleDateString()
      });
    }
  } catch (error) {
    console.error("Error checking out visitor:", error);
    alert("Failed to check out visitor. Please try again.");
  }
};

// Initialize Firebase real-time listeners
useEffect(() => {
  console.log("🔥 Setting up Firebase listeners...");
  
  seedDefaultData();
  setFirebaseInitialized(true);
  
  const unsubscribeVisitors = listenToVisitors((visitorsData) => {
    setVisitors(visitorsData);
  });

  const unsubscribeApprovals = listenToApprovals((approvalsData) => {
    setApprovals(approvalsData);
  });

  const unsubscribeActivities = listenToActivities((activitiesData) => {
    setActivities(activitiesData);
  });
  
  return () => {
    unsubscribeVisitors();
    unsubscribeApprovals();
    unsubscribeActivities();
  };
}, []);

// Find this function in VisitorApp.jsx and replace it with this async version:

const handleAddApproval = async (data) => {
  try {
    const verificationCode = generateVerificationCode();
    
    const newApproval = {
      name: data.name,
      type: data.type,
      frequency: data.frequency,
      flat: currentResident,
      approved: true,
      requestTime: new Date().toLocaleTimeString(),
      status: 'Pre-Approved',
      arrivalStatus: 'Not Arrived Yet',
      preApprovalCode: verificationCode,
      contactNumber: data.contactNumber,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };

    // ✅ Saved to Firebase automatically
    await addApproval(newApproval);
    
    // Show inline notification with code
    setResidentNotification({
      type: 'success',
      message: `Pre-Approval Created! Verification Code: ${verificationCode} - Share this with ${data.name}. Valid for 24 hours.`
    });
    // 🔔 Notify Security Dashboard
showSecurityNotification({
  title: 'New Pre-Approved Visitor',
  visitorName: data.name,
  phone: data.contactNumber,
  flat: currentResident,
  purpose: data.type,
  type: 'security'
});

    
    // Clear notification after 8 seconds
    setTimeout(() => {
      setResidentNotification({ type: '', message: '' });
    }, 8000);
    
    // Log activity
    await addActivity({
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      action: 'Pre-Approved Visitor Added',
      performedBy: `Resident - Flat ${currentResident}`,
      visitorName: data.name,
      flat: currentResident,
      status: 'Awaiting Arrival',
      date: new Date().toLocaleDateString()
    });
    
    setView('resident-dash');
  } catch (error) {
    console.error("Error adding approval:", error);
    setResidentNotification({
      type: 'error',
      message: 'Failed to add approval. Please try again.'
    });
    setTimeout(() => {
      setResidentNotification({ type: '', message: '' });
    }, 5000);
  }
};

//   const handleApproveRequest = (id) => {
//   const updated = approvals.map(a =>
//     a.id === id ? { ...a, approved: true, status: 'Pre-Approved' } : a
//   );
//   setApprovals(updated);
//   // saveData('approvals', updated);
// };

const handleCancelApproval = async (approvalId, flat) => {
  try {
    const approval = approvals.find(a => a.id === approvalId);
    
    if (!approval) return;
    
    // Update approval status in Firebase
    await updateApproval(approvalId, {
      status: 'Cancelled',
      arrivalStatus: 'Cancelled by Resident',
      cancelledAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    });
    
      // ENSURE this notification code exists (should already be there):
      setResidentNotification({
        type: 'error',
        message: `Pre-approved visitor "${approval.name}" has been cancelled successfully.`
      });

      setTimeout(() => {
        setResidentNotification({ type: '', message: '' });
      }, 5000);

    
    // Log activity
    if (approval) {
      await addActivity({
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        action: 'Pre-Approval Manually Cancelled',
        performedBy: `Resident - Flat ${flat}`,
        visitorName: approval.name,
        flat: flat,
        status: 'Cancelled',
        date: new Date().toLocaleDateString()
      });
    }
  } catch (error) {
    console.error("Error cancelling approval:", error);
    setResidentNotification({
      type: 'error',
      message: 'Failed to cancel approval. Please try again.'
    });
    setTimeout(() => {
      setResidentNotification({ type: '', message: '' });
    }, 5000);
  }
};

const handleMarkArrived = async (approvalId) => {
  try {
    const approval = approvals.find(a => a.id === approvalId);
    
    if (!approval) return;
    
    // Delete from approvals
    await deleteApproval(approvalId);
    
    // Add to visitors as "inside"
    const newVisitor = {
      name: approval.name,
      phone: approval.contactNumber || '',
      flat: approval.flat,
      purpose: approval.type,
      vehicle: '',
      checkIn: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      checkOut: null,
      status: 'inside',
      approvalStatus: 'approved',
      photo: null,
      fromPreApproval: true
    };
    
    await addVisitor(newVisitor);
// 🔔 Notify Resident
showResidentNotification({
  title: 'Pre-Approved Visitor Checked In',
  visitorName: approval.name,
  phone: approval.contactNumber,
  flat: approval.flat,
  purpose: approval.type,
  type: 'resident'
});
    
    // Log activity
    await addActivity({
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      action: 'Pre-Approved Visitor Checked In',
      performedBy: `Security - ${securityData?.name || 'Gate'}`,
      visitorName: approval.name,
      flat: approval.flat,
      status: 'Inside',
      date: new Date().toLocaleDateString()
    });
  } catch (error) {
    console.error("Error marking visitor as arrived:", error);
    alert("Failed to check in visitor. Please try again.");
  }
};

const handleRejectVisitorByAdmin = (visitorId) => {
  const visitor = visitors.find(v => v.id === visitorId);
  const updated = visitors.map(v =>
    v.id === visitorId ? { ...v, status: 'rejected', approvalStatus: 'rejected' } : v
  );
  setVisitors(updated);
  // saveData('visitors', updated);
  
  // Log activity
  if (visitor) {
    const newActivity = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      action: 'Visitor Rejected by Admin',
      performedBy: `Admin - ${adminData?.name || 'Admin'}`,
      visitorName: visitor.name,
      flat: visitor.flat,
      status: 'Rejected',
      date: new Date().toLocaleDateString()
    };
    const updatedActivities = [newActivity, ...activities];
    setActivities(updatedActivities);
    // saveData('activities', updatedActivities);
  }
};

if (view === 'login') {
  return <LoginScreen onLogin={(role, identifier, userData) => {
    if (role === 'resident') {
      setCurrentResident(identifier);
      setResidentData(userData);
    } else if (role === 'security') {
      setSecurityData(userData);
    } else if (role === 'admin') {
      setAdminData(userData);
    }

    initAudioContext();

    setView(role === 'resident' ? 'resident-dash' : 
            role === 'security' ? 'security-dash' : 'admin-dash');
    // setLoginMessage('User login successful');

    // setTimeout(() => {
    //   setLoginMessage('');
    // }, 3000);
  }} />;
}

return (
  <>
    {view === 'login' && <LoginScreen onLogin={login} />}

    {view === 'resident-dash' && (
      <ResidentDashboard
        visitors={visitors}
        approvals={approvals}
        currentResident={currentResident}
        residentInfo={residentData}
        residentNotifications={residentNotifications}
        onDismissResidentNotification={dismissResidentNotification}
        onLogout={logout}
        onAddApproval={() => setView('add-approval')}
        onApproveVisitor={handleApproveVisitor}
        onRejectVisitor={handleRejectVisitor}
        onCancelApproval={handleCancelApproval}
      />
    )}

    {view === 'security-dash' && (
      <SecurityDashboard
        visitors={visitors}
        approvals={approvals}
        securityData={securityData}
        securityNotifications={securityNotifications}
        onDismissSecurityNotification={dismissSecurityNotification}
        onLogout={logout}
        onCheckIn={() => setView('check-in')}
        onSearch={() => setView('search')}
        onCheckOut={handleCheckOut}
        onMarkArrived={handleMarkArrived}
      />
    )}

    {view === 'check-in' && (
      <CheckInForm
        residents={residents}
        onSubmit={handleCheckIn}
        onCancel={() => setView('security-dash')}
      />
    )}

    {view === 'add-approval' && (
      <AddApprovalForm
        onSubmit={handleAddApproval}
        onCancel={() => setView('resident-dash')}
      />
    )}

    {view === 'search' && (
      <SearchView
        visitors={visitors}
        approvals={approvals}
        onBack={() => setView('security-dash')}
        onCheckOut={handleCheckOut}
      />
    )}

    {view === 'admin-dash' && (
      <AdminDashboard
        visitors={visitors}
        approvals={approvals}
        residents={residents}
        securityGuards={securityGuards}

        activities={activities}   // ✅ REQUIRED
        adminData={adminData}     // ✅ REQUIRED

        onRejectVisitor={handleRejectVisitorByAdmin}
        onLogout={logout}
      />
    )}
  </>
);
}