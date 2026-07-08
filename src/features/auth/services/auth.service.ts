import { createClient } from "@/lib/supabase/client";
import { clearNativeSession, loadNativeSession, saveNativeSession } from "@/lib/supabase/native-storage";
import { Capacitor } from "@capacitor/core";

async function getStableSession() {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    if (Capacitor.isNativePlatform()) {
      await saveNativeSession(session);
    }

    return session;
  }

  if (Capacitor.isNativePlatform()) {
    const storedSession = await loadNativeSession();

    if (storedSession) {
      const { data, error } = await supabase.auth.setSession({
        access_token: storedSession.access_token,
        refresh_token: storedSession.refresh_token,
      });

      if (!error && data.session) {
        await saveNativeSession(data.session);
        return data.session;
      }

      await clearNativeSession();
    }
  }

  return await new Promise<Awaited<ReturnType<typeof authService.getSession>>>((resolve) => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event !== "INITIAL_SESSION") {
        return;
      }

      subscription.unsubscribe();
      resolve(nextSession);
    });
  });
}

async function syncServerSession(accessToken: string, refreshToken: string) {
  await fetch("/api/auth/session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      access_token: accessToken,
      refresh_token: refreshToken,
    }),
  });
}

async function clearServerSession() {
  await fetch("/api/auth/session", {
    method: "DELETE",
  });
}

export const authService = {
  async signUp(email: string, password: string, fullName: string) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
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

    if (data.session) {
      if (Capacitor.isNativePlatform()) {
        await saveNativeSession(data.session);
      }

      await syncServerSession(data.session.access_token, data.session.refresh_token);
    }

    return data;
  },

  async signOut() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    if (Capacitor.isNativePlatform()) {
      await clearNativeSession();
    }

    await clearServerSession();
  },

  async resetPassword(email: string) {
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
    });
    if (error) throw error;
  },

  async updatePassword(password: string) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
    return data;
  },

  async getSession() {
    return await getStableSession();
  },

  async syncSession() {
    const session = await getStableSession();

    if (!session) {
      if (Capacitor.isNativePlatform()) {
        await clearNativeSession();
      }

      await clearServerSession();
      return null;
    }

    if (Capacitor.isNativePlatform()) {
      await saveNativeSession(session);
    }

    await syncServerSession(session.access_token, session.refresh_token);
    return session;
  },

  async getUser() {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    return data.user;
  },
};
