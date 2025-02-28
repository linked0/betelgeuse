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
import { MarketEventType } from '../types';
import Order, { OfferType } from './order.entity';

@ObjectType()
@Entity()
export default class MarketEvent extends BaseET {
  // ====== PROPERTIES ======//

  @Field({ nullable: true })
  @Property({ nullable: true })
  userAddress?: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  toAddress?: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  proxyAddress?: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  amount?: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  contractAddress?: string;

  @Field(() => Order, { nullable: true })
  @ManyToOne(() => Order, { nullable: true })
  order?: Order;

  @Field({ nullable: true })
  @Property({ nullable: true })
  transactionHash?: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  eventType?: number;

  @Field({ nullable: true })
  @Property({ nullable: true })
  error?: string;

  // ====== METHODS ======//
  // ====== GETTERS ======//
  // ====== MUTATORS ======//
  // ====== CONSTRUCTORS ======//
  constructor() {
    // call the constructor for BaseEntity
    super();
  }
}
