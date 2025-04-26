/**
 * Utility functions for safe rendering in React components
 */

/**
 * Safely convert any value to a string representation that can be rendered in React
 * Prevents "Objects are not valid as React child" errors
 * 
 * @param {any} value - The value to stringify
 * @param {string} defaultValue - Default value if input is nullish
 * @returns {string} - String representation safe for React rendering
 */
export const safeRender = (value, defaultValue = '') => {
  if (value === null || value === undefined) {
    return defaultValue;
  }
  
  if (typeof value === 'string') {
    return value;
  }
  
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  
  if (typeof value === 'object') {
    // Check if it's an object with name property (common for user objects)
    if (value.name !== undefined) {
      return typeof value.name === 'string' ? value.name : String(value.name);
    }
    
    // For arrays, join elements with comma
    if (Array.isArray(value)) {
      return value.map(item => safeRender(item)).join(', ');
    }
    
    // For other objects, stringify
    try {
      return JSON.stringify(value);
    } catch (e) {
      return '[Object]';
    }
  }
  
  // Fallback
  return String(value);
};

/**
 * A specialized version of safeRender specifically for user objects
 * 
 * @param {Object} user - User object that might contain nested objects
 * @param {string} property - The property to extract (name, email, etc)
 * @param {string} defaultValue - Default value if property is missing
 * @returns {string} - Safe string representation
 */
export const safeUserProperty = (user, property, defaultValue = '') => {
  if (!user) return defaultValue;
  
  const value = user[property];
  return safeRender(value, defaultValue);
};