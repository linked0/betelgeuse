import {
  Arg,
  Authorized,
  Ctx,
  Info,
  Int,
  Mutation,
  Query,
  Resolver,
} from 'type-graphql';
import shortId from 'shortid';
import ReqContext from '../interfaces/ReqContext';
import { FileUpload, GraphQLUpload } from 'graphql-upload-ts';
import { uploadImageToResize } from '../utils/Image';
import { createTokenId } from '../utils/TokenId';
import Asset from '../entities/asset.entity';
import { ServiceResponse } from '../interfaces/base.interface';
import { ethers } from 'ethers';
import { ApiUserError, BaseError } from '../utils/BaseError';
import User, { Owner } from '../entities/user.entity';
import { GraphQLResolveInfo } from 'graphql';
import AssetContract, { MetaType } from '../entities/assetContract.entity';
import { isValidContract } from '../utils/Contract';
import AssetCollection, {
  CategoryType,
} from '../entities/assetCollection.entity';
import { wrap } from '@mikro-orm/core';
import Activity, { ActivityType } from '../entities/activity.entity';
import * as dotenv from 'dotenv';
import {
  contractType,
  getErc1155TokenData,
  getErc721TokenData,
} from '../utils/web3/contract-type';
import { ItemType } from '../constants';
import got from 'got';
import { ImageDownload } from '../utils/ImageDownload';
import { OrderStatus } from '../entities/order.entity';
dotenv.config();

const AssetServiceResponse = ServiceResponse(Asset);

@Resolver()
export class AssetResolver {
  @Query(() => AssetServiceResponse)
  async GetAsset(
    @Arg('tokenId') tokenId: string,
    @Arg('assetContractAddress', { nullable: true })
    assetContractAddress: string,
    @Ctx() ctx: ReqContext,
  ): Promise<typeof AssetServiceResponse> {
    try {
      const { em } = ctx;
      if (!assetContractAddress)
        assetContractAddress = process.env.ASSET_CONTRACT_SHARED_ADDRESS || '';

      return await em.findOneOrFail(Asset, {
        assetContractAddress,
        tokenId,
      });
    } catch (e) {
      return new ApiUserError(
        this.constructor.name,
        'failed to retrieve asset.',
      );
    }
  }

  @Query(() => [Asset], { nullable: true })
  async GetUserAssets(
    @Arg('userAddress') userAddress: string,
    @Ctx() ctx: ReqContext,
  ): Promise<[Asset] | BaseError | null> {
    try {
      const { em } = ctx;
      if (!ethers.utils.isAddress(userAddress)) {
        return new ApiUserError(this.constructor.name, 'invalid userAddress');
      }

      const owner = await em.findOneOrFail(User, {
        userAddress,
      });
      const asset = await em.getRepository(Asset).find(
        {
          owners: { user: owner },
        },
        { populate: ['creator', 'assetCollection', 'owners'] },
      );
      return asset as [Asset];
    } catch (e: any) {
      if (e.toString().includes('NotFoundError: User not found')) {
        return new ApiUserError(this.constructor.name, 'user not found');
      } else {
        return new ApiUserError(
          this.constructor.name,
          'fail to retrieve assets',
        );
      }
    }
  }

  @Query(() => AssetServiceResponse)
  async GetAssetOrders(
    @Arg('assetId') assetId: string,
    @Ctx() ctx: ReqContext,
  ): Promise<typeof AssetServiceResponse> {
    try {
      const { em } = ctx;
      const asset = await em.findOneOrFail(
        Asset,
        {
          id: assetId,
        },
        { populate: ['activities', 'activities.order'] },
      );

      console.log('asset :', asset);
      return asset;
    } catch (e) {
      return new ApiUserError(this.constructor.name, 'retrieve assets');
    }
  }

  @Query(() => AssetServiceResponse)
  async GetAssetDetail(
    @Arg('assetId', { nullable: true }) assetId: string,
    @Arg('assetContractAddress', { nullable: true })
    assetContractAddress: string,
    @Arg('tokenId', { nullable: true }) tokenId: string,
    @Ctx() ctx: ReqContext,
  ): Promise<typeof AssetServiceResponse> {
    try {
      const { em } = ctx;

      const asset = await em.findOneOrFail(
        Asset,
        assetId
          ? {
              id: assetId,
            }
          : { assetContractAddress, tokenId },
        {
          populate: [
            'creator',
            'owners',
            'owners.user',
            'assetCollection',
            'assetCollection.feeCollectors',
            'assetCollection.feeCollectors.user',
            'assetContract',
            'activities',
            'activities.from',
            'activities.to',
            'activities.order',
          ],
        },
      );

      wrap(asset).assign({ viewCount: asset.viewCount + 1 });
      if (asset.activities) {
        for (const at of asset.activities.$) {
          if (at && at.order) {
            const now = new Date();
            const endTime = new Date(at.order.endTime);
            // console.log('now.getTime() :', now.getTime());
            // console.log('endTime.getTime() :', endTime.getTime());
            if (endTime < now) {
              wrap(at.order).assign({
                status: OrderStatus.EXPIRED,
              });
            }
          }
        }
      }
      await em.flush();
      return asset;
    } catch (e) {
      return new ApiUserError(
        this.constructor.name,
        'fail to retrieve asset detail',
      );
    }
  }

