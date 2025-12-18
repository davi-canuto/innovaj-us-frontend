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
import { toast } from "sonner";
import { api } from "@/services/api";
import { useRouter } from "next/navigation";

const FormSchema = z.object({
    name: z.string(),
    number: z.string(),
    origin: z.string(),
    document_number: z.string(),
    protocol_date: z.date(),
    proposal_year: z.string(),
    requested_amount: z.string(),
    inclusion_source: z.string(),
    stage: z.string()
});


type FormValues = z.infer<typeof FormSchema>;

interface PrecatoryFormProps {
    redirectOnSuccess?: boolean;
}

export default function PrecatoryForm({ redirectOnSuccess = false }: PrecatoryFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            name: "",
            number: "",
            origin: "",
            document_number: "",
            protocol_date: new Date(),
            proposal_year: "",
            requested_amount: "",
            inclusion_source: "",
            stage: ""
        }
    });

    async function onSubmit(data: FormValues) {
        setIsSubmitting(true);
        try {
            const payload = {
                name: data.name,
                number: data.number,
                origin: data.origin,
                document_number: data.document_number,
                protocol_date: data.protocol_date.toISOString().split('T')[0],
                proposal_year: parseInt(data.proposal_year),
                requested_amount: parseFloat(data.requested_amount),
                inclusion_source: data.inclusion_source,
                stage: data.stage,
            };

            await api.post('/precatories', { record: payload });

            toast.success("Precatório cadastrado com sucesso!");

            if (redirectOnSuccess) {
                router.push("/precatory/list");
            } else {
                form.reset();
            }
        } catch (error) {
            console.error("Error creating precatory:", error);
            toast.error("Erro ao cadastrar precatório");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">


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
                            <FormItem>
                                <FormLabel>Número do Documento</FormLabel>
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
                                <FormLabel>Ano da Proposta</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ""}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o ano" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="2025">2025</SelectItem>
                                        <SelectItem value="2024">2024</SelectItem>
                                        <SelectItem value="2023">2023</SelectItem>
                                        <SelectItem value="2022">2022</SelectItem>
                                        <SelectItem value="2021">2021</SelectItem>
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
                                <FormLabel>Estágio</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ""}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o estágio" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Em andamento">Em andamento</SelectItem>
                                        <SelectItem value="Concluído">Concluído</SelectItem>
                                        <SelectItem value="Cancelado">Cancelado</SelectItem>
                                        <SelectItem value="Pendente">Pendente</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="inclusion_source"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Fonte de Inclusão</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ""}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione a fonte" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="court_order">Ordem Judicial</SelectItem>
                                        <SelectItem value="rpv_conversion">Conversão de RPV</SelectItem>
                                        <SelectItem value="administrative_request">Requisição Administrativa</SelectItem>
                                        <SelectItem value="system_generated">Gerado pelo Sistema</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="requested_amount"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Valor Requerido</FormLabel>
                            <FormControl>
                                <Input placeholder="R$ 0,00" {...field} type="number" step="0.01" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="w-full flex justify-end">
                    <Button
                        type="submit"
                        className="bg-[#1a384c] col-2 w-fit cursor-pointer py-6 font-bold"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Cadastrando..." : "Cadastrar Precatório"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
