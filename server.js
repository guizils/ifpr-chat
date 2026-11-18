import 'dotenv/config';
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const port = process.env.PORT || 3000;
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no arquivo .env');
  process.exit(1);
}
const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(path.dirname(fileURLToPath(import.meta.url)), 'public')));
const validId = x => Number.isSafeInteger(Number(x)) && Number(x) > 0;

app.get('/api/users', async (_req, res) => {
  const { data, error } = await db.from('chat_users').select('id,name').order('id');
  res.status(error ? 500 : 200).json(error ? { error: 'Erro ao carregar usuários' } : data);
});
app.get('/api/messages', async (req, res) => {
  const { me, other } = req.query;
  if (!validId(me) || !validId(other) || Number(me) === Number(other)) return res.status(400).json({ error: 'Usuários inválidos' });
  const a = Number(me), b = Number(other);
  const { data, error } = await db.from('chat_messages')
    .select('id,sender_id,receiver_id,body,created_at')
    .or(`and(sender_id.eq.${a},receiver_id.eq.${b}),and(sender_id.eq.${b},receiver_id.eq.${a})`)
    .order('created_at', { ascending: true }).order('id', { ascending: true }).limit(500);
  res.status(error ? 500 : 200).json(error ? { error: 'Erro ao carregar mensagens' } : data);
});
app.post('/api/messages', async (req, res) => {
  const { sender_id, receiver_id, body } = req.body ?? {};
  if (!validId(sender_id) || !validId(receiver_id) || Number(sender_id) === Number(receiver_id) || typeof body !== 'string' || !body.trim() || body.trim().length > 2000)
    return res.status(400).json({ error: 'Mensagem inválida' });
  const { data: users, error: usersError } = await db.from('chat_users').select('id').in('id', [Number(sender_id), Number(receiver_id)]);
  if (usersError || users?.length !== 2) return res.status(400).json({ error: 'Usuário não encontrado' });
  const { data, error } = await db.from('chat_messages').insert({ sender_id: Number(sender_id), receiver_id: Number(receiver_id), body: body.trim() }).select().single();
  res.status(error ? 500 : 201).json(error ? { error: 'Erro ao enviar mensagem' } : data);
});
app.listen(port, () => console.log(`Chat disponível em http://localhost:${port}`));
