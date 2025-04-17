// test/RefugeeAccess.test.js

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RefugeeAccess Contract", function () {
    let RefugeeAccess;
    let refugeeAccess;
    let owner;
    let refugee;

    beforeEach(async function () {
        [owner, refugee] = await ethers.getSigners();
        RefugeeAccess = await ethers.getContractFactory("RefugeeAccess");
        refugeeAccess = await RefugeeAccess.deploy();
        await refugeeAccess.deployed();
    });

    it("should deploy the contract", async function () {
        expect(await refugeeAccess.owner()).to.equal(owner.address);
    });

    it("should allow the owner to grant access to a refugee", async function () {
        const tx = await refugeeAccess.connect(owner).grantAccess(refugee.address, true);
        const receipt = await tx.wait();
        const event = receipt.events.find(event => event.event === "AccessGranted");

        expect(event).to.not.be.undefined;
        expect(event.args.refugee).to.equal(refugee.address);
        expect(event.args.access).to.equal(true);
    });

    it("should allow the owner to revoke access from a refugee", async function () {
        await refugeeAccess.connect(owner).grantAccess(refugee.address, true);
        const tx = await refugeeAccess.connect(owner).grantAccess(refugee.address, false);
        const receipt = await tx.wait();
        const event = receipt.events.find(event => event.event === "AccessRevoked");

        expect(event).to.not.be.undefined;
        expect(event.args.refugee).to.equal(refugee.address);
        expect(event.args.access).to.equal(false);
    });

    it("should prevent non-owners from granting/revoking access", async function () {
        await expect(refugeeAccess.connect(refugee).grantAccess(refugee.address, true))
            .to.be.revertedWith("Ownable: caller is not the owner");
    });
});
