export type ClientSource = "app" | "web" | "unknown";

export type SignupAuthMethod =
  | "email"
  | "google"
  | "facebook"
  | "phone"
  | "apple"
  | "anonymous"
  | "unknown";

export interface KumbuUser {
  id: string;
  email: string | null;
  display_name: string | null;
  phone: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
  signup_source?: ClientSource | string | null;
  signup_auth_method?: SignupAuthMethod | string | null;
  last_active_source?: ClientSource | string | null;
  banned_at?: string | null;
  banned_until?: string | null;
  ban_reason?: string | null;
  banned_by?: string | null;
  deleted_at?: string | null;
  gender?: string | null;
  birth_date?: string | null;
  city?: string | null;
  region?: string | null;
  country?: string | null;
  cart: unknown;
  favorites: unknown;
  delivery_address: Record<string, unknown> | null;
}

export type OrderStatus = "delivered" | "shipping" | "processing" | "cancelled";

export interface KumbuOrder {
  id: string;
  user_id: string;
  seller_id?: string | null;
  created_at: string;
  items_count: number;
  total_label: string;
  status: OrderStatus;
  show_track: boolean;
}

export interface CatalogCategory {
  id: string;
  name: string;
  icon_key: string;
  accent_hex: string;
  sort_order: number;
  kind: "product" | "stay";
}

export interface CatalogSubcategory {
  category_id: string;
  id: string;
  label: string;
  sort_order: number;
}

export interface CatalogProduct {
  id: string;
  category_id: string;
  subcategory_id: string | null;
  title: string;
  rating?: number | null;
  price_label: string;
  old_price_label: string | null;
  discount_percent: number | null;
  delivery_text: string | null;
  image_color: number | null;
  is_featured: boolean;
  is_out_of_stock: boolean;
  sort_order: number;
  seller_id?: string | null;
  created_at?: string;
  deleted_at?: string | null;
}

export interface MarketingBlock {
  id: string;
  kind: "hero" | "offers";
  title: string;
  subtitle: string;
  gradient_from: string;
  gradient_to: string;
  sort_order: number;
}

export interface SupportSettings {
  id: string;
  welcome_message: string;
  quick_actions: string[];
  auto_reply_message: string;
}

export interface CategorySortFilter {
  id: string;
  label: string;
  sort_mode: "default" | "rating_desc" | "price_asc";
  sort_order: number;
}

export interface PaymentMethod {
  id: string;
  label: string;
  icon_key: string;
  sort_order: number;
  is_default: boolean;
}

export interface UserNotification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  icon_key: string;
  created_at: string;
  read_at: string | null;
  hidden_at?: string | null;
  broadcast_id?: string | null;
}

export interface AdminOverview {
  users_total: number;
  users_last_7d: number;
  orders_total: number;
  orders_last_7d: number;
  orders_processing: number;
  orders_shipping: number;
  orders_delivered: number;
  orders_cancelled: number;
  products_total: number;
  products_out_of_stock: number;
  categories_total: number;
  notifications_unread: number;
}

export interface AdminUserRow {
  user_id: string;
  email: string;
  role: "super_admin" | "admin" | "support";
  created_at: string;
}

export interface MarketplaceConversation {
  id: string;
  product_id: string | null;
  buyer_id: string;
  seller_id: string;
  created_at: string;
  updated_at: string;
  is_blocked: boolean;
  blocked_reason: string | null;
  blocked_at: string | null;
  messages?: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
  hidden_at: string | null;
}

export type ContentReportStatus = "pending" | "reviewing" | "resolved" | "dismissed";

export type ContentReportTargetType = "listing" | "user" | "conversation" | "message";

export interface ContentReport {
  id: string;
  reporter_id: string;
  target_type: ContentReportTargetType;
  target_id: string;
  reported_user_id: string | null;
  reason: string;
  details: string | null;
  status: ContentReportStatus;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  admin_notes: string | null;
}

export interface UserConsent {
  id: string;
  user_id: string;
  consent_type: string;
  accepted_at: string;
  user_agent: string | null;
}

export interface UserBlock {
  blocker_id: string;
  blocked_id: string;
  created_at: string;
}

export interface LegalSection {
  title: string;
  paragraphs: string[];
}

export interface LegalDocument {
  slug: string;
  title: string;
  intro: string | null;
  sections: LegalSection[];
  updated_at: string;
  updated_by: string | null;
}
