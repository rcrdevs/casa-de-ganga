import { db } from '../config/database.js';
import { createPaymentPreference } from '../services/mercadoPago.js';
import { config } from '../config/index.js';
import { sendOrderConfirmationEmail } from '../services/emailOrderService.js'; // NOVO

// Função auxiliar para sanitização básica
function sanitize(value) {
  if (typeof value !== 'string') return value;
  return value.trim().replace(/[<>\'\";]/g, '');
}

export async function createOrder(req, res, next) {
  const connection = await db.getConnection();
  try {
    const userId = req.user.id;
    let { items, address, couponCode } = req.body;

    // Sanitização adicional
    address = {
      cep: sanitize(address?.cep),
      endereco: sanitize(address?.endereco),
      numero: sanitize(address?.numero),
      complemento: sanitize(address?.complemento),
      cidade_estado: sanitize(address?.cidade_estado)
    };

    // Buscar produtos do banco
    const ids = items.map(i => i.id);
    const placeholders = ids.map(() => '?').join(',');
    const [dbProducts] = await db.query(
      `SELECT id, name, price FROM products WHERE id IN (${placeholders})`,
      ids
    );

    const productMap = {};
    dbProducts.forEach(p => productMap[p.id] = p);

    let totalProdutos = 0;
    const itensMP = [];

    for (const item of items) {
      const prod = productMap[item.id];
      if (!prod) {
        return res.status(400).json({ message: `Produto ${item.id} não encontrado` });
      }
      const price = Number(prod.price);
      if (isNaN(price) || price <= 0) {
        console.error(`Erro de preço no produto ${item.id}:`, prod.price);
        return res.status(400).json({ message: 'Erro no preço do produto' });
      }
      totalProdutos += price * item.quantity;
      itensMP.push({
        title: String(prod.name),
        unit_price: price,
        quantity: Number(item.quantity),
        currency_id: 'BRL'
      });
    }

    // Cálculo do frete (lógica simples)
    const cep = address.cep.replace(/\D/g, '');
    const shippingPrice = cep.startsWith('0') || cep.startsWith('1') ? 25 : 45;

    itensMP.push({
      title: 'Frete',
      unit_price: shippingPrice,
      quantity: 1,
      currency_id: 'BRL'
    });

    let totalFinal = totalProdutos + shippingPrice;
    let discountAmount = 0;

    // Aplicar cupom de desconto se existir
    if (couponCode) {
      const [couponRows] = await db.execute(
        'SELECT discount_percent FROM coupons WHERE code = ? AND used_count < max_uses AND (expires_at IS NULL OR expires_at > NOW())',
        [couponCode]
      );
      if (couponRows.length > 0) {
        const discountPercent = couponRows[0].discount_percent;
        discountAmount = (totalProdutos * discountPercent) / 100;
        totalFinal -= discountAmount;
      }
    }

    await connection.beginTransaction();

    // Inserir pedido
    const [orderResult] = await connection.execute(
      `INSERT INTO orders 
      (user_id, status, total_price, cep, endereco, numero, complemento, cidade_estado, frete, estimativa_envio, discount_amount, coupon_code)
      VALUES (?, 'pending', ?, ?, ?, ?, ?, ?, ?, '15 dias úteis', ?, ?)`,
      [
        userId,
        totalFinal,
        address.cep,
        address.endereco,
        address.numero,
        address.complemento || '',
        address.cidade_estado,
        shippingPrice,
        discountAmount,
        couponCode || null
      ]
    );
    const orderId = orderResult.insertId;

    // Inserir itens
    for (const item of items) {
      const prod = productMap[item.id];
      await connection.execute(
        'INSERT INTO order_items (order_id, product_id, name, price, quantity) VALUES (?, ?, ?, ?, ?)',
        [orderId, prod.id, prod.name, prod.price, item.quantity]
      );
    }

    // Se cupom foi aplicado, incrementar used_count
    if (couponCode && discountAmount > 0) {
      await connection.execute(
        'UPDATE coupons SET used_count = used_count + 1 WHERE code = ?',
        [couponCode]
      );
    }

    // Criar preferência no Mercado Pago
    const mpPreference = {
      items: itensMP,
      external_reference: String(orderId),
      notification_url: `${config.webhookBaseUrl}/webhooks/mercadopago`,
      back_urls: {
        success: `${config.frontendUrl}/success`,
        failure: `${config.frontendUrl}/failure`,
        pending: `${config.frontendUrl}/pending`
      }
    };

    const mpResponse = await createPaymentPreference(mpPreference);

    await connection.execute(
      'UPDATE orders SET mp_preference_id = ?, checkout_url = ? WHERE id = ?',
      [mpResponse.id, mpResponse.init_point, orderId]
    );

    await connection.commit();

    // --- ENVIO DE E-MAIL DE CONFIRMAÇÃO ---
    // Buscar e-mail do usuário (assíncrono, não esperar)
    const [userRows] = await db.execute('SELECT email FROM users WHERE id = ?', [userId]);
    const userEmail = userRows[0]?.email;

    if (userEmail) {
      // Buscar os itens completos para o e-mail (já temos items, mas podemos garantir)
      const orderForEmail = {
        id: orderId,
        total_price: totalFinal,
        frete: shippingPrice,
        discount_amount: discountAmount,
        cep: address.cep,
        endereco: address.endereco,
        numero: address.numero,
        complemento: address.complemento,
        cidade_estado: address.cidade_estado,
        created_at: new Date()
      };
      // items já está no formato correto (cada item tem name, price, quantity)
      sendOrderConfirmationEmail(userEmail, orderForEmail, items).catch(err => 
        console.error('Erro ao enviar e-mail de confirmação:', err)
      );
    }

    res.json({ orderId, init_point: mpResponse.init_point });
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
}

export async function getOrderStatus(req, res, next) {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;
    const [rows] = await db.execute(
      'SELECT status FROM orders WHERE id = ? AND user_id = ?',
      [orderId, userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Pedido não encontrado' });
    }
    res.json({ status: rows[0].status });
  } catch (err) {
    next(err);
  }
}

export async function getUserOrders(req, res, next) {
  try {
    const userId = req.user.id;
    const [pedidos] = await db.execute(
      'SELECT id, total_price, status, checkout_url, created_at, discount_amount, coupon_code FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    res.json(pedidos);
  } catch (err) {
    next(err);
  }
}