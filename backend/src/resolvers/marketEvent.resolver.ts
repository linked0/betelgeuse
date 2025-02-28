import { Resolver, Mutation, Ctx, Arg, Authorized } from 'type-graphql';
import ReqContext from '../interfaces/ReqContext';
import Asset from '../entities/asset.entity';
import { ServiceResponse } from '../interfaces/base.interface';
import { ethers } from 'ethers';
import { ApiUserError } from '../utils/BaseError';
import User, { Owner } from '../entities/user.entity';
import * as dotenv from 'dotenv';
import Activity, { ActivityType } from '../entities/activity.entity';
import MarketEvent from '../entities/marketEvent.entity';
import { EventData, MarketEventType } from '../types';
import Order, { OfferType, OrderStatus } from '../entities/order.entity';
import { wrap } from '@mikro-orm/core';

dotenv.config();

const MarketEventServiceResponse = ServiceResponse(MarketEvent);

@Resolver()
export class MarketEventResolver {
  @Authorized()
  @Mutation(() => MarketEventServiceResponse)
  async createEvent(
    @Arg('eventData') eventData: string,
    @Ctx() ctx: ReqContext,
  ): Promise<typeof MarketEventServiceResponse> {
    try {
      const { em, user } = ctx;
      const event: EventData = JSON.parse(eventData);
      console.log('event :', event);
      // if (user.userAddress !== event.fromAddress) {
      //   return new ApiUserError(this.constructor.name, 'userAddress not match');
      // }

      if (
        (event.eventType === MarketEventType.CancelOrder ||
          event.eventType === MarketEventType.MatchOrders) &&
        !event.orderId
      ) {
        return new ApiUserError(this.constructor.name, 'invalid orderId');
      }

      // 이동할 NFT 자산을 기준으로 from, to 를 구분한다.
      const from = await em.findOneOrFail(User, {
        userAddress: event.fromAddress,
      });
      if (event && event.orderId && event.assetId) {
        const asset = await em.findOneOrFail(
          Asset,
          {
            id: event.assetId,
          },
          { populate: ['owners'] },
        );
        const order = await em.findOneOrFail(Order, {
          id: event.orderId,
        });

        if (event.eventType === MarketEventType.MatchOrders) {
          if (!event.amount || !event.fromAddress || !event.toAddress) {
            return new ApiUserError(
              this.constructor.name,
              'MatchOrders must have fromAddress, toAddress and amount',
            );
          }
          const to = await em.findOneOrFail(User, {
            userAddress: event.toAddress,
          });
          const activity = new Activity(
            from,
            asset,
            ActivityType.SELL,
            event.amount,
          );
          activity.order = order;
          activity.to = to;
          activity.txHash = event.transactionHash;

          // update order
          wrap(order).assign({ sold: order.sold + event.amount });
          if (order.amount === order.sold)
            if (order.offerType === OfferType.LISTING) {
              wrap(order).assign({ status: OrderStatus.SOLD });
            } else {
              wrap(order).assign({ status: OrderStatus.ACCEPTED });
            }

          // update owner
          const fromOwner = await em.findOneOrFail(Owner, {
            asset,
            user: from,
          });
          const left = fromOwner.amount - event.amount;
          if (left > 0) {
            wrap(fromOwner).assign({ amount: left });
          } else {
            em.remove(fromOwner);
          }
          const toOwner = await em.findOne(Owner, {
            asset,
            user: to,
          });
          if (toOwner) {
            wrap(toOwner).assign({
              amount: toOwner.amount + event.amount,
              unitPrice: order.unitPrice,
            });
          } else {
            const owner = new Owner(to, asset, event.amount);
            em.persist(owner);
          }
          em.persist(activity);
        } else if (event.eventType === MarketEventType.CancelOrder) {
          const activity = new Activity(from, asset, ActivityType.CANCEL, 0);
          wrap(order).assign({ status: OrderStatus.CANCELED });
          activity.order = order;
          activity.txHash = event.transactionHash;
          em.persist(activity);
        }
      }
      const marketEvent = new MarketEvent();
      em.persist(marketEvent);
      await em.flush();
      return marketEvent;
    } catch (e) {
      console.log('e :', e);
      return new ApiUserError(
        this.constructor.name,
        'failed to create marketEvent.',
      );
    }
  }
}
