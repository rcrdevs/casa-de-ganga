import { MercadoPagoConfig, Preference } from 'mercadopago';
import { config } from '../config/index.js';

const client = new MercadoPagoConfig({ accessToken: config.mpAccessToken });

export async function createPaymentPreference(preferenceData) {
  try {
    const preference = new Preference(client);
    const result = await preference.create({ body: preferenceData });
    return result;
  } catch (error) {
    console.error('Erro no Mercado Pago:', error);
    throw new Error('Falha ao criar preferência de pagamento');
  }
}