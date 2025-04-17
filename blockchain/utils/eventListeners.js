// utils/eventListeners.js

const { ethers } = require("ethers");
const { contractAddresses, networks } = require("./constants");
require("dotenv").config();

// Setup provider based on the network
const getProvider = (network) => {
  const { url } = networks[network];
  return new ethers.JsonRpcProvider(url);
};

// Function to listen to events
const listenToEvents = (network) => {
  const contract = getContract("AidDistribution", network);
  contract.on("AidRecordCreated", (aidId, receiver, amount) => {
    console.log(`Aid record created: ID ${aidId}, Receiver: ${receiver}, Amount: ${amount}`);
  });
  console.log("Listening to AidRecordCreated events...");
};

module.exports = { listenToEvents };
