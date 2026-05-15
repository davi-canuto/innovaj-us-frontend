'use server'

import { getToken } from './auth'

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL

export async function downloadAttachment(
  precatoryId: number,
  attachId: number,
  displayName: string,
): Promise<{ blob: string; contentType: string; filename: string }> {
  const token = await getToken()

  const response = await fetch(
    `${API_URL}/precatories/${precatoryId}/attachments/${attachId}/file?download=true`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    },
  )

  if (!response.ok) {
    throw new Error(`Erro ao baixar anexo: ${response.status}`)
  }

  const contentType = response.headers.get('content-type') ?? 'application/octet-stream'
  const arrayBuffer = await response.arrayBuffer()
  const blob = Buffer.from(arrayBuffer).toString('base64')

  return { blob, contentType, filename: displayName }
}
