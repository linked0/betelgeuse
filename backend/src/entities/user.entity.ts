import {
  Collection,
  Entity,
  Index,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  Property,
  Unique,
} from '@mikro-orm/core';
import { Field, ObjectType } from 'type-graphql';
import BaseET from './base.entity';
import Asset from './asset.entity';
import AssetCollection from './assetCollection.entity';
import { Float } from 'type-graphql/dist/scalars/aliases';
import { Profile } from './profile.entity';

@ObjectType()
@Entity()
@Unique({ properties: ['userAddress'] })
export default class User extends BaseET {
  // ====== PROPERTIES ======//
  @Field()
  @Index({ type: 'fulltext' })
  @Property()
  userAddress!: string;

  @Field({ nullable: true })
  @Property({ nullable: true, hidden: true })
  nonce?: string;

  @Property({ nullable: true, hidden: true })
  apiKey?: string;

  @Property({ default: 0, hidden: true })
  usageCount!: number;

  @Property({ default: 1, hidden: true })
  mintCount!: number;

  // ====== RELATIONS ======//
  @Field(() => [AssetCollection])
  @OneToMany(
    () => AssetCollection,
    (assetCollection) => assetCollection.creator,
  )
  assetCollections? = new Collection<AssetCollection>(this);

  @Field(() => Asset)
  @OneToMany(() => Asset, (asset) => asset.creator)
  assetsCreated? = new Collection<Asset>(this);

  @Field(() => [Asset])
  @ManyToMany(() => Asset, 'markers', { owner: true })
  assetsFavorite = new Collection<Asset>(this);

  @Field(() => Profile, { nullable: true })
  @OneToOne(() => Profile, { nullable: true })
  profile?: Profile;
  // ====== METHODS ======//
  // ====== GETTERS ======//
  // ====== MUTATORS ======//
  // ====== CONSTRUCTORS ======//
  constructor(userAddress: string, nonce: string = '') {
    // call the constructor for BaseEntity
    super();

    // assign the properties
    this.userAddress = userAddress;
    this.nonce = nonce;
  }
}

@ObjectType()
@Entity()
export class Owner extends BaseET {
  // ====== PROPERTIES ======//

  @Field()
  @Property()
  amount: number;

  @Field({ nullable: true })
  @Property({ type: 'string', nullable: true })
  unitPrice?: string;

  // ====== RELATIONS ======//

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, { nullable: true })
  user: User;

  @Field(() => Asset)
  @ManyToOne(() => Asset)
  asset: Asset;

  // ====== RELATIONS ======//
  // ====== METHODS ======//
  // ====== GETTERS ======//
  // ====== MUTATORS ======//
  // ====== CONSTRUCTORS ======//
  constructor(user: User, asset: Asset, amount: number) {
    // call the constructor for BaseEntity
    super();

    // assign the properties
    this.user = user;
    this.asset = asset;
    this.amount = amount;
  }
}

@ObjectType()
@Entity()
export class FeeCollector extends BaseET {
  // ====== PROPERTIES ======//

  @Field()
  @Property()
  fee: number;

  // ====== RELATIONS ======//

  @Field(() => User)
  @ManyToOne(() => User)
  user: User;

  @Field(() => AssetCollection)
  @ManyToOne(() => AssetCollection)
  assetCollection: AssetCollection;

  // ====== RELATIONS ======//
  // ====== METHODS ======//
  // ====== GETTERS ======//
  // ====== MUTATORS ======//
  // ====== CONSTRUCTORS ======//
  constructor(user: User, assetCollection: AssetCollection, fee: number) {
    // call the constructor for BaseEntity
    super();

    // assign the properties
    this.user = user;
    this.assetCollection = assetCollection;
    this.fee = fee;
  }
}
