import { db } from '../config/database.js';

export async function validateCoupon(req, res, next) {
  try {
    const { code, userId } = req.body; // userId para verificar se já usou

    if (!code) {
      return res.status(400).json({ valid: false, message: 'Código não informado' });
    }

    // Buscar cupom no banco
    const [rows] = await db.execute(
      'SELECT * FROM coupons WHERE code = ? AND (expires_at IS NULL OR expires_at > NOW())',
      [code]
    );

    if (rows.length === 0) {
      return res.status(404).json({ valid: false, message: 'Cupom inválido ou expirado' });
    }

    const coupon = rows[0];

    // Verificar se ainda pode ser usado
    if (coupon.used_count >= coupon.max_uses) {
      return res.status(400).json({ valid: false, message: 'Cupom já atingiu o limite de usos' });
    }

    // (Opcional) Verificar se o usuário já usou este cupom
    // Se quiser controlar por usuário, crie uma tabela coupon_uses

    res.json({
      valid: true,
      discount_percent: coupon.discount_percent,
      code: coupon.code
    });

  } catch (err) {
    next(err);
  }
}

// Registrar uso do cupom (chamado após finalizar compra)
export async function useCoupon(req, res, next) {
  try {
    const { code } = req.body;
    await db.execute('UPDATE coupons SET used_count = used_count + 1 WHERE code = ?', [code]);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}