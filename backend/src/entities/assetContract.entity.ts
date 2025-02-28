import {
  Collection,
  Entity,
  Enum,
  Index,
  OneToMany,
  Property,
  Unique,
} from '@mikro-orm/core';
import { Field, Int, ObjectType, registerEnumType } from 'type-graphql';
import BaseET from './base.entity';
import Asset from './asset.entity';
import { OrderItemType } from './order.entity';
import { ItemType } from '../constants';

export enum MetaType {
  CENTRALIZED,
  DECENTRALIZED,
}

registerEnumType(MetaType, {
  name: 'MetaType', // this one is mandatory
});

@ObjectType()
@Entity()
@Unique({ properties: ['contractAddress'] })
export default class AssetContract extends BaseET {
  // ====== PROPERTIES ======//

  @Field(() => ItemType)
  @Enum(() => ItemType)
  itemType: ItemType;

  @Field(() => MetaType)
  @Enum(() => MetaType)
  metaType: MetaType;

  @Field()
  @Property()
  contractAddress!: string;

  @Property()
  name!: string;

  @Field()
  @Property({ length: 3000 })
  description!: string;

  @Field()
  @Property()
  imageUrl?: string;

  @Field({ nullable: true })
  @Property({ type: 'string', nullable: true })
  metadatalUrl?: string;

  @Field({ nullable: true })
  @Property({ type: 'string', nullable: true })
  symbol?: string;

  // ====== RELATIONS ======//
  @Field(() => Asset)
  @OneToMany(() => Asset, (asset) => asset.assetContract)
  assets? = new Collection<Asset>(this);
  // ====== METHODS ======//
  // ====== GETTERS ======//
  // ====== MUTATORS ======//
  // ====== CONSTRUCTORS ======//
  constructor(
    itemType,
    metaType,
    contractAddress,
    name,
    description,
    symbol = '',
    imageUrl = '',
    metadatalUrl = '',
  ) {
    // call the constructor for BaseEntity
    super();

    // assign the properties
    this.itemType = itemType;
    this.metaType = metaType;
    this.contractAddress = contractAddress;
    this.name = name;
    this.description = description;
    this.imageUrl = imageUrl;
    this.metadatalUrl = metadatalUrl;
    this.symbol = symbol;
  }
}
