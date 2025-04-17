// test/DonorTracking.test.js

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DonorTracking Contract", function () {
    let DonorTracking;
    let donorTracking;
    let owner;
    let donor;

    beforeEach(async function () {
        [owner, donor] = await ethers.getSigners();
        DonorTracking = await ethers.getContractFactory("DonorTracking");
        donorTracking = await DonorTracking.deploy();
        await donorTracking.deployed();
    });

    it("should deploy the contract", async function () {
        expect(await donorTracking.owner()).to.equal(owner.address);
    });

    it("should allow donors to contribute and track donations", async function () {
        const tx = await donorTracking.connect(donor).donate({ value: ethers.utils.parseEther("2.0") });
        const receipt = await tx.wait();
        const event = receipt.events.find(event => event.event === "DonationMade");

        expect(event).to.not.be.undefined;
        expect(event.args.donor).to.equal(donor.address);
        expect(event.args.amount).to.equal(ethers.utils.parseEther("2.0"));
    });

    it("should return the correct donation balance for a donor", async function () {
        await donorTracking.connect(donor).donate({ value: ethers.utils.parseEther("2.0") });
        const balance = await donorTracking.getDonationBalance(donor.address);
        expect(balance).to.equal(ethers.utils.parseEther("2.0"));
    });

    it("should prevent donations of zero value", async function () {
        await expect(donorTracking.connect(donor).donate({ value: 0 }))
            .to.be.revertedWith("Donation amount must be greater than zero");
    });
});
