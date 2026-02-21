import express from 'express';
const router = express.Router();

router.get('/auth', (req, res) => {
  const authUrl = `https://sandbox.melhorenvio.com.br/oauth/authorize?client_id=${process.env.MELHOR_ENVIO_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.MELHOR_ENVIO_REDIRECT_URI)}&response_type=code&scope=${process.env.MELHOR_ENVIO_SCOPE}`;
  res.redirect(authUrl);
});

export default router;


export async function calcularFrete(cepOrigem, cepDestino, produtos) {
  const token = process.env.MELHOR_ENVIO_TOKEN; // token que você salvou
  const url = `${process.env.MELHOR_ENVIO_URL}/api/v2/me/shipment/calculate`;

  const payload = {
    from: { postal_code: cepOrigem },
    to: { postal_code: cepDestino },
    products: produtos.map(p => ({
      id: p.id,
      quantity: p.quantity,
      width: p.width || 20,      // dimensões em cm (use valores reais do banco se tiver)
      height: p.height || 20,
      length: p.length || 20,
      weight: p.weight || 0.5,    // peso em kg
      insurance_value: p.insurance_value || (p.preco * p.quantity)
    }))
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro na API Melhor Envio (${response.status}): ${errorText}`);
  }

  return await response.json(); // Retorna array com opções de frete
}

router.get('/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.status(400).send('Código não recebido');
  }

  try {
    const response = await fetch('https://sandbox.melhorenvio.com.br/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: process.env.MELHOR_ENVIO_CLIENT_ID,
        client_secret: process.env.MELHOR_ENVIO_CLIENT_SECRET,
        redirect_uri: process.env.MELHOR_ENVIO_REDIRECT_URI,
        code
      })
    });

    const data = await response.json();
    // data.access_token, data.refresh_token, data.expires_in

    // Salve os tokens no banco (associado ao usuário) ou em cache
    // Por enquanto, você pode salvar na sessão ou em variável de ambiente (apenas para teste)

    console.log('Token obtido:', data);

    res.send('Autorizado! Agora você pode fechar esta aba.');
  } catch (error) {
    console.error('Erro ao obter token:', error);
    res.status(500).send('Erro na autenticação');
  }
});