  @Authorized()
  @Mutation(() => AssetServiceResponse)
  async createAsset(
    @Arg('imageFile', () => GraphQLUpload) file: FileUpload,
    @Arg('name') name: string,
    @Arg('description', { nullable: true }) description: string,
    @Arg('assetContractAddress', { nullable: true })
    assetContractAddress: string,
    @Arg('assetCollectionId', { nullable: true }) assetCollectionId: string,
    @Arg('externalLink', { nullable: true }) externalLink: string,
    @Arg('attribute', { nullable: true }) attribute: string,
    @Arg('totalSupply', () => Int) totalSupply: number,
    @Ctx() ctx: ReqContext,
    @Info() info: GraphQLResolveInfo,
  ): Promise<typeof AssetServiceResponse> {
    try {
      if (
        assetContractAddress !== undefined &&
        !(await isValidContract(assetContractAddress))
      ) {
        return new ApiUserError(
          this.constructor.name,
          'invalid assetContractAddress',
        );
      }
      const { em, user } = ctx;
      const creator = await em.findOneOrFail(User, {
        userAddress: user.userAddress,
      });
      const { originalUrl, thumbnailUrl, previewUrl } =
        await uploadImageToResize(file);
      const tokenId = createTokenId(
        user.userAddress,
        creator.mintCount,
        totalSupply,
      );
      const asset = new Asset(
        creator,
        process.env.ASSET_CONTRACT_SHARED_ADDRESS || '',
        tokenId,
        totalSupply,
        name,
        description || '',
        originalUrl,
        thumbnailUrl,
        previewUrl,
      );

      wrap(creator).assign({ mintCount: creator.mintCount + 1 });
      // asset.owners.add(creator);

      asset.assetContract = await em.findOneOrFail(AssetContract, {
        contractAddress: process.env.ASSET_CONTRACT_SHARED_ADDRESS || '',
      });

      if (assetCollectionId === undefined) {
        const tempId = shortId.generate();
        const assetCollection = new AssetCollection(
          'Unknown Collection-' + tempId,
          '',
          CategoryType.NO_CATEGORY,
        );
        assetCollection.creator = creator;
        asset.assetCollection = assetCollection;
      } else {
        const assetCollection = await em.findOneOrFail(AssetCollection, {
          id: assetCollectionId,
        });
        asset.assetCollection = assetCollection;
      }
      if (externalLink) asset.externalLink = externalLink;
      if (attribute) asset.attribute = attribute;
      em.persist(asset);

      const owner = new Owner(creator, asset, totalSupply);
      em.persist(owner);

      // add activity
      const zeroUser = await em.findOneOrFail(User, {
        userAddress: '0x0000000000000000000000000000000000000000',
      });
      const activity = new Activity(
        zeroUser,
        asset,
        ActivityType.MINTED,
        totalSupply,
      );
      activity.to = creator;
      em.persist(activity);
      await em.flush();
      return asset;
    } catch (e) {
      console.log('e :', e);
      return new ApiUserError(this.constructor.name, 'failed to create asset.');
    }
  }
  @Authorized()
  @Mutation(() => AssetServiceResponse)
  async updateAsset(
    @Arg('assetId', { nullable: true }) assetId: string,
    @Arg('assetContractAddress', { nullable: true })
    assetContractAddress: string,
    @Arg('tokenId', { nullable: true }) tokenId: string,
    @Arg('name', { nullable: true }) name: string,
    @Arg('description', { nullable: true }) description: string,
    @Arg('imageFile', () => GraphQLUpload, { nullable: true })
    file: FileUpload,
    @Arg('externalLink', { nullable: true }) externalLink: string,
    @Arg('attribute', { nullable: true }) attribute: string,
    @Arg('metadataLink', { nullable: true }) metadataLink: string,
    @Arg('backgroundColor', { nullable: true }) backgroundColor: string,
    @Ctx() ctx: ReqContext,
    @Info() info: GraphQLResolveInfo,
  ): Promise<typeof AssetServiceResponse> {
    try {
      const { em, user } = ctx;
      const asset = await em.findOneOrFail(
        Asset,
        assetId
          ? {
              id: assetId,
              creator: user.id,
            }
          : { assetContractAddress, tokenId, creator: user.id },
        {
          populate: [
            'creator',
            'owners',
            'owners.user',
            'assetCollection',
            'assetCollection.feeCollectors',
            'assetCollection.feeCollectors.user',
            'assetContract',
            'activities',
            'activities.from',
            'activities.to',
            'activities.order',
          ],
        },
      );
      if (name) asset.name = name;
      if (description) asset.description = description;
      if (externalLink) asset.externalLink = externalLink;
      if (attribute) asset.attribute = attribute;
      if (metadataLink) asset.metadataLink = metadataLink;
      if (backgroundColor) asset.backgroundColor = backgroundColor;

      if (file) {
        const { originalUrl, thumbnailUrl, previewUrl } =
          await uploadImageToResize(file);
        asset.originalUrl = originalUrl;
        asset.thumbnailUrl = thumbnailUrl;
        asset.previewUrl = previewUrl;
      }
      await em.persistAndFlush(asset);
      return asset;
    } catch (e) {
      console.log('e :', e);
      return new ApiUserError(this.constructor.name, 'failed to update asset.');
    }
  }
  @Authorized()
  @Mutation(() => AssetServiceResponse)
  async importAsset(
    @Arg('tokenId') tokenId: string,
    @Arg('assetContractAddress') assetContractAddress: string,
    @Ctx() ctx: ReqContext,
    @Info() info: GraphQLResolveInfo,
  ): Promise<typeof AssetServiceResponse> {
    try {
      const { em, user } = ctx;
      if (
        assetContractAddress !== undefined &&
        !(await isValidContract(assetContractAddress))
      ) {
        return new ApiUserError(
          this.constructor.name,
          'invalid assetContractAddress',
        );
      }
      const existAsset = await em.getRepository(Asset).findOne({
        tokenId,
        assetContractAddress,
      });
      if (existAsset) {
        return new ApiUserError(
          this.constructor.name,
          'exist assetContractAddress and tokenId',
        );
      }

      const nftContractType = await contractType(assetContractAddress);
      console.log('nftContractType :', nftContractType);
      const tokenData =
        nftContractType === ItemType.ERC1155
          ? await getErc1155TokenData(
              assetContractAddress,
              user.userAddress,
              tokenId,
            )
          : await getErc721TokenData(
              assetContractAddress,
              user.userAddress,
              tokenId,
            );
      console.log('tokenData :', tokenData);
      if (tokenData.balanceOf.toHexString() === '0x00')
        new ApiUserError(
          this.constructor.name,
          `Your address '${user.userAddress}' has no balance for token id ${tokenId}`,
        );
      const response = await got(tokenData.uri);
      const data = JSON.parse(response.body);
      console.log('data:', data);

      let assetContract = await em.findOne(AssetContract, {
        contractAddress: assetContractAddress,
      });
      if (!assetContract) {
        assetContract = new AssetContract(
          nftContractType,
          MetaType.DECENTRALIZED,
          assetContractAddress,
          data.name || '',
          data.description || '',
        );
        em.persist(assetContract);
      }

      const { thumbnailUrl, previewUrl } = await ImageDownload(data.image);
      const creator = await em.findOneOrFail(User, {
        userAddress: user.userAddress,
      });
      const asset = new Asset(
        creator,
        assetContractAddress,
        tokenId,
        10,
        data.name || '',
        data.description || '',
        data.image,
        thumbnailUrl,
        previewUrl,
      );

      asset.assetContract = assetContract;
      let assetCollection = await em.findOne(AssetCollection, {
        assets: { assetContractAddress },
      });
      if (!assetCollection) {
        const tempId = shortId.generate();
        assetCollection = new AssetCollection(
          data.name + ' Collection-' + tempId || '',
          data.description || '',
          CategoryType.NO_CATEGORY,
        );
        assetCollection.creator = creator;
        asset.assetCollection = assetCollection;
        em.persist(assetCollection);
      } else {
        asset.assetCollection = assetCollection;
      }
      em.persist(asset);
      const owner = new Owner(creator, asset, 1);
      em.persist(owner);

      await em.flush();
      return asset;
    } catch (e) {
      console.log('e :', e);
      return new ApiUserError(this.constructor.name, 'failed to create asset.');
    }
  }

  @Authorized()
  @Mutation(() => AssetServiceResponse)
  async updateAssetFavorite(
    @Arg('assetId', { nullable: true }) assetId: string,
    @Arg('assetContractAddress', { nullable: true })
    assetContractAddress: string,
    @Arg('tokenId', { nullable: true }) tokenId: string,
    @Ctx() ctx: ReqContext,
    @Info() info: GraphQLResolveInfo,
  ): Promise<typeof AssetServiceResponse> {
    try {
      const { em, user } = ctx;
      const asset = await em.findOneOrFail(
        Asset,
        assetId
          ? {
              id: assetId,
            }
          : { assetContractAddress, tokenId },
      );

      const marker = await em.findOneOrFail(User, {
        userAddress: user.userAddress,
      });

      if (asset.markers.contains(marker)) {
        asset.markers.remove(marker);
      } else {
        asset.markers.add(marker);
      }
      return asset;
    } catch (e) {
      console.log('e :', e);
      return new ApiUserError(
        this.constructor.name,
        'failed to update asset favorite.',
      );
    }
  }
}
