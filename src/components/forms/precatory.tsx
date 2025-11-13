"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { boolean, z } from "zod";
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

const FormSchema = z.object({
    name: z.string(),
    number: z.string(),
    origin: z.string(),
    document_number: z.string(),
    protocol_date: z.date(),
    proposal_year: z.string(),
    inclusion_source: z.string(),
    stage: z.string()
});


type FormValues = z.infer<typeof FormSchema>;

export default function PrecatoryForm() {

    const form = useForm<FormValues>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            name: "",
            number: "",
            origin: "",
            document_number: "",
            protocol_date: new Date(),
            proposal_year: "",
            inclusion_source: "",
            stage: ""
        }
    });

    function onSubmit(data: FormValues) {
        console.log("Form data:", data);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full mt-8">


                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nome</FormLabel>
                                <FormControl>
                                    <Input placeholder="Exemplo de titulo" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="number"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Número do Protocolo</FormLabel>
                                <FormControl>
                                    <Input placeholder="000.000.000-00" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="origin"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Origem</FormLabel>
                                <FormControl>
                                    <Input placeholder="Maria Silva" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="document_number"
                        render={({ field }) => (
                            <FormItem>Número do Documento
                                <FormLabel></FormLabel>
                                <FormControl>
                                    <Input placeholder="00000" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <FormField
                        control={form.control}
                        name="protocol_date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Data do Protocolo</FormLabel>
                                <FormControl>
                                    <DatePicker selected={field.value} onSelect={field.onChange} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="proposal_year"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ano da pro</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ""}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o gênero" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="F">Feminino</SelectItem>
                                        <SelectItem value="M">Masculino</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="stage"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Gênero</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ""}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o gênero" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="F">Feminino</SelectItem>
                                        <SelectItem value="M">Masculino</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="w-full flex justify-end">
                    <Button type="submit" className="bg-[#1a384c] col-2 w-fit cursor-pointer py-6 font-bold">
                        Cadastrar Credor
                    </Button>
                </div>
            </form>
        </Form>
    );
}
