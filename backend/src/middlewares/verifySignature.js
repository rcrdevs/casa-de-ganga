import crypto from 'crypto';

export function verifyMercadoPagoSignature(req, res, next) {
  const signature = req.headers['x-signature'];
  const requestBody = JSON.stringify(req.body);
  
  if (!signature) {
    return res.status(401).json({ error: 'Assinatura ausente' });
  }

  try {
    // Implementar lógica de verificação conforme documentação do MP
    // Exemplo simplificado (não funcional sem a chave correta)
    // const expectedSignature = crypto
    //   .createHmac('sha256', process.env.MP_WEBHOOK_SECRET)
    //   .update(requestBody)
    //   .digest('hex');
    // if (signature !== expectedSignature) {
    //   return res.status(401).json({ error: 'Assinatura inválida' });
    // }
    next();
  } catch (err) {
    res.status(401).json({ error: 'Assinatura inválida' });
  }
}