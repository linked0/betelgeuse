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
import User from './user.entity';

@ObjectType()
@Entity()
export class Profile extends BaseET {
  // ====== PROPERTIES ======//

  @Field({ nullable: true })
  @Property({ type: 'string', nullable: true })
  image?: string;

  @Field({ nullable: true })
  @Index({ type: 'fulltext' })
  @Property({ type: 'string', nullable: true })
  name?: string;

  @Field({ nullable: true })
  @Property({ length: 3000, nullable: true })
  bio?: string;

  @Field({ nullable: true })
  @Property({ type: 'string', nullable: true })
  twitter?: string;

  @Field({ nullable: true })
  @Property({ type: 'string', nullable: true })
  youtube?: string;

  @Field({ nullable: true })
  @Property({ type: 'string', nullable: true })
  instagram?: string;

  @Field({ nullable: true })
  @Property({ type: 'string', nullable: true })
  homepage?: string;

  // ====== RELATIONS ======//

  @Field(() => User)
  @OneToOne(() => User, (user) => user.profile, {
    nullable: true,
  })
  user?: User;

  // ====== RELATIONS ======//
  // ====== METHODS ======//
  // ====== GETTERS ======//
  // ====== MUTATORS ======//
  // ====== CONSTRUCTORS ======//
  constructor(user: User) {
    // call the constructor for BaseEntity
    super();

    // assign the properties
    this.user = user;
    this.name = 'unknown';
  }
}
