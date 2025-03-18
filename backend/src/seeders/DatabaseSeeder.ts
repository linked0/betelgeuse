import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import AssetContract, { MetaType } from '../entities/assetContract.entity';
import { ItemType } from '../constants';
import User from '../entities/user.entity';
export class DatabaseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    // Create Contract
    const sharedStoreContractAddress = process.env.ASSET_CONTRACT_SHARED_ADDRESS;
    const sharedStoreContract = new AssetContract(
      ItemType.ERC1155,
      MetaType.CENTRALIZED,
      sharedStoreContractAddress,
      'ShareAsset',
      'Shared Store Contract',
    );
    em.getRepository(AssetContract)
      .persistAndFlush(sharedStoreContract)
      .then(() => console.log('💪 sharedStoreContract persisted to database'))
      .catch((err) => console.log('😱 something went wrong!:', err));

    const lazyMintContractAddress = process.env.LAZY_MINT_ADAPTER;
    const lazyMintAssetContract = new AssetContract(
      ItemType.ERC1155,
      MetaType.CENTRALIZED,
      lazyMintContractAddress,
      'lazyMintAsset',
      'Lazy Mint Asset Contract',
    );
    em.getRepository(AssetContract)
      .persistAndFlush(lazyMintAssetContract)
      .then(() => console.log('💪 lazyMintAssetContract persisted to database'))
      .catch((err) => console.log('😱 something went wrong!:', err));

    const nativeTokenContractAddress = process.env.NATIVE_TOKEN;
    const nativeTokenContract = new AssetContract(
      ItemType.NATIVE,
      MetaType.DECENTRALIZED,
      nativeTokenContractAddress,
      'nativeTokenContract',
      'Native Token Contract',
      'BOA',
    );
    em.getRepository(AssetContract)
      .persistAndFlush(nativeTokenContract)
      .then(() => console.log('💪 nativeTokenContract persisted to database'))
      .catch((err) => console.log('😱 something went wrong!:', err));

    // Create User
    const zeroUser = new User('0x0000000000000000000000000000000000000000');
    em.getRepository(User)
      .persistAndFlush(zeroUser)
      .then(() => console.log('💪 zeroUser persisted to database'))
      .catch((err) => console.log('😱 something went wrong!:', err));
  }
}
