// src/utils/storage.js

/**
 * Save data to localStorage (stringified JSON)
 */
export const saveData = (key, data) => {
  try {
    if (data === null || data === undefined) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(data));
    }
  } catch (error) {
    console.error(`Error saving data for ${key}:`, error);
  }
};

/**
 * Load data from localStorage, or return fallback
 */
export const loadData = (key, fallback = null) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch (error) {
    console.error(`Error loading data for ${key}:`, error);
    return fallback;
  }
};

/**
 * Clear all relevant application data
 */
export const clearAllData = () => {
  try {
    const keysToRemove = [
      'visitors',
      'approvals',
      'residents',
      'securityGuards',
      'admins',
      'loginState'
    ];
    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.error('Error clearing data:', error);
  }
};

/**
 * Initialize default demo data if not already present
 */
export const initializeDefaultData = () => {
  if (!loadData('residents')) {
    saveData('residents', [
      { id: 1, name: 'Amit Kumar', flat: 'A-101', mobile: '6353872412' },
      { id: 2, name: 'Priya Sharma', flat: 'B-205', mobile: '6483829372' },
      { id: 3, name: 'Rajesh Gupta', flat: 'C-304', mobile: '8937354908' },
    ]);
  }

  if (!loadData('securityGuards')) {
    saveData('securityGuards', [
      { id: 1, name: 'Shyamlal', gate: 'Main-Gate', mobile: '6353872413' },
      { id: 2, name: 'Jagwinder Singh', gate: 'Exit-Gate', mobile: '9193647382' },
    ]);
  }

  if (!loadData('admins')) {
    saveData('admins', [
      { id: 1, name: 'Rajesh Patel', mobile: '1234567890', role: 'Admin' }
    ]);
  }
};
