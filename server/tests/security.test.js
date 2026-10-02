import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PGlite } from '@electric-sql/pglite';
import { postgresSchemaSQL, domainTables } from '../postgres-schema.js';
test('schema privado com RLS bloqueia leitura da Data API, inclusive após concessão acidental', async () => {
  const db = new PGlite();
  try {
    await db.exec('CREATE ROLE anon; CREATE ROLE authenticated;');
    await db.exec(await postgresSchemaSQL());
    for (const name of domainTables) {
      const { rows } = await db.query("SELECT relrowsecurity AS rls,has_table_privilege('anon',oid,'SELECT') AS anon_read FROM pg_class WHERE oid=$1::regclass", [`voltz.${name}`]);
      assert.equal(rows[0].rls,true); assert.equal(rows[0].anon_read,false);
    }
    await db.exec("INSERT INTO voltz.clients (id,nome,email,password_hash,created_at) VALUES ('test','Teste','test@voltz.invalid','hash','2026-10-02'); GRANT USAGE ON SCHEMA voltz TO anon; GRANT SELECT ON voltz.clients TO anon; SET ROLE anon;");
    assert.equal((await db.query('SELECT * FROM voltz.clients')).rows.length,0);
  } finally { await db.close(); }
});
