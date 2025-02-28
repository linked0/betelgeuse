import { Migration } from '@mikro-orm/migrations';

export class Migration20250203082237 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "asset_contract" ("id" uuid not null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "item_type" smallint not null, "meta_type" smallint not null, "contract_address" varchar(255) not null, "name" varchar(255) not null, "description" varchar(3000) not null, "image_url" varchar(255) not null default \'\', "metadatal_url" varchar(255) null default \'\', "symbol" varchar(255) null default \'\', constraint "asset_contract_pkey" primary key ("id"));');
    this.addSql('alter table "asset_contract" add constraint "asset_contract_contract_address_unique" unique ("contract_address");');

    this.addSql('create table "message" ("id" uuid not null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "from" varchar(255) not null, "content" varchar(255) not null, constraint "message_pkey" primary key ("id"));');

    this.addSql('create table "profile" ("id" uuid not null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "image" varchar(255) null, "name" varchar(255) null default \'unknown\', "bio" varchar(3000) null, "twitter" varchar(255) null, "youtube" varchar(255) null, "instagram" varchar(255) null, "homepage" varchar(255) null, constraint "profile_pkey" primary key ("id"));');
    this.addSql('create index "profile_name_index" on "public"."profile" using gin(to_tsvector(\'simple\', "name"));');

    this.addSql('create table "user" ("id" uuid not null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "user_address" varchar(255) not null, "nonce" varchar(255) null default \'\', "api_key" varchar(255) null, "usage_count" int not null default 0, "mint_count" int not null default 1, "profile_id" uuid null, constraint "user_pkey" primary key ("id"));');
    this.addSql('alter table "user" add constraint "user_profile_id_unique" unique ("profile_id");');
    this.addSql('create index "user_user_address_index" on "public"."user" using gin(to_tsvector(\'simple\', "user_address"));');
    this.addSql('alter table "user" add constraint "user_user_address_unique" unique ("user_address");');

    this.addSql('create table "order" ("id" uuid not null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "offer_type" smallint not null, "order_type" smallint not null, "status" smallint not null, "start_time" timestamptz(0) not null, "end_time" timestamptz(0) not null, "amount" int not null, "sold" int not null, "offerer_id" uuid not null, "original_data" varchar(5000) not null, "order_hash" varchar(255) not null, "unit_price" varchar(255) not null, constraint "order_pkey" primary key ("id"));');

    this.addSql('create table "order_item" ("id" uuid not null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "order_item_type" smallint not null, "identifier_or_criteria" varchar(255) not null, "start_amount" varchar(255) not null, "end_amount" varchar(255) not null, "recipient" varchar(255) null, "order_id" uuid not null, "asset_contract_id" uuid not null, constraint "order_item_pkey" primary key ("id"));');

    this.addSql('create table "market_event" ("id" uuid not null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "user_address" varchar(255) null, "to_address" varchar(255) null, "proxy_address" varchar(255) null, "amount" varchar(255) null, "contract_address" varchar(255) null, "order_id" uuid null, "transaction_hash" varchar(255) null, "event_type" int null, "error" varchar(255) null, constraint "market_event_pkey" primary key ("id"));');

    this.addSql('create table "asset_collection" ("id" uuid not null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "name" varchar(255) not null, "url" varchar(255) null, "description" varchar(3000) not null, "logo_url" varchar(255) null default \'\', "feature_url" varchar(255) null, "banner_url" varchar(255) null, "web_link" varchar(255) null, "medium_link" varchar(255) null, "telegram_link" varchar(255) null, "category_type" smallint not null, "creator_id" uuid not null, constraint "asset_collection_pkey" primary key ("id"));');
    this.addSql('create index "asset_collection_name_index" on "public"."asset_collection" using gin(to_tsvector(\'simple\', "name"));');
    this.addSql('alter table "asset_collection" add constraint "asset_collection_name_unique" unique ("name");');

    this.addSql('create table "fee_collector" ("id" uuid not null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "fee" int not null, "user_id" uuid not null, "asset_collection_id" uuid not null, constraint "fee_collector_pkey" primary key ("id"));');

    this.addSql('create table "asset" ("id" uuid not null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "asset_contract_address" varchar(255) not null default \'0x00\', "token_id" varchar(255) not null, "name" varchar(255) not null, "description" varchar(3000) not null, "original_url" varchar(255) not null, "thumbnail_url" varchar(255) not null, "preview_url" varchar(255) not null, "external_link" varchar(255) null, "attribute" varchar(5000) null, "metadata_link" varchar(255) null default \'\', "background_color" varchar(255) null default \'\', "total_supply" int not null, "view_count" int not null default 0, "asset_contract_id" uuid null, "asset_collection_id" uuid null, "creator_id" uuid not null, constraint "asset_pkey" primary key ("id"));');
    this.addSql('create index "asset_name_index" on "public"."asset" using gin(to_tsvector(\'simple\', "name"));');
    this.addSql('create index "asset_token_id_name_index" on "asset" ("token_id", "name");');
    this.addSql('alter table "asset" add constraint "asset_asset_contract_address_token_id_unique" unique ("asset_contract_address", "token_id");');

    this.addSql('create table "owner" ("id" uuid not null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "amount" int not null, "unit_price" varchar(255) null, "user_id" uuid null, "asset_id" uuid not null, constraint "owner_pkey" primary key ("id"));');

    this.addSql('create table "activity" ("id" uuid not null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "activity_type" smallint not null, "from_id" uuid not null, "amount" int not null, "asset_id" uuid not null, "to_id" uuid null, "tx_hash" varchar(255) null, "order_id" uuid null, constraint "activity_pkey" primary key ("id"));');

    this.addSql('create table "user_assets_favorite" ("user_id" uuid not null, "asset_id" uuid not null, constraint "user_assets_favorite_pkey" primary key ("user_id", "asset_id"));');

    this.addSql('alter table "user" add constraint "user_profile_id_foreign" foreign key ("profile_id") references "profile" ("id") on update cascade on delete set null;');

    this.addSql('alter table "order" add constraint "order_offerer_id_foreign" foreign key ("offerer_id") references "user" ("id") on update cascade;');

    this.addSql('alter table "order_item" add constraint "order_item_order_id_foreign" foreign key ("order_id") references "order" ("id") on update cascade;');
    this.addSql('alter table "order_item" add constraint "order_item_asset_contract_id_foreign" foreign key ("asset_contract_id") references "asset_contract" ("id") on update cascade;');

    this.addSql('alter table "market_event" add constraint "market_event_order_id_foreign" foreign key ("order_id") references "order" ("id") on update cascade on delete set null;');

    this.addSql('alter table "asset_collection" add constraint "asset_collection_creator_id_foreign" foreign key ("creator_id") references "user" ("id") on update cascade;');

    this.addSql('alter table "fee_collector" add constraint "fee_collector_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;');
    this.addSql('alter table "fee_collector" add constraint "fee_collector_asset_collection_id_foreign" foreign key ("asset_collection_id") references "asset_collection" ("id") on update cascade;');

    this.addSql('alter table "asset" add constraint "asset_asset_contract_id_foreign" foreign key ("asset_contract_id") references "asset_contract" ("id") on update cascade on delete set null;');
    this.addSql('alter table "asset" add constraint "asset_asset_collection_id_foreign" foreign key ("asset_collection_id") references "asset_collection" ("id") on update cascade on delete set null;');
    this.addSql('alter table "asset" add constraint "asset_creator_id_foreign" foreign key ("creator_id") references "user" ("id") on update cascade;');

    this.addSql('alter table "owner" add constraint "owner_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade on delete set null;');
    this.addSql('alter table "owner" add constraint "owner_asset_id_foreign" foreign key ("asset_id") references "asset" ("id") on update cascade;');

    this.addSql('alter table "activity" add constraint "activity_from_id_foreign" foreign key ("from_id") references "user" ("id") on update cascade;');
    this.addSql('alter table "activity" add constraint "activity_asset_id_foreign" foreign key ("asset_id") references "asset" ("id") on update cascade;');
    this.addSql('alter table "activity" add constraint "activity_to_id_foreign" foreign key ("to_id") references "user" ("id") on update cascade on delete set null;');
    this.addSql('alter table "activity" add constraint "activity_order_id_foreign" foreign key ("order_id") references "order" ("id") on update cascade on delete set null;');

    this.addSql('alter table "user_assets_favorite" add constraint "user_assets_favorite_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade on delete cascade;');
    this.addSql('alter table "user_assets_favorite" add constraint "user_assets_favorite_asset_id_foreign" foreign key ("asset_id") references "asset" ("id") on update cascade on delete cascade;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "order_item" drop constraint "order_item_asset_contract_id_foreign";');

    this.addSql('alter table "asset" drop constraint "asset_asset_contract_id_foreign";');

    this.addSql('alter table "user" drop constraint "user_profile_id_foreign";');

    this.addSql('alter table "order" drop constraint "order_offerer_id_foreign";');

    this.addSql('alter table "asset_collection" drop constraint "asset_collection_creator_id_foreign";');

    this.addSql('alter table "fee_collector" drop constraint "fee_collector_user_id_foreign";');

    this.addSql('alter table "asset" drop constraint "asset_creator_id_foreign";');

    this.addSql('alter table "owner" drop constraint "owner_user_id_foreign";');

    this.addSql('alter table "activity" drop constraint "activity_from_id_foreign";');

    this.addSql('alter table "activity" drop constraint "activity_to_id_foreign";');

    this.addSql('alter table "user_assets_favorite" drop constraint "user_assets_favorite_user_id_foreign";');

    this.addSql('alter table "order_item" drop constraint "order_item_order_id_foreign";');

    this.addSql('alter table "market_event" drop constraint "market_event_order_id_foreign";');

    this.addSql('alter table "activity" drop constraint "activity_order_id_foreign";');

    this.addSql('alter table "fee_collector" drop constraint "fee_collector_asset_collection_id_foreign";');

    this.addSql('alter table "asset" drop constraint "asset_asset_collection_id_foreign";');

    this.addSql('alter table "owner" drop constraint "owner_asset_id_foreign";');

    this.addSql('alter table "activity" drop constraint "activity_asset_id_foreign";');

    this.addSql('alter table "user_assets_favorite" drop constraint "user_assets_favorite_asset_id_foreign";');

    this.addSql('drop table if exists "asset_contract" cascade;');

    this.addSql('drop table if exists "message" cascade;');

    this.addSql('drop table if exists "profile" cascade;');

    this.addSql('drop table if exists "user" cascade;');

    this.addSql('drop table if exists "order" cascade;');

    this.addSql('drop table if exists "order_item" cascade;');

    this.addSql('drop table if exists "market_event" cascade;');

    this.addSql('drop table if exists "asset_collection" cascade;');

    this.addSql('drop table if exists "fee_collector" cascade;');

    this.addSql('drop table if exists "asset" cascade;');

    this.addSql('drop table if exists "owner" cascade;');

    this.addSql('drop table if exists "activity" cascade;');

    this.addSql('drop table if exists "user_assets_favorite" cascade;');
  }

}
