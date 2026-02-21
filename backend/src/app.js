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

// Segurança
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'", 
        "https://apis.google.com",
        "https://*.firebaseapp.com",
        "https://http2.mlstatic.com",      // domínio dos bricks
        "https://api.mercadopago.com",     // api do MP
        "https://www.mercadopago.com.br",  // checkout
        ...(config.nodeEnv === 'development' ? ["'unsafe-eval'"] : [])
      ],
      connectSrc: [
        "'self'",
        config.frontendUrl,
        "https://identitytoolkit.googleapis.com",
        "https://securetoken.googleapis.com",
        "https://api.mercadopago.com",      // para requisições da SDK
        "https://api.mercadolibre.com"      // para tracks (opcional)
      ],
      frameSrc: [
        "'self'", 
        "https://*.firebaseapp.com",
        "https://www.mercadopago.com.br"    // para iframes do checkout
      ],
      imgSrc: [
        "'self'", 
        "data:", 
        "https:", 
        "https://*.googleusercontent.com",
        "https://http2.mlstatic.com"        // imagens dos métodos
      ],
      // Em produção, idealmente remover 'unsafe-inline' usando nonces, mas manteremos por enquanto
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:", "https://*.googleusercontent.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: [
        "'self'",
        config.frontendUrl,
        "https://identitytoolkit.googleapis.com",
        "https://securetoken.googleapis.com"
      ],
      frameSrc: ["'self'", "https://*.firebaseapp.com"]
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
    req.rawBuffer = buf; // guarda o buffer bruto para verificação de webhook
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
  res.send('Backend Kripta Haus');
});

// Middleware de erro (deve ser o último)
app.use(errorHandler);

export default app;