# InnovaJus — Frontend

Sistema de gestão de precatórios para escritórios de advocacia. Construído em Next.js 16 (App Router) com TypeScript, Tailwind CSS e Shadcn/UI.

## Comandos

```bash
npm run dev    # inicia na porta 8080
npm run build
npm run start
```

## Stack

- **Next.js 16** com App Router e Server Actions
- **TypeScript**, **Tailwind CSS v4**, **Shadcn/UI**
- **TanStack Table** para tabelas
- **React Hook Form + Zod** para formulários
- **Sonner** para toasts
- **Recharts** para gráficos
- Auth via cookies httpOnly; middleware em `src/middleware.ts` protege rotas

## Estrutura principal

```
src/app/(auth)/          → login, signup
src/app/(dashboard)/     → dashboard, precatory, claimant, debtor
src/components/forms/    → formulários (login, signup, precatório, credor, devedor)
src/components/tables/   → DataTable reutilizável + colunas por entidade
src/components/layout/   → sidebar, header, cards do dashboard, gráfico
src/lib/actions/         → Server Actions (auth.ts, dashboard.ts)
src/services/            → clientes da API REST (petitioners, precatories, dependants)
src/utils/types.ts       → tipos TypeScript de todas as entidades
src/utils/masks.ts       → máscaras de CPF, CNPJ, telefone
```

## Variáveis de ambiente

```env
API_URL=http://localhost:3001          # usado pelos Server Actions (server-side)
NEXT_PUBLIC_API_URL=/api-proxy         # usado pelo browser (proxiado pelo next.config.ts)
```

---

## Domínio: O que é um Precatório

Precatório é uma **requisição judicial de pagamento** expedida por um juiz determinando que um ente público (União, Estado ou Município) pague uma dívida decorrente de sentença judicial transitada em julgado. É o mecanismo constitucional (art. 100 da CF) pelo qual o Poder Judiciário cobra do Poder Executivo o cumprimento de condenações.

### Fluxo real de um precatório

1. Cidadão ganha ação judicial contra o governo
2. A sentença transita em julgado (sem mais recursos)
3. O juiz expede o **Ofício Requisitório** ao tribunal (ex: TJRN)
4. O tribunal inclui o precatório no orçamento do ente devedor
5. O ente devedor paga conforme fila orçamentária (pode levar anos)
6. O credor recebe o valor, descontados honorários e impostos

### Exemplo real (DP-PREC-30083 / TJRN)

Este documento do sistema é um precatório real emitido em 06/08/2020 pela **1ª Vara da Fazenda Pública da Comarca de Natal**:

- **Credor (Petitioner):** Pedro Simplicio Neto — CPF 301.020.734-49, nascido em 17/12/1958, servidor público aposentado do Estado do RN desde 02/08/2017
- **Devedor (Defendant):** Estado do Rio Grande do Norte — CNPJ 08.241.739/0001-05
- **Causa:** indenização por demora no processo concessório de aposentadoria e licença-prêmio
- **Processo originário:** 0837552-73.2017.8.20.5001, ajuizado em 22/08/2017
- **Trânsito em julgado:** 05/02/2019

**Composição do valor:**
| Campo | Valor |
|---|---|
| Principal corrigido monetariamente | R$ 87.506,90 |
| Juros aplicados | R$ 1.750,14 |
| Custas/despesas antecipadas | R$ 0,00 |
| **Total do requisitório** | **R$ 89.257,04** |
| Data-base da atualização monetária | 08/02/2019 |

**Retenção (honorários contratuais):** 30% para Holanda & Rego Advogados Associados (CNPJ 22.477.630/0001-94, OAB 511/RN) — ou seja, o credor efetivamente recebe ~R$ 62.479,93.

### Vocabulário do domínio

| Termo jurídico | Sinônimos no sistema | Significado |
|---|---|---|
| Credor | `Petitioner`, exequente, beneficiário | Quem tem direito a receber |
| Devedor | `Defendant`, executado, ente devedor | Governo que deve pagar |
| Precatório | `Precatory` | O documento/processo de cobrança judicial |
| Dependente | `Dependant` | Dependente do credor (herdeiro, cônjuge) — pode ter direito proporcional |
| Trânsito em julgado | `judgment_date` | Data em que a sentença se tornou definitiva |
| Data-base | `base_date_update` | Data de referência para atualização monetária do valor |
| Natureza do crédito | `nature_of_credit` | **Alimentar** (servidores, professores, aposentados — têm prioridade constitucional) ou **Comum** |
| Estágio | `stage` | Em andamento / Finalizado / Cancelado |
| Fonte de inclusão | `inclusion_source` | Como o precatório entrou no sistema |
| RPV | — | Requisição de Pequeno Valor (< teto constitucional); pago antes, fora da fila de precatórios |

### Natureza do crédito — detalhe importante

- **Alimentar:** servidores públicos, professores, aposentados, pensionistas, beneficiários da previdência. Têm **prioridade** na fila de pagamento (art. 100 §1º CF). Idosos acima de 60 anos ou portadores de doença grave dentro dessa categoria recebem com **superprioridade**.
- **Comum:** demais casos (desapropriações, contratos, etc.). Pagos depois dos alimentares.

O exemplo acima (Pedro, aposentado, 66 anos na época) seria **alimentar com superprioridade**, mas foi cadastrado como "Comum / Outros" — isso é um dado que o escritório deve verificar ao cadastrar.

### Fontes de inclusão (`inclusion_source`)

| Valor | Significado |
|---|---|
| `court_order` | Ordem judicial direta (caso típico) |
| `rpv_conversion` | RPV convertida em precatório por superar o teto |
| `administrative_request` | Requisição administrativa (acordos) |
| `system_generated` | Gerado internamente pelo sistema |

### O papel do escritório de advocacia (Organization)

O InnovaJus é usado por **escritórios** que representam credores contra entes públicos. O escritório:
- Cadastra e acompanha seus precatórios
- Gerencia sua carteira de credores (Petitioners) e devedores (Defendants)
- Controla em qual estágio cada precatório está
- Monitora valores e datas para cobrar atualização monetária e juros

Cada `Precatory` pertence a um `User` e a uma `Organization`, e opcionalmente a um `Petitioner` e um `Defendant`.
