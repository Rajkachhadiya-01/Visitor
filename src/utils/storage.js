// src/utils/storage.js

/**
 * Save data to localStorage
 * @param {string} key - Storage key
 * @param {any} data - Data to store
 */
export const saveData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

/**
 * Load data from localStorage
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if key doesn't exist
 * @returns {any} Stored data or default value
 */
export const loadData = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error loading data:', error);
    return defaultValue;
  }
};

/**
 * Clear all application data from localStorage
 */
export const clearAllData = () => {
  try {
    const keysToRemove = ['visitors', 'approvals', 'residents', 'securityGuards', 'loginState'];
    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.error('Error clearing data:', error);
  }
};

/**
 * Remove specific key from localStorage
 * @param {string} key - Storage key to remove
 */
export const removeData = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing data:', error);
  }
};