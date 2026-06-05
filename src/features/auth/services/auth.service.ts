import { createClient } from "@/lib/supabase/client";

export const authService = {
  async signUp(email: string, password: string, fullName: string) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw error;
    return data;
  },

  async signIn(email: string, password: string) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async resetPassword(email: string) {
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/login`,
    });
    if (error) throw error;
  },

  async getSession() {
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  async getUser() {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    return data.user;
  },
};
