"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { loginSchema, type LoginFormData } from "@/features/auth/model/schemas";
import { useAuthViewModel } from "@/features/auth/viewmodel/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPageClient() {
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const router = useRouter();
  const { signIn, syncSession } = useAuthViewModel();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    let active = true;

    void (async () => {
      const result = await syncSession();

      if (!active) {
        return;
      }

      if (result.success && result.data) {
        router.replace("/dashboard");
        return;
      }

      setCheckingSession(false);
    })();

    return () => {
      active = false;
    };
  }, [router, syncSession]);

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

  if (checkingSession) {
    return <div className="flex min-h-screen items-center justify-center px-4" />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <img src="/logo-light.png" alt="PessoAuto" className="mx-auto h-42 w-auto block dark:hidden" />
          <img src="/logo-dark.png" alt="PessoAuto" className="mx-auto h-42 w-auto hidden dark:block" />
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
          Nao tem conta? <Link href="/auth/signup" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">Cadastre-se</Link>
        </p>
      </div>
    </div>
  );
}
