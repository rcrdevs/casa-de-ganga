// backend/src/config/firebase-admin.js
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminho para o arquivo de credencial (está na raiz do backend)
const serviceAccountPath = path.resolve(__dirname, '../../kripta-efce5-firebase-adminsdk-fbsvc-eb35925f94.json');

if (!fs.existsSync(serviceAccountPath)) {
  throw new Error('Arquivo de credencial do Firebase não encontrado');
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

export const auth = admin.auth();
export default admin;