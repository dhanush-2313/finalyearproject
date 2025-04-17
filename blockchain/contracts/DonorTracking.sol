// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DonorTracking {
    struct Donor {
        address donorAddress;
        uint totalDonated;
        uint donationCount;
    }

    mapping(address => Donor) public donors;
    event DonorUpdated(address donor, uint totalDonated);

    // Function to track a new donation
    function donate() public payable {
        donors[msg.sender].donorAddress = msg.sender;
        donors[msg.sender].totalDonated += msg.value;
        donors[msg.sender].donationCount++;
        emit DonorUpdated(msg.sender, donors[msg.sender].totalDonated);
    }

    // Function to get donor details
    function getDonorDetails(address donorAddress) public view returns (Donor memory) {
        return donors[donorAddress];
    }
}
