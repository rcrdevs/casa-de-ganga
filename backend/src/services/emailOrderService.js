import nodemailer from 'nodemailer';
import { config } from '../config/index.js';

const transporter = nodemailer.createTransport({
  host: config.emailHost,
  port: config.emailPort,
  secure: false,
  auth: {
    user: config.emailUser,
    pass: config.emailPass,
  },
});

/**
 * Envia e-mail de confirmação de pedido
 * @param {string} to - E-mail do cliente
 * @param {object} order - Dados do pedido (deve conter id, total_price, frete, discount_amount, cep, endereco, numero, complemento, cidade_estado, created_at)
 * @param {Array} items - Itens do pedido (cada item: name, price, quantity)
 */
export async function sendOrderConfirmationEmail(to, order, items) {
  const itemsList = items.map(item => 
    `<li>${item.quantity}x ${item.name} - R$ ${(item.price * item.quantity).toFixed(2)}</li>`
  ).join('');

  const total = order.total_price;
  const shipping = order.frete || 0;
  const discount = order.discount_amount || 0;
  const subtotal = total - shipping + discount;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Pedido confirmado - Kripta Haus</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
        h1 { color: #C11820; }
        .order-info { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .items { list-style: none; padding: 0; }
        .items li { padding: 8px 0; border-bottom: 1px solid #eee; }
        .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; }
        .footer { margin-top: 30px; font-size: 12px; color: #777; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>?? Kripta Haus</h1>
        <h2>Seu pedido foi confirmado!</h2>
        <p>Olá, seu pedido #${order.id} foi recebido e está sendo processado.</p>
        
        <div class="order-info">
          <h3>Detalhes do pedido</h3>
          <p><strong>Número do pedido:</strong> #${order.id}</p>
          <p><strong>Data:</strong> ${new Date(order.created_at).toLocaleDateString('pt-BR')}</p>
          <p><strong>Endereço de entrega:</strong> ${order.endereco}, ${order.numero}${order.complemento ? ', ' + order.complemento : ''} - ${order.cidade_estado} - CEP ${order.cep}</p>
        </div>

        <h3>Itens</h3>
        <ul class="items">
          ${itemsList}
        </ul>

        <div class="total">
          <p>Subtotal: R$ ${subtotal.toFixed(2)}</p>
          <p>Frete: R$ ${shipping.toFixed(2)}</p>
          ${discount > 0 ? `<p>Desconto: -R$ ${discount.toFixed(2)}</p>` : ''}
          <p><strong>Total: R$ ${total.toFixed(2)}</strong></p>
        </div>

        <p>Acompanhe o status do seu pedido a qualquer momento fazendo login em nossa loja.</p>
        
        <div class="footer">
          <p>Kripta Haus - Love the Unloved</p>
          <p>Este é um e-mail automático, por favor não responda.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: config.emailFrom,
    to,
    subject: `Pedido #${order.id} confirmado - Kripta Haus`,
    html,
  };

  await transporter.sendMail(mailOptions);
}

/**
 * Envia e-mail de atualização de status do pedido
 * @param {string} to - E-mail do cliente
 * @param {object} order - Dados do pedido (deve conter id)
 * @param {string} oldStatus - Status anterior
 * @param {string} newStatus - Novo status
 */
export async function sendOrderStatusUpdateEmail(to, order, oldStatus, newStatus) {
  const statusMessages = {
    pending: 'Aguardando pagamento',
    paid: 'Pagamento confirmado',
    approved: 'Pagamento confirmado',
    shipped: 'Pedido enviado',
    delivered: 'Pedido entregue',
    cancelled: 'Pedido cancelado',
    refunded: 'Reembolsado',
  };

  const userFriendlyOld = statusMessages[oldStatus] || oldStatus;
  const userFriendlyNew = statusMessages[newStatus] || newStatus;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Status do pedido atualizado - Kripta Haus</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
        h1 { color: #C11820; }
        .status-box { background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center; }
        .new-status { font-size: 24px; font-weight: bold; color: #C11820; margin: 10px 0; }
        .footer { margin-top: 30px; font-size: 12px; color: #777; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>?? Kripta Haus</h1>
        <h2>Atualização do seu pedido #${order.id}</h2>
        
        <div class="status-box">
          <p>Status anterior: <strong>${userFriendlyOld}</strong></p>
          <p>?</p>
          <p class="new-status">${userFriendlyNew}</p>
        </div>

        <p>Acesse sua conta para mais detalhes.</p>
        
        <div class="footer">
          <p>Kripta Haus - Love the Unloved</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: config.emailFrom,
    to,
    subject: `Pedido #${order.id}: ${userFriendlyNew} - Kripta Haus`,
    html,
  };

  await transporter.sendMail(mailOptions);
}