import express from 'express';
import { body } from 'express-validator'; // <-- importação necessária
import { validate } from '../middlewares/validate.js';
import { validateCoupon, useCoupon } from '../controllers/couponController.js';

const router = express.Router();

router.post('/validate',
  [
    body('code').notEmpty().withMessage('Código obrigatório')
  ],
  validate,
  validateCoupon
);

router.post('/use', useCoupon); // se quiser proteger, adicione autenticação

export default router;