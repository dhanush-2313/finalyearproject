# End-to-End Testing Guide for Humanitarian Aid Blockchain Platform

This guide will help you test the entire system from start to finish, ensuring all components work together correctly.

## Prerequisites

1. Make sure you have installed:
   - Node.js 16+
   - MongoDB (running locally or accessible)
   - Web browser (Chrome recommended)

2. Terminal windows needed:
   - One for the local blockchain (Ganache/Hardhat)
   - One for the backend server
   - One for the frontend application

## Step 1: Start the Local Blockchain

```bash
# Navigate to the blockchain directory
cd blockchain

# Start the local blockchain
npx hardhat node
```

The terminal will show available accounts with test ETH. Keep this terminal open.

## Step 2: Deploy the Smart Contracts

Open a new terminal:

```bash
# Navigate to the blockchain directory
cd blockchain

# Deploy contracts to the local blockchain
npx hardhat run scripts/deploy.js --network localhost
```

This will deploy all contracts and save their addresses to `scripts/deployments/contractAddresses.json`.

## Step 3: Start the Backend Server

Open a new terminal:

```bash
# Navigate to the backend directory
cd blockBackend

# Install dependencies if needed
npm install

# Start the server
npm start
```

You should see logs showing:
- ✅ MongoDB connected
- ✅ Blockchain event listeners initialized
- 🚀 Server running on port 4000

## Step 4: Start the Frontend

Open a new terminal:

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies if needed
npm install

# Start the frontend
npm start
```

The browser should automatically open to `http://localhost:3000`.

## Step 5: End-to-End Testing Flow

### 1. Admin Tasks

1. **Login as Admin**
   - Username: admin@example.com
   - Password: admin123

2. **Create a Refugee Record**
   - Click "Refugees" in the sidebar
   - Click "Add New Refugee"
   - Fill in details (name, location, etc.)
   - Click "Submit"

3. **Create an Aid Package**
   - Click "Aid Management" in the sidebar
   - Click "Create Aid Package"
   - Select the refugee you just created
   - Enter details (aid type, amount)
   - Click "Submit"
   - You should see a success notification with a transaction hash

### 2. Field Worker Tasks

1. **Login as Field Worker**
   - Username: field@example.com
   - Password: field123

2. **Update Aid Status**
   - Click "Aid Assignments" in the sidebar
   - Find your created aid package
   - Click "Update Status"
   - Change status to "In Transit" then click "Update"
   - Change status to "Delivered" then click "Update"
   - Each update should create a blockchain transaction

### 3. Donor Tasks

1. **Login as Donor**
   - Username: donor@example.com
   - Password: donor123

2. **Make a Donation**
   - Click "Donate" in the sidebar
   - Enter donation amount
   - Click "Submit Donation"
   - You should see a success notification with a transaction hash

### 4. Verify Blockchain Records

1. **View Events**
   - Login as Admin
   - Click "Blockchain Events" in the sidebar
   - You should see all events from your testing:
     - AidAdded
     - AidStatusUpdated
     - AidDistributed
     - DonationReceived

2. **Filter Events by Type**
   - Use the dropdown to filter by specific event types
   - Verify the details match what you entered

## What to Look For

- **Successful Transactions**: Each action should show a transaction hash
- **Event Tracking**: Events should appear in the events list
- **Status Updates**: Aid status changes should be reflected in the UI
- **Confirmation**: When viewing details, the blockchain data should match what was entered

## Common Issues and Solutions

1. **Contract Connection Error**
   - Ensure your local blockchain is running
   - Check that contract addresses in `.env` match those in the deployment file

2. **Transaction Timeout**
   - The local blockchain may have stalled - restart it
   - Check the logs for nonce errors which indicate transaction sequence issues

3. **Events Not Appearing**
   - Check the backend logs for event listener errors
   - Make sure MongoDB is running and accessible

## Explaining the Project (Layman's Terms)

Our humanitarian aid platform uses blockchain to ensure transparent and traceable aid delivery:

1. **What the System Does**:
   - Tracks aid packages from donation to delivery
   - Records who received what, when, and where
   - Prevents fraud by making all transactions visible and permanent
   - Allows donors to see exactly where their money goes

2. **How It Works**:
   - **Digital Ledger**: Think of the blockchain as a digital notebook where every entry is permanent and visible to everyone
   - **Smart Contracts**: These are like automatic agreements that execute when conditions are met
   - **Web Interface**: A user-friendly website for all users to interact with the system

3. **Real-World Benefits**:
   - **Transparency**: All aid transactions are publicly visible
   - **Accountability**: No one can change records after they're created
   - **Efficiency**: Reduced paperwork and manual verification
   - **Trust**: Donors can verify their contributions reach the intended recipients

When demonstrating, focus on showing how a donation moves through the system and how every step is recorded permanently on the blockchain. 