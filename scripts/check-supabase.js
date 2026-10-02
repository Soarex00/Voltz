import 'dotenv/config';
import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import { openDatabase } from '../server/db.js';
import { createApp } from '../server/app.js';
import { hashToken } from '../server/security.js';

if (!process.env.DATABASE_URL) throw new Error('Configure DATABASE_URL para verificar o Supabase.');
const db = await openDatabase();
const rollback = new Error('ROLLBACK_TEST_ONLY');
try {
  // pg_stat_ssl describes the pooler's upstream socket; inspect our TLS socket instead.
  const connection = await db.connectionInfo();
  assert.equal(connection.tls, true);
  assert.equal(connection.certificateVerified, true);
  try {
    await db.transaction(async transaction => {
      const admin = (await transaction.query('SELECT id FROM admins LIMIT 1'))[0];
      assert.ok(admin, 'Importe ou inicialize o banco primeiro.');
      const adminToken = randomBytes(32).toString('hex');
      await transaction.query('INSERT INTO sessions (token_hash,admin_id,expires_at) VALUES ($1,$2,$3)', [hashToken(adminToken),admin.id,new Date(Date.now()+60000).toISOString()]);
      const server = createApp(transaction, { aiKey: '' }).listen(0,'127.0.0.1');
      await new Promise(resolve => server.once('listening',resolve));
      const base = `http://127.0.0.1:${server.address().port}`;
      const request = async (route, method = 'GET', body, token) => {
        const res = await fetch(base+route,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},...(body?{body:JSON.stringify(body)}:{})});
        return {status:res.status,data:res.status===204?null:await res.json()};
      };
      try {
        const credentials = {nome:'Cliente de verificação temporário',email:`check-${randomUUID()}@voltz.invalid`,senha:randomBytes(20).toString('base64url')};
        assert.equal((await request('/auth/register','POST',credentials)).status,201);
        const client = await request('/auth/login','POST',credentials); assert.equal(client.status,200);
        const products = await request('/products'); assert.ok(products.data.length);
        assert.equal((await request('/admin/dashboard','GET',undefined,client.data.token)).status,403);
        const review = await request(`/products/${products.data[0].id}/interactions`,'POST',{rating:5,comment:'Verificação temporária de integração.'},client.data.token); assert.equal(review.status,201);
        assert.equal((await request(`/admin/interactions/${review.data.id}/reply`,'PUT',{reply:'Resposta temporária de integração.'},adminToken)).status,200);
        const mine = await request('/interactions/mine','GET',undefined,client.data.token); assert.equal(mine.data[0].reply,'Resposta temporária de integração.');
        assert.equal((await request('/admin/dashboard','GET',undefined,adminToken)).status,200);
        assert.equal((await request('/auth/logout','POST',undefined,client.data.token)).status,204);
        assert.equal((await request('/auth/me','GET',undefined,client.data.token)).status,401);
        console.log('Supabase: TLS validado, cadastro/login, permissões, avaliação, resposta, dashboard e logout verificados.');
      } finally { await new Promise(resolve => server.close(resolve)); }
      // Roll back all temporary writes, even when every check succeeds.
      throw rollback;
    });
  } catch (error) { if (error !== rollback) throw error; }
  console.log('Todos os dados temporários foram revertidos.');
} finally { await db.close(); }
