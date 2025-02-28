import {
  Collection,
  Entity,
  Index,
  ManyToMany,
  ManyToOne,
  OneToMany,
  Property,
  Unique,
} from '@mikro-orm/core';
import { Field, ObjectType } from 'type-graphql';
import BaseET from './base.entity';
import AssetContract from './assetContract.entity';
import AssetCollection from './assetCollection.entity';
import User, { Owner } from './user.entity';
import Order, { OrderItem } from './order.entity';
import { Float } from 'type-graphql/dist/scalars/aliases';
import MarketEvent from './marketEvent.entity';
import Activity from './activity.entity';
import { FullTextType } from '@mikro-orm/postgresql';

@ObjectType()
@Entity()
@Unique({ properties: ['assetContractAddress', 'tokenId'] })
@Index({ properties: ['tokenId', 'name'] })
export default class Asset extends BaseET {
  // ====== PROPERTIES ======//

  @Field()
  @Property({ default: '0x00' })
  assetContractAddress!: string;

  @Field()
  @Property()
  tokenId!: string;

  @Field()
  @Index({ type: 'fulltext' })
  @Property()
  name!: string;

  @Field()
  @Property({ length: 3000 })
  description!: string;

  @Field()
  @Property()
  originalUrl: string;

  @Field()
  @Property()
  thumbnailUrl: string;

  @Field()
  @Property()
  previewUrl: string;

  @Field({ nullable: true })
  @Property({ type: 'string', nullable: true })
  externalLink?: string;

  @Field({ nullable: true })
  @Property({ type: 'string', nullable: true, length: 5000 })
  attribute?: string;

  @Field({ nullable: true })
  @Property({ type: 'string', nullable: true })
  metadataLink: string;

  @Field({ nullable: true })
  @Property({ type: 'string', nullable: true })
  backgroundColor: string;

  @Field()
  @Property()
  totalSupply: number;

  @Field(() => Float)
  @Property({ default: 0 })
  viewCount!: number;

  @Field(() => [Activity])
  @OneToMany(() => Activity, (activity) => activity.asset)
  activities? = new Collection<Activity>(this);

  // ====== RELATIONS ======//
  @Field(() => AssetContract, { nullable: true })
  @ManyToOne(() => AssetContract, { nullable: true })
  assetContract?: AssetContract;

  @Field(() => AssetCollection, { nullable: true })
  @ManyToOne(() => AssetCollection, { nullable: true })
  assetCollection?: AssetCollection;

  @Field(() => User)
  @ManyToOne(() => User)
  creator: User;

  @Field(() => [Owner], { nullable: true })
  @OneToMany(() => Owner, (owner) => owner.asset, { nullable: true })
  owners? = new Collection<Owner>(this);

  @Field(() => User, { nullable: true })
  @ManyToMany(() => User, (user) => user.assetsFavorite, { nullable: true })
  markers = new Collection<User>(this);

  // ====== METHODS ======//
  // ====== GETTERS ======//
  // ====== MUTATORS ======//
  // ====== CONSTRUCTORS ======//
  constructor(
    creator,
    assetContractAddress,
    tokenId,
    totalSupply,
    name,
    description,
    originalUrl,
    thumbnailUrl,
    previewUrl,
    metadataLink = '',
    backgroundColor = '',
  ) {
    // call the constructor for BaseEntity
    super();

    // assign the properties
    this.creator = creator;
    this.assetContractAddress = assetContractAddress;
    this.tokenId = tokenId;
    this.totalSupply = totalSupply;
    this.name = name;
    this.description = description;
    this.originalUrl = originalUrl;
    this.thumbnailUrl = thumbnailUrl;
    this.previewUrl = previewUrl;
    this.metadataLink = metadataLink;
    this.backgroundColor = backgroundColor;
  }
}
