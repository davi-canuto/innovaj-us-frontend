'use server'

import { getToken } from './auth'

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL

export async function downloadQuotationPdf(quotationId: number, precatoryNumber: string): Promise<{ blob: number[]; filename: string }> {
  const token = await getToken()

  const response = await fetch(`${API_URL}/quotations/${quotationId}/pdf`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Erro ao baixar PDF: ${response.status}`)
  }

  const arrayBuffer = await response.arrayBuffer()
  const blob = Array.from(new Uint8Array(arrayBuffer))
  const filename = `cotacao-${precatoryNumber}-${quotationId}.pdf`

  return { blob, filename }
}
