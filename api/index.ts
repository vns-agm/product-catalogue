// Vercel serverless entry point. Every /api/* request is rewritten here (see vercel.json)
// and handled by the same Express app that runs locally via apps/api/src/server.ts.
import { loadConfig } from '../apps/api/src/config';
import { buildApp } from '../apps/api/src/container';

export default buildApp(loadConfig());
