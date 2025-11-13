"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const FormSchema = z.object({
  email: z.string().email("Por favor insira um e-mail válido!"),
  password: z.string().min(1, "Senha é obrigatória!"),
});

export default function FormLogin() {
  const router = useRouter();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      // Aqui você chama a função de login real
      // await login(data.email, data.password);

      router.push("/dashboard");
    } catch (err) {
      toast.error("Email ou senha inválidos!");
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

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 w-full max-w-md mx-auto"
        >
          {/* Campo de email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm  font-bold text-[1rem]">
                  E-mail
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="@gmail.com"
                    autoComplete="email"
                    className="text-[1rem]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Campo de senha */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-bold text-[1rem]">
                  Senha
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="text-[1rem]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Botão */}
          <Button
            type="submit"
            className="w-full font-bold py-6 mt-2 text-[1rem] cursor-pointer bg-[#1a384c]"
            disabled={form.formState.isSubmitting}
          >
            Entrar
          </Button>
        </form>
      </Form>
    </div>
  );
}
