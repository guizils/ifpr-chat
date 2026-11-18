# Chat IFPR (demonstração)

## Configuração
1. Crie um projeto no Supabase.
2. Abra **SQL Editor** e execute todo o arquivo `schema.sql`.
3. Copie `.env.example` para `.env` e preencha `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` em **Project Settings → API Keys** (a interface pode variar). **Nunca compartilhe a chave secreta nem a coloque em `public/`.**
4. No terminal, dentro da pasta do projeto, execute `npm install` e `npm run dev`.
5. Acesse `http://localhost:3000`.

Selecione Guilherme, envie uma mensagem para João e depois alterne para João para responder. É possível abrir duas abas e escolher um usuário em cada uma. A sincronização é feita por consultas a cada 1,5 segundo, sem depender de configuração do Supabase Realtime.

## Limitações
Projeto de demonstração **sem autenticação**: qualquer visitante que consiga acessar a API pode se passar por qualquer usuário e ler mensagens. Não exponha o servidor à internet. A chave `service_role` é usada exclusivamente no servidor, nunca no navegador. Para produção, adicione Supabase Auth, RLS e autorização por usuário.
