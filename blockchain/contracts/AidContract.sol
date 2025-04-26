// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./AlternativePayments.sol";

contract AidContract {
    struct AidRecord {
        uint id;
        string recipient;
        string aidType;
        uint256 amount;
        string status;
        address addedBy;
        uint256 timestamp;
        string paymentMethod; // "ETH", "VOUCHER", "MOBILE_MONEY"
        string paymentDetails; // Voucher code or phone number
    }

    struct Donor {
        string name;
        uint256 totalDonated;
    }

    mapping(uint => AidRecord) public aidRecords;
    mapping(address => Donor) public donors;
    AlternativePayments public alternativePayments;

    uint public recordCount;
    address public admin;

    // Events for logging transactions
    event AidAdded(uint id, string recipient, string aidType, uint256 amount, string status, address addedBy, string paymentMethod);
    event AidUpdated(uint id, string status);
    event AidDistributed(address indexed recipient, string aidType, uint256 amount, uint256 timestamp);
    event DonationReceived(address indexed donor, string name, uint256 amount); // ✅ Event for tracking donations

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    constructor(address _alternativePaymentsAddress) {
        admin = msg.sender;
        alternativePayments = AlternativePayments(_alternativePaymentsAddress);
    }

    // ✅ Function to add aid records
    function addAidRecord(
        string memory _recipient,
        string memory _aidType,
        uint256 _amount,
        string memory _paymentMethod,
        string memory _paymentDetails
    ) public onlyAdmin {
        recordCount++;
        aidRecords[recordCount] = AidRecord(
            recordCount,
            _recipient,
            _aidType,
            _amount,
            "Pending",
            msg.sender,
            block.timestamp,
            _paymentMethod,
            _paymentDetails
        );

        emit AidAdded(recordCount, _recipient, _aidType, _amount, "Pending", msg.sender, _paymentMethod);
        
        if (keccak256(bytes(_paymentMethod)) == keccak256(bytes("VOUCHER"))) {
            alternativePayments.createVoucher(_paymentDetails, _amount, _recipient, 30); // 30 days expiry
        } else if (keccak256(bytes(_paymentMethod)) == keccak256(bytes("MOBILE_MONEY"))) {
            alternativePayments.createMobileMoneyPayment(_paymentDetails, _amount, "M-Pesa");
        }
    }

    // ✅ Function to update aid record status
    function updateAidStatus(uint _id, string memory _status) public onlyAdmin {
        require(aidRecords[_id].id != 0, "Record not found");
        aidRecords[_id].status = _status;
        emit AidUpdated(_id, _status);
    }

    // ✅ Function to fetch a specific aid record
    function getAidRecord(uint _id) public view returns (
        uint, string memory, string memory, uint256, string memory, address, uint256, string memory, string memory
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
            record.timestamp,
            record.paymentMethod,
            record.paymentDetails
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

    // ✅ Function to handle donations
    function donate(string memory _name) public payable {
        require(msg.value >= 10000000000000000, "Minimum donation amount is 0.01 ETH");
        require(bytes(_name).length > 0, "Donor name cannot be empty");

        // Update total donation amount
        donors[msg.sender].totalDonated += msg.value;

        // If donor is new, set their name
        if (bytes(donors[msg.sender].name).length == 0) {
            donors[msg.sender].name = _name;
        }

        emit DonationReceived(msg.sender, _name, msg.value);
    }

    // ✅ Function to get donor details
    function getDonorDetails(address _donor) public view returns (string memory, uint256) {
        require(bytes(donors[_donor].name).length > 0, "Donor not found");
        return (donors[_donor].name, donors[_donor].totalDonated);
    }
}
