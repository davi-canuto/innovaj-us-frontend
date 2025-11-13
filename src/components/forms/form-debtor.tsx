"use client";

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { maskCNPJ, maskPhone } from "@/utils/masks";

const FormSchema = z.object({
    type: z.string(),
    companyName: z.string(),
    cnpj: z.string().optional(),
    foundationDate: z.date().optional(),
    code: z.string(),
    phone: z.string(),
    email: z.string(),
});

type FormValues = z.infer<typeof FormSchema>;

export default function FormDebtor() {

    const form = useForm<FormValues>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            type: "",
            companyName: "",
            cnpj: "",
            foundationDate: new Date(),
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full mt-8">

                <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tipo do Credor:</FormLabel>
                            <Select
                                onValueChange={(val) => {
                                    field.onChange(val);
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

                <FormField
                    control={form.control}
                    name="companyName"
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
                        name="cnpj"
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
                        name="foundationDate"
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
            <div className="w-full flex justify-end">
                <Button type="submit" className="bg-[#1a384c] col-2 w-fit cursor-pointer py-2">
                    Cadastrar Credor
                </Button>
            </div>

        </form>
    </Form >
  );
}
