export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      vehicles: {
        Row: {
          id: string;
          user_id: string;
          brand: string;
          model: string;
          year: number;
          version: string | null;
          plate: string | null;
          color: string | null;
          fuel: string | null;
          current_km: number;
          chassis: string | null;
          renavam: string | null;
          acquisition_date: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          brand: string;
          model: string;
          year: number;
          version?: string | null;
          plate?: string | null;
          color?: string | null;
          fuel?: string | null;
          current_km: number;
          chassis?: string | null;
          renavam?: string | null;
          acquisition_date?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          brand?: string;
          model?: string;
          year?: number;
          version?: string | null;
          plate?: string | null;
          color?: string | null;
          fuel?: string | null;
          current_km?: number;
          chassis?: string | null;
          renavam?: string | null;
          acquisition_date?: string | null;
          notes?: string | null;
          created_at?: string;
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
          id: string;
          vehicle_id: string;
          category_id: string;
          title: string;
          description: string | null;
          maintenance_date: string | null;
          vehicle_km: number;
          amount: number;
          workshop: string | null;
          notes: string | null;
          next_change_km: number | null;
          next_change_date: string | null;
          status: string;
          priority: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          vehicle_id: string;
          category_id: string;
          title: string;
          description?: string | null;
          maintenance_date?: string | null;
          vehicle_km: number;
          amount: number;
          workshop?: string | null;
          notes?: string | null;
          next_change_km?: number | null;
          next_change_date?: string | null;
          status?: string;
          priority?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          vehicle_id?: string;
          category_id?: string;
          title?: string;
          description?: string | null;
          maintenance_date?: string | null;
          vehicle_km?: number;
          amount?: number;
          workshop?: string | null;
          notes?: string | null;
          next_change_km?: number | null;
          next_change_date?: string | null;
          status?: string;
          priority?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      attachments: {
        Row: {
          id: string;
          maintenance_id: string;
          file_url: string;
          file_name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          maintenance_id: string;
          file_url: string;
          file_name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          maintenance_id?: string;
          file_url?: string;
          file_name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
