import crypto from 'crypto';

export function verifyMercadoPagoSignature(req, res, next) {
  const isDev = process.env.NODE_ENV === 'development';
  const signatureHeader = req.headers['x-signature'];

  console.log('=== Webhook Signature Verification ===');
  console.log('x-signature header:', signatureHeader);

  if (!signatureHeader) {
    if (isDev) {
      console.warn('?? Webhook sem assinatura. Pulando verificação.');
      return next();
    }
    return res.status(401).json({ error: 'Missing signature' });
  }

  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) {
    if (isDev) {
      console.warn('?? MP_WEBHOOK_SECRET não definido. Pulando verificação.');
      return next();
    }
    return res.status(500).json({ error: 'Secret not configured' });
  }

  try {
    // Extrair timestamp e assinatura v1
    const parts = signatureHeader.split(',').reduce((acc, part) => {
      const [key, value] = part.trim().split('=');
      acc[key] = value;
      return acc;
    }, {});

    const ts = parts.ts;
    const receivedSignature = parts.v1;

    console.log('timestamp:', ts);
    console.log('received signature (v1):', receivedSignature);

    // Obter o buffer bruto
    const rawBuffer = req.rawBuffer;
    if (!rawBuffer) {
      console.error('? rawBuffer não definido. Verifique o middleware express.json.');
      return res.status(500).json({ error: 'Raw buffer not captured' });
    }

    // Calcular assinatura esperada sobre o buffer bruto (sem timestamp)
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBuffer)
      .digest('hex');

    console.log('expected signature (body only):', expectedSignature);

    // Se não bater, tenta incluir o timestamp no formato "ts.body"
    if (receivedSignature !== expectedSignature) {
      const dataWithTs = Buffer.from(ts + '.' + rawBuffer.toString());
      const expectedWithTs = crypto
        .createHmac('sha256', secret)
        .update(dataWithTs)
        .digest('hex');
      console.log('expected signature (with ts):', expectedWithTs);

      if (receivedSignature === expectedWithTs) {
        console.log('? Assinatura válida (com timestamp)');
        return next();
      }
    } else {
      console.log('? Assinatura válida (apenas body)');
      return next();
    }

    // Se chegou aqui, nenhuma das assinaturas conferiu
    console.error('? Assinatura inválida');
    return res.status(401).json({ error: 'Invalid signature' });

  } catch (err) {
    console.error('Erro na verificação:', err);
    return res.status(401).json({ error: 'Signature verification failed' });
  }
}