import {
  Collection,
  Entity,
  Enum,
  Index,
  ManyToMany,
  ManyToOne,
  OneToMany,
  Property,
  Unique,
} from '@mikro-orm/core';
import { Field, ObjectType } from 'type-graphql';
import Asset from './asset.entity';
import BaseET from './base.entity';
import User from './user.entity';
import { registerEnumType } from 'type-graphql';
import Order from './order.entity';

export enum ActivityType {
  MINTED,
  LIST,
  OFFER,
  CANCEL,
  SELL,
  TRANSFER,
}

registerEnumType(ActivityType, {
  name: 'ActivityType', // this one is mandatory
});

@ObjectType()
@Entity()
export default class Activity extends BaseET {
  // ====== PROPERTIES ======//

  @Field(() => ActivityType)
  @Enum(() => ActivityType)
  activityType: ActivityType;

  @Field(() => User)
  @ManyToOne(() => User)
  from: User;

  @Field()
  @Property()
  amount: number;

  @Field(() => Asset)
  @ManyToOne(() => Asset)
  asset: Asset;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, { nullable: true })
  to?: User;

  @Field({ nullable: true })
  @Property({ nullable: true })
  txHash?: string;

  @Field(() => Order, { nullable: true })
  @ManyToOne(() => Order, { nullable: true })
  order?: Order;

  // ====== METHODS ======//
  // ====== GETTERS ======//
  // ====== MUTATORS ======//
  // ====== CONSTRUCTORS ======//
  constructor(
    from: User,
    asset: Asset,
    activityType: ActivityType,
    amount: number,
  ) {
    // call the constructor for BaseEntity
    super();

    // assign the properties
    this.from = from;
    this.asset = asset;
    this.activityType = activityType;
    this.amount = amount;
  }
}
