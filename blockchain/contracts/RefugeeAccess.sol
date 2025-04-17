// SPDX-License-Identifier: MIT


pragma solidity ^0.8.0;

contract RefugeeAccess {
    struct Refugee {
        address refugeeAddress;
        string name;
        bool isEligibleForAid;
    }

    mapping(address => Refugee) public refugees;
    event RefugeeStatusUpdated(address refugee, bool isEligibleForAid);

    // Function to register a refugee
    function registerRefugee(address refugeeAddress, string memory name) public {
        refugees[refugeeAddress] = Refugee(refugeeAddress, name, true);
        emit RefugeeStatusUpdated(refugeeAddress, true);
    }

    // Function to update refugee eligibility
    function updateEligibility(address refugeeAddress, bool eligibility) public {
        refugees[refugeeAddress].isEligibleForAid = eligibility;
        emit RefugeeStatusUpdated(refugeeAddress, eligibility);
    }

    // Function to get refugee details
    function getRefugeeDetails(address refugeeAddress) public view returns (Refugee memory) {
        return refugees[refugeeAddress];
    }
}
