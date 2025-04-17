// test/FieldWorker.test.js

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FieldWorker Contract", function () {
    let FieldWorker;
    let fieldWorker;
    let owner;
    let worker;
    let taskDetails = "Deliver aid to Refugee Camp A";

    beforeEach(async function () {
        [owner, worker] = await ethers.getSigners();
        FieldWorker = await ethers.getContractFactory("FieldWorker");
        fieldWorker = await FieldWorker.deploy();
        await fieldWorker.deployed();
    });

    it("should deploy the contract", async function () {
        expect(await fieldWorker.owner()).to.equal(owner.address);
    });

    it("should allow the owner to assign tasks to field workers", async function () {
        const tx = await fieldWorker.connect(owner).assignTask(worker.address, taskDetails);
        const receipt = await tx.wait();
        const event = receipt.events.find(event => event.event === "TaskAssigned");

        expect(event).to.not.be.undefined;
        expect(event.args.worker).to.equal(worker.address);
        expect(event.args.taskDetails).to.equal(taskDetails);
    });

    it("should allow the assigned worker to mark the task as completed", async function () {
        await fieldWorker.connect(owner).assignTask(worker.address, taskDetails);
        const tx = await fieldWorker.connect(worker).completeTask(1);
        const receipt = await tx.wait();
        const event = receipt.events.find(event => event.event === "TaskCompleted");

        expect(event).to.not.be.undefined;
        expect(event.args.worker).to.equal(worker.address);
    });

    it("should prevent non-owners from assigning tasks", async function () {
        await expect(fieldWorker.connect(worker).assignTask(worker.address, taskDetails))
            .to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should prevent non-assigned workers from completing tasks", async function () {
        await expect(fieldWorker.connect(worker).completeTask(999))
            .to.be.revertedWith("Task not assigned to this worker");
    });
});
