import {
  Resolver,
  Query,
  Ctx,
  Arg,
  Authorized,
  Mutation,
  Int,
  Info,
} from 'type-graphql';
import User, { FeeCollector } from '../entities/user.entity';
import ReqContext from '../interfaces/ReqContext';
import { v4 } from 'uuid';
import { ApiUserError } from '../utils/BaseError';
import { ServiceResponse } from '../interfaces/base.interface';
import { ethers } from 'ethers';
import pkg from 'jsonwebtoken';
import generateApiKey from 'generate-api-key';

const { sign } = pkg;
import * as dotenv from 'dotenv';

dotenv.config();

import { Field, ObjectType } from 'type-graphql';
import { FileUpload, GraphQLUpload } from 'graphql-upload-ts';
import AssetCollection, {
  CategoryType,
} from '../entities/assetCollection.entity';
import { GraphQLResolveInfo } from 'graphql';
import { uploadImage } from '../utils/Image';
import { FeeCollectorData } from '../types';
import { Profile } from '../entities/profile.entity';

@ObjectType()
export class Jwt {
  @Field()
  userAddress: string;
  @Field()
  jwt: string;

  constructor(userAddress: string, jwt: string) {
    this.userAddress = userAddress;
    this.jwt = jwt;
  }
}

function createNonce() {
  const nonce = v4();
  console.log('createNonce:nonce=', nonce);
  return nonce;
}

const UserServiceResponse = ServiceResponse(User);
const ProfileServiceResponse = ServiceResponse(Profile);
const JwtServiceResponse = ServiceResponse(Jwt);

@Resolver()
export class UserResolver {
  @Query(() => UserServiceResponse)
  async getNonce(
    @Arg('userAddress') userAddress: string,
    @Ctx() ctx: ReqContext,
  ): Promise<typeof UserServiceResponse> {
    if (!ethers.utils.isAddress(userAddress)) {
      return new ApiUserError(this.constructor.name, 'invalid userAddress');
    }

    try {
      const { em } = ctx;
      const nonce = createNonce();
      const user = await em.findOne(User, { userAddress });
      if (user) {
        user.nonce = nonce;
        await em.flush();
        return user;
      } else {
        console.log('nonce :', nonce);
        const newUser = new User(userAddress, nonce);
        await em.persistAndFlush(newUser);
        return newUser;
      }
    } catch (e) {
      return new ApiUserError(this.constructor.name, 'failed for nonce');
    }
  }

  @Query(() => JwtServiceResponse)
  async getJwt(
    @Arg('userAddress') userAddress: string,
    @Arg('message') message: string,
    @Arg('signature') signature: string,
    @Ctx() ctx: ReqContext,
  ): Promise<typeof JwtServiceResponse> {
    if (!ethers.utils.isAddress(userAddress)) {
      return new ApiUserError(this.constructor.name, 'invalid address');
    }
    const recover = ethers.utils.verifyMessage(message, signature);
    if (recover !== userAddress) {
      return new ApiUserError(
        this.constructor.name,
        'invalid signature or message',
      );
    }

    try {
      const { em } = ctx;
      const nonce = createNonce();
      const user = await em.findOne(User, { userAddress });
      if (user) {
        user.nonce = nonce;
        const jwt = sign(
          {
            id: user.id,
            userAddress,
          },
          process.env.JWT_SECRET,
          { expiresIn: '30d', jwtid: nonce, issuer: 'boa-space-backend' },
        );
        return new Jwt(userAddress, jwt);
      } else {
        return new ApiUserError(this.constructor.name, 'not user found');
      }
    } catch (e) {
      return new ApiUserError(this.constructor.name, 'failed for jwt');
    }
  }

  @Authorized()
  @Query(() => UserServiceResponse)
  async getMyInfo(
    @Ctx() ctx: ReqContext,
    @Info() info: GraphQLResolveInfo,
  ): Promise<typeof UserServiceResponse> {
    try {
      const { em, user } = ctx;
      const me = await em.findOneOrFail(
        User,
        {
          userAddress: user.userAddress,
        },
        { populate: ['profile'] },
      );
      return me;
    } catch (e) {
      console.log('e :', e);
      return new ApiUserError(this.constructor.name, 'failed to my info.');
    }
  }

  @Authorized()
  @Mutation(() => ProfileServiceResponse)
  async createUserProfile(
    @Arg('userFile', () => GraphQLUpload, { nullable: true })
    userFile: FileUpload,
    @Arg('name') name: string,
    @Arg('bio', { nullable: true }) bio: string,
    @Arg('twitter', { nullable: true }) twitter: string,
    @Arg('youtube', { nullable: true }) youtube: string,
    @Arg('instagram', { nullable: true }) instagram: string,
    @Arg('homepage', { nullable: true }) homepage: string,
    @Ctx() ctx: ReqContext,
    @Info() info: GraphQLResolveInfo,
  ): Promise<typeof ProfileServiceResponse> {
    try {
      const { em, user } = ctx;
      const creator = await em.findOneOrFail(User, {
        userAddress: user.userAddress,
      });
      const profile = new Profile(creator);

      if (name) profile.name = name;
      if (bio) profile.bio = bio;
      if (twitter) profile.twitter = twitter;
      if (youtube) profile.youtube = youtube;
      if (instagram) profile.instagram = instagram;
      if (homepage) profile.homepage = homepage;

      if (userFile) {
        const url = await uploadImage(userFile);
        profile.image = url;
      }

      em.persist(profile);
      await em.flush();
      return profile;
    } catch (e) {
      console.log('e :', e);
      return new ApiUserError(
        this.constructor.name,
        'failed to create profile.',
      );
    }
  }

  @Authorized()
  @Mutation(() => ProfileServiceResponse)
  async updateProfile(
    @Arg('userFile', () => GraphQLUpload, { nullable: true })
    userFile: FileUpload,
    @Arg('name', { nullable: true }) name: string,
    @Arg('bio', { nullable: true }) bio: string,
    @Arg('twitter', { nullable: true }) twitter: string,
    @Arg('youtube', { nullable: true }) youtube: string,
    @Arg('instagram', { nullable: true }) instagram: string,
    @Arg('homepage', { nullable: true }) homepage: string,
    @Ctx() ctx: ReqContext,
    @Info() info: GraphQLResolveInfo,
  ): Promise<typeof ProfileServiceResponse> {
    try {
      const { em, user } = ctx;
      const profile = await em.findOneOrFail(Profile, { user: user.id });

      if (name) profile.name = name;
      if (bio) profile.bio = bio;
      if (twitter) profile.twitter = twitter;
      if (youtube) profile.youtube = youtube;
      if (instagram) profile.instagram = instagram;
      if (homepage) profile.homepage = homepage;

      if (userFile) {
        const url = await uploadImage(userFile);
        profile.image = url;
      }

      em.persist(profile);
      await em.flush();

      return profile;
    } catch (e) {
      console.log('e :', e);
      return new ApiUserError(
        this.constructor.name,
        'failed to update profile.',
      );
    }
  }
}
