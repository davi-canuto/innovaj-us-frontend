"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { login } from "@/lib/actions/auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function FormLogin() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await login(formData);

      if (result.error) {
        setErrorMessage(result.error);
        setIsPending(false);
      } else {
        router.push("/dashboard");
      }
    } catch {
      setErrorMessage("Erro ao fazer login. Tente novamente.");
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

      <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md mx-auto">
        {/* Campo de email */}
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

        {/* Campo de senha */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-bold text-[1rem]">
            Senha
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            className="text-[1rem]"
            required
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
          {isPending ? "Entrando..." : "Entrar"}
        </Button>

        <p className="text-center text-sm text-gray-600">
          Não tem uma conta?{" "}
          <Link href="/signup" className="text-[#1a384c] font-bold hover:underline">
            Criar conta
          </Link>
        </p>
      </form>
    </div>
  );
}
