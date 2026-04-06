"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { api, ApiValidationError } from "@/services/api";
import { precatoriesService } from "@/services/precatories";
import { petitionersService } from "@/services/petitioners";
import { defendantsService } from "@/services/defendants";
import { useRouter } from "next/navigation";
import { Precatory, Petitioner, Defendant } from "@/utils/types";

const FormSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    number: z.string().min(1, "Número do protocolo é obrigatório"),
    origin: z.string().min(1, "Origem é obrigatória"),
    document_number: z.string().min(1, "Número do documento é obrigatório"),
    protocol_date: z.date().refine((val) => val !== undefined, {
        message: "Data do protocolo é obrigatória",
    }),
    proposal_year: z.string().min(1, "Ano da proposta é obrigatório"),
    requested_amount: z.string().min(1, "Valor requerido é obrigatório"),
    inclusion_source: z.string().min(1, "Fonte de inclusão é obrigatória"),
    stage: z.string().min(1, "Estágio é obrigatório"),
    status: z.string().optional(),
    petitioner_id: z.string().optional(),
    defendant_id: z.string().optional(),
    // Processos
    filing_date: z.date().optional(),
    administrative_process: z.string().optional(),
    pje_process: z.string().optional(),
    // Honorários
    fee_percentage: z.string().optional(),
    has_contract: z.boolean().optional(),
    // RPV
    is_rpv: z.boolean().optional(),
    rpv_amount_cents: z.string().optional(),
    succumbence_fee_cents: z.string().optional(),
    contractual_fee_cents: z.string().optional(),
    // Negociação
    is_negotiated: z.boolean().optional(),
    negotiated_amount_cents: z.string().optional(),
    disbursement_cents: z.string().optional(),
    costs_cents: z.string().optional(),
    payment_forecast_date: z.date().optional(),
    percentage_of_face_value: z.string().optional(),
});

type FormValues = z.infer<typeof FormSchema>;

interface PrecatoryFormProps {
    redirectOnSuccess?: boolean;
    defaultValues?: Precatory;
    onSuccess?: () => void;
}

function centsToString(cents?: number | null): string {
    if (cents == null) return "";
    return (cents / 100).toFixed(2);
}

function stringToCents(value?: string): number | undefined {
    if (!value) return undefined;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? undefined : Math.round(parsed * 100);
}

