import { Chain } from "@usedapp/core";

export const AgoraMainnet: Chain = {
  chainId: 12300,
  chainName: "PoohMainnet",
  isTestChain: false,
  isLocalChain: false,
  multicallAddress: "0x045d5aFA977791EFA0A78d9Cd31D0327DB79C632",
  rpcUrl: "https://mainnet.bosagora.org",
  nativeCurrency: {
    name: "POO",
    symbol: "POO",
    decimals: 18,
  },
  blockExplorerUrl: "https://scan.bosagora.org",
  getExplorerAddressLink: (address: string) => `https://scan.bosagora.org/address/${address}`,
  getExplorerTransactionLink: (transactionHash: string) =>
    `https://scan.bosagora.org/tx/${transactionHash}`,
};

export const AgoraTestnet: Chain = {
  chainId: 7212309,
  chainName: "PoohLocalnet",
  isTestChain: true,
  isLocalChain: true,
  multicallAddress: "0x1b985dDfB6Ad5456Af45065698c0930dFF2D767b",
  rpcUrl: "http://127.0.0.1:8585",
  nativeCurrency: {
    name: "POO",
    symbol: "POO",
    decimals: 18,
  },
  blockExplorerUrl: "https://testnet-scan.bosagora.org",
  getExplorerAddressLink: (address: string) =>
    `https://testnet-scan.bosagora.org/address/${address}`,
  getExplorerTransactionLink: (transactionHash: string) =>
    `https://testnet-scan.bosagora.org/tx/${transactionHash}`,
};

export default { AgoraMainnet, AgoraTestnet };
