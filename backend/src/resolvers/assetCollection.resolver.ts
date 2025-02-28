/* tslint:disable:prefer-const */
import {
  Resolver,
  Query,
  Mutation,
  Ctx,
  Arg,
  Info,
  Authorized,
  Int,
} from 'type-graphql';
import ReqContext from '../interfaces/ReqContext';
import { GraphQLUpload, FileUpload } from 'graphql-upload-ts';
import { uploadImage } from '../utils/Image';
import { ServiceResponse } from '../interfaces/base.interface';
import { ApiUserError, BaseError } from '../utils/BaseError';
import User, { FeeCollector } from '../entities/user.entity';
import { GraphQLResolveInfo } from 'graphql';
import * as dotenv from 'dotenv';
import AssetCollection, {
  CategoryType,
} from '../entities/assetCollection.entity';
import { ethers } from 'ethers';
import { FeeCollectorData } from '../types';

dotenv.config();

const AssetCollectionServiceResponse = ServiceResponse(AssetCollection);

@Resolver()
export class AssetCollectionResolver {
  @Query(() => AssetCollectionServiceResponse)
  async GetAssetCollection(
    @Arg('id') id: string,
    @Ctx() ctx: ReqContext,
  ): Promise<typeof AssetCollectionServiceResponse> {
    try {
      const { em } = ctx;

      const assetCollection: AssetCollection = await em.findOneOrFail(
        AssetCollection,
        {
          id,
        },
        {
          populate: ['assets'],
        },
      );
      return assetCollection;
    } catch (e) {
      return new ApiUserError(
        this.constructor.name,
        'failed to retrieve assetCollection.',
      );
    }
  }

  @Query(() => AssetCollection)
  async GetAssetCollection2(
    @Arg('id') id: string,
    @Ctx() ctx: ReqContext,
  ): Promise<typeof AssetCollectionServiceResponse> {
    try {
      const { em } = ctx;

      const assetCollection: AssetCollection = await em.findOneOrFail(
        AssetCollection,
        {
          id,
        },
        {
          populate: ['assets'],
        },
      );
      return assetCollection;
    } catch (e) {
      return new ApiUserError(
        this.constructor.name,
        'failed to retrieve assetCollection.',
      );
    }
  }

  @Query(() => AssetCollectionServiceResponse)
  async GetAssetCollectionByName(
    @Arg('name') name: string,
    @Ctx() ctx: ReqContext,
  ): Promise<typeof AssetCollectionServiceResponse> {
    try {
      const { em } = ctx;

      const url = name.replace(/\s/g, '').toLowerCase();
      const assetCollection: AssetCollection = await em.findOneOrFail(
        AssetCollection,
        {
          url,
        },
        {
          populate: ['creator', 'creator.profile', 'assets', 'feeCollectors'],
        },
      );
      return assetCollection;
    } catch (e) {
      return new ApiUserError(
        this.constructor.name,
        'failed to retrieve assetCollection.',
      );
    }
  }

  @Query(() => [AssetCollection], { nullable: true })
  async GetAssetCollections(
    @Arg('category', { nullable: true }) categoryType: CategoryType,
    @Ctx() ctx: ReqContext,
  ): Promise<[AssetCollection] | BaseError | null> {
    try {
      const { em } = ctx;

      const assetCollections = categoryType
        ? await em.getRepository(AssetCollection).find({ categoryType })
        : await em.getRepository(AssetCollection).findAll();
      return assetCollections as [AssetCollection];
    } catch (e) {
      return new ApiUserError(
        this.constructor.name,
        'failed to retrieve assetCollection.',
      );
    }
  }

  @Query(() => [AssetCollection], { nullable: true })
  async GetUserAssetCollections(
    @Arg('userAddress') userAddress: string,
    @Ctx() ctx: ReqContext,
  ): Promise<[AssetCollection] | BaseError | null> {
    try {
      const { em } = ctx;
      if (!ethers.utils.isAddress(userAddress)) {
        return new ApiUserError(this.constructor.name, 'invalid userAddress');
      }

      const creator = await em.findOneOrFail(User, {
        userAddress,
      });
      const assetCollections = await em.getRepository(AssetCollection).find(
        {
          creator,
        },
        { populate: ['creator'] },
      );
      return assetCollections as [AssetCollection];
    } catch (e) {
      return new ApiUserError(
        this.constructor.name,
        'fail to retrieve AssetCollection',
      );
    }
  }

