// test/AidDistribution.test.js

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AidDistribution Contract", function () {
    let AidDistribution;
    let aidDistribution;
    let owner;
    let donor;
    let receiver;

    beforeEach(async function () {
        [owner, donor, receiver] = await ethers.getSigners();
        AidDistribution = await ethers.getContractFactory("AidDistribution");
        aidDistribution = await AidDistribution.deploy();
        await aidDistribution.deployed();
    });

    it("should deploy the contract", async function () {
        expect(await aidDistribution.owner()).to.equal(owner.address);
    });

    it("should allow the owner to create an aid record", async function () {
        const tx = await aidDistribution.connect(owner).createAidRecord(receiver.address, 100);
        const receipt = await tx.wait();
        const event = receipt.events.find(event => event.event === "AidRecordCreated");

        expect(event).to.not.be.undefined;
        expect(event.args.receiver).to.equal(receiver.address);
        expect(event.args.amount).to.equal(100);
    });

    it("should allow a donor to fund the aid distribution", async function () {
        await aidDistribution.connect(donor).createAidRecord(receiver.address, 100);
        const tx = await aidDistribution.connect(donor).fundAid(1, { value: ethers.utils.parseEther("1.0") });

        const receipt = await tx.wait();
        const event = receipt.events.find(event => event.event === "AidFunded");

        expect(event).to.not.be.undefined;
        expect(event.args.amount).to.equal(ethers.utils.parseEther("1.0"));
    });

    it("should prevent non-owners from creating aid records", async function () {
        await expect(aidDistribution.connect(donor).createAidRecord(receiver.address, 100))
            .to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should prevent funding a non-existing aid record", async function () {
        await expect(aidDistribution.connect(donor).fundAid(999, { value: ethers.utils.parseEther("1.0") }))
            .to.be.revertedWith("Aid record does not exist");
    });
});
