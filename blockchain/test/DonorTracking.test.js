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

    it("should prevent donations below minimum amount", async function () {
        await expect(donorTracking.connect(donor).donate({ value: ethers.parseEther("0.009") }))
            .to.be.revertedWith("Minimum donation amount is 0.01 ETH");
    });

    it("should prevent donations with empty name", async function () {
        await expect(donorTracking.connect(donor).donate("", { value: ethers.parseEther("1.0") }))
            .to.be.revertedWith("Donor name cannot be empty");
    });

    it("should prevent donations with mismatched amounts", async function () {
        await expect(donorTracking.connect(donor).donate("John", ethers.parseEther("2.0"), { value: ethers.parseEther("1.0") }))
            .to.be.revertedWith("Sent ETH amount must match donation amount");
    });
});
