"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { precatoriesService } from "@/services/precatories"

interface PdfUploadButtonProps {
  onSuccess?: () => void
}

export function PdfUploadButton({ onSuccess }: PdfUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      await precatoriesService.parsePdf(file)
      toast.success("Precatório importado com sucesso!")
      onSuccess?.()
    } catch {
      // erro já exibido pelo api.ts via toast
    } finally {
      setIsUploading(false)
      // limpa o input para permitir re-upload do mesmo arquivo
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        variant="outline"
        className="border-[#1a384c] text-[#1a384c] hover:bg-[#1a384c] hover:text-white"
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
      >
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Importando...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Importar PDF
          </>
        )}
      </Button>
    </>
  )
}
