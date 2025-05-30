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
import { Field, Int, ObjectType, registerEnumType } from 'type-graphql';
import BaseET from './base.entity';
import Asset from './asset.entity';
import User, { FeeCollector, Owner } from './user.entity';

export enum CategoryType {
  ART,
  GAME,
  MUSIC,
  PHOTOGRAPHY,
  DOMAIN,
  MEMBERSHIP,
  VIRTUAL_WORLD,
  SPORTS,
  NO_CATEGORY,
}

registerEnumType(CategoryType, {
  name: 'CategoryType', // this one is mandatory
});

@ObjectType()
@Entity()
@Unique({ properties: ['name'] })
export default class AssetCollection extends BaseET {
  // ====== PROPERTIES ======//

  @Field()
  @Index({ type: 'fulltext' })
  @Property()
  name!: string;

  @Field({ nullable: true })
  @Property({ type: 'string', nullable: true })
  url?: string;

  @Field()
  @Property({ length: 3000 })
  description!: string;

  @Field({ nullable: true })
  @Property({ type: 'string', nullable: true })
  logoUrl?: string;

  @Field({ nullable: true })
  @Property({ type: 'string', nullable: true })
  featureUrl?: string;

  @Field({ nullable: true })
  @Property({ type: 'string', nullable: true })
  bannerUrl?: string;

  @Field({ nullable: true })
  @Property({ type: 'string', nullable: true })
  webLink?: string;

  @Field({ nullable: true })
  @Property({ type: 'string', nullable: true })
  mediumLink?: string;

  @Field({ nullable: true })
  @Property({ type: 'string', nullable: true })
  telegramLink?: string;

  @Field(() => CategoryType)
  @Enum(() => CategoryType)
  categoryType!: CategoryType;

  // ====== RELATIONS ======//
  @Field(() => User)
  @ManyToOne(() => User)
  creator!: User;

  @Field(() => [Asset], { nullable: true })
  @OneToMany(() => Asset, (asset) => asset.assetCollection, { nullable: true })
  assets? = new Collection<Asset>(this);

  @Field(() => [FeeCollector], { nullable: true })
  @OneToMany(
    () => FeeCollector,
    (feeCollector) => feeCollector.assetCollection,
    {
      nullable: true,
    },
  )
  feeCollectors? = new Collection<FeeCollector>(this);

  // ====== METHODS ======//
  // ====== GETTERS ======//
  // ====== MUTATORS ======//
  // ====== CONSTRUCTORS ======//
  constructor(name, description, categoryType, logoUrl = '') {
    // call the constructor for BaseEntity
    super();

    // assign the properties
    this.name = name;
    this.description = description;
    this.categoryType = categoryType;
    this.logoUrl = logoUrl;
  }
}
