"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { loginSchema, type LoginFormData } from "@/features/auth/model/schemas";
import { useAuthViewModel } from "@/features/auth/viewmodel/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signIn } = useAuthViewModel();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);

    const result = await signIn(data.email, data.password);

    if (!result.success) {
      toast.error(result.error || "Erro ao fazer login");
      setLoading(false);
      return;
    }

    toast.success("Bem-vindo de volta!");
    router.push("/dashboard");
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/50">
            <svg className="h-8 w-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M1 16h22M9 6h4l2 2h5a1 1 0 011 1v7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">RevisAuto</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Controle de manutencao veicular</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Email" type="email" placeholder="seu@email.com" autoComplete="email" error={errors.email?.message} {...register("email")} />
          <Input label="Senha" type="password" placeholder="Sua senha" autoComplete="current-password" error={errors.password?.message} {...register("password")} />
          <div className="flex justify-end">
            <Link href="/auth/forgot-password" className="text-xs font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
              Esqueceu a senha?
            </Link>
          </div>
          <Button type="submit" fullWidth loading={loading}>Entrar</Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Nao tem conta?{" "}
          <Link href="/auth/signup" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">Cadastre-se</Link>
        </p>
      </div>
    </div>
  );
}
