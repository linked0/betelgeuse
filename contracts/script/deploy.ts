import { NonceManager } from "@ethersproject/experimental";
import { Wallet } from "ethers";
import { ethers } from "hardhat";
import { BigNumber } from "ethers";
import { GasPriceManager } from "../utils/GasPriceManager";
import { createTokenId, parseTokenId } from "../utils/ParseTokenID";
import { expect } from "chai";

const ZeroAddress = "0x0000000000000000000000000000000000000000";

async function main() {
  const provider = ethers.provider;

  // Deploying ConduitController
  const ConduitControllerFactory = await ethers.getContractFactory("ConduitController");

  const admin = new Wallet(process.env.ADMIN_KEY || "");
  const adminSigner = new NonceManager(new GasPriceManager(provider.getSigner(admin.address)));

  const conduitController = await ConduitControllerFactory.connect(adminSigner).deploy();
  await conduitController.deployed();

  console.log(`CONDUIT_CONTROLLER_ADDRESS=${conduitController.address}`);

  // Creating Conduit
  let conduitAddress = ZeroAddress;
  const conduitKey = process.env.CONDUIT_KEY || "";
  await conduitController.createConduit(conduitKey, admin.address);
  while (true) {
    const { conduit: conduitAddr, exists } = await conduitController.connect(adminSigner).getConduit(conduitKey);
    if (exists) {
      conduitAddress = conduitAddr;
      break;
    }
    // Sleep 1 milisecond
    await new Promise((resolve) => setTimeout(resolve, 1));
  }
  console.log(`CONDUIT_ADDRESS=${conduitAddress}`);
  console.log(`CONDUIT_KEY=${conduitKey}`);

  // Deploying Seaport contract
  const SeaportFactory = await ethers.getContractFactory("Seaport");
  const seaport = await SeaportFactory.connect(adminSigner).deploy(conduitController.address);
  await seaport.deployed();
  console.log(`SEAPORT_ADDRESS=${seaport.address}`);

  // Update channel for marketplace to conduit
  let status = await conduitController.connect(adminSigner).getChannelStatus(conduitAddress, seaport.address);

  // Deploying AssetcontractShared contract
  const AssetContractFactory = await ethers.getContractFactory("AssetContractShared");
  const name = process.env.ASSET_CONTRACT_NAME || "";
  const symbol = process.env.ASSET_CONTRACT_SYMBOL || "";
  const templateURI = process.env.ASSET_CONTRACT_TEMPLATE_URI || "";
  const assetContract = await AssetContractFactory.connect(adminSigner).deploy(
    name,
    symbol,
    ethers.constants.AddressZero,
    templateURI,
    ethers.constants.AddressZero
  );
  await assetContract.deployed();
  console.log(`ASSET_CONTRACT_SHARED_ADDRESS=${assetContract.address}`);

  // Deploying SharedStorefrontLazyMintAdapter contract
  const LazymintAdapterFactory = await ethers.getContractFactory("SharedStorefrontLazyMintAdapter");
  const useConduit = process.env.CONDUIT;
  let conduitAddr: string = useConduit ? conduitAddress : ZeroAddress;
  const lazymintAdapter = await LazymintAdapterFactory.connect(adminSigner).deploy(
    seaport.address,
    conduitAddr,
    assetContract.address
  );
  await lazymintAdapter.deployed();
  console.log(`LAZY_MINT_ADAPTER_ADDRESS=${lazymintAdapter.address}`);

  // Set the shared proxy of assetToken to SharedStorefront
  await assetContract.addSharedProxyAddress(lazymintAdapter.address);

  // Mint AssetContractShared NFT Tokens
  const creator = new Wallet(process.env.SPIDER_VERSE_NFT_CREATOR_KEY || "");
  const creatorSigner = new NonceManager(new GasPriceManager(provider.getSigner(creator.address)));
  const creatorContract = await assetContract.connect(creatorSigner);

  const quantity = Number(process.env.SPIDER_VERSE_NFT_QUANTITY || "1");
  const tokenIndex = BigNumber.from(process.env.SPIDER_VERSE_NFT_INDEX || "0");
  const data = process.env.SPIDER_VERSE_NFT_DATA || "";
  const buffer = ethers.utils.toUtf8Bytes(data);

  const tokenId = createTokenId(creator.address, tokenIndex, quantity);
  await creatorContract.mint(creator.address, tokenId, quantity, buffer);
  console.log(`SPIDER_VERSE_NFT_LAST_COMBINE_TOKEN_ID=${tokenId.toHexString()}`);

  // Deploy WBOA contract
  const WBOA9Factory = await ethers.getContractFactory("WETH");
  const WBOA9 = await WBOA9Factory.connect(adminSigner).deploy();
  await WBOA9.deployed();
  console.log(`WETH_ADDRESS=${WBOA9.address}`);

  // Deplly Multicall contract
  const MulticallFactory = await ethers.getContractFactory("Multicall");
  const multicall = await MulticallFactory.connect(adminSigner).deploy();
  await multicall.deployed();
  console.log(`MULTICALL_ADDRESS=${multicall.address}`);

  console.log("");
  console.log("# These constants are for .env of frontend");
  console.log(`REACT_APP_SEAPORT_ADDRESS=${seaport.address}`);
  console.log(`REACT_APP_ASSET_CONTRACT_SHARED_ADDRESS=${assetContract.address}`);
  console.log(`REACT_APP_LAZY_MINT_ADAPTER_ADDRESS=${lazymintAdapter.address}`);
  console.log(`REACT_APP_WETH_ADDRESS=${WBOA9.address}`);
  console.log(`REACT_APP_PAYABLE_PROXY_ADDRESS=${process.env.PAYABLE_PROXY_ADDRESS}`);
  console.log(`REACT_APP_MULTICALL_ADDRESS=${multicall.address}`);
  console.log("");

  const [address, tokenIdx, maxSupply] = parseTokenId(tokenId.toString());
  console.log("====== Minted NFT information ======");
  console.log("tokenId:", tokenId);
  console.log("tokenId(HEX):", tokenIdx.toHexString());
  console.log("uri:", await assetContract.uri(tokenId));
  console.log("creator:", await assetContract.creator(tokenId));
  console.log("token index:", tokenIndex.toString());
  console.log("max supply:", maxSupply);
  console.log("balance of creator:", (await assetContract.balanceOf(creator.address, tokenId)).toString());

  console.log("====== AssetContractShared information ======");
  console.log("name:", await assetContract.name());
  console.log("symbol:", await assetContract.symbol());
  console.log("templateURI:", await assetContract.templateURI());

  console.log("====== Additional information ======");
  console.log("Add to SharedProxyAddress - address:", lazymintAdapter.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

