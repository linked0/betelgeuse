import {
  Arg,
  Authorized,
  Ctx,
  Int,
  Mutation,
  Query,
  Resolver,
} from 'type-graphql';
import ReqContext from '../interfaces/ReqContext';
import Asset from '../entities/asset.entity';
import { ServiceResponse } from '../interfaces/base.interface';
import { ApiUserError } from '../utils/BaseError';
import User from '../entities/user.entity';
import * as dotenv from 'dotenv';
import Order, { OfferType, OrderStatus } from '../entities/order.entity';
import Activity, { ActivityType } from '../entities/activity.entity';
import { ItemType } from '../constants';

dotenv.config();

const OrderServiceResponse = ServiceResponse(Order);

@Resolver()
export class OrderResolver {
  @Query(() => OrderServiceResponse)
  async GetOrder(
    @Arg('orderId') orderId: string,
    @Ctx() ctx: ReqContext,
  ): Promise<typeof OrderServiceResponse> {
    try {
      const { em } = ctx;

      const order: Order = await em.findOneOrFail(Order, {
        id: orderId,
      });
      return order;
    } catch (e) {
      return new ApiUserError(
        this.constructor.name,
        'failed to retrieve order.',
      );
    }
  }

  @Authorized()
  @Mutation(() => OrderServiceResponse)
  async createOrder(
    @Arg('assetId') assetId: string,
    @Arg('offerType', () => Int) offerType: OfferType,
    @Arg('orderHash') orderHash: string,
    @Arg('originalData') originalData: string,
    @Ctx() ctx: ReqContext,
  ): Promise<typeof OrderServiceResponse> {
    try {
      const { em, user } = ctx;

      // parse original data to json
      const { parameters: orderData } = JSON.parse(originalData);

      const offerer = await em.findOneOrFail(User, {
        userAddress: user.userAddress,
      });
      if (offerer.userAddress !== orderData.offerer) {
        return new ApiUserError(this.constructor.name, 'offerer not match');
      }

      // create offer items
      let amount = 0;
      let unitPrice = '';
      if (offerType === OfferType.LISTING) {
        const offers = orderData.offer;
        offers.map(async (offer) => {
          amount += parseInt(offer.startAmount, 10);
        });
        const considerations = orderData.consideration;
        considerations.map(async (consideration) => {
          unitPrice = (
            BigInt(unitPrice) + BigInt(consideration.startAmount)
          ).toString();
        });
      } else {
        const offers = orderData.offer;
        offers.map(async (offer) => {
          unitPrice = (
            BigInt(unitPrice) + BigInt(offer.startAmount)
          ).toString();
        });
        const considerations = orderData.consideration;
        considerations.map(async (consideration) => {
          if (consideration.itemType > ItemType.ERC20)
            amount += parseInt(consideration.startAmount, 10);
        });
      }

      const asset = await em.findOneOrFail(Asset, {
        id: assetId,
      });
      console.log('orderData :', orderData);
      const startTime = new Date(orderData.startTime * 1000);
      const endTime = new Date(orderData.endTime * 1000);
      const order = new Order(
        offerer,
        offerType,
        orderData.orderType,
        orderHash,
        originalData,
        OrderStatus.SALE,
        startTime,
        endTime,
        amount,
        unitPrice,
        0,
      );

      em.persist(order);

      const activity = new Activity(
        offerer,
        asset,
        offerType === OfferType.LISTING
          ? ActivityType.LIST
          : ActivityType.OFFER,
        amount,
      );
      activity.order = order;
      em.persist(activity);

      await em.flush();
      return order;
    } catch (e) {
      console.log('e :', e);
      return new ApiUserError(this.constructor.name, 'failed to create order.');
    }
  }
}
