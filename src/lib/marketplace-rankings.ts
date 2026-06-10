export type RankedProduct = {
  id?: string;
  title?: string;
  price_label?: string;
  view_count?: number;
  review_count?: number;
  rating?: number | null;
  seller_id?: string;
  product_id?: string;
  units_sold?: number;
  deal_count?: number;
};

export type RankedSeller = {
  seller_id?: string;
  user_id?: string;
  listing_count?: number;
  orders_count?: number;
};

export type MarketplaceRankings = {
  topViewed: RankedProduct[];
  topListedSellers: RankedSeller[];
  topSoldProducts: RankedProduct[];
  topPurchasedDeals: RankedProduct[];
  topSellersByOrders: RankedSeller[];
  topBuyers: RankedSeller[];
};
