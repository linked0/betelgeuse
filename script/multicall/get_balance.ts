import { NonceManager } from "@ethersproject/experimental";
import { create } from "domain";
import { BigNumber, Wallet } from "ethers";
import { ethers } from "hardhat";
import { GasPriceManager } from "../../utils/GasPriceManager";
import { parseTokenId } from "../../utils/ParseTokenID";

async function main() {
    const MulticallFactory = await ethers.getContractFactory("Multicall");

    const provider = ethers.provider;
    const admin = new Wallet(process.env.ADMIN_KEY || "");
    const adminSigner = new NonceManager(new GasPriceManager(provider.getSigner(admin.address)));

    const multicallContract = await MulticallFactory.attach(process.env.MULTICALL_ADDRESS || "");
    const ownerMulticall = await multicallContract.connect(adminSigner);
    console.log("ETH Balance:", await ownerMulticall.getEthBalance(admin.address));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
