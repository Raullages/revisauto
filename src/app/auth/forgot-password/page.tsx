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
          <img
            src="/logo-light.png"
            alt="PessoAuto"
            className="mx-auto h-36 w-auto block dark:hidden"
          />
          <img
            src="/logo-dark.png"
            alt="PessoAuto"
            className="mx-auto h-36 w-auto hidden dark:block"
          />
          <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">Recuperar senha</h1>
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
