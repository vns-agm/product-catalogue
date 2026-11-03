import 'dotenv/config';
import { loadConfig } from './config';
import { buildApp } from './container';

const config = loadConfig();
buildApp(config).listen(config.API_PORT, () => {
  console.info(`API listening on http://localhost:${config.API_PORT} (email: ${config.EMAIL_PROVIDER})`);
});
