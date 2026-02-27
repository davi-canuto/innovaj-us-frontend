# InnovaJus Frontend — Tarefas MVP

Checklist completo do que falta implementar para o frontend funcionar 100%.
Marcar com [x] conforme for concluindo.

---

## Bloco 1 — Devedores (CRUD completo)

- [x] **1.1** Criar `src/services/defendants.ts` com CRUD completo (getAll, getById, create, update, delete) — seguir padrão de `petitioners.ts`, endpoint base `/defendants`
- [x] **1.2** Corrigir `src/components/forms/form-debtor.tsx`:
  - Substituir `console.log` por `defendantsService.create(data)`
  - Adicionar `isPending` no botão ("Salvando..." + disabled)
  - Adicionar mensagem de erro inline (igual ao `form-login.tsx`)
  - Remover `useState` importado sem uso
  - Aceitar props `defaultValues` e `onSuccess` para reutilizar no modal de edição
- [x] **1.3** Criar `src/components/tables/columns/defendant.tsx` — colunas: nome, CNPJ, e-mail, ações (editar/excluir); excluir via `defendantsService.delete(id)`; editar chama `onEdit(row.original)`
- [x] **1.4** Criar `src/app/(dashboard)/debtor/list/page.tsx` — Server Component que faz GET `/defendants`, renderiza DataTable com colunas de devedor; botão "Novo Devedor" abre AppDialog com FormDebtor
- [x] **1.5** Criar `src/app/(dashboard)/debtor/new/page.tsx` — mover conteúdo de `/debtor/page.tsx` para cá
- [x] **1.6** Deletar `src/app/(dashboard)/debtor/page.tsx` (substituído pelo 1.5)
- [x] **1.7** Atualizar `src/components/layout/app-sidebar.tsx` — adicionar sub-itens em "Devedores":
  - Listar Devedores → `/debtor/list`
  - Novo Devedor → `/debtor/new`

---

## Bloco 2 — Edição (modal) para Credores, Precatórios e Devedores

- [x] **2.1** Modificar `src/components/forms/form-petitioner.tsx`:
  - Adicionar props `defaultValues?: Petitioner` e `onSuccess?: () => void`
  - Quando `defaultValues.id` existir, chamar `petitionersService.update(id, data)` em vez de `create`
  - Pré-preencher o formulário com `defaultValues`
- [x] **2.2** Modificar `src/app/(dashboard)/claimant/list/page.tsx`:
  - Converter para Client Component
  - Adicionar estado `editingPetitioner`
  - Passar `onEdit` para as colunas
  - Renderizar `AppDialog` com `FormPetitioner` pré-preenchido quando `editingPetitioner !== null`
- [x] **2.3** Modificar `src/components/tables/columns/petitioner.tsx`:
  - Receber `onEdit` como parâmetro
  - Ligar botão "Editar" ao `onEdit(row.original)`
- [x] **2.4** Modificar `src/components/forms/precatory.tsx`:
  - Adicionar props `defaultValues?: Precatory` e `onSuccess?: () => void`
  - Quando `defaultValues.id` existir, chamar `precatoriesService.update(id, data)`
  - Pré-preencher o formulário com `defaultValues`
- [x] **2.5** Modificar `src/app/(dashboard)/precatory/list/page.tsx`:
  - Converter para Client Component
  - Adicionar estado `editingPrecatory`
  - Passar `onEdit` para as colunas
  - Renderizar `AppDialog` com `PrecatoryForm` pré-preenchido quando `editingPrecatory !== null`
- [x] **2.6** Modificar `src/components/tables/columns/precatory.tsx`:
  - Receber `onEdit` como parâmetro
  - Ligar botão "Editar" ao `onEdit(row.original)`
- [x] **2.7** Edição de Devedores — já coberta no passo 1.4 (list page com edit modal)

---

## Bloco 3 — Vincular Credor e Devedor no formulário de Precatório

- [x] **3.1** Modificar `src/components/forms/precatory.tsx`:
  - Buscar lista de credores (`petitionersService.getAll()`) e devedores (`defendantsService.getAll()`) no mount
  - Adicionar campo `<Select>` para `petitioner_id` (exibir nome/CPF)
  - Adicionar campo `<Select>` para `defendant_id` (exibir nome/CNPJ)
  - Incluir `petitioner_id` e `defendant_id` no payload de criação/edição

---

## Bloco 4 — Dashboard (métricas e gráfico)

- [x] **4.1** Corrigir `src/lib/actions/dashboard.ts`:
  - Fazer uma única chamada GET `/precatories` e reutilizar para `getDashboardStats` e `getChartData`
  - Implementar `desembolsado30Dias`: filtrar precatórios com stage finalizado E `updated_at` nos últimos 30 dias, somar `requested_amount`
- [x] **4.2** Corrigir `src/components/layout/dashboard-chart.tsx`:
  - Substituir "January - June 2024" pelo período real dos dados (mais antigo → hoje)
  - Substituir "Visitors" por "Precatórios"
  - Substituir "2023" hardcoded por ano dinâmico

---

## Bloco 5 — Correções de inconsistências

- [x] **5.1** Corrigir deleção nas colunas (inconsistência de URL):
  - `src/components/tables/columns/precatory.tsx`: substituir `fetch('/api/precatories/{id}')` por `precatoriesService.delete(id)`
  - `src/components/tables/columns/petitioner.tsx`: substituir `fetch('/api/petitioners/{id}')` por `petitionersService.delete(id)`

---

## Fora do escopo deste MVP (deixar para depois)

- Paginação da API (backend e frontend)
- Skeletons de loading nas tabelas
- Estado de lista vazia com mensagem específica
- Remover `console.log` de debug do `api.ts`
- Remover `src/lib/auth.ts` (localStorage — conflita com cookies)
- Pastas vazias: `src/contexts/`, `src/domains/`, `src/shared/`
- Migrar `middleware.ts` para `proxy.ts` (aviso do Next.js 16)

---

## Referências rápidas

- Padrão de serviço: `src/services/petitioners.ts`
- Padrão de colunas: `src/components/tables/columns/petitioner.tsx`
- Padrão de lista page: `src/app/(dashboard)/claimant/list/page.tsx`
- Padrão de formulário: `src/components/forms/form-petitioner.tsx`
- Padrão de erro inline: `src/components/forms/form-login.tsx`
- Cliente HTTP: `src/services/api.ts` (usa `NEXT_PUBLIC_API_URL`)
- Auth server-side: `src/lib/actions/auth.ts` (usa `API_URL`)
