import { randomUUID, randomBytes } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { root } from './db.js';
import { hashPassword } from './security.js';

export async function seed(db) {
  let admin = (await db.query('SELECT id FROM admins LIMIT 1'))[0];
  if (!admin) {
    if (process.env.NODE_ENV === 'production' && (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD)) {
      throw new Error('Configure ADMIN_EMAIL e ADMIN_PASSWORD para criar o administrador.');
    }
    const password = process.env.ADMIN_PASSWORD || randomBytes(15).toString('base64url');
    if (password.length < 10) throw new Error('ADMIN_PASSWORD deve ter pelo menos 10 caracteres.');
    const email = (process.env.ADMIN_EMAIL || 'admin@voltz.local').toLowerCase();
    admin = { id: randomUUID() };
    await db.query('INSERT INTO admins (id,nome,email,password_hash,created_at) VALUES ($1,$2,$3,$4,$5)',
      [admin.id, 'Administrador Voltz', email, await hashPassword(password), new Date().toISOString()]);
    if (process.env.NODE_ENV !== 'production') {
      await mkdir(path.join(root, 'data'), { recursive: true });
      await writeFile(path.join(root, 'data/admin-access.txt'), `Acesso administrativo local\nE-mail: ${email}\nSenha: ${password}\nPágina: http://localhost:5173/admin/login\n`, { mode: 0o600 });
    }
  }
  if ((await db.query('SELECT id FROM products LIMIT 1')).length) return;
  const legacy = JSON.parse(await readFile(path.join(root, 'db.json'), 'utf8'));
  const clients = new Map();
  for (const user of legacy.users || []) {
    if (user.isAdmin) continue;
    const email = user.email.toLowerCase().trim();
    let client = (await db.query('SELECT id FROM clients WHERE email=$1', [email]))[0];
    if (!client) {
      client = { id: randomUUID() };
      const { senha, password_hash: _passwordHash, confirmarSenha: _confirmarSenha, isAdmin: _isAdmin, id: _id, ...profile } = user;
      await db.query('INSERT INTO clients (id,nome,email,password_hash,profile,created_at) VALUES ($1,$2,$3,$4,$5,$6)',
        [client.id, user.nome, email, user.password_hash || await hashPassword(senha || randomBytes(24).toString('hex')), JSON.stringify(profile), new Date().toISOString()]);
    }
    clients.set(user.nome, client.id);
  }
  for (const [index, product] of legacy.products.entries()) {
    const id = randomUUID();
    await db.query('INSERT INTO products (id,name,model,image,price,vehicles,description,destaque,admin_id,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',
      [id, product.name, product.model, '/' + product.image.replace(/^\.\//, ''), product.price,
        JSON.stringify(product.vehicles || []), `Consulte os veículos cadastrados e confirme a especificação no manual do fabricante antes da instalação.`, index < 4 ? 1 : 0, admin.id, new Date().toISOString()]);
    for (const review of product.userReviews || []) {
      let clientId = clients.get(review.name);
      if (!clientId) {
        clientId = randomUUID();
        await db.query('INSERT INTO clients (id,nome,email,password_hash,created_at) VALUES ($1,$2,$3,$4,$5)',
          [clientId, review.name || 'Cliente importado', `importado-${clientId}@voltz.invalid`, await hashPassword(randomBytes(24).toString('hex')), review.date || new Date().toISOString()]);
        clients.set(review.name, clientId);
      }
      await db.query('INSERT INTO interactions (id,product_id,client_id,rating,comment,created_at) VALUES ($1,$2,$3,$4,$5,$6)',
        [randomUUID(), id, clientId, review.rating, review.comment, review.date || new Date().toISOString()]);
    }
  }
}
