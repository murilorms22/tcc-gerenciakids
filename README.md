# GerenciaKids 👶 — Sistema de Gestão Escolar Infantil & Conformidade LGPD

Aplicação Full-Stack completa desenvolvida como Trabalho de Conclusão de Curso (TCC) para modernizar a gestão pedagógica, administrativa e o controle de saúde em creches e pré-escolas públicas, com foco em **Segurança da Informação e Conformidade com a LGPD (Art. 14 — Dados Pessoais de Crianças e Dados Sensíveis de Saúde)**.

---

## 🏗️ Arquitetura do Monorepo

```text
tcc-gerenciakids/
├── docker-compose.yaml       # Orquestração MySQL 8.0 (3306) + phpMyAdmin (8080)
├── backend/                  # API RESTful em NestJS 10 + Prisma ORM + MySQL + AES-256-GCM
│   ├── prisma/
│   │   ├── schema.prisma     # Modelagem relacional completa (User, Token, Turma, Responsavel, Aluno, Atividade, Aviso, AuditLog)
│   │   ├── migrations/       # Migration SQL inicial pronta para deploy
│   │   └── seed.ts           # Carga inicial com 4 perfis, turmas, responsáveis e alunos com dados médicos criptografados
│   ├── src/                  # Módulos NestJS, CryptoService (AES-256-GCM), AuthGuard stateful, RolesGuard (RBAC), AuditInterceptor
│   └── test/
│       └── GerenciaKids.postman_collection.json
└── frontend/                 # SPA em React 19 + Vite 7 + Tailwind CSS v4 (Design System Lexend & Laranja #ff7417)
    └── src/                  # Contexto Auth RBAC, Services Axios, Dashboards por perfil, Ficha Médica, Chamada, Agenda, Avisos e Auditoria
```

---

## 🔐 Segurança e Conformidade LGPD Implementadas

1. **Criptografia Simétrica Autenticada (`AES-256-GCM`):** Campos sensíveis de saúde dos alunos (`alergias`, `observacoes`, `tipo_sanguineo`) são criptografados antes de serem persistidos no MySQL no formato `iv:authTag:ciphertext` e descriptografados apenas em memória para usuários autenticados e autorizados.
2. **Autenticação JWT Stateful (`Token` Table):** Cada login gera um JWT com `jti` único registrado na tabela `tokens`, permitindo revogação imediata no `POST /auth/logout`.
3. **Controle de Acesso Baseado em Perfis (RBAC) e Ownership:**
   - `ADMIN` / `DIRECAO`: Gestão completa da escola, turmas, alunos, responsáveis, avisos e acesso exclusivo à trilha de auditoria (`GET /audit-logs`).
   - `PROFESSOR`: Consulta de alunos/fichas médicas, registro de chamada (`PATCH /alunos/:id/chamada`), gestão de atividades da agenda e publicação de avisos. Bloqueado (`403 Forbidden`) em exclusão de alunos e auditoria.
   - `RESPONSAVEL`: Isolamento estrito por vínculo familiar (`userId` vinculado a `Responsavel`) — visualiza apenas os próprios filhos em `GET /alunos` e recebe `403 Forbidden` ao tentar acessar fichas de terceiros ou rotas administrativas.
4. **Prevenção contra Mass Assignment e Política de Senhas:** `ValidationPipe` global com `whitelist: true` e `forbidNonWhitelisted: true`; `POST /auth/register` força o perfil `RESPONSAVEL` e exige senha com no mínimo 8 caracteres contendo letras e números.
5. **Trilha de Auditoria Automática (`AuditInterceptor`):** Registra em `audit_logs` toda leitura individual de ficha médica (`GET /alunos/:id`), criação, edição, chamada e exclusão.

---

## 🚀 Como Executar o Projeto (Passo a Passo)

### 1. Subir o Banco de Dados MySQL 8.0 e phpMyAdmin (Docker)
Na raiz do repositório:
```bash
docker compose up -d
```
- **MySQL 8.0:** `localhost:3306` (usuário: `root` | senha: `root` | banco: `gerenciakids_db`)
- **phpMyAdmin:** `http://localhost:8080`

### 2. Configurar e Iniciar o Back-end (`backend/`)
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
npm run start:dev
```
- **API NestJS:** `http://localhost:3001`

### 3. Configurar e Iniciar o Front-end (`frontend/`)
Em outro terminal:
```bash
cd frontend
npm install
npm run dev
```
- **Aplicação Web React (Vite):** `http://localhost:5173`

---

## 🔑 Credenciais Padrão (Seed)

| Perfil (`Role`) | E-mail | Senha | Permissões Principais |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@escola.com` | `Senha123` | Acesso total + Secretaria + Auditoria LGPD |
| **DIRECAO** | `direcao@escola.com` | `Senha123` | Acesso total + Secretaria + Auditoria LGPD |
| **PROFESSOR** | `professor@escola.com` | `Senha123` | Alunos, Chamada, Agenda e Avisos (sem exclusão/admin) |
| **RESPONSAVEL** | `responsavel@escola.com` | `Senha123` | Visualização restrita aos próprios filhos vinculados |
