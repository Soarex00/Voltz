# Certificado público do Supabase

`supabase-ca.crt` é o certificado público **Supabase Root 2021 CA**, usado para verificar a cadeia de certificados do PostgreSQL/Supavisor. Não é uma chave privada ou um segredo.

Fonte HTTPS: https://supabase-downloads.s3-ap-southeast-1.amazonaws.com/prod/ssl/prod-ca-2021.crt

O endereço é o utilizado pelo [componente SSLConfiguration do dashboard](https://github.com/supabase/supabase/blob/master/apps/studio/components/interfaces/Settings/Database/SSLConfiguration.tsx), definido em [custom-content.json](https://github.com/supabase/supabase/blob/master/apps/studio/hooks/custom-content/custom-content.json). Validade do certificado baixado: 26/04/2031.

O backend fornece esta CA ao cliente `pg` com `rejectUnauthorized: true`. Em uma futura rotação de CA pelo provedor, atualizar o certificado a partir do dashboard/fonte oficial e repetir `npm run db:check`. [Documentação SSL](https://supabase.com/docs/guides/platform/ssl-enforcement).
