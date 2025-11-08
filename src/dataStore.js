// dataStore.js
// Simple in-memory data store (non-permanent)

export const tempDB = {
  residents: [
    { id: 1, name: 'Amit Kumar', flat: 'A-101', mobile: '6353872412' },
    { id: 2, name: 'Priya Sharma', flat: 'B-205', mobile: '6483829372' },
    { id: 3, name: 'Rajesh Gupta', flat: 'C-304', mobile: '8937354908' },
  ],
  securityGuards: [
    { id: 1, name: 'Shyamlal', gate: 'Main-Gate', mobile: '6353872413' },
    { id: 2, name: 'Jagwinder Singh', gate: 'Exit-Gate', mobile: '9193647382' },
  ],
  visitors: [   
    { id: 1, name: 'John Doe', mobile: '9999999999', flat: 'A-101', purpose: 'Personal Visit', checkIn: '10:30 AM', status: 'inside', vehicle: 'MH-01-AB-1234', approvalStatus: 'approved', photo: null },
    { id: 2, name: 'Sunita', mobile: '8888888888', flat: 'A-101', purpose: 'Domestic Help', checkIn: '08:00 AM', checkOut: '12:30 PM', status: 'out', approvalStatus: 'approved', photo: null }],
  approvals: [
    { id: 1, name: 'Sunita (Maid)', type: 'Domestic Help', flat: 'A-101', frequency: 'daily', approved: true },
    { id: 2, name: 'Ravi (Plumber)', type: 'Service', flat: 'A-101', frequency: 'once', approved: true },
  ]
};

// Safe utility to clear all data manually
export const clearTempDB = () => {
  tempDB.visitors = [];
  tempDB.approvals = [];
  console.log('🧹 Temporary in-memory data cleared.');
};
