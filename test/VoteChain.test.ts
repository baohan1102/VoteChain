
import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.create();

describe("VoteChain", function () {
  async function setup() {
    const [owner, voter1, voter2] = await ethers.getSigners();

    const voteChain = await ethers.deployContract("VoteChain");
    await voteChain.waitForDeployment();

    const latestBlock = await ethers.provider.getBlock("latest");
    const now = latestBlock!.timestamp;

    const startTime = now + 60;
    const endTime = now + 3600;

    return {
      voteChain,
      owner,
      voter1,
      voter2,
      startTime,
      endTime,
    };
  }

  it("Should create a poll successfully", async function () {
    const { voteChain, startTime, endTime } = await setup();

    await voteChain.createPoll(
      "Favorite language",
      "Choose your favorite language",
      ["Solidity", "JavaScript"],
      startTime,
      endTime
    );

    expect(await voteChain.pollCount()).to.equal(1n);
  });

  it("Should reject polls with fewer than 2 options", async function () {
    const { voteChain, startTime, endTime } = await setup();

    await expect(
      voteChain.createPoll(
        "Invalid poll",
        "Only one option",
        ["Solidity"],
        startTime,
        endTime
      )
    ).to.be.revertedWith("At least 2 options required");
  });

  it("Should allow the creator to add voters", async function () {
    const { voteChain, voter1, startTime, endTime } = await setup();

    await voteChain.createPoll(
      "Test poll",
      "Description",
      ["Yes", "No"],
      startTime,
      endTime
    );

    await voteChain.addVoter(1, voter1.address);

    expect(
      await voteChain.allowedVoters(1, voter1.address)
    ).to.equal(true);
  });

  it("Should reject unauthorized voters", async function () {
    const { voteChain, voter1, startTime, endTime } = await setup();

    await voteChain.createPoll(
      "Test poll",
      "Description",
      ["Yes", "No"],
      startTime,
      endTime
    );

    await ethers.provider.send("evm_setNextBlockTimestamp", [
      startTime + 1,
    ]);
    await ethers.provider.send("evm_mine", []);

    await expect(
      voteChain.connect(voter1).vote(1, 0)
    ).to.be.revertedWith("You are not allowed to vote");
  });

  it("Should prevent double voting", async function () {
    const { voteChain, voter1, startTime, endTime } = await setup();

    await voteChain.createPoll(
      "Test poll",
      "Description",
      ["Yes", "No"],
      startTime,
      endTime
    );

    await voteChain.addVoter(1, voter1.address);

    await ethers.provider.send("evm_setNextBlockTimestamp", [
      startTime + 1,
    ]);
    await ethers.provider.send("evm_mine", []);

    await voteChain.connect(voter1).vote(1, 0);

    await expect(
      voteChain.connect(voter1).vote(1, 1)
    ).to.be.revertedWith("You have already voted");
  });

  it("Should return correct voting results", async function () {
    const { voteChain, voter1, voter2, startTime, endTime } =
      await setup();

    await voteChain.createPoll(
      "Favorite language",
      "Choose one",
      ["Solidity", "JavaScript"],
      startTime,
      endTime
    );

    await voteChain.addVoter(1, voter1.address);
    await voteChain.addVoter(1, voter2.address);

    await ethers.provider.send("evm_setNextBlockTimestamp", [
      startTime + 1,
    ]);
    await ethers.provider.send("evm_mine", []);

    await voteChain.connect(voter1).vote(1, 0);
    await voteChain.connect(voter2).vote(1, 1);

    const [options, counts] = await voteChain.getResults(1);

    expect(options).to.deep.equal(["Solidity", "JavaScript"]);
    expect(Array.from(counts)).to.deep.equal([1n, 1n]);
  });

it("Should reject voting before the start time", async function () {
  const [owner, voter] = await ethers.getSigners();

  const VoteChain = await ethers.getContractFactory("VoteChain");
  const voteChain = await VoteChain.deploy();
  await voteChain.waitForDeployment();

  const latestBlock = await ethers.provider.getBlock("latest");
  const currentTime = latestBlock!.timestamp;

  const startTime = currentTime + 3600;
  const endTime = currentTime + 7200;

  await voteChain.createPoll(
    "Test Poll",
    "Testing voting before start",
    ["Yes", "No"],
    startTime,
    endTime
  );

  await voteChain.addVoter(1, voter.address);

  await expect(
    voteChain.connect(voter).vote(1, 0)
  ).to.be.revertedWith("Poll has not started");
});

it("Should reject voting after the end time", async function () {
  const [owner, voter] = await ethers.getSigners();

  const VoteChain = await ethers.getContractFactory("VoteChain");
  const voteChain = await VoteChain.deploy();
  await voteChain.waitForDeployment();

  const latestBlock = await ethers.provider.getBlock("latest");
  const currentTime = latestBlock!.timestamp;

  const startTime = currentTime + 100;
  const endTime = currentTime + 200;

  await voteChain.createPoll(
    "Expired Poll",
    "Testing voting after end",
    ["Yes", "No"],
    startTime,
    endTime
  );

  await voteChain.addVoter(1, voter.address);

  // Chuyen thoi gian blockchain qua thoi diem ket thuc
  await ethers.provider.send("evm_setNextBlockTimestamp", [
    endTime + 1
  ]);
  await ethers.provider.send("evm_mine", []);

  await expect(
    voteChain.connect(voter).vote(1, 0)
  ).to.be.revertedWith("Poll has ended");
});

it("Should reject invalid voting option", async function () {
  const [owner, voter] = await ethers.getSigners();

  const VoteChain = await ethers.getContractFactory("VoteChain");
  const voteChain = await VoteChain.deploy();
  await voteChain.waitForDeployment();

  const latestBlock = await ethers.provider.getBlock("latest");
  const currentTime = latestBlock!.timestamp;

  const startTime = currentTime + 100;
  const endTime = currentTime + 3600;

  await voteChain.createPoll(
    "Invalid Option Test",
    "Testing invalid voting option",
    ["Yes", "No"],
    startTime,
    endTime
  );

  await voteChain.addVoter(1, voter.address);

  // Chuyen blockchain den thoi gian bat dau
  await ethers.provider.send("evm_setNextBlockTimestamp", [
    startTime + 1
  ]);
  await ethers.provider.send("evm_mine", []);

  // Thu bo phieu cho lua chon ID 5 (khong ton tai)
  await expect(
    voteChain.connect(voter).vote(1, 5)
  ).to.be.revertedWith("Invalid option");
});

});
