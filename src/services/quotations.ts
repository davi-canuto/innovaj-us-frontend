import { Precatory, Quotation, QuotationRange } from '@/utils/types'

// Tabela de faixas de porcentagem por ano relativo
// offset 0 (ano atual)  → 50%, 55%, 60%
// offset 1              → 40%, 45%, 50%
// offset 2              → 30%, 35%, 40%
// offset 3+             → 25%, 30%, 35%
const PERCENTAGE_TABLE: Record<number, [number, number, number]> = {
  0: [50, 55, 60],
  1: [40, 45, 50],
  2: [30, 35, 40],
}
const FALLBACK_PERCENTAGES: [number, number, number] = [25, 30, 35]

export function getPercentagesForYear(paymentYear: number): [number, number, number] {
  const currentYear = new Date().getFullYear()
  const offset = paymentYear - currentYear
  if (offset <= 0) return PERCENTAGE_TABLE[0]
  return PERCENTAGE_TABLE[offset] ?? FALLBACK_PERCENTAGES
}

export function buildQuotation(precatory: Precatory): Quotation {
  const currentYear = new Date().getFullYear()
  const faceValue = precatory.requested_amount ?? 0

  const ranges: QuotationRange[] = [0, 1, 2, 3].map((offset) => {
    const year = currentYear + offset
    const percentages = offset <= 0
      ? PERCENTAGE_TABLE[0]
      : (PERCENTAGE_TABLE[offset] ?? FALLBACK_PERCENTAGES)

    const values: [number, number, number] = [
      Math.round(faceValue * percentages[0] / 100),
      Math.round(faceValue * percentages[1] / 100),
      Math.round(faceValue * percentages[2] / 100),
    ]

    return {
      year,
      label: year.toString(),
      percentages,
      values,
    }
  })

  return {
    precatory_id: precatory.id,
    precatory_name: precatory.name,
    precatory_number: precatory.number,
    face_value_cents: faceValue,
    petitioner_name: precatory.petitioner?.name,
    defendant_name: precatory.defendant?.name,
    payment_forecast_year: precatory.payment_forecast_year
      ?? (precatory.payment_forecast_date ? new Date(precatory.payment_forecast_date).getFullYear() : undefined),
    ranges,
  }
}
