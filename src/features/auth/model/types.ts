import type { User } from "@supabase/supabase-js";

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface AuthError {
  message: string;
  status?: number;
}
