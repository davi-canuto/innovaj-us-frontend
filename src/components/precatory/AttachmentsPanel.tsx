"use client"

import { useEffect, useRef, useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import {
  File,
  FileText,
  FileSpreadsheet,
  Image,
  Pencil,
  Plus,
  Trash2,
  Download,
  Eye,
  X,
  Loader2,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { attachmentsService } from "@/services/attachments"
import { downloadAttachment } from "@/lib/actions/attachments"
import type { PrecatoryAttachment } from "@/utils/types"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? ""

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("pt-BR")
}

function getFileIcon(contentType: string) {
  if (contentType === "application/pdf") return FileText
  if (contentType.startsWith("image/")) return Image
  if (
    contentType.includes("vnd.openxmlformats") ||
    contentType.includes("msword") ||
    contentType.includes("ms-excel") ||
    contentType.includes("spreadsheet")
  )
    return FileSpreadsheet
  return File
}

function canPreview(contentType: string): boolean {
  return contentType === "application/pdf" || contentType.startsWith("image/")
}

interface AttachmentsPanelProps {
  precatoryId: number
  precatoryName: string
  open: boolean
  onClose: () => void
}

export function AttachmentsPanel({ precatoryId, precatoryName, open, onClose }: AttachmentsPanelProps) {
  const [attachments, setAttachments] = useState<PrecatoryAttachment[]>([])
  const [loading, setLoading] = useState(false)

  const [showUploadForm, setShowUploadForm] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [displayName, setDisplayName] = useState("")
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState("")
  const [savingId, setSavingId] = useState<number | null>(null)

  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const [downloadingId, setDownloadingId] = useState<number | null>(null)

  async function loadAttachments() {
    setLoading(true)
    try {
      const data = await attachmentsService.list(precatoryId)
      setAttachments(Array.isArray(data) ? data : [])
    } catch {
      setAttachments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) loadAttachments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, precatoryId])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
    const nameWithoutExt = file.name.replace(/\.[^.]+$/, "")
    setDisplayName(nameWithoutExt)
  }

  async function handleUpload() {
    if (!selectedFile || !displayName.trim()) {
      toast.error("Selecione um arquivo e informe o nome do documento")
      return
    }
    setUploading(true)
    try {
      const created = await attachmentsService.upload(precatoryId, selectedFile, displayName.trim())
      setAttachments((prev) => [created, ...prev])
      toast.success("Anexo enviado!")
      setShowUploadForm(false)
      setSelectedFile(null)
      setDisplayName("")
      if (fileInputRef.current) fileInputRef.current.value = ""
    } catch {
      toast.error("Erro ao enviar anexo")
    } finally {
      setUploading(false)
    }
  }

  function cancelUpload() {
    setShowUploadForm(false)
    setSelectedFile(null)
    setDisplayName("")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  function startEdit(attachment: PrecatoryAttachment) {
    setEditingId(attachment.id)
    setEditName(attachment.display_name)
  }

  async function saveEdit(attachId: number) {
    if (!editName.trim()) {
      toast.error("Nome não pode ser vazio")
      return
    }
    setSavingId(attachId)
    try {
      const updated = await attachmentsService.rename(precatoryId, attachId, editName.trim())
      setAttachments((prev) => prev.map((a) => (a.id === attachId ? updated : a)))
      toast.success("Nome atualizado!")
      setEditingId(null)
    } catch {
      toast.error("Erro ao renomear anexo")
    } finally {
      setSavingId(null)
    }
  }

  async function handleDelete(attachId: number) {
    try {
      await attachmentsService.remove(precatoryId, attachId)
      setAttachments((prev) => prev.filter((a) => a.id !== attachId))
      toast.success("Anexo removido")
    } catch {
      toast.error("Erro ao remover anexo")
    } finally {
      setConfirmDeleteId(null)
    }
  }

  async function handleDownload(attachment: PrecatoryAttachment) {
    setDownloadingId(attachment.id)
    try {
      const { blob, contentType, filename } = await downloadAttachment(
        precatoryId,
        attachment.id,
        attachment.display_name,
      )
      const bytes = Uint8Array.from(atob(blob), (c) => c.charCodeAt(0))
      const blobObj = new Blob([bytes], { type: contentType })
      const url = URL.createObjectURL(blobObj)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error("Erro ao baixar anexo")
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={(o) => { if (!o) onClose() }}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader className="pb-4 border-b">
            <SheetTitle className="text-[#1a384c]">
              Anexos · <span className="font-normal text-gray-500 text-sm">{precatoryName}</span>
            </SheetTitle>
          </SheetHeader>

          <div className="py-4 space-y-4">
            {/* Botão abrir upload */}
            {!showUploadForm && (
              <Button
                size="sm"
                variant="outline"
                className="gap-2"
                onClick={() => setShowUploadForm(true)}
              >
                <Plus className="h-4 w-4" />
                Adicionar Anexo
              </Button>
            )}

            {/* Formulário de upload */}
            {showUploadForm && (
              <div className="border rounded-xl p-4 bg-gray-50 space-y-3">
                <p className="text-sm font-medium text-[#1a384c]">Novo anexo</p>
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 uppercase tracking-wide">Arquivo</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="block w-full text-sm text-gray-600 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-[#1a384c] file:text-white cursor-pointer"
                    onChange={handleFileChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 uppercase tracking-wide">Nome do documento *</label>
                  <Input
                    placeholder="Ex: Ofício Requisitório TJRN"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button size="sm" variant="outline" onClick={cancelUpload}>Cancelar</Button>
                  <Button
                    size="sm"
                    className="bg-[#1a384c] text-white"
                    disabled={uploading || !selectedFile || !displayName.trim()}
                    onClick={handleUpload}
                  >
                    {uploading ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />Enviando...</> : "Enviar"}
                  </Button>
                </div>
              </div>
            )}

            {/* Lista de anexos */}
            {loading ? (
              <p className="text-sm text-gray-400 text-center py-8">Carregando anexos...</p>
            ) : attachments.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Nenhum anexo cadastrado.</p>
            ) : (
              <div className="space-y-3">
                {attachments.map((attachment) => {
                  const Icon = getFileIcon(attachment.content_type)
                  const isEditing = editingId === attachment.id
                  const isSaving = savingId === attachment.id

                  return (
                    <div key={attachment.id} className="border rounded-xl p-4 bg-white space-y-2">
                      <div className="flex items-start gap-3">
                        <Icon className="h-5 w-5 text-[#248A61] mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <Input
                                className="h-7 text-sm"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") saveEdit(attachment.id)
                                  if (e.key === "Escape") setEditingId(null)
                                }}
                                autoFocus
                              />
                              <Button
                                size="sm"
                                className="h-7 px-2 bg-[#1a384c] text-white shrink-0"
                                disabled={isSaving || !editName.trim()}
                                onClick={() => saveEdit(attachment.id)}
                              >
                                {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : "Salvar"}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 shrink-0"
                                onClick={() => setEditingId(null)}
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-[#1a384c] truncate">{attachment.display_name}</p>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-gray-400 hover:text-[#1a384c] shrink-0"
                                onClick={() => startEdit(attachment)}
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                          <p className="text-xs text-gray-400 mt-0.5">
                            {attachment.content_type} · {formatBytes(attachment.byte_size)}
                          </p>
                          <p className="text-xs text-gray-400">{formatDate(attachment.created_at)}</p>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 gap-1 text-xs"
                          onClick={() => window.open(`${API_BASE}${attachment.file_url}`, "_blank")}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Abrir
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 gap-1 text-xs"
                          disabled={downloadingId === attachment.id}
                          onClick={() => handleDownload(attachment)}
                        >
                          {downloadingId === attachment.id
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : <Download className="h-3.5 w-3.5" />
                          }
                          Baixar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 gap-1 text-xs text-red-600 hover:text-red-700 hover:border-red-300"
                          onClick={() => setConfirmDeleteId(attachment.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remover
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Dialog de confirmação de remoção */}
      <Dialog open={confirmDeleteId !== null} onOpenChange={(o) => { if (!o) setConfirmDeleteId(null) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Remover anexo</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">Tem certeza que deseja remover este anexo? Esta ação não pode ser desfeita.</p>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" size="sm" onClick={() => setConfirmDeleteId(null)}>Cancelar</Button>
            <Button
              size="sm"
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => confirmDeleteId !== null && handleDelete(confirmDeleteId)}
            >
              Remover
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </>
  )
}
