"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { login } from "@/lib/actions/auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function FormLogin() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await login(formData);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Login realizado com sucesso!");
        router.refresh();
        router.push("/dashboard");
      }
    } catch (error) {
      toast.error("Erro ao fazer login. Tente novamente.");
    } finally {
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
