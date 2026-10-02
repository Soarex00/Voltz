import 'dotenv/config';
import { openDatabase } from './db.js';
import { seed } from './seed.js';
import { createApp } from './app.js';
const db = await openDatabase();
await seed(db);
const port = Number(process.env.PORT || 3001);
const server = createApp(db).listen(port, () => console.log(`API Voltz: http://localhost:${port}. Acesso local do admin: data/admin-access.txt`));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(async () => { await db.close(); process.exit(0); }));
