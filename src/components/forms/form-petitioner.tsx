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

const FormSchema = z.object({
  person_type: z.enum(["PF", "PJ"]),
  name: z.string().optional(),
  registration_number: z.string(),
  birth_date: z.date().optional(),
  death_date: z.date().optional(),
  deceased: z.boolean().optional(),
  company_name: z.string().optional(),
  foundation_date: z.date().optional(),
  code: z.string(),
  phone: z.string(),
  email: z.string(),
});

type FormValues = z.infer<typeof FormSchema>;

export default function FormPetitioner() {
  const [personType, setPersonType] = useState<"PF" | "PJ">("PF");

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      person_type: "PF",
      name: "",
      registration_number: "",
      birth_date: new Date(),
      death_date: new Date(),
      company_name: "",
      foundation_date: new Date(),
      code: "",
      phone: "",
      email: ""
    }
  });

  function onSubmit(data: FormValues) {
    console.log("Form data:", data);
    
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">

        <FormField
          control={form.control}
          name="person_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo do Credor:</FormLabel>
              <Select
                onValueChange={(val) => {
                  field.onChange(val);
                  setPersonType(val as any);
                }}
                value={field.value}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PF">Pessoa Física </SelectItem>
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
                    <FormLabel>Nome</FormLabel>
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
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <Input placeholder="000.000.000-00" {...field} onChange={(e) => field.onChange(maskCPF(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <FormField
                control={form.control}
                name="birth_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de nascimento</FormLabel>
                    <FormControl>
                      <DatePicker selected={field.value} onSelect={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
             
              <FormField
                control={form.control}
                name="deceased"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel>Óbito?</FormLabel>
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
                      <FormLabel>Data do óbito</FormLabel>
                      <FormControl>
                        <DatePicker selected={field.value} onSelect={field.onChange} />
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
                  <FormLabel>Razão Social</FormLabel>
                  <FormControl>
                    <Input placeholder="Exemplo LDTA"  {...field} />
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
                    <FormLabel>CNPJ</FormLabel>
                    <FormControl>
                      <Input placeholder="00.000.000/0000-00"  {...field} onChange={(e) => field.onChange(maskCNPJ(e.target.value))} />
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
                      <DatePicker selected={field.value} onSelect={field.onChange} />
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
                  <Input placeholder="(DDD) 99999-9999" {...field} onChange={(e) => field.onChange(maskPhone(e.target.value))} />
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
        <Separator></Separator>
        
        <div className="w-full flex justify-end">
          <Button type="submit" className="bg-[#1a384c] col-2 w-fit cursor-pointer py-6 font-bold">
            Cadastrar Credor
          </Button>
        </div>

      </form>
    </Form>
  );
}
