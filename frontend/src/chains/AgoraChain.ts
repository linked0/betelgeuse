import { Chain } from "@usedapp/core";

export const AgoraMainnet: Chain = {
  chainId: 12300,
  chainName: "PoohMainnet",
  isTestChain: false,
  isLocalChain: false,
  multicallAddress: process.env.REACT_APP_MULTICALL_ADDRESS || "",
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
  multicallAddress: process.env.REACT_APP_MULTICALL_ADDRESS_TESTNET || "",
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
