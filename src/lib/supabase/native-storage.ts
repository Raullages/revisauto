import { Preferences } from "@capacitor/preferences";
import type { Session } from "@supabase/supabase-js";

const NATIVE_SESSION_KEY = "supabase.native.session";

export const nativeStorage = {
  async getItem(key: string) {
    const { value } = await Preferences.get({ key });
    return value;
  },

  async setItem(key: string, value: string) {
    await Preferences.set({ key, value });
  },

  async removeItem(key: string) {
    await Preferences.remove({ key });
  },
};

export async function saveNativeSession(session: Session) {
  await Preferences.set({
    key: NATIVE_SESSION_KEY,
    value: JSON.stringify(session),
  });
}

export async function loadNativeSession() {
  const { value } = await Preferences.get({ key: NATIVE_SESSION_KEY });

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as Session;
  } catch {
    await Preferences.remove({ key: NATIVE_SESSION_KEY });
    return null;
  }
}

export async function clearNativeSession() {
  await Preferences.remove({ key: NATIVE_SESSION_KEY });
}
