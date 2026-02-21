export async function calcularFrete(cepOrigem, cepDestino, produtos) {
  const token = process.env.MELHOR_ENVIO_TOKEN;
  const url = `${process.env.MELHOR_ENVIO_URL}/api/v2/me/shipment/calculate`;

  // Monta o payload com os produtos
  const payload = {
    from: { postal_code: cepOrigem },
    to: { postal_code: cepDestino },
    products: produtos.map(p => ({
      id: p.id,
      quantity: p.quantity,
      width: p.width || 20,      // dimensões em cm (valores padrão se não tiver)
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
    throw new Error(`Erro na API Melhor Envio: ${response.status}`);
  }

  return await response.json(); // Retorna array com opções de frete
}