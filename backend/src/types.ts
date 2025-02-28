import { OrderType } from './constants';
import { ItemType } from './constants';
import {
  BigNumber,
  BigNumberish,
  BytesLike,
  Contract,
  ContractTransaction,
  ethers,
  Overrides,
  PayableOverrides,
  PopulatedTransaction,
} from 'ethers';
import { registerEnumType } from 'type-graphql';
import { ActivityType } from './entities/activity.entity';

type TypedDataDomain = {
  name?: string;
  version?: string;
  chainId?: BigNumberish;
  verifyingContract?: string;
  salt?: BytesLike;
};

type TypedDataField = {
  name: string;
  type: string;
};

// Temporary until TypedDataSigner is added in ethers (in v6)
export type Signer = ethers.Signer & {
  _signTypedData(
    domain: TypedDataDomain,
    types: Record<string, Array<TypedDataField>>,
    value: Record<string, any>,
  ): Promise<string>;
};

export type OfferItem = {
  itemType: ItemType;
  token: string;
  identifierOrCriteria: string;
  startAmount: string;
  endAmount: string;
};

export type ConsiderationItem = {
  itemType: ItemType;
  token: string;
  identifierOrCriteria: string;
  startAmount: string;
  endAmount: string;
  recipient: string;
};

export type Item = OfferItem | ConsiderationItem;

export type OrderParameters = {
  offerer: string;
  zone: string;
  orderType: OrderType;
  startTime: BigNumberish;
  endTime: BigNumberish;
  zoneHash: string;
  salt: string;
  offer: OfferItem[];
  consideration: ConsiderationItem[];
  totalOriginalConsiderationItems: BigNumberish;
  conduitKey: string;
};

export type OrderComponents = OrderParameters & { counter: number };

export type Order = {
  parameters: OrderParameters;
  signature: string;
};

export type AdvancedOrder = Order & {
  numerator: BigNumber;
  denominator: BigNumber;
  extraData: string;
};

export type BasicErc721Item = {
  itemType: ItemType.ERC721;
  token: string;
  identifier: string;
};

export type Erc721ItemWithCriteria = {
  itemType: ItemType.ERC721;
  token: string;
  identifiers: string[];
  // Used for criteria based items i.e. offering to buy 5 NFTs for a collection
  amount?: string;
  endAmount?: string;
};

type Erc721Item = BasicErc721Item | Erc721ItemWithCriteria;

export type BasicErc1155Item = {
  itemType: ItemType.ERC1155;
  token: string;
  identifier: string;
  amount: string;
  endAmount?: string;
};

export type Erc1155ItemWithCriteria = {
  itemType: ItemType.ERC1155;
  token: string;
  identifiers: string[];
  amount: string;
  endAmount?: string;
};

type Erc1155Item = BasicErc1155Item | Erc1155ItemWithCriteria;

export type CurrencyItem = {
  token?: string;
  amount: string;
  endAmount?: string;
};

export type CreateInputItem = Erc721Item | Erc1155Item | CurrencyItem;

export type ConsiderationInputItem = CreateInputItem & { recipient?: string };

export type TipInputItem = CreateInputItem & { recipient: string };

export type Fee = {
  recipient: string;
  basisPoints: number;
};

export type CreateOrderInput = {
  conduitKey?: string;
  zone?: string;
  startTime?: string;
  endTime?: string;
  offer: readonly CreateInputItem[];
  consideration: readonly ConsiderationInputItem[];
  counter?: number;
  fees?: readonly Fee[];
  allowPartialFills?: boolean;
  restrictedByZone?: boolean;
  useProxy?: boolean;
  domain?: string;
  salt?: string;
};

export type InputCriteria = {
  identifier: string;
  proof: string[];
};

export type OrderStatus = {
  isValidated: boolean;
  isCancelled: boolean;
  totalFilled: BigNumber;
  totalSize: BigNumber;
};

export type OrderWithCounter = {
  parameters: OrderComponents;
  signature: string;
};

export enum MarketEventType {
  // Transactions and signature requests
  TransactionCreated = 'TransactionCreated',
  TransactionConfirmed = 'TransactionConfirmed',
  TransactionDenied = 'TransactionDenied',
  TransactionFailed = 'TransactionFailed',

  // Pre-transaction events
  InitializeAccount = 'InitializeAccount',
  WrapBOA = 'WrapBOA',
  UnwrapWBOA = 'UnwrapWBOA',
  ApproveCurrency = 'ApproveCurrency',
  ApproveAsset = 'ApproveAsset',
  ApproveAllAssets = 'ApproveAllAssets',
  UnapproveCurrency = 'UnapproveCurrency',

  // Basic actions: matching orders, creating orders, and cancelling orders
  MatchOrders = 'MatchOrders',
  CancelOrder = 'CancelOrder',
  BulkCancelExistingOrders = 'BulkCancelExistingOrders',
  ApproveOrder = 'ApproveOrder',
  CreateOrder = 'CreateOrder',
  // When the signature request for an order is denied
  OrderDenied = 'OrderDenied',

  // When transferring one or more assets
  TransferAll = 'TransferAll',
  TransferOne = 'TransferOne',

  // When wrapping or unwrapping NFTs
  WrapAssets = 'WrapAssets',
  UnwrapAssets = 'UnwrapAssets',
  LiquidateAssets = 'LiquidateAssets',
  PurchaseAssets = 'PurchaseAssets',
}

registerEnumType(MarketEventType, {
  name: 'MarketEventType', // this one is mandatory
});

export interface EventData {
  fromAddress?: string;
  toAddress?: string;
  proxyAddress?: string;
  amount?: number;
  contractAddress?: string;
  assetId?: string;
  orderId?: string;
  transactionHash?: string;
  eventType?: MarketEventType;
  error?: string;
}

export interface Metadata {
  name: string;
  description: string;
  image: string;
  attributes?: any;
}

export interface FeeCollectorData {
  address: string;
  fee: number;
  state?: string; // C:create, U:update, D:delete
}
