"use client";

import { useCallback } from "react";
import { authService } from "../services/auth.service";
import type { AuthError } from "../model/types";

export function useAuthViewModel() {
  const signUp = useCallback(
    async (email: string, password: string, fullName: string) => {
      try {
        const result = await authService.signUp(email, password, fullName);
        return { success: true, data: result };
      } catch (error) {
        const authError = error as AuthError;
        return { success: false, error: authError.message || "Erro ao cadastrar" };
      }
    },
    [],
  );

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const result = await authService.signIn(email, password);
      return { success: true, data: result };
    } catch (error) {
      const authError = error as AuthError;
      return { success: false, error: authError.message || "Erro ao fazer login" };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authService.signOut();
      return { success: true };
    } catch (error) {
      const authError = error as AuthError;
      return { success: false, error: authError.message || "Erro ao sair" };
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      await authService.resetPassword(email);
      return { success: true };
    } catch (error) {
      const authError = error as AuthError;
      return { success: false, error: authError.message || "Erro ao enviar email" };
    }
  }, []);

  return { signUp, signIn, signOut, resetPassword };
}
