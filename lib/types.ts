// lib/types.ts

export type Role = 'client' | 'livreur' | 'admin'
export type ZoneType = 'dakar_centre' | 'banlieue' | 'interieur'
export type OrderType = 'particulier' | 'vendeur'
export type OrderStatus = 'en_attente' | 'confirme' | 'en_cours' | 'livre' | 'annule'
export type PaymentMethod = 'wave' | 'orange_money' | 'cash'

export interface Zone {
  id: string
  name: string
  type: ZoneType
  tarif_base: number
  created_at: string
}

export interface Profile {
  id: string
  full_name: string
  phone: string
  role: Role
  zone_id?: string
  avatar_url?: string
  created_at: string
  zone?: Zone
}

export interface Order {
  id: string
  client_id: string
  livreur_id?: string
  zone_from_id: string
  zone_to_id: string
  type: OrderType
  description: string
  recipient_name: string
  recipient_phone: string
  address_landmark?: string // Point de repère (ex: "En face de la brioche dorée")
  gps_link?: string // Lien Google Maps ou position WhatsApp
  status: OrderStatus
  price: number
  payment_method: PaymentMethod
  notes?: string
  created_at: string
  updated_at: string
  // Relations
  client?: Profile
  livreur?: Profile
  zone_from?: Zone
  zone_to?: Zone
  history?: OrderStatusHistory[]
}

export interface OrderStatusHistory {
  id: string
  order_id: string
  status: string
  note?: string
  created_by?: string
  created_at: string
}

// Labels UI
export const STATUS_LABELS: Record<OrderStatus, string> = {
  en_attente: 'En attente',
  confirme: 'Confirmé',
  en_cours: 'En cours',
  livre: 'Livré',
  annule: 'Annulé',
}

export const STATUS_COLORS: Record<OrderStatus, string> = {
  en_attente: 'bg-yellow-100 text-yellow-800',
  confirme: 'bg-blue-100 text-blue-800',
  en_cours: 'bg-orange-100 text-orange-800',
  livre: 'bg-green-100 text-green-800',
  annule: 'bg-red-100 text-red-800',
}

export const ZONE_TYPE_LABELS: Record<ZoneType, string> = {
  dakar_centre: 'Dakar Centre',
  banlieue: 'Banlieue',
  interieur: 'Intérieur du pays',
}

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  wave: '💙 Wave',
  orange_money: '🟠 Orange Money',
  cash: '💵 Cash à la livraison',
}
