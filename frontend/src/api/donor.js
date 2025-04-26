import axios from 'axios';
import { API_URL } from '../utils/constants';

export const generateDonationReceipt = async (donationData) => {
  try {
    const response = await axios.post(
      `${API_URL}/donor/receipt`,
      donationData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error generating receipt:', error);
    throw error;
  }
};

// Export both named functions and default object
const donorAPI = {
  generateDonationReceipt,
};

export default donorAPI;