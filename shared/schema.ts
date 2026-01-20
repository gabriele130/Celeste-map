import { z } from "zod";

// ============ Authentication ============
export const loginPincodeSchema = z.object({
  connector_uuid: z.string().uuid("Invalid connector UUID"),
  pincode: z.string().min(4, "Pincode must be at least 4 characters"),
});
export type LoginPincodeRequest = z.infer<typeof loginPincodeSchema>;

export const loginOtpSchema = z.object({
  otp: z.string().min(6, "OTP must be at least 6 characters"),
});
export type LoginOtpRequest = z.infer<typeof loginOtpSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});
export type ForgotPasswordRequest = z.infer<typeof forgotPasswordSchema>;

export interface AuthTokens {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
}

export interface SessionInfo {
  isAuthenticated: boolean;
  user?: UserMe;
  customer?: CustomerMe;
}

// ============ User ============
export interface UserMe {
  id: number;
  email: string;
  name: string;
  locale?: string;
  timezone?: string;
}

// ============ Customer ============
export interface CustomerMe {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  company_name?: string;
  vat_number?: string;
}

export const editCustomerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
  company_name: z.string().optional(),
  vat_number: z.string().optional(),
});
export type EditCustomerRequest = z.infer<typeof editCustomerSchema>;

export interface CustomerWallet {
  balance: number;
  currency: string;
  credits?: number;
}

export interface CustomerBranding {
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
}

// ============ Connectors ============
export interface Connector {
  id: number;
  uuid: string;
  is_online: boolean;
  has_wifi: boolean;
  software_version: number;
  hardware_version: number;
  supports_doip: boolean;
  vehicle_path_string?: string;
  vin_number?: string;
  product_description?: string;
  hardware_type: string;
}

export interface ConnectorsResponse {
  result: Connector[];
  total: number;
  offset: number;
  limit: number;
}

// ============ Vehicles ============
export interface VehicleMake {
  id: number;
  name: string;
  logo_url?: string;
}

export interface VehicleModelGroup {
  id: number;
  name: string;
  make_id: number;
}

export interface VehicleModel {
  id: number;
  name: string;
  model_group_id: number;
  year_from?: number;
  year_to?: number;
}

export interface VehicleModelVariant {
  id: number;
  name: string;
  model_id: number;
  engine?: string;
  fuel_type?: string;
  power_kw?: number;
}

export interface VehicleSearchResult {
  vin: string;
  make?: string;
  model?: string;
  type?: string;
  engine?: string;
}

export interface HistoricalVehicle {
  vin: string;
  make: string;
  model: string;
  last_service_date: string;
}

// ============ Products ============
export interface ProductGroup {
  id: number;
  name: string;
  description?: string;
}

export interface ProductBundle {
  id: number;
  name: string;
  products: Product[];
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price?: number;
  currency?: string;
  is_favorite?: boolean;
}

export interface ProductPrerequisite {
  id: number;
  name: string;
  required: boolean;
}

export const addFavoriteSchema = z.object({
  product_id: z.number(),
});
export type AddFavoriteRequest = z.infer<typeof addFavoriteSchema>;

// ============ Cart ============
export interface CartItem {
  product_id: number;
  quantity: number;
  vehicle_variant_id?: number;
}

export const calculatePricesSchema = z.object({
  items: z.array(z.object({
    product_id: z.number(),
    quantity: z.number().min(1),
    vehicle_variant_id: z.number().optional(),
  })),
  vin: z.string().optional(),
});
export type CalculatePricesRequest = z.infer<typeof calculatePricesSchema>;

export interface PriceBreakdown {
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  currency: string;
}

export interface CartPricesResponse {
  items: PriceBreakdown[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
}

// ============ Tickets ============
export interface PreparedTicket {
  id: number;
  vin: string;
  status: string;
  created_at: string;
  vehicle_description?: string;
  product_description?: string;
}

export interface PreparedTicketsResponse {
  result: PreparedTicket[];
  total: number;
  offset: number;
  limit: number;
}

export interface TicketNote {
  id: number;
  content: string;
  created_at: string;
  author?: string;
}

export interface HistoricalTicket {
  id: number;
  vin: string;
  status: string;
  created_at: string;
  closed_at?: string;
  vehicle_description?: string;
  product_description?: string;
}

export const createTicketSchema = z.object({
  connector_id: z.number(),
  product_id: z.number(),
  vehicle_variant_id: z.number().optional(),
  vin: z.string().optional(),
  notes: z.string().optional(),
});
export type CreateTicketRequest = z.infer<typeof createTicketSchema>;

export interface Ticket {
  id: number;
  status: string;
  connector_id: number;
  product_id: number;
  created_at: string;
  vin?: string;
}

// ============ Employees ============
export interface Employee {
  id: number;
  name: string;
  email: string;
  role?: string;
  phone?: string;
  is_active: boolean;
}

export const createEmployeeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  role: z.string().optional(),
  phone: z.string().optional(),
});
export type CreateEmployeeRequest = z.infer<typeof createEmployeeSchema>;

export const editEmployeeSchema = createEmployeeSchema.extend({
  is_active: z.boolean().optional(),
});
export type EditEmployeeRequest = z.infer<typeof editEmployeeSchema>;

// ============ Chats ============
export interface Chat {
  id: string;
  status: string;
  created_at: string;
  messages: ChatMessage[];
  participants?: string[];
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
}

// ============ Service Center ============
export interface ServiceCenter {
  id: number;
  name: string;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
}

export interface ServiceCenterStatus {
  is_open: boolean;
  current_queue: number;
  estimated_wait_time?: number;
  available_slots?: number;
}

// ============ System ============
export interface Country {
  code: string;
  name: string;
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

// ============ Messenger ============
export interface Channel {
  id: string;
  name: string;
  type: string;
  created_at: string;
  participants?: string[];
}

export const translateTextSchema = z.object({
  text: z.string().min(1, "Text is required"),
  target_language: z.string().min(2, "Target language is required"),
  source_language: z.string().optional(),
});
export type TranslateTextRequest = z.infer<typeof translateTextSchema>;

export interface TranslateTextResponse {
  translated_text: string;
  source_language: string;
  target_language: string;
}

export const sendControlMessageSchema = z.object({
  channel_id: z.string(),
  message_type: z.string(),
  payload: z.record(z.any()).optional(),
});
export type SendControlMessageRequest = z.infer<typeof sendControlMessageSchema>;

export const createAttachmentSchema = z.object({
  channel_id: z.string(),
  file_name: z.string(),
  file_type: z.string(),
  file_data: z.string(),
});
export type CreateAttachmentRequest = z.infer<typeof createAttachmentSchema>;

export interface ChannelAttachment {
  id: string;
  file_name: string;
  file_type: string;
  file_url: string;
  created_at: string;
}

// ============ API Response Wrappers ============
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export interface PaginatedResponse<T> {
  result: T[];
  total: number;
  offset: number;
  limit: number;
}
