// backend/src/app.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/index.js';
import { errorHandler } from './middlewares/errorHandler.js';

// Importar rotas
import authRoutes from './routes/auth.js';
import orderRoutes from './routes/orders.js';
import webhookRoutes from './routes/webhook.js';
import couponRoutes from './routes/coupon.js';
import shippingRoutes from './routes/shipping.js';
import melhorEnvioRoutes from './routes/melhorEnvio.js';
import paymentRoutes from './routes/payment.js';

const app = express();

// Segurança - Corrigido problema de chaves duplicadas no CSP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'", 
        "https://apis.google.com",
        "https://*.firebaseapp.com",
        "https://http2.mlstatic.com",
        "https://api.mercadopago.com",
        "https://www.mercadopago.com.br",
        ...(config.nodeEnv === 'development' ? ["'unsafe-eval'"] : [])
      ],
      connectSrc: [
        "'self'",
        config.frontendUrl,
        "https://identitytoolkit.googleapis.com",
        "https://securetoken.googleapis.com",
        "https://api.mercadopago.com",
        "https://api.mercadolibre.com"
      ],
      frameSrc: [
        "'self'", 
        "https://*.firebaseapp.com",
        "https://www.mercadopago.com.br"
      ],
      imgSrc: [
        "'self'", 
        "data:", 
        "https:", 
        "https://*.googleusercontent.com",
        "https://http2.mlstatic.com"
      ],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
}));

// Rate limiting global
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Muitas requisições. Tente novamente mais tarde.'
}));

// CORS
app.use(cors({
  origin: config.nodeEnv === 'production' 
    ? [config.frontendUrl] 
    : ['http://localhost:5173', 'http://localhost:5174']
}));

app.set('trust proxy', 1); 

app.use(express.json({
  limit: '1mb',
  verify: (req, res, buf) => {
    req.rawBuffer = buf; // Guarda o buffer bruto para verificação do webhook do Mercado Pago
  }
}));

// Rotas
app.use('/auth', authRoutes);
app.use('/orders', orderRoutes);
app.use('/webhooks', webhookRoutes);
app.use('/coupons', couponRoutes);
app.use('/shipping', shippingRoutes);
app.use('/auth/melhor-envio', melhorEnvioRoutes);
app.use('/payments', paymentRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.send('Backend Casa de Ganga');
});

// Middleware de erro (deve ser o último)
app.use(errorHandler);

export default app;