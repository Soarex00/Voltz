// Run the same behavior tests against a real PostgreSQL engine compiled to WASM.
// This verifies SQL compatibility; it does not claim a live cloud deployment.
process.env.TEST_DATABASE_ENGINE = 'postgres';
await import('./app.test.js');
