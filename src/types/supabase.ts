export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      attachments: {
        Row: {
          created_at: string;
          file_name: string;
          file_url: string;
          id: string;
          maintenance_id: string;
        };
        Insert: {
          created_at?: string;
          file_name: string;
          file_url: string;
          id?: string;
          maintenance_id: string;
        };
        Update: {
          created_at?: string;
          file_name?: string;
          file_url?: string;
          id?: string;
          maintenance_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "attachments_maintenance_id_fkey";
            columns: ["maintenance_id"];
            isOneToOne: false;
            referencedRelation: "maintenances";
            referencedColumns: ["id"];
          },
        ];
      };
      fuel_logs: {
        Row: {
          created_at: string;
          date: string;
          fuel_type: string;
          gas_station: string | null;
          id: string;
          is_full_tank: boolean;
          liters: number;
          notes: string | null;
          odometer_km: number;
          price_per_liter: number | null;
          total_cost: number;
          vehicle_id: string;
        };
        Insert: {
          created_at?: string;
          date: string;
          fuel_type: string;
          gas_station?: string | null;
          id?: string;
          is_full_tank?: boolean;
          liters: number;
          notes?: string | null;
          odometer_km: number;
          price_per_liter?: number | null;
          total_cost: number;
          vehicle_id: string;
        };
        Update: {
          created_at?: string;
          date?: string;
          fuel_type?: string;
          gas_station?: string | null;
          id?: string;
          is_full_tank?: boolean;
          liters?: number;
          notes?: string | null;
          odometer_km?: number;
          price_per_liter?: number | null;
          total_cost?: number;
          vehicle_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fuel_logs_vehicle_id_fkey";
            columns: ["vehicle_id"];
            isOneToOne: false;
            referencedRelation: "vehicles";
            referencedColumns: ["id"];
          },
        ];
      };
      fuel_stations: {
        Row: {
          accuracy_estimate: string | null;
          address: string | null;
          address_complement: string | null;
          brand: string | null;
          city: string | null;
          cnpj: string | null;
          created_at: string;
          data_obtained_at: string | null;
          id: string;
          last_synced_at: string;
          latitude: number;
          longitude: number;
          name: string;
          neighborhood: string | null;
          products: Json;
          source: string;
          source_id: string;
          state: string | null;
          updated_at: string;
          validation: string | null;
          zip_code: string | null;
        };
        Insert: {
          accuracy_estimate?: string | null;
          address?: string | null;
          address_complement?: string | null;
          brand?: string | null;
          city?: string | null;
          cnpj?: string | null;
          created_at?: string;
          data_obtained_at?: string | null;
          id?: string;
          last_synced_at?: string;
          latitude: number;
          longitude: number;
          name: string;
          neighborhood?: string | null;
          products?: Json;
          source?: string;
          source_id: string;
          state?: string | null;
          updated_at?: string;
          validation?: string | null;
          zip_code?: string | null;
        };
        Update: {
          accuracy_estimate?: string | null;
          address?: string | null;
          address_complement?: string | null;
          brand?: string | null;
          city?: string | null;
          cnpj?: string | null;
          created_at?: string;
          data_obtained_at?: string | null;
          id?: string;
          last_synced_at?: string;
          latitude?: number;
          longitude?: number;
          name?: string;
          neighborhood?: string | null;
          products?: Json;
          source?: string;
          source_id?: string;
          state?: string | null;
          updated_at?: string;
          validation?: string | null;
          zip_code?: string | null;
        };
        Relationships: [];
      };
      maintenance_categories: {
        Row: {
          id: string;
          name: string;
        };
        Insert: {
          id?: string;
          name: string;
        };
        Update: {
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      maintenances: {
        Row: {
          amount: number;
          category_id: string;
          created_at: string;
          description: string | null;
          id: string;
          maintenance_date: string | null;
          next_change_date: string | null;
          next_change_km: number | null;
          notes: string | null;
          priority: string;
          status: string;
          title: string;
          vehicle_id: string;
          vehicle_km: number;
          workshop: string | null;
        };
        Insert: {
          amount?: number;
          category_id: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          maintenance_date?: string | null;
          next_change_date?: string | null;
          next_change_km?: number | null;
          notes?: string | null;
          priority?: string;
          status?: string;
          title: string;
          vehicle_id: string;
          vehicle_km: number;
          workshop?: string | null;
        };
        Update: {
          amount?: number;
          category_id?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          maintenance_date?: string | null;
          next_change_date?: string | null;
          next_change_km?: number | null;
          notes?: string | null;
          priority?: string;
          status?: string;
          title?: string;
          vehicle_id?: string;
          vehicle_km?: number;
          workshop?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "maintenances_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "maintenance_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "maintenances_vehicle_id_fkey";
            columns: ["vehicle_id"];
            isOneToOne: false;
            referencedRelation: "vehicles";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          body: string;
          created_at: string;
          id: string;
          is_read: boolean;
          maintenance_id: string | null;
          title: string;
          user_id: string;
        };
        Insert: {
          body: string;
          created_at?: string;
          id?: string;
          is_read?: boolean;
          maintenance_id?: string | null;
          title: string;
          user_id: string;
        };
        Update: {
          body?: string;
          created_at?: string;
          id?: string;
          is_read?: boolean;
          maintenance_id?: string | null;
          title?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_maintenance_id_fkey";
            columns: ["maintenance_id"];
            isOneToOne: false;
            referencedRelation: "maintenances";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          email: string;
          fuel_station_reminders_enabled: boolean;
          full_name: string;
          id: string;
          last_fuel_reminder_at: string | null;
          last_fuel_reminder_lat: number | null;
          last_fuel_reminder_lng: number | null;
          location_permission_status: string;
          push_permission_status: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          subscription_status: string | null;
          subscription_tier: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          fuel_station_reminders_enabled?: boolean;
          full_name?: string;
          id: string;
          last_fuel_reminder_at?: string | null;
          last_fuel_reminder_lat?: number | null;
          last_fuel_reminder_lng?: number | null;
          location_permission_status?: string;
          push_permission_status?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          subscription_status?: string | null;
          subscription_tier?: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          fuel_station_reminders_enabled?: boolean;
          full_name?: string;
          id?: string;
          last_fuel_reminder_at?: string | null;
          last_fuel_reminder_lat?: number | null;
          last_fuel_reminder_lng?: number | null;
          location_permission_status?: string;
          push_permission_status?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          subscription_status?: string | null;
          subscription_tier?: string;
        };
        Relationships: [];
      };
      push_subscriptions: {
        Row: {
          auth: string;
          created_at: string;
          endpoint: string;
          id: string;
          p256dh: string;
          user_id: string;
        };
        Insert: {
          auth: string;
          created_at?: string;
          endpoint: string;
          id?: string;
          p256dh: string;
          user_id: string;
        };
        Update: {
          auth?: string;
          created_at?: string;
          endpoint?: string;
          id?: string;
          p256dh?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      vehicles: {
        Row: {
          acquisition_date: string | null;
          brand: string;
          chassis: string | null;
          color: string | null;
          created_at: string;
          current_km: number;
          fuel: string | null;
          id: string;
          model: string;
          notes: string | null;
          plate: string | null;
          renavam: string | null;
          user_id: string;
          version: string | null;
          year: number;
        };
        Insert: {
          acquisition_date?: string | null;
          brand: string;
          chassis?: string | null;
          color?: string | null;
          created_at?: string;
          current_km?: number;
          fuel?: string | null;
          id?: string;
          model: string;
          notes?: string | null;
          plate?: string | null;
          renavam?: string | null;
          user_id: string;
          version?: string | null;
          year: number;
        };
        Update: {
          acquisition_date?: string | null;
          brand?: string;
          chassis?: string | null;
          color?: string | null;
          created_at?: string;
          current_km?: number;
          fuel?: string | null;
          id?: string;
          model?: string;
          notes?: string | null;
          plate?: string | null;
          renavam?: string | null;
          user_id?: string;
          version?: string | null;
          year?: number;
        };
        Relationships: [
          {
            foreignKeyName: "vehicles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof DatabaseWithoutInternals, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer Row;
    }
    ? Row
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer Row;
      }
      ? Row
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer Insert;
    }
    ? Insert
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer Insert;
      }
      ? Insert
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer Update;
    }
    ? Update
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer Update;
      }
      ? Update
      : never
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
