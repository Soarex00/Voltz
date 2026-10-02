import 'dotenv/config';
import { DatabaseSync } from 'node:sqlite';
import { access } from 'node:fs/promises';
import path from 'node:path';
import { openDatabase, root } from '../server/db.js';
import { domainTables } from '../server/postgres-schema.js';

if (!process.env.DATABASE_URL) throw new Error('Configure DATABASE_URL antes de importar.');
const filename = process.env.SQLITE_PATH || path.join(root, 'data/voltz.sqlite');
await access(filename);
const local = new DatabaseSync(filename, { readOnly: true });
const snapshot = Object.fromEntries(domainTables.map(name => [name, local.prepare(`SELECT * FROM ${name}`).all()]));
local.close();
const cloud = await openDatabase();
try {
  await cloud.transaction(async db => {
    for (const name of domainTables) {
      if (Number((await db.query(`SELECT COUNT(*) AS total FROM ${name}`))[0].total)) throw new Error('Importação cancelada: o banco remoto já contém dados.');
    }
    for (const name of domainTables) for (const row of snapshot[name]) {
      const columns = Object.keys(row);
      if (columns.some(column => !/^[a-z_]+$/.test(column))) throw new Error('Coluna inesperada no banco local.');
      await db.query(`INSERT INTO ${name} (${columns.join(',')}) VALUES (${columns.map((_,i) => `$${i+1}`).join(',')})`, Object.values(row));
    }
  });
  console.log('Importação concluída. UUIDs, contas, produtos e avaliações preservados.');
  console.log(Object.fromEntries(domainTables.map(name => [name, snapshot[name].length])));
} finally { await cloud.close(); }
