import { readFile, writeFile } from 'node:fs/promises';
import { hashPassword } from '../server/security.js';
const file = new URL('../db.json', import.meta.url);
const seed = JSON.parse(await readFile(file, 'utf8'));
for (const user of seed.users || []) {
  if (user.senha) user.password_hash = await hashPassword(user.senha);
  delete user.senha;
  delete user.confirmarSenha;
}
await writeFile(file, JSON.stringify(seed, null, 2) + '\n');
console.log('Dados iniciais atualizados: senhas em hash, sem alterar as credenciais existentes.');
