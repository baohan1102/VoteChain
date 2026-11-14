
import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect({
    network: "sepolia",
  });

  console.log("Deploying VoteChain to Sepolia...");

  const voteChain = await ethers.deployContract("VoteChain");

  await voteChain.waitForDeployment();

  const address = await voteChain.getAddress();

  console.log("VoteChain deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
