"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { maskCNPJ } from "@/utils/masks"
import { organizationsService } from "@/services/organizations"
import { Organization } from "@/utils/types"

const FormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  registration_number: z.string().optional(),
})

type FormValues = z.infer<typeof FormSchema>

interface FormOrganizationProps {
  defaultValues?: Organization
  onSuccess?: () => void
}

export default function FormOrganization({ defaultValues, onSuccess }: FormOrganizationProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      registration_number: defaultValues?.registration_number
        ? maskCNPJ(defaultValues.registration_number)
        : "",
    },
  })

  const { isSubmitting } = form.formState

  async function onSubmit(data: FormValues) {
    setErrorMessage(null)

    const payload: Partial<Organization> = {
      name: data.name,
      registration_number: data.registration_number?.replace(/\D/g, "") || undefined,
    }

    try {
      if (defaultValues?.id) {
        await organizationsService.update(defaultValues.id, payload)
        toast.success("Organização atualizada com sucesso!")
      } else {
        await organizationsService.create(payload)
        toast.success("Organização cadastrada com sucesso!")
        form.reset()
      }
      onSuccess?.()
    } catch {
      setErrorMessage("Erro ao salvar organização. Tente novamente.")
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full mt-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome *</FormLabel>
              <FormControl>
                <Input placeholder="Holanda & Rego Advogados Associados" {...field} />
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
              <FormLabel>CNPJ (opcional)</FormLabel>
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
              defaultValues?.id ? "Salvar alterações" : "Cadastrar Organização"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
