/**
 * Formats a timestamp in Indian format (DD-MM-YYYY HH:MM:SS)
 * Works with various timestamp formats (milliseconds, seconds, date strings)
 * 
 * @param {number|string|Date} timestamp - The timestamp to format
 * @returns {string} - Formatted date string
 */
export const formatIndianTimestamp = (timestamp) => {
  if (!timestamp) return "N/A";
  
  let date;
  
  // Handle different timestamp formats
  if (typeof timestamp === 'number') {
    // If it's a Unix timestamp in seconds (blockchain standard)
    if (timestamp.toString().length <= 10) {
      date = new Date(timestamp * 1000);
    } else {
      // If it's in milliseconds
      date = new Date(timestamp);
    }
  } else if (typeof timestamp === 'string') {
    // If it's already a string, try to parse it
    try {
      // First try parsing as ISO string
      date = new Date(timestamp);
      
      // If that fails, try parsing as Unix timestamp
      if (isNaN(date.getTime())) {
        const timestampNum = Number(timestamp);
        if (!isNaN(timestampNum)) {
          date = new Date(timestampNum * 1000);
        }
      }
    } catch (e) {
      console.error("Error parsing timestamp:", e);
      return "Invalid Date";
    }
  } else if (timestamp instanceof Date) {
    // If it's already a Date object
    date = timestamp;
  } else {
    return "Invalid Date";
  }
  
  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return "Invalid Date";
  }
  
  // Format in Indian style: DD-MM-YYYY HH:MM:SS
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  
  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
};

const { ethers } = require('ethers');

// Convert Wei to ETH with proper formatting
export const weiToEth = (wei) => {
    if (!wei) return "0";
    try {
        const ethValue = ethers.formatEther(wei.toString());
        // Format to 4 decimal places to keep display clean
        return Number(ethValue).toFixed(4);
    } catch (error) {
        console.error('Error converting Wei to ETH:', error);
        return "0";
    }
};

export const formatDate = (timestamp) => {
    try {
        // If timestamp is a string, try to parse it
        if (typeof timestamp === 'string') {
            // Check if it's a Unix timestamp in seconds
            if (/^\d+$/.test(timestamp)) {
                timestamp = parseInt(timestamp) * 1000; // Convert to milliseconds
            } else {
                // Try parsing as ISO string
                timestamp = new Date(timestamp).getTime();
            }
        }
        
        // If timestamp is a number, assume it's in seconds (blockchain format)
        if (typeof timestamp === 'number') {
            // If timestamp is less than 1e12, it's likely in seconds
            if (timestamp < 1e12) {
                timestamp = timestamp * 1000; // Convert to milliseconds
            }
        }
        
        const date = new Date(timestamp);
        
        // Check if date is valid
        if (isNaN(date.getTime())) {
            console.warn('Invalid date:', timestamp);
            return 'Invalid date';
        }
        
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid date';
    }
};