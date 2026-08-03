import { createApp } from './app.js';
import { env } from './config.js';
import './db.js';

const app = createApp();

app.listen(env.port, env.host, () => {
  console.log(`EyeBox API listening on http://${env.host}:${env.port}`);
  console.log(`Data directory: ${env.dataDir}`);
});
