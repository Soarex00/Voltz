import { readFile } from 'node:fs/promises';
export const domainTables = ['admins', 'clients', 'products', 'interactions', 'sessions'];
export async function postgresSchemaSQL() {
  const schema = await readFile(new URL('./schema.sql', import.meta.url), 'utf8');
  // Qualify identifiers in our fixed schema file, never in queries supplied by users.
  const qualified = schema.replace(/\b(admins|clients|products|interactions|sessions)\b/g, name => `voltz.${name}`);
  return `CREATE SCHEMA IF NOT EXISTS voltz;
REVOKE ALL ON SCHEMA voltz FROM PUBLIC;
${qualified}
${domainTables.map(name => `ALTER TABLE voltz.${name} ENABLE ROW LEVEL SECURITY;\nREVOKE ALL ON TABLE voltz.${name} FROM PUBLIC;`).join('\n')}
DO $$
DECLARE role_name TEXT;
BEGIN
  FOREACH role_name IN ARRAY ARRAY['anon','authenticated'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname=role_name) THEN
      EXECUTE format('REVOKE ALL ON SCHEMA voltz FROM %I', role_name);
      EXECUTE format('REVOKE ALL ON ALL TABLES IN SCHEMA voltz FROM %I', role_name);
    END IF;
  END LOOP;
END $$;
`;
}
