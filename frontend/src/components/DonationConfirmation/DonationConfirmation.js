import React from 'react';
import DonationReceipt from '../DonationReceipt/DonationReceipt';
import './DonationConfirmation.css';

const DonationConfirmation = ({ donation, blockchainDetails }) => {
  return (
    <div className="donation-confirmation">
      <h2>Thank You For Your Donation!</h2>
      <div className="confirmation-details">
        <p><strong>Amount:</strong> {donation.amount} ETH</p>
        <p><strong>Cause:</strong> {donation.cause}</p>
        {donation.message && (
          <p><strong>Message:</strong> {donation.message}</p>
        )}
        {blockchainDetails && (
          <div className="blockchain-details">
            <h3>Transaction Details</h3>
            <p><strong>Transaction Hash:</strong> {blockchainDetails.hash}</p>
            <p><strong>Block Number:</strong> {blockchainDetails.blockNumber}</p>
            <p><strong>From:</strong> {blockchainDetails.from}</p>
            <p><strong>To:</strong> {blockchainDetails.to}</p>
          </div>
        )}
        
        {/* Add receipt generation */}
        <div className="receipt-section">
          <h3>Donation Receipt</h3>
          <p>Generate a permanent record of your donation stored on IPFS</p>
          <DonationReceipt donation={donation} />
        </div>
      </div>
    </div>
  );
};