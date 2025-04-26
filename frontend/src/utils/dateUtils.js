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
    date = new Date(timestamp);
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