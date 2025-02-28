import { Entity, Property } from '@mikro-orm/core';
import { Field, ObjectType } from 'type-graphql';
import BaseET from './base.entity';

@ObjectType()
@Entity()
export default class Message extends BaseET {
  // ====== PROPERTIES ======//
  @Field()
  @Property()
  from!: string;

  @Field()
  @Property()
  content!: string;
  // ====== RELATIONS ======//
  // ====== METHODS ======//
  // ====== GETTERS ======//
  // ====== MUTATORS ======//
  // ====== CONSTRUCTORS ======//
  constructor(from: string, content: string) {
    // call the constructor for BaseEntity
    super();

    // assign the properties
    this.from = from;
    this.content = content;
  }
}
