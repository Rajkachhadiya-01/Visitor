// src/VisitorApp.jsx
import React, { useState, useRef } from 'react';
import { 
  Users, Shield, Home, Bell, UserPlus, Search, CheckCircle, 
  XCircle, Clock, Camera 
} from 'lucide-react';


const LoginScreen = ({ onLogin }) => {
const [userType, setUserType] = useState(null);
const [selectedResident, setSelectedResident] = useState('');

const residents = [
{ id: 1, name: 'Amit Kumar', flat: 'A-101' },
{ id: 2, name: 'Priya Sharma', flat: 'B-205' },
{ id: 3, name: 'Rajesh Gupta', flat: 'C-304' },
];

const handleResidentLogin = () => {
if (selectedResident) {
onLogin('resident', selectedResident);
} else {
alert('Please select a resident');
}
};

return (
<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
<div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
<div className="text-center mb-8">
<div className="inline-block p-4 bg-indigo-100 rounded-full mb-4">
<Home className="w-12 h-12 text-indigo-600" />
</div>
<h1 className="text-3xl font-bold text-gray-800">Society Visitor Manager</h1>
<p className="text-gray-600 mt-2">Secure Entry System</p>
</div>


    {!userType ? (
      <div className="space-y-4">
        <button
          onClick={() => setUserType('resident')}
          className="w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition"
        >
          <Users className="w-6 h-6" />
          Login as Resident
        </button>
        
        <button
          onClick={() => onLogin('security', null)}
          className="w-full flex items-center justify-center gap-3 bg-gray-700 hover:bg-gray-800 text-white font-semibold py-4 px-6 rounded-xl transition"
        >
          <Shield className="w-6 h-6" />
          Login as Security
        </button>
      </div>
    ) : (
      <div className="space-y-4">
        <button
          onClick={() => setUserType(null)}
          className="text-gray-600 hover:text-gray-800 mb-2 flex items-center gap-2"
        >
          ← Back
        </button>
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Select Resident
          </label>
          <select
            value={selectedResident}
            onChange={(e) => setSelectedResident(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none"
          >
            <option value="">Choose your flat...</option>
            {residents.map(r => (
              <option key={r.id} value={r.flat}>
                {r.flat} - {r.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleResidentLogin}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition"
        >
          Continue
        </button>
      </div>
    )}
  </div>
</div>


);
};

const ResidentDashboard = ({ visitors, approvals, notifications, currentResident, residentInfo, onLogout, onAddApproval, onApproveRequest, onApproveVisitor, onRejectVisitor }) => {
const myVisitors = visitors.filter(v => v.flat === currentResident);
const myApprovals = approvals.filter(a => a.flat === currentResident && a.approved);
const pendingRequests = approvals.filter(a => a.flat === currentResident && !a.approved);
const pendingVisitors = visitors.filter(v => v.flat === currentResident && v.status === 'pending');
const inside = myVisitors.filter(v => v.status === 'inside').length;

return (
<div className="min-h-screen bg-gray-50">
<div className="bg-indigo-600 text-white p-6">
<div className="max-w-6xl mx-auto flex justify-between items-center">
<div>
<h1 className="text-2xl font-bold">Resident Dashboard</h1>
<p className="text-indigo-200">Flat {currentResident} - {residentInfo?.name}</p>
</div>
<button onClick={onLogout} className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold">
Logout
</button>
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
                  <img src={v.photo} alt={v.name} className="w-20 h-20 rounded-lg object-cover border-2 border-orange-300" />
                )}
                <div className="flex-1">
                  <p className="font-semibold text-lg">{v.name}</p>
                  <p className="text-sm text-gray-600">Phone: {v.phone}</p>
                  <p className="text-sm text-gray-600">{v.purpose} {v.vehicle && `• ${v.vehicle}`}</p>
                  <p className="text-xs text-gray-500">Arrived: {v.checkIn}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                  Waiting
                </span>
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
                  Pending
                </span>
              </div>
              <button
                onClick={() => onApproveRequest(a.id)}
                className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700"
              >
                Approve Request
              </button>
            </div>
          ))}
        </div>
      </div>
    )}

    <div className="bg-white rounded-xl shadow mb-6">
      <div className="p-6 border-b flex justify-between items-center">
        <h2 className="text-xl font-bold">Approved Visitors</h2>
        <button
          onClick={onAddApproval}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700"
        >
          <UserPlus className="w-4 h-4" />
          Add
        </button>
      </div>
      <div className="p-6 space-y-3">
        {myApprovals.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No approved visitors</p>
        ) : (
          myApprovals.map(a => (
            <div key={a.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold">{a.name}</p>
                <p className="text-sm text-gray-600">{a.type} • {a.frequency}</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                Active
              </span>
            </div>
          ))
        )}
      </div>
    </div>

    <div className="bg-white rounded-xl shadow">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold">Visitor History</h2>
      </div>
      <div className="p-6 space-y-3">
        {myVisitors.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No visitor history</p>
        ) : (
          myVisitors.map(v => (
            <div key={v.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                {v.photo && (
                  <img src={v.photo} alt={v.name} className="w-12 h-12 rounded-lg object-cover" />
                )}
                <div>
                  <p className="font-semibold">{v.name}</p>
                  <p className="text-sm text-gray-600">{v.purpose}</p>
                  <p className="text-xs text-gray-500">In: {v.checkIn} {v.checkOut && `| Out: ${v.checkOut}`}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                v.status === 'inside' ? 'bg-green-100 text-green-700' : 
                v.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                v.status === 'rejected' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {v.status === 'inside' ? 'Inside' : 
                 v.status === 'pending' ? 'Pending' :
                 v.status === 'rejected' ? 'Rejected' : 'Out'}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
</div>


);
};

const SecurityDashboard = ({ visitors, approvals, onLogout, onCheckIn, onSearch, onCheckOut }) => {
const inside = visitors.filter(v => v.status === 'inside');
const pending = visitors.filter(v => v.status === 'pending');
const pendingApprovals = approvals.filter(a => !a.approved);

return (
<div className="min-h-screen bg-gray-50">
<div className="bg-gray-800 text-white p-6">
<div className="max-w-6xl mx-auto flex justify-between items-center">
<div>
<h1 className="text-2xl font-bold">Security Dashboard</h1>
<p className="text-gray-300">Gate Management</p>
</div>
<button onClick={onLogout} className="bg-white text-gray-800 px-4 py-2 rounded-lg font-semibold">
Logout
</button>
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
          <h2 className="text-xl font-bold">Pre-Approvals Awaiting Resident Confirmation</h2>
        </div>
        <div className="p-6 space-y-3">
          {pendingApprovals.map(a => (
            <div key={a.id} className="flex justify-between items-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div>
                <p className="font-semibold">{a.name}</p>
                <p className="text-sm text-gray-600">Flat: {a.flat} • {a.type} • {a.frequency}</p>
                <p className="text-xs text-gray-500">Requested: {a.requestTime}</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                Awaiting Approval
              </span>
            </div>
          ))}
        </div>
      </div>
    )}

    <div className="bg-white rounded-xl shadow">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold">Currently Inside</h2>
      </div>
      <div className="p-6 space-y-3">
        {inside.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No visitors inside</p>
        ) : (
          inside.map(v => (
            <div key={v.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                {v.photo && (
                  <img src={v.photo} alt={v.name} className="w-16 h-16 rounded-lg object-cover" />
                )}
                <div>
                  <p className="font-semibold">{v.name}</p>
                  <p className="text-sm text-gray-600">Flat: {v.flat} • {v.purpose}</p>
                  <p className="text-xs text-gray-500">In: {v.checkIn} {v.vehicle && `• ${v.vehicle}`}</p>
                </div>
              </div>
              <button
                onClick={() => onCheckOut(v.id)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-semibold"
              >
                Check Out
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
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

const startCamera = async (mode = facingMode) => {
  try {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: mode },
      audio: false,
    });

    if (videoRef.current) {
      videoRef.current.srcObject = mediaStream;

      // ✅ Safari fix — wait for metadata
      videoRef.current.onloadedmetadata = async () => {
        try {
          // Set video dimensions explicitly
          videoRef.current.width = videoRef.current.videoWidth;
          videoRef.current.height = videoRef.current.videoHeight;
          await videoRef.current.play();
          console.log("✅ Camera stream started successfully");
        } catch (err) {
          console.error("Autoplay blocked:", err);
        }
      };
    }

    setStream(mediaStream);
    setShowCamera(true);
  } catch (err) {
    console.error("Camera error:", err);
    alert("Unable to access the camera. Please check permissions and try again.");
  }
};

// eslint-disable-next-line react-hooks/exhaustive-deps
React.useEffect(() => {
  return () => stopCamera();
}, []);

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
              onClick={startCamera}
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
                className="w-full rounded-lg bg-black"
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
                  🔄 Flip Camera
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
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Flat *</label>
          <select
            value={flat}
            onChange={(e) => setFlat(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg"
          >
            <option value="">Select flat</option>
            {residents.map(r => (
              <option key={r.id} value={r.flat}>{r.flat} - {r.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Purpose *</label>
          <select
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg"
          >
            <option value="">Select purpose</option>
            <option value="Personal Visit">Personal Visit</option>
            <option value="Delivery">Delivery</option>
            <option value="Service Provider">Service Provider</option>
            <option value="Domestic Help">Domestic Help</option>
          </select>
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
const [frequency, setFrequency] = useState('');

const handleSubmit = () => {
if (name && type && frequency) {
onSubmit({ name, type, frequency });
} else {
alert('Please fill all fields');
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
          <label className="block text-sm font-semibold text-gray-700 mb-2">Type *</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg"
          >
            <option value="">Select type</option>
            <option value="Domestic Help">Domestic Help</option>
            <option value="Service">Service Provider</option>
            <option value="Guest">Guest</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Frequency *</label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg"
          >
            <option value="">Select</option>
            <option value="once">One Time</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
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

const SearchView = ({ visitors, onBack, onCheckOut }) => {
const [searchTerm, setSearchTerm] = useState('');

const filtered = visitors.filter(v =>
v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
v.phone.includes(searchTerm) ||
v.flat.toLowerCase().includes(searchTerm.toLowerCase())
);

return (
<div className="min-h-screen bg-gray-50 p-6">
<div className="max-w-4xl mx-auto">
<button onClick={onBack} className="text-gray-600 mb-4 hover:text-gray-800">
← Back
</button>


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
const [view, setView] = useState('login');
const [currentResident, setCurrentResident] = useState(null);
const [visitors, setVisitors] = useState([
{ id: 1, name: 'John Doe', phone: '9999999999', flat: 'A-101', purpose: 'Personal Visit', checkIn: '10:30 AM', status: 'inside', vehicle: 'MH-01-AB-1234', approvalStatus: 'approved', photo: null },
{ id: 2, name: 'Sunita', phone: '8888888888', flat: 'A-101', purpose: 'Domestic Help', checkIn: '08:00 AM', checkOut: '12:30 PM', status: 'out', approvalStatus: 'approved', photo: null },
]);
const [approvals, setApprovals] = useState([
{ id: 1, name: 'Sunita (Maid)', type: 'Domestic Help', flat: 'A-101', frequency: 'daily', approved: true },
{ id: 2, name: 'Ravi (Plumber)', type: 'Service', flat: 'A-101', frequency: 'once', approved: true },
]);
const [notifications, setNotifications] = useState([]);

const residents = [
{ id: 1, name: 'Amit Kumar', flat: 'A-101' },
{ id: 2, name: 'Priya Sharma', flat: 'B-205' },
{ id: 3, name: 'Rajesh Gupta', flat: 'C-304' },
];

const handleCheckIn = (data) => {
const newVisitor = {
  ...data,
  id: Date.now(),
  checkIn: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
  status: 'pending',
  approvalStatus: 'pending'
};
setVisitors([newVisitor, ...visitors]);
setNotifications([
{ id: Date.now(), msg: `${data.name} waiting for approval at gate`, time: newVisitor.checkIn, visitorId: newVisitor.id },
...notifications
]);
setView('security-dash');
};

const handleApproveVisitor = (visitorId) => {
setVisitors(visitors.map(v =>
v.id === visitorId ? { ...v, status: 'inside', approvalStatus: 'approved' } : v
));
};

const handleRejectVisitor = (visitorId) => {
setVisitors(visitors.map(v =>
v.id === visitorId ? { ...v, status: 'rejected', approvalStatus: 'rejected' } : v
));
};

const handleCheckOut = (id) => {
setVisitors(visitors.map(v =>
v.id === id
? { ...v, status: 'out', checkOut: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }
: v
));
};

const handleAddApproval = (data) => {
const newApproval = {
  ...data,
  id: Date.now(),
  flat: currentResident,
  approved: false,
  requestTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
};
setApprovals([...approvals, newApproval]);
setView('resident-dash');
};

const handleApproveRequest = (id) => {
setApprovals(approvals.map(a =>
a.id === id ? { ...a, approved: true } : a
));
};

if (view === 'login') {
return <LoginScreen onLogin={(role, residentFlat) => {
if (role === 'resident') {
setCurrentResident(residentFlat);
setView('resident-dash');
} else {
setView('security-dash');
}
}} />;
}

if (view === 'resident-dash') {
const residentInfo = residents.find(r => r.flat === currentResident);
return (
<ResidentDashboard
visitors={visitors}
approvals={approvals}
notifications={notifications}
currentResident={currentResident}
residentInfo={residentInfo}
onLogout={() => {
setView('login');
setCurrentResident(null);
}}
onAddApproval={() => setView('add-approval')}
onApproveRequest={handleApproveRequest}
onApproveVisitor={handleApproveVisitor}
onRejectVisitor={handleRejectVisitor}
/>
);
}

if (view === 'security-dash') {
return (
<SecurityDashboard
visitors={visitors}
approvals={approvals}
onLogout={() => setView('login')}
onCheckIn={() => setView('check-in')}
onSearch={() => setView('search')}
onCheckOut={handleCheckOut}
/>
);
}

if (view === 'check-in') {
return (
<CheckInForm
residents={residents}
onSubmit={handleCheckIn}
onCancel={() => setView('security-dash')}
/>
);
}

if (view === 'add-approval') {
return (
<AddApprovalForm
onSubmit={handleAddApproval}
onCancel={() => setView('resident-dash')}
/>
);
}

if (view === 'search') {
return (
<SearchView
visitors={visitors}
onBack={() => setView('security-dash')}
onCheckOut={handleCheckOut}
/>
);
}

return null;
}