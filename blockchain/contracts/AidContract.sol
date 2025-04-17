// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract AidContract {
    struct AidRecord {
        uint id;
        string recipient;
        string aidType;
        uint256 amount;
        string status;
        address addedBy;
        uint256 timestamp;
    }

    struct Donor {
        string name;
        uint256 totalDonated;
    }

    mapping(uint => AidRecord) public aidRecords;
    mapping(address => Donor) public donors; // ✅ Donor mapping added

    uint public recordCount;
    address public admin;

    // Events for logging transactions
    event AidAdded(uint id, string recipient, string aidType, uint256 amount, string status, address addedBy);
    event AidUpdated(uint id, string status);
    event AidDistributed(address indexed recipient, string aidType, uint256 amount, uint256 timestamp);
    event DonationReceived(address indexed donor, string name, uint256 amount); // ✅ Event for tracking donations

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    // ✅ Function to add aid records
    function addAidRecord(string memory _recipient, string memory _aidType, uint256 _amount) public onlyAdmin {
        recordCount++;
        aidRecords[recordCount] = AidRecord(
            recordCount,
            _recipient,
            _aidType,
            _amount,
            "Pending",
            msg.sender,
            block.timestamp
        );

        emit AidAdded(recordCount, _recipient, _aidType, _amount, "Pending", msg.sender);
        emit AidDistributed(msg.sender, _aidType, _amount, block.timestamp);
    }

    // ✅ Function to update aid record status
    function updateAidStatus(uint _id, string memory _status) public onlyAdmin {
        require(aidRecords[_id].id != 0, "Record not found");
        aidRecords[_id].status = _status;
        emit AidUpdated(_id, _status);
    }

    // ✅ Function to fetch a specific aid record
    function getAidRecord(uint _id) public view returns (
        uint, string memory, string memory, uint256, string memory, address, uint256
    ) {
        require(aidRecords[_id].id != 0, "Record not found"); // Ensure record exists

        AidRecord storage record = aidRecords[_id];
        return (
            record.id,
            record.recipient,
            record.aidType,
            record.amount,
            record.status,
            record.addedBy,
            record.timestamp
        );
    }

    // ✅ (Optional) Function to fetch all aid records
    function getAllAidRecords() public view returns (AidRecord[] memory) {
        AidRecord[] memory records = new AidRecord[](recordCount);
        for (uint i = 1; i <= recordCount; i++) {
            records[i - 1] = aidRecords[i];
        }
        return records;
    }

    // ✅ Function to donate and track donor details
    function donate(string memory _name, uint256 _amount) public {
        require(_amount > 0, "Donation amount must be greater than zero");

        // Update total donation amount
        donors[msg.sender].totalDonated += _amount;

        // If donor is new, set their name
        if (bytes(donors[msg.sender].name).length == 0) {
            donors[msg.sender].name = _name;
        }

        emit DonationReceived(msg.sender, _name, _amount);
    }

    // ✅ Function to get donor details
    function getDonorDetails(address _donor) public view returns (string memory, uint256) {
        require(bytes(donors[_donor].name).length > 0, "Donor not found");
        return (donors[_donor].name, donors[_donor].totalDonated);
    }
}
