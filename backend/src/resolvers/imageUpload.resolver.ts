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
import { ApiUserError, BaseError } from '../utils/BaseError';
import { GraphQLResolveInfo } from 'graphql';

@Resolver()
export class ImageUploadResolver {
  @Authorized()
  @Mutation(() => String, { nullable: true })
  async uploadSingleImage(
    @Arg('imageFile', () => GraphQLUpload) imageFile: FileUpload,
    @Ctx() ctx: ReqContext,
    @Info() info: GraphQLResolveInfo,
  ): Promise<string | BaseError | null> {
    try {
      const imageUrl: string = await uploadImage(imageFile);
      return imageUrl;
    } catch (e) {
      console.log('e :', e);
      return new ApiUserError(this.constructor.name, 'failed to upload image.');
    }
  }
}
