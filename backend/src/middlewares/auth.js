import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  jwt.verify(token, config.jwtSecret, (err, user) => {
    if (err) {
      // Alterado para warn para não acionar falsos positivos de erro em produção
      console.warn(`Tentativa de acesso com token inválido/expirado: ${err.message}`); 
      return res.status(403).json({ message: 'Token inválido ou expirado' });
    }
    req.user = user;
    next();
  });
}