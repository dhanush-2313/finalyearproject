const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Refugee Verification and Aid Record Test", function () {
  let refugeeAccess;
  let aidDistribution;
  let owner;
  let refugee;

  before(async function () {
    [owner, refugee] = await ethers.getSigners();
    
    // Deploy RefugeeAccess contract
    const RefugeeAccess = await ethers.getContractFactory("RefugeeAccess");
    refugeeAccess = await RefugeeAccess.deploy();
    await refugeeAccess.deployTransaction.wait();

    // Deploy AidDistribution contract
    const AidDistribution = await ethers.getContractFactory("AidDistribution");
    aidDistribution = await AidDistribution.deploy(refugeeAccess.address);
    await aidDistribution.deployTransaction.wait();
  });

  it("Should register refugee and verify registration", async function () {
    // Register refugee
    await refugeeAccess.registerRefugee(refugee.address, "Test Refugee", true);
    
    // Verify registration
    const refugeeInfo = await refugeeAccess.getRefugeeInfo(refugee.address);
    expect(refugeeInfo.registered).to.be.true;
    expect(refugeeInfo.name).to.equal("Test Refugee");
    expect(refugeeInfo.eligibleForAid).to.be.true;
  });

  it("Should create and verify aid record", async function () {
    // Create aid record
    await aidDistribution.createAidRecord(
      refugee.address,
      "Test Refugee",
      ethers.utils.parseEther("1.0")
    );

    // Get all aid records
    const aidRecords = await aidDistribution.getAllAidRecords();
    expect(aidRecords.length).to.equal(1);

    // Verify aid record details
    const record = aidRecords[0];
    expect(record.refugeeAddress).to.equal(refugee.address);
    expect(record.refugeeName).to.equal("Test Refugee");
    expect(record.amount).to.equal(ethers.utils.parseEther("1.0"));
  });
}); 