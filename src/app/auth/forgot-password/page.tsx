"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import toast from "react-hot-toast";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/features/auth/model/schemas";
import { useAuthViewModel } from "@/features/auth/viewmodel/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { resetPassword } = useAuthViewModel();

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setLoading(true);

    const result = await resetPassword(data.email);

    if (!result.success) {
      toast.error(result.error || "Erro ao enviar email");
      setLoading(false);
      return;
    }

    setSent(true);
    toast.success("Link de recuperacao enviado! Verifique seu email.");
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/50">
            <svg className="h-8 w-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Recuperar senha</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {sent ? "Verifique as instrucoes no seu email" : "Digite seu email para recuperar a senha"}
          </p>
        </div>

        {!sent && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Email" type="email" placeholder="seu@email.com" autoComplete="email" error={errors.email?.message} {...register("email")} />
            <Button type="submit" fullWidth loading={loading}>Enviar link</Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">Voltar para o login</Link>
        </p>
      </div>
    </div>
  );
}
