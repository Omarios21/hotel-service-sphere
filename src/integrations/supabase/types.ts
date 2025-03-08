export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      activities: {
        Row: {
          available: boolean
          created_at: string | null
          description: string
          duration: string
          id: string
          image: string
          location: string
          name: string
          price: number
          updated_at: string | null
        }
        Insert: {
          available?: boolean
          created_at?: string | null
          description: string
          duration: string
          id?: string
          image: string
          location: string
          name: string
          price: number
          updated_at?: string | null
        }
        Update: {
          available?: boolean
          created_at?: string | null
          description?: string
          duration?: string
          id?: string
          image?: string
          location?: string
          name?: string
          price?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      activity_bookings: {
        Row: {
          activity_id: string
          activity_name: string
          booking_id: string
          booking_time: string
          created_at: string | null
          date: string
          guest_count: number
          id: string
          location: string
          status: string
          total_price: number
          updated_at: string | null
        }
        Insert: {
          activity_id: string
          activity_name: string
          booking_id: string
          booking_time: string
          created_at?: string | null
          date: string
          guest_count: number
          id?: string
          location: string
          status?: string
          total_price: number
          updated_at?: string | null
        }
        Update: {
          activity_id?: string
          activity_name?: string
          booking_id?: string
          booking_time?: string
          created_at?: string | null
          date?: string
          guest_count?: number
          id?: string
          location?: string
          status?: string
          total_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_bookings_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_dates: {
        Row: {
          activity_id: string
          created_at: string | null
          date: string
          id: string
        }
        Insert: {
          activity_id: string
          created_at?: string | null
          date: string
          id?: string
        }
        Update: {
          activity_id?: string
          created_at?: string | null
          date?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_dates_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
      }
      admins: {
        Row: {
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          available: boolean | null
          category: string
          created_at: string | null
          description: string
          id: string
          image_url: string
          name: string
          price: number
          updated_at: string | null
        }
        Insert: {
          available?: boolean | null
          category: string
          created_at?: string | null
          description: string
          id?: string
          image_url: string
          name: string
          price: number
          updated_at?: string | null
        }
        Update: {
          available?: boolean | null
          category?: string
          created_at?: string | null
          description?: string
          id?: string
          image_url?: string
          name?: string
          price?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      spa_bookings: {
        Row: {
          booking_id: string
          booking_time: string
          created_at: string | null
          date: string
          id: string
          price: number
          service_id: string
          service_name: string
          status: string
          time: string
          updated_at: string | null
        }
        Insert: {
          booking_id: string
          booking_time: string
          created_at?: string | null
          date: string
          id?: string
          price: number
          service_id: string
          service_name: string
          status?: string
          time: string
          updated_at?: string | null
        }
        Update: {
          booking_id?: string
          booking_time?: string
          created_at?: string | null
          date?: string
          id?: string
          price?: number
          service_id?: string
          service_name?: string
          status?: string
          time?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spa_bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "spa_services"
            referencedColumns: ["id"]
          },
        ]
      }
      spa_services: {
        Row: {
          available: boolean
          created_at: string | null
          description: string
          duration: string
          id: string
          image: string
          name: string
          price: number
          updated_at: string | null
        }
        Insert: {
          available?: boolean
          created_at?: string | null
          description: string
          duration: string
          id?: string
          image: string
          name: string
          price: number
          updated_at?: string | null
        }
        Update: {
          available?: boolean
          created_at?: string | null
          description?: string
          duration?: string
          id?: string
          image?: string
          name?: string
          price?: number
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: {
          user_uid: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