  @Authorized()
  @Mutation(() => AssetCollectionServiceResponse)
  async createAssetCollection(
    @Arg('logoUrl') logoUrl: string,
    @Arg('featureUrl', { nullable: true }) featureUrl: string,
    @Arg('bannerUrl', { nullable: true }) bannerUrl: string,
    @Arg('name') name: string,
    @Arg('description', { nullable: true }) description: string,
    @Arg('webLink', { nullable: true }) webLink: string,
    @Arg('mediumLink', { nullable: true }) mediumLink: string,
    @Arg('telegramLink', { nullable: true }) telegramLink: string,
    @Arg('feeCollectors', { nullable: true }) feeCollectors: string,
    @Arg('category', () => Int) category: CategoryType,
    @Ctx() ctx: ReqContext,
    @Info() info: GraphQLResolveInfo,
  ): Promise<typeof AssetCollectionServiceResponse> {
    try {
      const { em, user } = ctx;
      if (category === undefined) {
        return new ApiUserError(
          this.constructor.name,
          'failed because of no category argument.',
        );
      }

      const creator = await em.findOneOrFail(User, {
        userAddress: user.userAddress,
      });
      const url = name.replace(/\s/g, '').toLowerCase();
      const assetCollection = new AssetCollection(
        name,
        description || '',
        category,
        logoUrl,
      );

      assetCollection.creator = creator;
      assetCollection.url = url;

      if (featureUrl) assetCollection.featureUrl = featureUrl;
      if (bannerUrl) assetCollection.bannerUrl = bannerUrl;
      if (webLink) assetCollection.webLink = webLink;
      if (mediumLink) assetCollection.mediumLink = mediumLink;
      if (telegramLink) assetCollection.telegramLink = telegramLink;

      if (feeCollectors) {
        const collectorsData: [FeeCollectorData] = JSON.parse(feeCollectors);
        for (const data of collectorsData) {
          let collector = await em.findOne(User, {
            userAddress: data.address,
          });
          if (!collector) {
            collector = new User(data.address);
            em.persist(collector);
          }
          const feeCollector = new FeeCollector(
            collector,
            assetCollection,
            data.fee,
          );
          em.persist(feeCollector);
        }
      }

      em.persist(assetCollection);
      await em.flush();
      console.log('end');
      return assetCollection;
    } catch (e) {
      console.log('e :', e);
      return new ApiUserError(
        this.constructor.name,
        'failed to create assetCollection.',
      );
    }
  }

  @Authorized()
  @Mutation(() => AssetCollectionServiceResponse)
  async updateAssetCollection(
    @Arg('id') id: string,
    @Arg('logoUrl', { nullable: true }) logoUrl: string,
    @Arg('featureUrl', { nullable: true }) featureUrl: string,
    @Arg('bannerUrl', { nullable: true }) bannerUrl: string,
    @Arg('name', { nullable: true }) name: string,
    @Arg('description', { nullable: true }) description: string,
    @Arg('webLink', { nullable: true }) webLink: string,
    @Arg('mediumLink', { nullable: true }) mediumLink: string,
    @Arg('telegramLink', { nullable: true }) telegramLink: string,
    @Arg('feeCollectors', { nullable: true }) feeCollectors: string,
    @Arg('category', () => Int, { nullable: true }) categoryType: CategoryType,
    @Ctx() ctx: ReqContext,
    @Info() info: GraphQLResolveInfo,
  ): Promise<typeof AssetCollectionServiceResponse> {
    try {
      const { em, user } = ctx;
      const assetCollection = await em.findOneOrFail(AssetCollection, id, {
        populate: ['creator', 'feeCollectors'],
      });
      if (user.userAddress !== assetCollection.creator.userAddress) {
        return new ApiUserError(
          this.constructor.name,
          'You are not authorized to update this asset collection.',
        );
      }

      if (categoryType) {
        assetCollection.categoryType = categoryType;
      }
      if (logoUrl) {
        assetCollection.logoUrl = logoUrl;
      }
      if (featureUrl) {
        assetCollection.featureUrl = featureUrl;
      }
      if (bannerUrl) {
        assetCollection.bannerUrl = bannerUrl;
      }
      if (name) {
        assetCollection.name = name;
      }
      if (description) {
        assetCollection.description = description;
      }
      if (webLink) {
        assetCollection.webLink = webLink;
      }
      if (mediumLink) {
        assetCollection.mediumLink = mediumLink;
      }
      if (telegramLink) {
        assetCollection.telegramLink = telegramLink;
      }

      if (feeCollectors) {
        const collectorsData: [FeeCollectorData] = JSON.parse(feeCollectors);
        const currentFeeCollectors = assetCollection.feeCollectors
          ? assetCollection.feeCollectors.getItems()
          : null;
        if (currentFeeCollectors) {
          for (const feeCollector of currentFeeCollectors) {
            em.remove(feeCollector);
          }
        }

        for (const data of collectorsData) {
          let collector = await em.findOne(User, {
            userAddress: data.address,
          });
          if (!collector) {
            collector = new User(data.address);
            em.persist(collector);
          }
          const feeCollector = new FeeCollector(
            collector,
            assetCollection,
            data.fee,
          );
          em.persist(feeCollector);
        }
      }

      await em.flush();
      return assetCollection;
    } catch (e) {
      console.log('e :', e);
      return new ApiUserError(
        this.constructor.name,
        'Failed to update assetCollection.',
      );
    }
  }
}
