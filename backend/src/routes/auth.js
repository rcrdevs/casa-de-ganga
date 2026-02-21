import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middlewares/validate.js';
import { 
  login, 
  register, 
  googleLogin, 
  refresh, 
  logout,
  forgotPassword,
  resetPassword 
} from '../controllers/authController.js';

const router = express.Router();

// Rotas públicas
router.post('/google-login', googleLogin);
router.post('/refresh', refresh);
router.post('/logout', logout);

router.post('/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('Senha obrigatória')
  ],
  validate,
  login
);

router.post('/forgot-password',
  [
    body('email').isEmail().normalizeEmail().withMessage('Email inválido')
  ],
  validate,
  forgotPassword
);

router.post('/reset-password',
  [
    body('token').notEmpty().withMessage('Token obrigatório'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('Senha deve ter no mínimo 8 caracteres')
  ],
  validate,
  resetPassword
);

router.post('/register',
  [
    body('name')
      .trim()
      .isLength({ min: 3 })
      .withMessage('Nome deve ter pelo menos 3 caracteres'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Email inválido'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Senha deve ter no mínimo 8 caracteres')
  ],
  validate,
  register
);

export default router;