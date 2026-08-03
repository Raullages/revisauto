"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { resetPasswordSchema, type ResetPasswordFormData } from "@/features/auth/model/schemas";
import { useAuthViewModel } from "@/features/auth/viewmodel/useAuth";
import { cn } from "@/lib/utils";

const passwordRequirements = [
  { label: "Pelo menos 8 caracteres", test: (password: string) => password.length >= 8 },
  { label: "Uma letra minúscula", test: (password: string) => /[a-z]/.test(password) },
  { label: "Uma letra maiúscula", test: (password: string) => /[A-Z]/.test(password) },
  { label: "Um número", test: (password: string) => /[0-9]/.test(password) },
  { label: "Um caractere especial", test: (password: string) => /[^A-Za-z0-9]/.test(password) },
  { label: "Sem espaços", test: (password: string) => /^\S+$/.test(password) },
];

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { updatePassword } = useAuthViewModel();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const password = watch("password", "");
  const passwordRequirementStatus = passwordRequirements.map((requirement) => ({
    label: requirement.label,
    met: requirement.test(password),
  }));

  const onSubmit = async (data: ResetPasswordFormData) => {
    setLoading(true);

    const result = await updatePassword(data.password);

    if (!result.success) {
      toast.error(result.error || "Erro ao redefinir senha");
      setLoading(false);
      return;
    }

    toast.success("Senha redefinida com sucesso!");
    router.push("/dashboard");
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Redefinir senha</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Escolha uma nova senha para sua conta
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nova senha"
            type="password"
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register("password")}
          />
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
          <Input
            label="Confirmar nova senha"
            type="password"
            placeholder="Repita a nova senha"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />
          <Button type="submit" fullWidth loading={loading}>Salvar nova senha</Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
            Voltar para o login
          </Link>
        </p>
      </div>
    </div>
  );
}
