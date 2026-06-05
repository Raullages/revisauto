"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { signupSchema, type SignupFormData } from "@/features/auth/model/schemas";
import { useAuthViewModel } from "@/features/auth/viewmodel/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signUp } = useAuthViewModel();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    setLoading(true);

    const result = await signUp(data.email, data.password, data.fullName);

    if (!result.success) {
      toast.error(result.error || "Erro ao cadastrar");
      setLoading(false);
      return;
    }

    toast.success("Conta criada! Faca login.");
    router.push("/auth/login");
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <img
            src="/logo-light.png"
            alt="PessoAuto"
            className="mx-auto h-24 w-auto block dark:hidden"
          />
          <img
            src="/logo-dark.png"
            alt="PessoAuto"
            className="mx-auto h-24 w-auto hidden dark:block"
          />
          <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">Criar conta</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Cadastre-se para começar</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Nome completo" placeholder="Seu nome" autoComplete="name" error={errors.fullName?.message} {...register("fullName")} />
          <Input label="Email" type="email" placeholder="seu@email.com" autoComplete="email" error={errors.email?.message} {...register("email")} />
          <Input label="Senha" type="password" placeholder="Minimo 6 caracteres" autoComplete="new-password" error={errors.password?.message} {...register("password")} />
          <Input label="Confirmar senha" type="password" placeholder="Repita a senha" autoComplete="new-password" error={errors.confirmPassword?.message} {...register("confirmPassword")} />
          <Button type="submit" fullWidth loading={loading}>Cadastrar</Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Ja tem conta?{" "}
          <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
