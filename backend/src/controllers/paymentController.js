// backend/src/controllers/paymentController.js
import { db } from '../config/database.js';

export async function createPayment(req, res, next) {
  try {
    const { orderId, paymentMethod, paymentData } = req.body;
    console.log('Recebida requisição de pagamento:', JSON.stringify(req.body, null, 2));

    // Busca o pedido
    const [orders] = await db.execute('SELECT * FROM orders WHERE id = ? AND user_id = ?', [orderId, req.user.id]);
    if (orders.length === 0) {
      return res.status(404).json({ message: 'Pedido não encontrado' });
    }
    const order = orders[0];

    // Garantir que o valor é número
    const amount = Number(order.total_price);
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: 'Valor do pedido inválido' });
    }

    // Verificar se o paymentMethodId foi fornecido
    if (!paymentData.paymentMethodId) {
      return res.status(400).json({ message: 'Método de pagamento não identificado' });
    }

    const mpPayload = {
      transaction_amount: amount,
      token: paymentData.token,
      description: `Pedido #${orderId} - Kripta Haus`,
      installments: paymentData.installments,
      payment_method_id: paymentData.paymentMethodId,
      payer: {
        email: paymentData.payer.email,
        identification: {
          type: paymentData.payer.identification.type,
          number: paymentData.payer.identification.number.replace(/\D/g, ''),
        },
      },
    };

    console.log('Payload para o MP:', JSON.stringify(mpPayload, null, 2));

    const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': orderId,
      },
      body: JSON.stringify(mpPayload),
    });

    const mpResult = await mpResponse.json();
    console.log('Resposta do MP:', JSON.stringify(mpResult, null, 2));

    if (!mpResponse.ok) {
      return res.status(400).json({
        message: mpResult.message || 'Erro no pagamento',
        cause: mpResult.cause,
      });
    }

    if (mpResult.status === 'approved') {
      await db.execute('UPDATE orders SET status = ? WHERE id = ?', ['paid', orderId]);
    }

    res.json({ status: mpResult.status, id: mpResult.id });
  } catch (err) {
    console.error('Erro no paymentController:', err);
    next(err);
  }
}