import {
  Collection,
  Entity,
  Enum,
  ManyToOne,
  OneToMany,
  Property,
} from '@mikro-orm/core';
import { Arg, Field, ObjectType } from 'type-graphql';
import Asset from './asset.entity';
import BaseET from './base.entity';
import User from './user.entity';
import { registerEnumType } from 'type-graphql';
import AssetContract from './assetContract.entity';
import { OrderType } from '../constants';

export enum OfferType {
  LISTING,
  OFFERING,
}

export enum OrderStatus {
  SALE,
  CANCELED,
  EXPIRED,
  SOLD,
  ACCEPTED,
}

export enum OrderItemType {
  OFFER,
  CONSIDERATION,
}

registerEnumType(OfferType, {
  name: 'OfferType', // this one is mandatory
});

registerEnumType(OrderItemType, {
  name: 'OrderItemType', // this one is mandatory
});

registerEnumType(OrderStatus, {
  name: 'OrderStatus', // this one is mandatory
});

@ObjectType()
@Entity()
export default class Order extends BaseET {
  // ====== PROPERTIES ======//

  @Field(() => OfferType)
  @Enum(() => OfferType)
  offerType: OfferType;

  @Field(() => OrderType)
  @Enum(() => OrderType)
  orderType: OrderType;

  @Field(() => OrderStatus)
  @Enum(() => OrderStatus)
  status: OrderStatus;

  @Field(() => Date)
  @Property()
  startTime: Date;

  @Field(() => Date)
  @Property()
  endTime: Date;

  @Field()
  @Property()
  amount: number;

  @Field()
  @Property()
  sold: number;

  @Field(() => User)
  @ManyToOne(() => User)
  offerer: User;

  @Field()
  @Property({ length: 5000 })
  originalData!: string;

  @Field()
  @Property()
  orderHash: string;

  @Field()
  @Property()
  unitPrice: string;

  // ====== METHODS ======//
  // ====== GETTERS ======//
  // ====== MUTATORS ======//
  // ====== CONSTRUCTORS ======//
  constructor(
    offerer: User,
    offerType: OfferType,
    orderType: OrderType,
    orderHash: string,
    originalData,
    status,
    startTime,
    endTime,
    amount,
    unitPrice,
    sold,
  ) {
    // call the constructor for BaseEntity
    super();

    // assign the properties
    this.offerer = offerer;
    this.offerType = offerType;
    this.orderType = orderType;
    this.orderHash = orderHash;
    this.originalData = originalData;
    this.status = status;
    this.startTime = startTime;
    this.endTime = endTime;
    this.amount = amount;
    this.unitPrice = unitPrice;
    this.sold = sold;
  }
}

@ObjectType()
@Entity()
export class OrderItem extends BaseET {
  // ====== PROPERTIES ======//

  @Field(() => OrderItemType)
  @Enum(() => OrderItemType)
  orderItemType: OrderItemType;

  @Field()
  @Property()
  identifierOrCriteria: string;

  @Field()
  @Property()
  startAmount: string;

  @Field()
  @Property()
  endAmount: string;

  @Field({ nullable: true })
  @Property({ type: 'string', nullable: true })
  recipient?: string;

  @Field(() => Order)
  @ManyToOne(() => Order)
  order: Order;

  @Field(() => AssetContract)
  @ManyToOne(() => AssetContract)
  assetContract: AssetContract;

  // ====== METHODS ======//
  // ====== GETTERS ======//
  // ====== MUTATORS ======//
  constructor(
    order: Order,
    assetContract: AssetContract,
    orderItemType: OrderItemType,
    identifierOrCriteria,
    startAmount,
    endAmount,
  ) {
    // call the constructor for BaseEntity
    super();

    this.order = order;
    this.assetContract = assetContract;
    this.orderItemType = orderItemType;
    this.identifierOrCriteria = identifierOrCriteria;
    this.startAmount = startAmount;
    this.endAmount = endAmount;
  }
}
