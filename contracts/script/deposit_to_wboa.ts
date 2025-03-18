import { NonceManager } from "@ethersproject/experimental";
import { BigNumber, Wallet } from "ethers";
import { ethers } from "hardhat";
import { GasPriceManager } from "../utils/GasPriceManager";
import { WETH } from "../typechain-types";
import { delay } from "@nomiclabs/hardhat-etherscan/dist/src/etherscan/EtherscanService";

async function main() {
    const WBOAFactory = await ethers.getContractFactory("WETH");
    const provider = ethers.provider;

    // Designated Depositer
    const depositer = new Wallet(process.env.WETH_DEPOSITER || "");
    const depositAmount = ethers.utils.parseEther(process.env.WETH_DEPOSIT_AMOUNT || "0");
    const depositSigner = new NonceManager(new GasPriceManager(provider.getSigner(depositer.address)));

    const wboaToken = await WBOAFactory.attach(process.env.WETH_ADDRESS);
    await wboaToken.connect(depositSigner).deposit({ value: depositAmount });
    console.log("%d BOAs of %s deposited", depositAmount, depositer.address);

    // Admin
    const admin = new Wallet(process.env.ADMIN_KEY || "");
    const adminAmount = ethers.utils.parseEther(process.env.WETH_DEPOSIT_AMOUNT || "0");
    const adminSigner = new NonceManager(new GasPriceManager(provider.getSigner(admin.address)));
    await wboaToken.connect(adminSigner).deposit({ value: depositAmount });
    console.log("%d BOAs of %s deposited", depositAmount, admin.address);

    // User
    const user = new Wallet(process.env.USER_KEY || "");
    const userAmount = ethers.utils.parseEther(process.env.WETH_DEPOSIT_AMOUNT || "0");
    const userSigner = new NonceManager(new GasPriceManager(provider.getSigner(user.address)));
    await wboaToken.connect(userSigner).deposit({ value: depositAmount });
    console.log("%d BOAs of %s deposited", depositAmount, user.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
