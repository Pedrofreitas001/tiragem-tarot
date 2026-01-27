export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          subscription_tier: 'free' | 'premium'
          subscription_expires_at: string | null
          readings_today: number
          last_reading_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          subscription_tier?: 'free' | 'premium'
          subscription_expires_at?: string | null
          readings_today?: number
          last_reading_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          subscription_tier?: 'free' | 'premium'
          subscription_expires_at?: string | null
          readings_today?: number
          last_reading_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      readings: {
        Row: {
          id: string
          user_id: string
          spread_type: string
          cards: Json
          question: string | null
          synthesis: string | null
          rating: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          spread_type: string
          cards: Json
          question?: string | null
          synthesis?: string | null
          rating?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          spread_type?: string
          cards?: Json
          question?: string | null
          synthesis?: string | null
          rating?: number | null
          notes?: string | null
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          status: 'active' | 'cancelled' | 'expired' | 'pending'
          provider: 'stripe' | 'mercadopago' | null
          provider_subscription_id: string | null
          plan: string
          price_cents: number
          currency: string
          started_at: string | null
          expires_at: string | null
          cancelled_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status?: 'active' | 'cancelled' | 'expired' | 'pending'
          provider?: 'stripe' | 'mercadopago' | null
          provider_subscription_id?: string | null
          plan: string
          price_cents: number
          currency?: string
          started_at?: string | null
          expires_at?: string | null
          cancelled_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          status?: 'active' | 'cancelled' | 'expired' | 'pending'
          provider?: 'stripe' | 'mercadopago' | null
          provider_subscription_id?: string | null
          plan?: string
          price_cents?: number
          currency?: string
          started_at?: string | null
          expires_at?: string | null
          cancelled_at?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      subscription_status: 'active' | 'cancelled' | 'expired' | 'pending'
      subscription_tier: 'free' | 'premium'
      payment_provider: 'stripe' | 'mercadopago'
    }
  }
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type Reading = Database['public']['Tables']['readings']['Row']
export type ReadingInsert = Database['public']['Tables']['readings']['Insert']
export type ReadingUpdate = Database['public']['Tables']['readings']['Update']

export type Subscription = Database['public']['Tables']['subscriptions']['Row']
export type SubscriptionInsert = Database['public']['Tables']['subscriptions']['Insert']
export type SubscriptionUpdate = Database['public']['Tables']['subscriptions']['Update']

export type SubscriptionTier = 'free' | 'premium'
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'pending'
