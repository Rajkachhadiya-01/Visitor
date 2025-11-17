// src/VisitorApp.jsx 
import React, { useState, useRef, useEffect } from 'react';
import { Users, Shield, Home, Camera } from 'lucide-react';
import { 
  addVisitor, 
  updateVisitor, 
  listenToVisitors, 
  addApproval, 
  updateApproval, 
  deleteApproval, 
  listenToApprovals, 
  addActivity, 
  listenToActivities, 
  uploadVisitorPhoto 
} from './utils/firebaseService';
import AdminDashboard from './AdminDashboard';
import SecurityDashboard from './SecurityDashboard';
import ResidentDashboard from './ResidentDashboard';
import FilterDropdown from './components/FilterDropdown';
import { NotificationContainer } from './components/NotificationToast';
import { useNotificationManager } from './hooks/useNotifications';
import { useAuth } from "./context/AuthContext";
import { loadData } from './utils/storage';

/**
 * Generate 6-digit unique verification code
 */
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Notification sound using HTML5 Audio
let audioInstance = null;

/**
 * Initialize audio context for notification sounds
 */
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

/**
 * Play notification sound
 */
export const playNotificationSound = async () => {
  try {
    if (!audioInstance) {
      initAudioContext();
    }
    
    audioInstance.currentTime = 0;
    const playPromise = audioInstance.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log("🔔 Sound played successfully");
        })
        .catch((err) => {
          console.error("❌ Audio playback failed:", err);
        });
    }
  } catch (err) {
    console.error("❌ Audio playback error:", err);
  }
};

window.playNotificationSound = playNotificationSound;
window.initAudioContext = initAudioContext;

let audioInitialized = false;
const initOnInteraction = () => {
  if (!audioInitialized) {
    initAudioContext();
    audioInitialized = true;
    console.log("🔊 Audio enabled after user interaction");
  }
};

document.addEventListener('click', initOnInteraction);
document.addEventListener('touchstart', initOnInteraction);

// Demo data
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

