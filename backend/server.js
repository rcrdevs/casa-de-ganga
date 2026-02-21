// backend/server.js
import app from './src/app.js';
import { config } from './src/config/index.js';

app.listen(config.port, () => {
  console.log(`Servidor rodando na porta ${config.port} (${config.nodeEnv})`);
});