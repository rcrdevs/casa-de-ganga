import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determina qual arquivo .env carregar baseado no NODE_ENV
const envFile = process.env.NODE_ENV === 'development' 
  ? '.env.production' 
  : '.env.development';

dotenv.config({ path: path.resolve(__dirname, '../../', envFile) });

// Validação das variáveis obrigatórias
const requiredEnv = [
  'JWT_SECRET',
  'DB_PASSWORD',
  'MP_ACCESS_TOKEN',
  'FRONTEND_URL'
];

requiredEnv.forEach(varName => {
  if (!process.env[varName]) {
    throw new Error(`? Variável ${varName} não definida em ${envFile}`);
  }
});

export const config = {
  jwtSecret: process.env.JWT_SECRET,
  dbPassword: process.env.DB_PASSWORD,
  mpAccessToken: process.env.MP_ACCESS_TOKEN,
  frontendUrl: process.env.FRONTEND_URL,
  webhookBaseUrl: process.env.WEBHOOK_BASE_URL || 'http://localhost:4242',
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 4242,
  dbHost: process.env.DB_HOST || 'localhost',
  dbUser: process.env.DB_USER || 'root',
  dbName: process.env.DB_NAME || 'kripta_haus',
  emailHost: process.env.EMAIL_HOST,
  emailPort: process.env.EMAIL_PORT,
  emailUser: process.env.EMAIL_USER,
  emailPass: process.env.EMAIL_PASS,
  emailFrom: process.env.EMAIL_FROM
};

console.log('FRONTEND_URL carregada:', config.frontendUrl);
