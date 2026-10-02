import 'dotenv/config';
import { readFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { postgresSchemaSQL } from './postgres-schema.js';

export const root = fileURLToPath(new URL('../', import.meta.url));
export async function openDatabase() {
  let pool, sqlite;
  const initializedClients = new WeakSet();
  if (process.env.DATABASE_URL) {
    const connection = new URL(process.env.DATABASE_URL);
    let ssl;
    if (connection.hostname.endsWith('.pooler.supabase.com') && connection.port === '6543') throw new Error('Use o Session pooler do Supabase na porta 5432.');
    if (connection.hostname.endsWith('.supabase.co') || connection.hostname.endsWith('.pooler.supabase.com')) {
      if (connection.searchParams.get('sslmode') === 'disable') throw new Error('A conexão Supabase exige TLS.');
      // pg URI SSL parameters override the ssl object: supply the official CA here.
      connection.searchParams.delete('sslmode');
      ssl = { ca: await readFile(new URL('./certs/supabase-ca.crt', import.meta.url), 'utf8'), rejectUnauthorized: true };
    }
    pool = new pg.Pool({ connectionString: connection.toString(), ...(ssl ? { ssl } : {}), max: 5, connectionTimeoutMillis: 10000, idleTimeoutMillis: 30000, keepAlive: true });
    pool.on('error', error => console.error('Erro em conexão ociosa com o banco:', error.code || 'CONNECTION_ERROR'));
  } else {
    if (process.env.NODE_ENV === 'production') throw new Error('DATABASE_URL é obrigatória em produção.');
    const { DatabaseSync } = await import('node:sqlite');
    const filename = process.env.SQLITE_PATH || path.join(root, 'data/voltz.sqlite');
    await mkdir(path.dirname(filename), { recursive: true });
    sqlite = new DatabaseSync(filename);
    sqlite.exec('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;');
  }
  async function acquireClient() {
    const client = await pool.connect();
    try {
      if (!initializedClients.has(client)) {
        await client.query('SET search_path TO voltz, pg_catalog');
        initializedClients.add(client);
      }
      return client;
    } catch (error) { client.release(); throw error; }
  }
  const db = {
    async query(sql, values = []) {
      if (pool) {
        const client = await acquireClient();
        try {
          return (await client.query(sql, values)).rows;
        } finally { client.release(); }
      }
      // SQLite binds in textual order, including repeated PostgreSQL placeholders.
      const bindings = [];
      const translated = sql.replace(/\$(\d+)/g, (_, index) => { bindings.push(values[Number(index) - 1]); return '?'; });
      const statement = sqlite.prepare(translated);
      if (/^\s*(SELECT|WITH)\b/i.test(sql) || /\bRETURNING\b/i.test(sql)) return statement.all(...bindings);
      statement.run(...bindings);
      return [];
    },
    async transaction(callback) {
      const client = pool ? await acquireClient() : null;
      const execute = client ? async (sql, values = []) => (await client.query(sql, values)).rows : db.query;
      try {
        await execute('BEGIN');
        const result = await callback({ query: execute });
        await execute('COMMIT');
        return result;
      } catch (error) { await execute('ROLLBACK'); throw error; }
      finally { client?.release(); }
    },
    async connectionInfo() {
      if (!pool) return { driver: 'sqlite' };
      const client = await acquireClient();
      try {
        const stream = client.connection.stream;
        return { driver: 'postgres', tls: stream.encrypted === true, certificateVerified: stream.authorized === true };
      } finally { client.release(); }
    },
    async close() { if (pool) await pool.end(); else sqlite.close(); },
  };
  const schema = await readFile(new URL('./schema.sql', import.meta.url), 'utf8');
  if (pool) {
    try { await db.query(await postgresSchemaSQL()); }
    catch (error) { await pool.end(); throw error; }
  } else sqlite.exec(schema);
  return db;
}
