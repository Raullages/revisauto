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
import { cn } from "@/lib/utils";

const passwordRequirements = [
  { label: "Pelo menos 8 caracteres", test: (password: string) => password.length >= 8 },
  { label: "Uma letra minúscula", test: (password: string) => /[a-z]/.test(password) },
  { label: "Uma letra maiúscula", test: (password: string) => /[A-Z]/.test(password) },
  { label: "Um número", test: (password: string) => /[0-9]/.test(password) },
  { label: "Um caractere especial", test: (password: string) => /[^A-Za-z0-9]/.test(password) },
  { label: "Sem espaços", test: (password: string) => /^\S+$/.test(password) },
];

export default function SignupPageClient() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signUp } = useAuthViewModel();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const password = watch("password", "");
  const passwordRequirementStatus = passwordRequirements.map((requirement) => ({
    label: requirement.label,
    met: requirement.test(password),
  }));

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
          <img src="/logo-light.png" alt="PessoAuto" className="mx-auto h-24 w-auto block dark:hidden" />
          <img src="/logo-dark.png" alt="PessoAuto" className="mx-auto h-24 w-auto hidden dark:block" />
          <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">Criar conta</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Cadastre-se para começar</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Nome completo" placeholder="Seu nome" autoComplete="name" error={errors.fullName?.message} {...register("fullName")} />
          <Input label="Email" type="email" placeholder="seu@email.com" autoComplete="email" error={errors.email?.message} {...register("email")} />
          <div className="space-y-1">
            <Input label="Senha" type="password" placeholder="Minimo 8 caracteres" autoComplete="new-password" error={errors.password?.message} {...register("password")} />
            <div className="space-y-1 text-xs">
              {passwordRequirementStatus.map((requirement) => (
                <p
                  key={requirement.label}
                  className={cn(
                    "transition-colors",
                    requirement.met ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400",
                  )}
                >
                  {requirement.label}
                </p>
              ))}
            </div>
          </div>
          <Input label="Confirmar senha" type="password" placeholder="Repita a senha" autoComplete="new-password" error={errors.confirmPassword?.message} {...register("confirmPassword")} />
          <Button type="submit" fullWidth loading={loading}>Cadastrar</Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Ja tem conta? <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
