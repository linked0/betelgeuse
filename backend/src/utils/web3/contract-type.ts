import { BigNumber, Contract, ethers } from 'ethers';

import ERC721 from '../../contracts/abi/ERC721.json';
import ERC1155 from '../../contracts/abi/ERC1155.json';
import * as dotenv from 'dotenv';
import { ItemType } from '../../constants';

dotenv.config();

const IERC1155Metadata_URI = '0x0e89341c';
const IERC721Metadata_URI = '0x5b5e139f';

export const provider = new ethers.providers.JsonRpcProvider(
  process.env.RPC_URL,
);

export enum NftContractType {
  ERC_1155 = 'ERC1155',
  ERC_721 = 'ERC721',
  NOT_SUPPORTED = 'Not supported',
}

export async function contractType(contract: string): Promise<ItemType> {
  try {
    const assetContractErc1155 = new Contract(contract, ERC1155, provider);
    const erc1155SupportsMetadata =
      await assetContractErc1155.supportsInterface(IERC1155Metadata_URI);
    if (erc1155SupportsMetadata) {
      console.log('This contract supports ERC1155 metadataUrl');
      return ItemType.ERC1155;
    }
    console.log('Check if ERC721 Metadata');
    const assetContractErc721 = new Contract(contract, ERC721, provider);
    const erc721SupportsMetadata = await assetContractErc721.supportsInterface(
      IERC721Metadata_URI,
    );
    if (erc721SupportsMetadata) {
      console.log('This contract supports ERC721 metadataUrl');
      return ItemType.ERC721;
    }
  } catch (e) {
    console.error(
      'Failed to confirm contract type and if it supports metadata URI interface',
      e,
    );
  }
  return ItemType.NOT_SUPPORTED;
}

export function getErc1155TokenData(
  contract: string,
  owner: string,
  tokenId: string,
): Promise<{ uri: string; balanceOf: BigNumber }> {
  const assetContract = new Contract(contract, ERC1155, provider);
  console.log(
    `getErc1155TokenData:Contract:${contract},owner:${owner},tokenId:${tokenId}`,
  );
  return Promise.all([
    assetContract.uri(tokenId),
    assetContract.balanceOf(owner, tokenId),
  ]).then(([uri, balanceOf]) => {
    return { uri, balanceOf };
  });
}

export function getErc721TokenData(
  contract: string,
  owner: string,
  tokenId: string,
): Promise<{ uri: string; balanceOf: BigNumber }> {
  const assetContract = new Contract(contract, ERC721, provider);
  return Promise.all([
    assetContract.tokenURI(tokenId),
    assetContract.balanceOf(owner),
  ]).then(([uri, balanceOf]) => {
    return { uri, balanceOf };
  });
}
