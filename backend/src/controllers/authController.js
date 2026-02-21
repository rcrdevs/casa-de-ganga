import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { auth as firebaseAuth } from '../config/firebase-admin.js';
import { db } from '../config/database.js';
import nodemailer from 'nodemailer';

// Configuração do transporte de email
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Função para gerar token de reset (válido por 1 hora)
function generateResetToken(userId) {
  return jwt.sign({ id: userId }, config.jwtSecret, { expiresIn: '1h' });
}

// ==================== EXISTENTES ====================

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Usuário não encontrado' });
    }
    const user = rows[0];
    if (!user.password) {
      return res.status(400).json({ message: 'Este usuário utiliza login social' });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Senha incorreta' });
    }
    await db.execute('DELETE FROM refresh_tokens WHERE user_id = ?', [user.id]);
    const accessToken = jwt.sign({ id: user.id }, config.jwtSecret, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: user.id }, config.jwtSecret, { expiresIn: '7d' });
    await db.execute('INSERT INTO refresh_tokens (user_id, token) VALUES (?, ?)', [user.id, refreshToken]);
    res.json({ accessToken, refreshToken });
  } catch (err) {
    next(err);
  }
}

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const [exists] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (exists.length > 0) {
      return res.status(400).json({ message: 'Email já cadastrado' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashed]
    );
    const userId = result.insertId;
    const accessToken = jwt.sign({ id: userId }, config.jwtSecret, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: userId }, config.jwtSecret, { expiresIn: '7d' });
    await db.execute('INSERT INTO refresh_tokens (user_id, token) VALUES (?, ?)', [userId, refreshToken]);
    res.status(201).json({ accessToken, refreshToken });
  } catch (err) {
    next(err);
  }
}

export async function googleLogin(req, res, next) {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: 'Token não enviado' });
    }
    const decodedToken = await firebaseAuth.verifyIdToken(idToken);
    const { email, name } = decodedToken;
    if (!email) {
      return res.status(400).json({ message: 'Email não encontrado no token' });
    }
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    let userId;
    if (rows.length === 0) {
      const [result] = await db.execute(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        [name || 'Usuário Google', email, null]
      );
      userId = result.insertId;
    } else {
      userId = rows[0].id;
    }
    await db.execute('DELETE FROM refresh_tokens WHERE user_id = ?', [userId]);
    const accessToken = jwt.sign({ id: userId }, config.jwtSecret, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: userId }, config.jwtSecret, { expiresIn: '7d' });
    await db.execute('INSERT INTO refresh_tokens (user_id, token) VALUES (?, ?)', [userId, refreshToken]);
    res.json({ accessToken, refreshToken });
  } catch (err) {
    console.error('Erro no Google login:', err);
    res.status(401).json({ message: 'Token inválido ou expirado' });
  }
}

// ==================== FUNÇÃO REFRESH COM LOGS ====================
export async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    console.log('Refresh token recebido:', refreshToken); // LOG ADICIONADO

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token ausente' });
    }

    const [rows] = await db.execute('SELECT * FROM refresh_tokens WHERE token = ?', [refreshToken]);
    console.log('Token encontrado no banco?', rows.length > 0); // LOG ADICIONADO

    if (rows.length === 0) {
      return res.status(403).json({ message: 'Refresh inválido' });
    }

    const decoded = jwt.verify(refreshToken, config.jwtSecret);
    const newAccessToken = jwt.sign({ id: decoded.id }, config.jwtSecret, { expiresIn: '15m' });
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(403).json({ message: 'Refresh expirado' });
    }
    next(err);
  }
}

// ==================== DEMAIS FUNÇÕES ====================

export async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token necessário' });
    }
    await db.execute('DELETE FROM refresh_tokens WHERE token = ?', [refreshToken]);
    res.json({ message: 'Logout realizado com sucesso' });
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const [users] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.json({ message: 'Se o email existir, enviaremos instruções' });
    }
    const userId = users[0].id;
    const resetToken = generateResetToken(userId);
    const resetLink = `${config.frontendUrl}/reset-password?token=${resetToken}`;
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Kripta Haus" <noreply@kriptahaus.com>',
      to: email,
      subject: 'Recuperação de senha - Kripta Haus',
      html: `
        <p>Você solicitou a redefinição de senha.</p>
        <p>Clique no link abaixo para criar uma nova senha (válido por 1 hora):</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>Se não foi você, ignore este email.</p>
      `,
    };
    await transporter.sendMail(mailOptions);
    res.json({ message: 'Email enviado com sucesso' });
  } catch (err) {
    console.error('Erro em forgotPassword:', err);
    next(err);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { token, newPassword } = req.body;
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwtSecret);
    } catch (err) {
      return res.status(401).json({ message: 'Token inválido ou expirado' });
    }
    const userId = decoded.id;
    const [users] = await db.execute('SELECT id FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);
    // Invalidar todos os refresh tokens do usuário por segurança
    await db.execute('DELETE FROM refresh_tokens WHERE user_id = ?', [userId]);
    res.json({ message: 'Senha redefinida com sucesso' });
  } catch (err) {
    console.error('Erro em resetPassword:', err);
    next(err);
  }
}