export default function PrecatoryForm({ redirectOnSuccess = false, defaultValues, onSuccess }: PrecatoryFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [petitioners, setPetitioners] = useState<Petitioner[]>([]);
    const [defendants, setDefendants] = useState<Defendant[]>([]);

    useEffect(() => {
        petitionersService.getAll().then((r) => setPetitioners(Array.isArray(r) ? r : [])).catch(() => {});
        defendantsService.getAll().then((r) => setDefendants(Array.isArray(r) ? r : [])).catch(() => {});
    }, []);

    const form = useForm<FormValues>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            name: defaultValues?.name ?? "",
            number: defaultValues?.number ?? "",
            origin: defaultValues?.origin ?? "",
            document_number: defaultValues?.document_number ?? "",
            protocol_date: defaultValues?.protocol_date ? new Date(defaultValues.protocol_date) : new Date(),
            proposal_year: defaultValues?.proposal_year?.toString() ?? "",
            requested_amount: defaultValues?.requested_amount ? (defaultValues.requested_amount / 100).toFixed(2) : "",
            inclusion_source: defaultValues?.inclusion_source ?? "",
            stage: defaultValues?.stage ?? "",
            status: defaultValues?.status ?? "",
            petitioner_id: defaultValues?.petitioner_id?.toString() ?? "",
            defendant_id: defaultValues?.defendant_id?.toString() ?? "",
            filing_date: defaultValues?.filing_date ? new Date(defaultValues.filing_date) : undefined,
            administrative_process: defaultValues?.administrative_process ?? "",
            pje_process: defaultValues?.pje_process ?? "",
            fee_percentage: defaultValues?.fee_percentage?.toString() ?? "",
            has_contract: defaultValues?.has_contract ?? false,
            is_rpv: defaultValues?.is_rpv ?? false,
            rpv_amount_cents: centsToString(defaultValues?.rpv_amount_cents),
            succumbence_fee_cents: centsToString(defaultValues?.succumbence_fee_cents),
            contractual_fee_cents: centsToString(defaultValues?.contractual_fee_cents),
            is_negotiated: defaultValues?.is_negotiated ?? false,
            negotiated_amount_cents: centsToString(defaultValues?.negotiated_amount_cents),
            disbursement_cents: centsToString(defaultValues?.disbursement_cents),
            costs_cents: centsToString(defaultValues?.costs_cents),
            payment_forecast_date: defaultValues?.payment_forecast_date ? new Date(defaultValues.payment_forecast_date) : undefined,
            percentage_of_face_value: defaultValues?.percentage_of_face_value?.toString() ?? "",
        }
    });

    const isRpv = form.watch("is_rpv");
    const isNegotiated = form.watch("is_negotiated");

    async function onSubmit(data: FormValues) {
        setIsSubmitting(true);
        try {
            const payload: Record<string, unknown> = {
                name: data.name,
                number: data.number,
                origin: data.origin,
                document_number: data.document_number,
                protocol_date: data.protocol_date.toISOString().split('T')[0],
                proposal_year: parseInt(data.proposal_year),
                requested_amount: Math.round(parseFloat(data.requested_amount) * 100),
                inclusion_source: data.inclusion_source,
                stage: data.stage,
                status: data.status || undefined,
                petitioner_id: data.petitioner_id ? parseInt(data.petitioner_id) : undefined,
                defendant_id: data.defendant_id ? parseInt(data.defendant_id) : undefined,
                filing_date: data.filing_date ? data.filing_date.toISOString().split('T')[0] : undefined,
                administrative_process: data.administrative_process || undefined,
                pje_process: data.pje_process || undefined,
                fee_percentage: data.fee_percentage ? parseFloat(data.fee_percentage) : undefined,
                has_contract: data.has_contract,
                is_rpv: data.is_rpv,
                is_negotiated: data.is_negotiated,
            };

            if (data.is_rpv) {
                payload.rpv_amount_cents = stringToCents(data.rpv_amount_cents);
                payload.succumbence_fee_cents = stringToCents(data.succumbence_fee_cents);
                payload.contractual_fee_cents = stringToCents(data.contractual_fee_cents);
            }

            if (data.is_negotiated) {
                payload.negotiated_amount_cents = stringToCents(data.negotiated_amount_cents);
                payload.disbursement_cents = stringToCents(data.disbursement_cents);
                payload.costs_cents = stringToCents(data.costs_cents);
                payload.payment_forecast_date = data.payment_forecast_date
                    ? data.payment_forecast_date.toISOString().split('T')[0]
                    : undefined;
                payload.percentage_of_face_value = data.percentage_of_face_value
                    ? parseFloat(data.percentage_of_face_value)
                    : undefined;
            }

            if (defaultValues?.id) {
                await precatoriesService.update(defaultValues.id, payload as Parameters<typeof precatoriesService.update>[1]);
                toast.success("Precatório atualizado com sucesso!");
                onSuccess?.();
            } else {
                await api.post('/precatories', { record: payload });
                toast.success("Precatório cadastrado com sucesso!");
                if (redirectOnSuccess) {
                    router.push("/precatory/list");
                } else {
                    form.reset();
                    onSuccess?.();
                }
            }
        } catch (error) {
            if (error instanceof ApiValidationError) {
                Object.entries(error.errors).forEach(([field, msgs]) => {
                    form.setError(field as Parameters<typeof form.setError>[0], {
                        message: msgs.join(", "),
                    });
                });
            } else {
                toast.error("Erro ao salvar precatório");
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">

                {/* Identificação */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Identificação</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nome *</FormLabel>
                                <FormControl><Input placeholder="Título do precatório" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="number" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Número do Protocolo *</FormLabel>
                                <FormControl><Input placeholder="000.000.000-00" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="origin" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Origem *</FormLabel>
                                <FormControl><Input placeholder="Origem" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="document_number" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Número do Documento *</FormLabel>
                                <FormControl><Input placeholder="00000" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="administrative_process" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Processo Administrativo</FormLabel>
                                <FormControl><Input placeholder="10630/2023" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="pje_process" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Processo PJE 2º Grau</FormLabel>
                                <FormControl><Input placeholder="08354522420238209500" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                </div>

                <Separator />

                {/* Datas e Estágio */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Datas e Estágio</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField control={form.control} name="protocol_date" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Data do Protocolo *</FormLabel>
                                <FormControl><DatePicker selected={field.value} onSelect={field.onChange} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="filing_date" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Data de Autuação</FormLabel>
                                <FormControl><DatePicker selected={field.value} onSelect={field.onChange} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="proposal_year" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ano da Proposta *</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ""}>
                                    <SelectTrigger><SelectValue placeholder="Selecione o ano" /></SelectTrigger>
                                    <SelectContent>
                                        {[2026, 2025, 2024, 2023, 2022, 2021].map(y => (
                                            <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField control={form.control} name="status" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Status</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ""}>
                                    <SelectTrigger><SelectValue placeholder="Selecione o status" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="em_negociacao">Em Negociação</SelectItem>
                                        <SelectItem value="negociado">Negociado</SelectItem>
                                        <SelectItem value="concluido">Concluído</SelectItem>
                                        <SelectItem value="cancelado">Cancelado</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="stage" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Estágio (legado) *</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ""}>
                                    <SelectTrigger><SelectValue placeholder="Selecione o estágio" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Em negociação">Em negociação</SelectItem>
                                        <SelectItem value="Concluído">Concluído</SelectItem>
                                        <SelectItem value="Cancelado">Cancelado</SelectItem>
                                        <SelectItem value="Pendente">Pendente</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="inclusion_source" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Fonte de Inclusão *</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ""}>
                                    <SelectTrigger><SelectValue placeholder="Selecione a fonte" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="court_order">Ordem Judicial</SelectItem>
                                        <SelectItem value="rpv_conversion">Conversão de RPV</SelectItem>
                                        <SelectItem value="administrative_request">Requisição Administrativa</SelectItem>
                                        <SelectItem value="system_generated">Gerado pelo Sistema</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                </div>

                <Separator />

                {/* Valor e Honorários */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Valor e Honorários</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField control={form.control} name="requested_amount" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Valor Requerido (R$) *</FormLabel>
                                <FormControl><Input placeholder="0,00" {...field} type="number" step="0.01" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="fee_percentage" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Honorários Contratuais (%)</FormLabel>
                                <FormControl><Input placeholder="30" {...field} type="number" step="0.01" min="0" max="100" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="has_contract" render={({ field }) => (
                            <FormItem className="flex flex-col justify-end pb-1">
                                <FormLabel>Contrato</FormLabel>
                                <div className="flex items-center gap-2 h-10">
                                    <FormControl>
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                    <span className="text-sm text-gray-700">Tem contrato assinado</span>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                </div>

                <Separator />

                {/* Partes */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Partes</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="petitioner_id" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Credor</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ""}>
                                    <SelectTrigger><SelectValue placeholder="Selecione o credor" /></SelectTrigger>
                                    <SelectContent>
                                        {petitioners.map((p) => (
                                            <SelectItem key={p.id} value={p.id.toString()}>
                                                {p.company_name || p.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="defendant_id" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Devedor</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ""}>
                                    <SelectTrigger><SelectValue placeholder="Selecione o devedor" /></SelectTrigger>
                                    <SelectContent>
                                        {defendants.map((d) => (
                                            <SelectItem key={d.id} value={d.id.toString()}>
                                                {d.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                </div>

                <Separator />

                {/* RPV */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">RPV</h3>
                        <FormField control={form.control} name="is_rpv" render={({ field }) => (
                            <FormItem className="flex items-center gap-2 m-0">
                                <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <FormLabel className="text-sm text-gray-700 cursor-pointer m-0">Este precatório é uma RPV</FormLabel>
                            </FormItem>
                        )} />
                    </div>
                    {isRpv && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pl-4 border-l-2 border-[#248A61]">
                            <FormField control={form.control} name="rpv_amount_cents" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Valor a Pagar (R$)</FormLabel>
                                    <FormControl><Input placeholder="0,00" {...field} type="number" step="0.01" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="succumbence_fee_cents" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>H. Sucumbência (R$)</FormLabel>
                                    <FormControl><Input placeholder="0,00" {...field} type="number" step="0.01" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="contractual_fee_cents" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>H. Contratuais (R$)</FormLabel>
                                    <FormControl><Input placeholder="0,00" {...field} type="number" step="0.01" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                    )}
                </div>

                <Separator />

                {/* Negociação */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Negociação / Compra</h3>
                        <FormField control={form.control} name="is_negotiated" render={({ field }) => (
                            <FormItem className="flex items-center gap-2 m-0">
                                <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <FormLabel className="text-sm text-gray-700 cursor-pointer m-0">Precatório negociado/comprado</FormLabel>
                            </FormItem>
                        )} />
                    </div>
                    {isNegotiated && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-4 border-l-2 border-[#248A61]">
                            <FormField control={form.control} name="negotiated_amount_cents" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Valor Negociado (R$)</FormLabel>
                                    <FormControl><Input placeholder="0,00" {...field} type="number" step="0.01" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="disbursement_cents" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Desembolso (R$)</FormLabel>
                                    <FormControl><Input placeholder="0,00" {...field} type="number" step="0.01" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="costs_cents" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Custas (R$)</FormLabel>
                                    <FormControl><Input placeholder="0,00" {...field} type="number" step="0.01" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="payment_forecast_date" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Previsão de Pagamento</FormLabel>
                                    <FormControl><DatePicker selected={field.value} onSelect={field.onChange} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="percentage_of_face_value" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>% do Valor Requerido</FormLabel>
                                    <FormControl><Input placeholder="Ex: 40" {...field} type="number" step="0.01" min="0" max="100" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                    )}
                </div>

                <div className="w-full flex justify-end">
                    <Button
                        type="submit"
                        className="bg-[#1a384c] col-2 w-fit cursor-pointer py-6 font-bold"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Salvando..." : defaultValues?.id ? "Salvar alterações" : "Cadastrar Precatório"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
