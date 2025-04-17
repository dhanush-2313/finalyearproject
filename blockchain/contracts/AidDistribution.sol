/// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AidDistribution {
    struct AidRecord {
        uint id;
        string description;
        uint amount;
        address recipient;
        bool distributed;
    }

    mapping(uint => AidRecord) public aidRecords;
    mapping(address => uint) public donorTotalAid; // Tracks total donations per donor

    uint public nextId;

    event AidDistributed(uint id, address recipient, uint amount);
    event AidDonated(address donor, uint amount); // 🆕 Logs each donation

    // ✅ Function to create an aid record
    function createAidRecord(string memory description, uint amount, address recipient) public {
        aidRecords[nextId] = AidRecord(nextId, description, amount, recipient, false);
        nextId++;
    }

    // ✅ Function to distribute aid
    function distributeAid(uint id) public {
        require(!aidRecords[id].distributed, "Aid already distributed.");
        aidRecords[id].distributed = true;
        emit AidDistributed(id, aidRecords[id].recipient, aidRecords[id].amount);
    }

    // ✅ Function to get aid record details
    function getAidRecord(uint id) public view returns (AidRecord memory) {
        return aidRecords[id];
    }

    // ✅ Function for donors to donate ETH
    function donate() public payable {
        require(msg.value > 0, "Donation must be greater than zero");
        donorTotalAid[msg.sender] += msg.value;
        emit AidDonated(msg.sender, msg.value);
    }

    // ✅ Function to get the total donations made by a specific donor
    function getDonorDetails(address donor) public view returns (uint) {
        return donorTotalAid[donor]; // Returns total donation amount
    }
}
