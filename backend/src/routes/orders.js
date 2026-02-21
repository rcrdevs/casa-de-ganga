import express from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import { createOrder, getOrderStatus, getUserOrders } from '../controllers/orderController.js';
import { body } from 'express-validator';
import { validate } from '../middlewares/validate.js';


const router = express.Router();

router.post('/', authenticateToken, createOrder);
router.get('/meus-pedidos', authenticateToken, getUserOrders);
router.get('/:id/status', authenticateToken, getOrderStatus);

router.post('/',
  authenticateToken,
  [
    body('items').isArray({ min: 1 }).withMessage('Carrinho vazio'),
    body('address.cep')
      .notEmpty().withMessage('CEP obrigatório')
      .matches(/^\d{8}$/).withMessage('CEP deve ter 8 dígitos'),
    body('address.endereco').notEmpty().withMessage('Endereço obrigatório'),
    body('address.numero').notEmpty().withMessage('Número obrigatório')
  ],
  validate,
  createOrder
);


export default router;