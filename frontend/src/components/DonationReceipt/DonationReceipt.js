import React, { useState } from 'react';
import { generateDonationReceipt } from '../../api/donor';
import { getFileFromIPFS } from '../../api/ipfs';
import { IPFS_GATEWAY_URL } from '../../utils/constants';
import './DonationReceipt.css';

const DonationReceipt = ({ donation }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateReceipt = async () => {
    try {
      setLoading(true);
      setError('');

      const result = await generateDonationReceipt({
        amount: donation.amount,
        cause: donation.cause,
        transactionHash: donation.transactionHash
      });

      // Open receipt in new tab
      window.open(`${IPFS_GATEWAY_URL}${result.receipt.cid}`, '_blank');

    } catch (err) {
      setError('Failed to generate receipt. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="donation-receipt">
      <button
        className="generate-receipt-btn"
        onClick={handleGenerateReceipt}
        disabled={loading}
      >
        {loading ? 'Generating...' : 'Generate Receipt'}
      </button>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default DonationReceipt;