import express from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import { createPayment } from '../controllers/paymentController.js';

const router = express.Router();

router.post('/create', authenticateToken, createPayment);

export default router;