import express from 'express';
import { mercadopagoWebhook } from '../controllers/webhookController.js';
// import { verifyMercadoPagoSignature } from '../middlewares/verifyMercadoPagoSignature.js';

const router = express.Router();

router.post('/mercadopago', mercadopagoWebhook);
// router.post('/mercadopago', verifyMercadoPagoSignature, mercadopagoWebhook);

export default router;