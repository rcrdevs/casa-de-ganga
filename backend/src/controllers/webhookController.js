import { db } from '../config/database.js';
import { sendOrderStatusUpdateEmail } from '../services/emailOrderService.js'; // NOVO

export async function mercadopagoWebhook(req, res, next) {
  const paymentId = req.body?.data?.id;
  if (!paymentId) return res.sendStatus(200);

  try {
    // Buscar dados do pagamento na API do MP
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` }
    });
    const paymentData = await response.json();
    
    const orderId = paymentData.external_reference;
    if (!orderId) {
      console.log('Webhook sem external_reference (provavelmente teste)');
      return res.sendStatus(200);
    }

    // Buscar status atual e dados do pedido
    const [orderRows] = await db.execute('SELECT status, user_id FROM orders WHERE id = ?', [orderId]);
    if (orderRows.length === 0) {
      console.log('Pedido não encontrado no webhook:', orderId);
      return res.sendStatus(200);
    }
    const oldStatus = orderRows[0].status;

    const statusMap = {
      approved: 'paid',
      rejected: 'cancelled',
      refunded: 'refunded',
      pending: 'pending'
    };
    const newStatus = statusMap[paymentData.status] || 'pending';

    // Atualizar apenas se o status mudou
    if (oldStatus !== newStatus) {
      await db.execute('UPDATE orders SET status = ? WHERE id = ?', [newStatus, orderId]);

      // Buscar e-mail do usuário para notificação
      const [userRows] = await db.execute('SELECT email FROM users WHERE id = ?', [orderRows[0].user_id]);
      const userEmail = userRows[0]?.email;

      if (userEmail) {
        // Enviar e-mail de atualização (assíncrono, não crítico)
        sendOrderStatusUpdateEmail(userEmail, { id: orderId }, oldStatus, newStatus).catch(err =>
          console.error('Erro ao enviar e-mail de status:', err)
        );
      }

      console.log(`Pedido ${orderId} atualizado: ${oldStatus} -> ${newStatus}`);
    } else {
      console.log(`Pedido ${orderId} status inalterado: ${newStatus}`);
    }
  } catch (err) {
    console.error('Erro no webhook:', err);
  }
  res.sendStatus(200);
}