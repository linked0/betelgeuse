import { Resolver, Query, Ctx, Arg } from 'type-graphql';
import ReqContext from '../interfaces/ReqContext';
import { ApiUserError, BaseError } from '../utils/BaseError';
import * as dotenv from 'dotenv';
import { createUnionType } from 'type-graphql';
import AssetCollection from '../entities/assetCollection.entity';
import Asset from '../entities/asset.entity';
import User from '../entities/user.entity';

const SearchResultUnion = createUnionType({
  name: 'SearchResult', // the name of the GraphQL union
  // function that returns tuple of object types classes
  types: () => [Asset, AssetCollection, User, BaseError] as const,
});

dotenv.config();

@Resolver()
export class SearchResolver {
  @Query(() => [SearchResultUnion])
  async GetSearchResult(
    @Arg('input') input: string,
    @Ctx() ctx: ReqContext,
  ): Promise<Array<typeof SearchResultUnion>> {
    try {
      const { em } = ctx;
      const assets = await em.getRepository(Asset).find({
        $or: [
          { name: { $fulltext: input } },
          { assetContractAddress: { $fulltext: input } },
        ],
      });
      const users = await em.getRepository(User).find({
        $or: [
          { userAddress: { $fulltext: input } },
          { profile: { name: { $fulltext: input } } },
        ],
      });
      const collections = await em
        .getRepository(AssetCollection)
        .find({ name: { $fulltext: input } });
      return [...assets, ...users, ...collections];
    } catch (e) {
      return [
        new ApiUserError(
          this.constructor.name,
          'failed to retrieve activities.',
        ),
      ];
    }
  }
}
