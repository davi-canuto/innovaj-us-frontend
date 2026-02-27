"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
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
import { maskCNPJ, maskPhone } from "@/utils/masks";
import { defendantsService } from "@/services/defendants";
import { Defendant } from "@/utils/types";

const FormSchema = z.object({
    entity_type: z.string().min(1, "Selecione o tipo"),
    name: z.string().min(1, "Razão social é obrigatória"),
    registration_number: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    code: z.string().optional(),
});

type FormValues = z.infer<typeof FormSchema>;

interface FormDebtorProps {
    defaultValues?: Defendant;
    onSuccess?: () => void;
}

export default function FormDebtor({ defaultValues, onSuccess }: FormDebtorProps) {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            entity_type: defaultValues?.entity_type ?? "",
            name: defaultValues?.name ?? "",
            registration_number: defaultValues?.registration_number
                ? maskCNPJ(defaultValues.registration_number)
                : "",
            phone: defaultValues?.phone ? maskPhone(defaultValues.phone) : "",
            email: defaultValues?.email ?? "",
            code: defaultValues?.code ?? "",
        },
    });

    const { isSubmitting } = form.formState;

    async function onSubmit(data: FormValues) {
        setErrorMessage(null);

        const payload: Partial<Defendant> = {
            entity_type: data.entity_type,
            name: data.name,
            registration_number: data.registration_number?.replace(/\D/g, "") || undefined,
            phone: data.phone?.replace(/\D/g, "") || undefined,
            email: data.email || undefined,
            code: data.code || undefined,
        };

        try {
            let result;
            if (defaultValues?.id) {
                result = await defendantsService.update(defaultValues.id, payload);
            } else {
                result = await defendantsService.create(payload);
            }

            if (result?.error) {
                setErrorMessage(result.error);
                return;
            }

            toast.success(defaultValues?.id ? "Devedor atualizado com sucesso!" : "Devedor cadastrado com sucesso!");
            form.reset();
            onSuccess?.();
        } catch {
            setErrorMessage("Erro ao salvar devedor. Tente novamente.");
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full mt-8">

                <FormField
                    control={form.control}
                    name="entity_type"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tipo do Devedor</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PF">Pessoa Física</SelectItem>
                                    <SelectItem value="PJ">Pessoa Jurídica</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Razão Social / Nome</FormLabel>
                            <FormControl>
                                <Input placeholder="Estado do Rio Grande do Norte" {...field} />
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
                                    <Input
                                        placeholder="00.000.000/0000-00"
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
                        name="code"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Código interno (opcional)</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ex: RN-001" {...field} />
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
                                    <Input
                                        placeholder="(DDD) 99999-9999"
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
                                    <Input placeholder="email@exemplo.com" type="email" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {errorMessage && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                        {errorMessage}
                    </p>
                )}

                <div className="w-full flex justify-end">
                    <Button
                        type="submit"
                        className="bg-[#1a384c] w-fit cursor-pointer py-6 font-bold"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Salvando...
                            </>
                        ) : (
                            defaultValues?.id ? "Salvar alterações" : "Cadastrar Devedor"
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
