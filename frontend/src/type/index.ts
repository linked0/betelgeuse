export enum ActivityType {
  MINTED = "MINTED",
  LIST = "LIST",
  OFFER = "OFFER",
  CANCEL = "CANCEL",
  SELL = "SELL",
  TRANSFER = "TRANSFER",
}

export enum MarketEventType {
  CANCEL_ORDER = "CancelOrder",
  MATCH_ORDER = "MatchOrders",
}

export enum OrderStatus {
  SALE = "SALE",
  CANCELED = "CANCELED",
  EXPIRED = "EXPIRED",
  SOLD = "SOLD",
  ACCEPTED = "ACCEPTED",
}

export const CategoryType = {
  ART: { name: "Art", value: 0 },
  GAME: { name: "Game", value: 1 },
  MUSIC: { name: "Music", value: 2 },
  PHOTOGRAPHY: { name: "Photography", value: 3 },
  DOMAIN: { name: "Domain", value: 4 },
  MEMBERSHIP: { name: "Membership", value: 5 },
  VIRTUAL_WORLD: { name: "Virtual worlds", value: 6 },
  SPORTS: { name: "Sports", value: 7 },
  NO_CATEGORY: { name: "No category", value: 8 },
};
