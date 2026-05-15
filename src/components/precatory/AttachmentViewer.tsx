"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { PrecatoryAttachment } from "@/utils/types"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? ""

interface AttachmentViewerProps {
  attachment: PrecatoryAttachment | null
  onClose: () => void
}

export function AttachmentViewer({ attachment, onClose }: AttachmentViewerProps) {
  const isOpen = attachment !== null
  const isPdf = attachment?.content_type === "application/pdf"
  const isImage = attachment?.content_type?.startsWith("image/") ?? false
  const src = attachment ? `${API_BASE}${attachment.file_url}` : ""

  return (
    <Dialog open={isOpen} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-w-4xl w-[95vw]">
        <DialogHeader>
          <DialogTitle className="truncate text-[#1a384c]">
            {attachment?.display_name}
          </DialogTitle>
        </DialogHeader>
        <div className="min-h-[200px] flex items-center justify-center">
          {isPdf && (
            <iframe
              src={src}
              className="w-full h-[70vh] rounded"
              title={attachment?.display_name}
            />
          )}
          {isImage && (
            <img
              src={src}
              alt={attachment?.display_name}
              className="max-w-full max-h-[70vh] object-contain rounded"
            />
          )}
          {!isPdf && !isImage && (
            <p className="text-sm text-gray-400">
              Visualização não disponível para este tipo de arquivo.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
