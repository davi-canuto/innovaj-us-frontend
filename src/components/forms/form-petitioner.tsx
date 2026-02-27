"use client"

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { maskCNPJ, maskCPF, maskPhone } from "@/utils/masks";
import { Separator } from "../ui/separator";
import { petitionersService } from "@/services/petitioners";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// Validação de CPF (apenas formato, não dígitos verificadores)
const isValidCPF = (cpf: string) => {
  const numbers = cpf.replace(/\D/g, "");
  return numbers.length === 11;
};

// Validação de CNPJ (apenas formato)
const isValidCNPJ = (cnpj: string) => {
  const numbers = cnpj.replace(/\D/g, "");
  return numbers.length === 14;
};

const FormSchema = z.object({
  person_type: z.enum(["PF", "PJ"]),
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres").optional(),
  registration_number: z.string().min(1, "Campo obrigatório"),
  birth_date: z.date().optional().nullable(),
  death_date: z.date().optional().nullable(),
  deceased: z.boolean().optional(),
  company_name: z.string().min(3, "Razão social deve ter no mínimo 3 caracteres").optional(),
  foundation_date: z.date().optional().nullable(),
  phone: z.string().optional(),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
}).refine((data) => {
  if (data.person_type === "PF") {
    return data.name && data.name.length >= 3;
  }
  return true;
}, {
  message: "Nome é obrigatório para Pessoa Física",
  path: ["name"],
}).refine((data) => {
  if (data.person_type === "PJ") {
    return data.company_name && data.company_name.length >= 3;
  }
  return true;
}, {
  message: "Razão Social é obrigatória para Pessoa Jurídica",
  path: ["company_name"],
}).refine((data) => {
  if (data.person_type === "PF") {
    return isValidCPF(data.registration_number);
  }
  return true;
}, {
  message: "CPF inválido (deve conter 11 dígitos)",
  path: ["registration_number"],
}).refine((data) => {
  if (data.person_type === "PJ") {
    return isValidCNPJ(data.registration_number);
  }
  return true;
}, {
  message: "CNPJ inválido (deve conter 14 dígitos)",
  path: ["registration_number"],
}).refine((data) => {
  if (data.deceased && !data.death_date) {
    return false;
  }
  return true;
}, {
  message: "Data do óbito é obrigatória quando marcado como falecido",
  path: ["death_date"],
});

type FormValues = z.infer<typeof FormSchema>;

interface FormPetitionerProps {
  onSuccess?: () => void;
  defaultValues?: {
    id?: number;
    person_type?: string;
    name?: string;
    registration_number?: string;
    birth_date?: string | null;
    death_date?: string | null;
    company_name?: string | null;
    phone?: string;
    email?: string;
  };
}

export default function FormPetitioner({ onSuccess, defaultValues }: FormPetitionerProps) {
  const initialType = (defaultValues?.person_type?.toUpperCase() as "PF" | "PJ") ?? "PF";
  const [personType, setPersonType] = useState<"PF" | "PJ">(initialType);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      person_type: initialType,
      name: defaultValues?.name ?? "",
      registration_number: defaultValues?.registration_number
        ? initialType === "PF"
          ? maskCPF(defaultValues.registration_number)
          : maskCNPJ(defaultValues.registration_number)
        : "",
      birth_date: defaultValues?.birth_date ? new Date(defaultValues.birth_date) : null,
      death_date: defaultValues?.death_date ? new Date(defaultValues.death_date) : null,
      deceased: !!defaultValues?.death_date,
      company_name: defaultValues?.company_name ?? "",
      foundation_date: null,
      phone: defaultValues?.phone ? maskPhone(defaultValues.phone) : "",
      email: defaultValues?.email ?? "",
    },
  });

  async function onSubmit(data: FormValues) {
    setIsLoading(true);

    try {
      const payload = {
        person_type: data.person_type.toLowerCase() as 'pf' | 'pj',
        name: data.person_type === "PF" ? data.name : undefined,
        company_name: data.person_type === "PJ" ? data.company_name : undefined,
        registration_number: data.registration_number.replace(/\D/g, ""),
        birth_date: data.birth_date?.toISOString().split('T')[0],
        death_date: data.deceased ? data.death_date?.toISOString().split('T')[0] : undefined,
        foundation_date: data.foundation_date?.toISOString().split('T')[0],
        phone: data.phone?.replace(/\D/g, "") || undefined,
        email: data.email || undefined,
      };

      if (defaultValues?.id) {
        await petitionersService.update(defaultValues.id, payload);
        toast.success("Credor atualizado com sucesso!");
      } else {
        await petitionersService.create(payload);
        toast.success("Credor cadastrado com sucesso!");
        form.reset();
        setPersonType("PF");
      }

      onSuccess?.();
    } catch (error) {
      console.error("Erro ao salvar credor:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">

        <FormField
          control={form.control}
          name="person_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo do Credor *</FormLabel>
              <Select
                onValueChange={(val) => {
                  field.onChange(val);
                  setPersonType(val as "PF" | "PJ");
                  form.setValue("registration_number", "");
                }}
                value={field.value}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PF">Pessoa Física</SelectItem>
                  <SelectItem value="PJ">Pessoa Jurídica</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        {personType === "PF" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome *</FormLabel>
                    <FormControl>
                      <Input placeholder="João Silva" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="registration_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="000.000.000-00"
                        maxLength={14}
                        {...field}
                        onChange={(e) => field.onChange(maskCPF(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="birth_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de nascimento</FormLabel>
                    <FormControl>
                      <DatePicker selected={field.value ?? undefined} onSelect={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deceased"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2">
                    <FormLabel>Falecido?</FormLabel>
                    <FormControl>
                      <Switch checked={field.value || false} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch("deceased") && (
                <FormField
                  control={form.control}
                  name="death_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data do óbito *</FormLabel>
                      <FormControl>
                        <DatePicker selected={field.value ?? undefined} onSelect={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </>
        )}

        {personType === "PJ" && (
          <>
            <FormField
              control={form.control}
              name="company_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Razão Social *</FormLabel>
                  <FormControl>
                    <Input placeholder="Empresa Exemplo LTDA" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="registration_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNPJ *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="00.000.000/0000-00"
                        maxLength={18}
                        {...field}
                        onChange={(e) => field.onChange(maskCNPJ(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="foundation_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de fundação</FormLabel>
                    <FormControl>
                      <DatePicker selected={field.value ?? undefined} onSelect={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone</FormLabel>
                <FormControl>
                  <Input
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                    {...field}
                    onChange={(e) => field.onChange(maskPhone(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input placeholder="email@exemplo.com" {...field} type="email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Separator />

        <div className="w-full flex justify-end">
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-[#1a384c] w-fit cursor-pointer py-6 font-bold"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cadastrando...
              </>
            ) : (
              defaultValues?.id ? "Salvar alterações" : "Cadastrar Credor"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
