import { z } from "zod";

const strongPasswordSchema = z
  .string()
  .min(1, "Senha é obrigatória")
  .min(8, "Senha deve ter pelo menos 8 caracteres")
  .regex(/[a-z]/, "Senha deve ter pelo menos uma letra minúscula")
  .regex(/[A-Z]/, "Senha deve ter pelo menos uma letra maiúscula")
  .regex(/[0-9]/, "Senha deve ter pelo menos um número")
  .regex(/[^A-Za-z0-9]/, "Senha deve ter pelo menos um caractere especial")
  .regex(/^\S+$/, "Senha não pode conter espaços");

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email é obrigatório")
    .email("Email inválido"),
  password: z
    .string()
    .min(1, "Senha é obrigatória")
    .min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    fullName: z
      .string()
      .min(1, "Nome é obrigatório")
      .min(3, "Nome deve ter pelo menos 3 caracteres"),
    email: z
      .string()
      .min(1, "Email é obrigatório")
      .email("Email inválido"),
    password: strongPasswordSchema,
    confirmPassword: z
      .string()
      .min(1, "Confirmação de senha é obrigatória"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Senhas não conferem",
    path: ["confirmPassword"],
  });

export type SignupFormData = z.infer<typeof signupSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email é obrigatório")
    .email("Email inválido"),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: strongPasswordSchema,
    confirmPassword: z
      .string()
      .min(1, "Confirmação de senha é obrigatória"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Senhas não conferem",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
