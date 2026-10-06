// ==============================================================================
// eFootballMarket Database Types
// Production Schema Definitions
// ==============================================================================

export type UserRole =
  | 'guest'
  | 'buyer'
  | 'seller'
  | 'verified_seller'
  | 'moderator'
  | 'support'
  | 'admin'
  | 'super_admin';

export type VerificationStatus =
  | 'pending'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'resubmission_required';

export type Platform =
  | 'android'
  | 'ios'
  | 'pc_steam'
  | 'playstation_4'
  | 'playstation_5'
  | 'xbox_one'
  | 'xbox_series_x';

export type Playstyle =
  | 'possession'
  | 'quick_counter'
  | 'long_ball_counter'
  | 'out_wide'
  | 'long_ball';

export type ListingStatus =
  | 'draft'
  | 'pending_review'
  | 'published'
  | 'in_escrow'
  | 'sold'
  | 'archived';

export type OrderStatus =
  | 'payment_pending'
  | 'escrow_locked'
  | 'seller_delivered'
  | 'buyer_reviewing'
  | 'completed'
  | 'disputed'
  | 'cancelled'
  | 'refunded';

export type EscrowState =
  | 'pending'
  | 'payment_initiated'
  | 'payment_received'
  | 'waiting_for_seller'
  | 'seller_delivered'
  | 'buyer_reviewing'
  | 'completed'
  | 'refund_pending'
  | 'refunded'
  | 'disputed'
  | 'cancelled'
  | 'expired';

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type DisputeStatus =
  | 'open'
  | 'under_review'
  | 'resolved_buyer_refund'
  | 'resolved_seller_release'
  | 'closed_dismissed';

export interface Profile {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  country: string;
  avatar_url: string | null;
  bio: string | null;
  role?: UserRole;
  is_verified_seller: boolean;
  seller_rating: number;
  total_reviews_count: number;
  completed_sales_count: number;
  available_balance: number;
  escrow_balance: number;
  is_suspended: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type NewsCategory =
  | 'scammer_alert'
  | 'efootball_news'
  | 'escrow_guide'
  | 'announcement'
  | 'update';

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  category: NewsCategory;
  content: string;
  summary: string;
  cover_image_url?: string | null;
  author_id?: string | null;
  author_name?: string;
  is_pinned: boolean;
  is_published: boolean;
  views_count: number;
  created_at: string;
  updated_at: string;
}

export interface Listing {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  platform: Platform;
  game_version: string;
  region: string;
  account_level: number;
  overall_team_strength: number;
  gp_balance: number;
  coin_balance: number;
  efootball_points: number;
  contract_renewal_tickets: number;
  booster_tokens: number;
  training_programs: number;
  player_slots: number;
  legend_players_count: number;
  epic_players_count: number;
  big_time_players_count: number;
  highlight_players_count: number;
  featured_players_count: number;
  key_players_list: string[];
  manager_name: string | null;
  formation: string | null;
  primary_playstyle: Playstyle;
  possession_rating: number;
  quick_counter_rating: number;
  long_ball_counter_rating: number;
  out_wide_rating: number;
  long_ball_rating: number;
  current_division: number;
  highest_division: number;
  dream_team_name: string | null;
  matches_played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_scored: number;
  goals_conceded: number;
  account_age_months: number;
  konami_id_status: 'linked_changeable' | 'unlinked' | 'linked_immutable';
  linked_email_status: 'transferable_full_access' | 'buyer_email_bindable';
  status: ListingStatus;
  views_count: number;
  favorites_count: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  // Joined relations
  seller?: Profile;
  images?: ListingImage[];
}

export interface ListingImage {
  id: string;
  listing_id: string;
  image_url: string;
  display_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  total_amount: number;
  platform_fee: number;
  seller_net_amount: number;
  currency: string;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  // Joined relations
  listing?: Listing;
  buyer?: Profile;
  seller?: Profile;
  escrow?: EscrowAccount;
}

export interface EscrowAccount {
  id: string;
  order_id: string;
  buyer_id: string;
  seller_id: string;
  gross_amount: number;
  fee_amount: number;
  net_amount: number;
  currency: string;
  escrow_state: EscrowState;
  inspection_deadline: string | null;
  delivered_at: string | null;
  completed_at: string | null;
  released_at: string | null;
  refunded_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AccountDelivery {
  id: string;
  order_id: string;
  encrypted_konami_email: string;
  encrypted_konami_password: string;
  encrypted_backup_codes: string | null;
  transfer_instructions: string | null;
  seller_ip: string | null;
  delivered_at: string;
  buyer_confirmed_at: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  payment_method: 'mpesa' | 'visa' | 'mastercard' | 'paypal';
  phone_number: string;
  amount: number;
  currency: string;
  merchant_request_id: string | null;
  checkout_request_id: string | null;
  mpesa_receipt_number: string | null;
  result_code: number | null;
  result_desc: string | null;
  status: PaymentStatus;
  raw_callback: Record<string, unknown> | null;
  created_at: string;
  completed_at: string | null;
}

export interface Dispute {
  id: string;
  order_id: string;
  opened_by: string;
  reason: string;
  description: string;
  status: DisputeStatus;
  assigned_to: string | null;
  resolution_notes: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  order_id: string | null;
  conversation_type: 'order' | 'inquiry' | 'support';
  last_message_at: string;
  is_locked: boolean;
  created_at: string;
  updated_at: string;
  messages?: Message[];
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  message_type: 'text' | 'image' | 'system' | 'credential_alert' | 'escrow_alert';
  content: string;
  attachments: Array<{ url: string; name: string; size: number }>;
  is_read: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  recipient_id: string;
  type: string;
  title: string;
  message: string;
  action_url: string | null;
  is_read: boolean;
  created_at: string;
}

export interface Review {
  id: string;
  order_id: string;
  reviewer_id: string;
  seller_id: string;
  rating: number;
  accuracy_rating: number | null;
  speed_rating: number | null;
  communication_rating: number | null;
  comment: string;
  seller_reply: string | null;
  seller_replied_at: string | null;
  created_at: string;
  updated_at: string;
  reviewer?: Profile;
}
