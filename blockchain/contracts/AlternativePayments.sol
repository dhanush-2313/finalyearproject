// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AlternativePayments {
    struct Voucher {
        uint id;
        string code;
        uint amount;
        address donor;
        string recipientId; // Can be phone number, email, or other identifier
        bool redeemed;
        uint expiryDate;
    }

    struct MobileMoneyPayment {
        uint id;
        string phoneNumber;
        uint amount;
        address donor;
        bool processed;
        string provider; // e.g., "M-Pesa", "Airtel Money"
    }

    mapping(uint => Voucher) public vouchers;
    mapping(uint => MobileMoneyPayment) public mobileMoneyPayments;
    mapping(string => bool) public usedVoucherCodes;
    
    uint public nextVoucherId;
    uint public nextPaymentId;
    address public admin;

    event VoucherCreated(uint id, string code, uint amount, string recipientId);
    event VoucherRedeemed(uint id, string code);
    event MobileMoneyPaymentCreated(uint id, string phoneNumber, uint amount, string provider);
    event MobileMoneyPaymentProcessed(uint id);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    // Create a new voucher
    function createVoucher(
        string memory code,
        uint amount,
        string memory recipientId,
        uint expiryDays
    ) public onlyAdmin {
        require(!usedVoucherCodes[code], "Voucher code already exists");
        require(expiryDays > 0, "Expiry days must be greater than 0");

        uint expiryDate = block.timestamp + (expiryDays * 1 days);
        vouchers[nextVoucherId] = Voucher(
            nextVoucherId,
            code,
            amount,
            msg.sender,
            recipientId,
            false,
            expiryDate
        );

        usedVoucherCodes[code] = true;
        emit VoucherCreated(nextVoucherId, code, amount, recipientId);
        nextVoucherId++;
    }

    // Redeem a voucher
    function redeemVoucher(string memory code) public {
        for (uint i = 0; i < nextVoucherId; i++) {
            if (keccak256(bytes(vouchers[i].code)) == keccak256(bytes(code))) {
                require(!vouchers[i].redeemed, "Voucher already redeemed");
                require(block.timestamp <= vouchers[i].expiryDate, "Voucher expired");
                
                vouchers[i].redeemed = true;
                emit VoucherRedeemed(vouchers[i].id, code);
                return;
            }
        }
        revert("Voucher not found");
    }

    // Create a mobile money payment
    function createMobileMoneyPayment(
        string memory phoneNumber,
        uint amount,
        string memory provider
    ) public onlyAdmin {
        mobileMoneyPayments[nextPaymentId] = MobileMoneyPayment(
            nextPaymentId,
            phoneNumber,
            amount,
            msg.sender,
            false,
            provider
        );

        emit MobileMoneyPaymentCreated(nextPaymentId, phoneNumber, amount, provider);
        nextPaymentId++;
    }

    // Mark mobile money payment as processed
    function processMobileMoneyPayment(uint id) public onlyAdmin {
        require(!mobileMoneyPayments[id].processed, "Payment already processed");
        mobileMoneyPayments[id].processed = true;
        emit MobileMoneyPaymentProcessed(id);
    }

    // Get voucher details
    function getVoucher(uint id) public view returns (Voucher memory) {
        return vouchers[id];
    }

    // Get mobile money payment details
    function getMobileMoneyPayment(uint id) public view returns (MobileMoneyPayment memory) {
        return mobileMoneyPayments[id];
    }
} 