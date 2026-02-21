import express from 'express';
import { calculateShipping } from '../controllers/shippingController.js';

const router = express.Router();

router.post('/calculate', calculateShipping);

export default router;