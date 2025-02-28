import { Resolver, Query, Ctx, Arg } from 'type-graphql';
import ReqContext from '../interfaces/ReqContext';
import { ServiceResponse } from '../interfaces/base.interface';
import { ethers } from 'ethers';
import { ApiUserError, BaseError } from '../utils/BaseError';
import * as dotenv from 'dotenv';
import Activity from '../entities/activity.entity';

dotenv.config();

const ActivityServiceResponse = ServiceResponse(Activity);

@Resolver()
export class ActivityResolver {
  @Query(() => ActivityServiceResponse)
  async GetAssetActivities(
    @Arg('assetId') assetId: string,
    @Ctx() ctx: ReqContext,
  ): Promise<[Activity] | BaseError | null> {
    try {
      const { em } = ctx;
      const activities = await em.getRepository(Activity).find({
        id: assetId,
      });
      return activities as [Activity];
    } catch (e) {
      return new ApiUserError(
        this.constructor.name,
        'failed to retrieve activities.',
      );
    }
  }

  @Query(() => [Activity], { nullable: true })
  async GetUserActivities(
    @Arg('userAddress') userAddress: string,
    @Ctx() ctx: ReqContext,
  ): Promise<[Activity] | BaseError | null> {
    try {
      const { em } = ctx;
      if (!ethers.utils.isAddress(userAddress)) {
        return new ApiUserError(this.constructor.name, 'invalid userAddress');
      }
      const activities = await em.getRepository(Activity).find(
        {
          from: { userAddress },
        },
        { populate: ['from', 'asset.assetCollection', 'order', 'to'] },
      );
      return activities as [Activity];
    } catch (e) {
      return new ApiUserError(
        this.constructor.name,
        'failed to retrieve activities',
      );
    }
  }
}
