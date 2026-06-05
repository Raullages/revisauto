import type { User } from "@supabase/supabase-js";

export type AuthUser = User;

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface ToastType {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

export interface NavItem {
  label: string;
  href: string;
  icon: string;
}
