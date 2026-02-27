"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { signup } from "@/lib/actions/auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function FormSignup() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    const password_confirmation = formData.get('password_confirmation') as string;

    if (password !== password_confirmation) {
      setErrorMessage("As senhas não coincidem");
      setIsPending(false);
      return;
    }

    try {
      const result = await signup(formData);

      if (result.error) {
        setErrorMessage(result.error);
        setIsPending(false);
      } else {
        router.push("/dashboard");
      }
    } catch {
      setErrorMessage("Erro ao criar conta. Tente novamente.");
      setIsPending(false);
    }
  }

  return (
    <div className="bg-white space-y-4 flex flex-col shadow-2xl items-center p-5 rounded-2xl md:pt-[60px] md:pb-[60px] md:px-[40px]">
      <Image
        className="dark:invert"
        src="/logo.png"
        alt="InnovaJus logo"
        width={366}
        height={160}
        priority
      />

      <h2 className="text-2xl font-bold text-[#1a384c]">Criar Conta</h2>

      <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md mx-auto">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-bold text-[1rem]">
            Nome Completo
          </Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="João Silva"
            autoComplete="name"
            className="text-[1rem]"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-bold text-[1rem]">
            E-mail
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="@gmail.com"
            autoComplete="email"
            className="text-[1rem]"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cpf" className="text-sm font-bold text-[1rem]">
            CPF (opcional)
          </Label>
          <Input
            id="cpf"
            name="cpf"
            type="text"
            placeholder="000.000.000-00"
            className="text-[1rem]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-bold text-[1rem]">
            Senha
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            className="text-[1rem]"
            required
            minLength={6}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password_confirmation" className="text-sm font-bold text-[1rem]">
            Confirmar Senha
          </Label>
          <Input
            id="password_confirmation"
            name="password_confirmation"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            className="text-[1rem]"
            required
            minLength={6}
          />
        </div>

        {errorMessage && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {errorMessage}
          </p>
        )}

        <Button
          type="submit"
          className="w-full font-bold py-6 mt-2 text-[1rem] cursor-pointer bg-[#1a384c]"
          disabled={isPending}
        >
          {isPending ? "Criando conta..." : "Criar Conta"}
        </Button>

        <p className="text-center text-sm text-gray-600">
          Já tem uma conta?{" "}
          <Link href="/login" className="text-[#1a384c] font-bold hover:underline">
            Faça login
          </Link>
        </p>
      </form>
    </div>
  );
}
