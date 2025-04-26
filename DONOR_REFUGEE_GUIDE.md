# Donor and Refugee Management Guide

## Donor Details

### Overview
Donors are users who contribute ETH to support humanitarian aid efforts. Each donor has:

- Profile information (name, email)
- Wallet address for blockchain transactions
- Donation history
- Total amount donated

### Donation Process
1. **Making a Donation**
   - Minimum donation amount: 0.01 ETH
   - Supported payment methods:
     - Cryptocurrency (ETH)
     - Credit Card
     - Bank Transfer
   - Optional: Add a personal message
   - Choose donation cause (e.g., shelter, education, general fund)

2. **Donation Status Tracking**
   - Pending: Initial state when donation is submitted
   - Processing: Transaction being confirmed on blockchain
   - Completed: Successfully processed and confirmed
   - Failed: Transaction failed or was rejected

3. **Viewing Donation History**
   - Total amount donated (in ETH)
   - Individual donation records with:
     - Amount
     - Date
     - Cause
     - Status
     - Transaction hash (for blockchain verification)

## Refugee Details

### Overview
Refugees are registered individuals eligible for aid. Each refugee profile contains:

- Personal Information:
  - Name
  - Age
  - Gender
  - Current Location
  - Specific Needs

### Registration and Status
1. **Registration Process**
   - Initial registration by field workers
   - Required documentation
   - Assignment of unique refugee ID

2. **Status Tracking**
   - Active: Currently eligible for aid
   - Inactive: No longer in program or relocated

3. **Aid Record Tracking**
   - Types of aid received
   - Dates of aid distribution
   - Field worker assignments
   - Distribution status updates

### Field Worker Interface
Field workers can:
- Update refugee information
- Submit aid distribution reports
- Track aid delivery status:
  1. Pending
  2. In Transit
  3. Delivered
  4. Verified

## Privacy and Security

### Data Protection
- Personal information is stored securely
- Blockchain transactions maintain privacy through address anonymization
- Access controls based on user roles:
  - Admins: Full access
  - Field Workers: Access to assigned cases
  - Donors: Limited to their own donation history

### Verification Process
1. **Donor Verification**
   - Wallet address verification
   - Transaction confirmation through blockchain

2. **Refugee Verification**
   - Field worker verification
   - Document validation
   - Status updates require multi-step confirmation

## Best Practices

### For Donors
1. Always verify transaction details before confirming
2. Keep private keys secure
3. Monitor donation status through dashboard
4. Save transaction hashes for future reference

### For Field Workers
1. Update refugee information promptly
2. Document all aid distributions
3. Verify recipient identity before distribution
4. Report any discrepancies immediately

## Technical Implementation

### Smart Contract Integration
- Donor tracking through DonorTracking contract
- Aid distribution verification
- Automated status updates
- Transaction history maintenance

### Database Schema
- Donor records linked to blockchain addresses
- Refugee profiles with detailed needs assessment
- Aid distribution records with complete audit trail
- Activity logs for all transactions

### API Endpoints
- `/api/donor/donations`: Manage donations
- `/api/refugee/profile`: Refugee profile management
- `/api/fieldworker/tasks`: Field worker task management

## Support and Troubleshooting

### Common Issues
1. Transaction Failed
   - Check ETH balance
   - Verify minimum donation amount
   - Ensure proper network connection

2. Status Updates Delayed
   - Check blockchain confirmation status
   - Verify network connectivity
   - Contact support if persistent

### Contact Information
For technical support or questions:
- Email: support@aidforge.org
- Emergency Contact: Available 24/7 for field workers