// ==================== LOGIN SCREEN ====================
const LoginScreen = ({ onLogin }) => {
  const [userType, setUserType] = useState(null);
  const [step, setStep] = useState('select');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [notice, setNotice] = useState({ type: '', text: '' });

  useEffect(() => {
    if (notice.text) {
      const timer = setTimeout(() => setNotice({ type: '', text: '' }), 5000);
      return () => clearTimeout(timer);
    }
  }, [notice]);

  const residents = loadData('residents', defaultResidents);
  const securityGuards = loadData('securityGuards', defaultGuards);
  const admins = loadData('admins', defaultAdmins);

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
              className="w-full flex items-center justify-center gap-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition"
            >
              <Users className="w-6 h-6" />
              Login as Admin
            </button>
          </div>
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">Enter OTP</label>
              <input
                type="password"
                maxLength="4"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 4-digit OTP"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-center tracking-widest focus:border-indigo-500 focus:outline-none"
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

// ==================== CHECK-IN FORM ====================
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
  const [submitting, setSubmitting] = useState(false);
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

  const handleSubmit = async () => {
    if (name && phone && flat && purpose) {
      setSubmitting(true);
      try {
        await onSubmit({ name, phone, flat, purpose, vehicle, photo });
      } finally {
        setSubmitting(false);
      }
    } else {
      alert('Please fill all required fields');
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
                disabled={submitting}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Check In'}
              </button>
              <button
                onClick={onCancel}
                disabled={submitting}
                className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
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

// ==================== ADD APPROVAL FORM ====================
const AddApprovalForm = ({ onSubmit, onCancel }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [frequency, setFrequency] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (name && type && frequency && contactNumber && contactNumber.length === 10) {
      setSubmitting(true);
      try {
        await onSubmit({ name, type, frequency, contactNumber });
      } finally {
        setSubmitting(false);
      }
    } else {
      alert('Please fill all required fields with valid contact number');
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
                disabled={submitting}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Add Approval'}
              </button>
              <button
                onClick={onCancel}
                disabled={submitting}
                className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
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

// ==================== SEARCH VIEW ====================
const SearchView = ({ visitors, approvals = [], onBack, onCheckOut, onMarkArrived, showToast }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('visitors');

  const filteredVisitors = visitors.filter(v => {
    if (!v) return false;
    
    const query = searchTerm.toLowerCase();
    const name = (v.name || '').toLowerCase();
    const phone = (v.phone || '').toString();
    const flat = (v.flat || '').toLowerCase();
    const purpose = (v.purpose || '').toLowerCase();
    
    return (
      name.includes(query) ||
      phone.includes(searchTerm) ||
      flat.includes(query) ||
      purpose.includes(query)
    );
  });

  const filteredApprovals = approvals.filter(a => {
    if (!a) return false;
    if (a.status !== 'Pre-Approved' || a.arrivalStatus === 'Arrived at Gate') return false;
    
    const query = searchTerm.toLowerCase();
    const name = (a.name || '').toLowerCase();
    const flat = (a.flat || '').toLowerCase();
    const code = (a.preApprovalCode || '').toString();
    
    return (
      name.includes(query) ||
      flat.includes(query) ||
      code.includes(searchTerm)
    );
  });

  const handleVerifyCode = (approvalId, enteredCode, preApprovalCode) => {
    if (enteredCode === preApprovalCode) {
      onMarkArrived(approvalId);
      
      if (showToast) {
        showToast('Visitor verified and checked in successfully!', 'success');
      }
    } else {
      if (showToast) {
        showToast('❌ Invalid Code - The verification code does not match.', 'error');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <button onClick={onBack} className="text-gray-600 mb-4 hover:text-gray-800">
          ← Back
        </button>

        <div className="bg-white rounded-xl shadow p-8">
          <h2 className="text-2xl font-bold mb-6">Search Visitor</h2>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('visitors')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                activeTab === 'visitors'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Visitors
            </button>
            <button
              onClick={() => setActiveTab('preapprovals')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                activeTab === 'preapprovals'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Pre-Approvals
            </button>
          </div>

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg mb-6"
            placeholder="Search by name, phone, flat, or code..."
          />

          {activeTab === 'visitors' && (
            <div className="space-y-3">
              {filteredVisitors.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No visitors found</p>
              ) : (
                filteredVisitors.map(v => (
                  <div key={v.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-lg">{v.name}</p>
                        <p className="text-sm text-gray-600">Phone: {v.phone}</p>
                        <p className="text-sm text-gray-600">Flat: {v.flat} • {v.purpose}</p>
                        <p className="text-xs text-gray-500">In: {v.checkIn}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        v.status === 'inside' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {v.status === 'inside' ? 'Inside' : v.status}
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
          )}

          {activeTab === 'preapprovals' && (
            <div className="space-y-3">
              {filteredApprovals.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No pre-approvals found</p>
              ) : (
                filteredApprovals.map(a => (
                  <div key={a.id} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <p className="font-semibold text-lg">{a.name}</p>
                        <p className="text-sm text-gray-600 mt-1">Flat: {a.flat} • {a.type}</p>
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
                          id={`search-code-${a.id}`}
                        />
                        <button
                          onClick={() => {
                            const codeInput = document.getElementById(`search-code-${a.id}`);
                            const enteredCode = codeInput.value;
                            
                            handleVerifyCode(a.id, enteredCode, a.preApprovalCode);
                            codeInput.value = '';
                          }}
                          className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition"
                        >
                          ✓ Verify & Allow Entry
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN APP ====================
export default function VisitorApp() {
  const {
    notifications: residentNotifications,
    showNotification: showResidentNotification,
    showToast: showResidentToast,
    dismissNotification: dismissResidentNotification,
    // enableNotifications: enableResidentNotifications
  } = useNotificationManager();

  const {
    notifications: securityNotifications,
    showNotification: showSecurityNotification,
    showToast: showSecurityToast,
    dismissNotification: dismissSecurityNotification,
    // enableNotifications: enableSecurityNotifications
  } = useNotificationManager();

  const {
    notifications: adminNotifications,
    showToast: showAdminToast,
    dismissNotification: dismissAdminNotification,
    // enableNotifications: enableAdminNotifications
  } = useNotificationManager();

  const { user, view, login, logout, setView } = useAuth();
  const [currentResident, setCurrentResident] = useState(null);
  const [residentData, setResidentData] = useState(null);
  const [securityData, setSecurityData] = useState(null);
  const [adminData, setAdminData] = useState(null);

  const [visitors, setVisitors] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [activities, setActivities] = useState([]);
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);

  const [residents] = useState(() => loadData('residents', defaultResidents));
  const [securityGuards] = useState(() => loadData('securityGuards', defaultGuards));

// ✅ FIXED: Track fresh login vs page refresh
  const isFreshLoginRef = useRef(false);
  const notificationsInitializedRef = useRef(false);
  // const residentNotificationReadyRef = useRef(false);
  // const securityNotificationReadyRef = useRef(false);

  // ✅ Setup user data and show login toast ONLY on fresh login
  useEffect(() => {
    if (user && user.role && isFreshLoginRef.current) {
      // Reset the flag immediately after showing toast
      isFreshLoginRef.current = false;
      
      if (user.role === 'resident') {
        setCurrentResident(user.identifier);
        setResidentData(user.data);
        showResidentToast('Login Successful! Welcome back.', 'success');
        
      } else if (user.role === 'security') {
        setSecurityData(user.data);
        showSecurityToast('Login Successful! Welcome back.', 'success');
        
      } else if (user.role === 'admin') {
        setAdminData(user.data);
        showAdminToast('Login Successful! Welcome back.', 'success');
      }
    }
    
    // If user exists but isFreshLogin is false, it's a page refresh
    // Set up the user data but don't show toast
    if (user && user.role && !isFreshLoginRef.current) {
      if (user.role === 'resident') {
        setCurrentResident(user.identifier);
        setResidentData(user.data);
      } else if (user.role === 'security') {
        setSecurityData(user.data);
      } else if (user.role === 'admin') {
        setAdminData(user.data);
      }
    }
  }, [user, showResidentToast, showSecurityToast, showAdminToast]);

  // Setup Firebase listeners
  useEffect(() => {
    console.log("🔥 Setting up Firebase listeners...");
    
    setFirebaseInitialized(true);
    
    const unsubscribeVisitors = listenToVisitors((visitorsData) => {
      console.log("✅ Visitors updated from Firebase:", visitorsData.length);
      setVisitors(visitorsData);
    });

    const unsubscribeApprovals = listenToApprovals((approvalsData) => {
      console.log("✅ Approvals updated from Firebase:", approvalsData.length);
      setApprovals(approvalsData);
    });

    const unsubscribeActivities = listenToActivities((activitiesData) => {
      console.log("✅ Activities updated from Firebase:", activitiesData.length);
      setActivities(activitiesData);
    });
    
    return () => {
      unsubscribeVisitors();
      unsubscribeApprovals();
      unsubscribeActivities();
    };
  }, []);

  // ✅ FIXED: Handle resident notifications - Skip on page refresh
  useEffect(() => {
    if (user && user.role === 'resident' && currentResident && visitors.length > 0) {
      const pendingForThisFlat = visitors.filter(
        v => v.flat === currentResident && v.status === 'pending'
      );
      
      // ✅ On first run (page refresh), just initialize without showing notifications
      if (!notificationsInitializedRef.current) {
        const currentPendingIds = new Set(pendingForThisFlat.map(v => v.id));
        // Store existing pending visitor IDs
        window.localStorage.setItem(
          `pending-visitors-${currentResident}`,
          JSON.stringify([...currentPendingIds])
        );
        notificationsInitializedRef.current = true;
        console.log("✅ Initialized pending visitors (no notifications on refresh)");
        return;
      }
      
      // ✅ Get previously stored IDs
      const storedIds = JSON.parse(
        window.localStorage.getItem(`pending-visitors-${currentResident}`) || '[]'
      );
      const previousIds = new Set(storedIds);
      
      // Find NEW visitors (not in previous set)
      const newVisitors = pendingForThisFlat.filter(v => !previousIds.has(v.id));
      
      // Show notifications only for NEW visitors
      if (newVisitors.length > 0) {
        console.log(`🔔 ${newVisitors.length} NEW visitor(s) detected!`);
        newVisitors.forEach(visitor => {
          showResidentNotification({
            title: 'Visitor Waiting for Approval!',
            visitorName: visitor.name,
            phone: visitor.phone,
            flat: visitor.flat,
            purpose: visitor.purpose,
            type: 'resident'
          });
        });
      }
      
      // Update stored IDs
      const currentPendingIds = new Set(pendingForThisFlat.map(v => v.id));
      window.localStorage.setItem(
        `pending-visitors-${currentResident}`,
        JSON.stringify([...currentPendingIds])
      );
    }
  }, [user, currentResident, visitors, showResidentNotification]);

  // ✅ FIXED: Handle security notifications - Skip on page refresh
  useEffect(() => {
    if (user && user.role === 'security' && approvals.length > 0) {
      const pendingApprovals = approvals.filter(
        a =>
          a.status === 'Pre-Approved' &&
          (!a.arrivalStatus || a.arrivalStatus === 'Not Arrived Yet')
      );

      // ✅ On first run (page refresh), just initialize without showing notifications
      if (!notificationsInitializedRef.current) {
        const currentPendingIds = new Set(pendingApprovals.map(a => a.id));
        // Store existing pending approval IDs
        window.localStorage.setItem(
          'pending-approvals-security',
          JSON.stringify([...currentPendingIds])
        );
        notificationsInitializedRef.current = true;
        console.log("✅ Initialized pending approvals (no notifications on refresh)");
        return;
      }
      
      // ✅ Get previously stored IDs
      const storedIds = JSON.parse(
        window.localStorage.getItem('pending-approvals-security') || '[]'
      );
      const previousIds = new Set(storedIds);
      
      // Find NEW approvals (not in previous set)
      const newApprovals = pendingApprovals.filter(a => !previousIds.has(a.id));

      // Show notifications only for NEW approvals
      if (newApprovals.length > 0) {
        console.log(`🔔 ${newApprovals.length} NEW pre-approved visitor(s) detected!`);
        newApprovals.forEach(approval => {
          showSecurityNotification({
            title: 'New Pre-Approved Visitor',
            visitorName: approval.name,
            phone: approval.contactNumber,
            flat: approval.flat,
            purpose: approval.type,
            type: 'security'
          });
        });
      }
      
      // Update stored IDs
      const currentPendingIds = new Set(pendingApprovals.map(a => a.id));
      window.localStorage.setItem(
        'pending-approvals-security',
        JSON.stringify([...currentPendingIds])
      );
    }
  }, [user, approvals, showSecurityNotification]);

  // Auto-cancel expired approvals
  useEffect(() => {
    if (!firebaseInitialized) return;
    
    const checkExpiredApprovals = async () => {
      const now = new Date().toISOString();
      
      for (const approval of approvals) {
        if (approval.expiresAt && approval.expiresAt < now && approval.status === 'Pre-Approved') {
          try {
            await updateApproval(approval.id, {
              status: 'Cancelled',
              arrivalStatus: 'Expired'
            });
            
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
    
    const interval = setInterval(checkExpiredApprovals, 60000);
    checkExpiredApprovals();
    
    return () => clearInterval(interval);
  }, [approvals, firebaseInitialized]);

  const handleCheckIn = async (data) => {
    try {
      let photoUrl = null;
      if (data.photo) {
        const tempId = `visitor_${Date.now()}`;
        photoUrl = await uploadVisitorPhoto(data.photo, tempId);
      }
      
      const newVisitor = {
        name: data.name,
        phone: data.phone,
        flat: data.flat,
        purpose: data.purpose,
        vehicle: data.vehicle || '',
        photo: photoUrl,
        checkIn: new Date().toLocaleTimeString(),
        checkOut: null,
        status: 'pending',
        approvalStatus: 'pending',
        createdAt: new Date().toISOString()
      };

      await addVisitor(newVisitor);

      await addActivity({
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        action: 'Visitor Check-In Requested',
        performedBy: `Security - ${securityData?.name || 'Gate'}`,
        visitorName: data.name,
        flat: data.flat,
        status: 'Awaiting Resident Approval',
        date: new Date().toLocaleDateString(),
        createdAt: new Date().toISOString()
      });
      
      setView('security-dash');

    } catch (error) {
      console.error("❌ Error checking in visitor:", error);
      alert("Failed to check in visitor. Please try again.");
    }
  };

  const handleApproveVisitor = async (visitorId) => {
    try {
      const visitor = visitors.find(v => v.id === visitorId);
      
      await updateVisitor(visitorId, {
        status: 'inside',
        approvalStatus: 'approved'
      });
      
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
      console.error("❌ Error approving visitor:", error);
      alert('Failed to approve visitor. Please try again.');
    }
  };

  const handleRejectVisitor = async (visitorId) => {
    try {
      const visitor = visitors.find(v => v.id === visitorId);
      
      await updateVisitor(visitorId, {
        status: 'rejected',
        approvalStatus: 'rejected'
      });
      
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
      console.error("❌ Error rejecting visitor:", error);
      alert('Failed to reject visitor. Please try again.');
    }
  };

  const handleCheckOut = async (id) => {
    try {
      const visitor = visitors.find(v => v.id === id);
      
      await updateVisitor(id, {
        status: 'out',
        checkOut: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      });
      
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
      console.error("❌ Error checking out visitor:", error);
      alert("Failed to check out visitor. Please try again.");
    }
  };

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

      await addApproval(newApproval);

      await addActivity({
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        action: 'Pre-Approved Visitor Added',
        performedBy: `Resident - Flat ${currentResident}`,
        visitorName: data.name,
        flat: currentResident,
        status: 'Awaiting Arrival',
        date: new Date().toLocaleDateString(),
        createdAt: new Date().toISOString()
      });
      
      setView('resident-dash');

    } catch (error) {
      console.error("❌ Error adding approval:", error);
      alert('Failed to add approval. Please try again.');
    }
  };

  const handleCancelApproval = async (approvalId, flat) => {
    try {
      const approval = approvals.find(a => a.id === approvalId);
      
      if (!approval) return;
      
      await updateApproval(approvalId, {
        status: 'Cancelled',
        arrivalStatus: 'Cancelled by Resident',
        cancelledAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      });
      
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
      console.error("❌ Error cancelling approval:", error);
      alert('Failed to cancel approval. Please try again.');
    }
  };

  const handleMarkArrived = async (approvalId) => {
    try {
      const approval = approvals.find(a => a.id === approvalId);
      
      if (!approval) return;
      
      await deleteApproval(approvalId);
      
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
      console.error("❌ Error marking visitor as arrived:", error);
      alert("Failed to check in visitor. Please try again.");
    }
  };

  const handleRejectVisitorByAdmin = async (visitorId) => {
    try {
      const visitor = visitors.find(v => v.id === visitorId);
      
      await updateVisitor(visitorId, {
        status: 'rejected',
        approvalStatus: 'rejected'
      });
      
      if (visitor) {
        await addActivity({
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          action: 'Visitor Rejected by Admin',
          performedBy: `Admin - ${adminData?.name || 'Admin'}`,
          visitorName: visitor.name,
          flat: visitor.flat,
          status: 'Rejected',
          date: new Date().toLocaleDateString()
        });
      }
    } catch (error) {
      console.error("❌ Error rejecting visitor:", error);
      alert('Failed to reject visitor. Please try again.');
    }
  };

  if (view === 'login') {
    return <LoginScreen onLogin={(role, identifier, userData) => {
      // ✅ SET FLAG TO TRUE FOR ACTUAL FRESH LOGIN
      isFreshLoginRef.current = true;
      
      // ✅ RESET notification initialization on fresh login
      notificationsInitializedRef.current = false;
      
      // ✅ CLEAR localStorage tracking on fresh login
      if (role === 'resident') {
        window.localStorage.removeItem(`pending-visitors-${identifier}`);
        setCurrentResident(identifier);
        setResidentData(userData);
      } else if (role === 'security') {
        window.localStorage.removeItem('pending-approvals-security');
        setSecurityData(userData);
      } else if (role === 'admin') {
        setAdminData(userData);
      }

      initAudioContext();
      login(role, identifier, userData);
    }} />;
  }

  return (
    <>
      {view === 'resident-dash' && (
        <>
          <ResidentDashboard
            visitors={visitors}
            approvals={approvals}
            currentResident={currentResident}
            residentInfo={residentData}
            residentNotifications={[]}
            onDismissResidentNotification={() => {}}
            onLogout={logout}
            onAddApproval={() => setView('add-approval')}
            onApproveVisitor={handleApproveVisitor}
            onRejectVisitor={handleRejectVisitor}
            onCancelApproval={handleCancelApproval}
          />
          <NotificationContainer
            notifications={residentNotifications}
            onDismiss={dismissResidentNotification}
          />
        </>
      )}

      {view === 'security-dash' && (
        <>
          <SecurityDashboard
            visitors={visitors}
            approvals={approvals}
            securityData={securityData}
            securityNotifications={[]}
            onDismissSecurityNotification={() => {}}
            onLogout={logout}
            onCheckIn={() => setView('check-in')}
            onSearch={() => setView('search')}
            onCheckOut={handleCheckOut}
            onMarkArrived={handleMarkArrived}
          />
          <NotificationContainer
            notifications={securityNotifications}
            onDismiss={dismissSecurityNotification}
          />
        </>
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
          onMarkArrived={handleMarkArrived}
          showToast={showSecurityToast}
        />
      )}

      {view === 'admin-dash' && (
        <>
          <AdminDashboard
            visitors={visitors}
            approvals={approvals}
            activities={activities}
            residents={residents}
            securityGuards={securityGuards}
            adminData={adminData}
            onRejectVisitor={handleRejectVisitorByAdmin}
            onLogout={logout}
          />
          <NotificationContainer
            notifications={adminNotifications}
            onDismiss={dismissAdminNotification}
          />
        </>
      )}
    </>
  );
}