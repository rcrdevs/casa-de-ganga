// backend/src/controllers/shippingController.js

export async function calculateShipping(req, res, next) {
  try {
    const { cepDestino, peso, comprimento, altura, largura } = req.body;

    // --- Validações básicas (já tinhamos) ---
    if (!cepDestino || cepDestino.length !== 8) {
      return res.status(400).json({ message: 'CEP de destino inválido' });
    }

    // --- Configurações da API ---
    const cepOrigem = '01001000'; // Substitua pelo CEP da sua loja!
    const codigoServico = '04014'; // Código do SEDEX (consulte outros códigos no seu contrato)

    // URL do endpoint de PRAZO via GET
    const urlPrazo = `${process.env.CORREIOS_API_URL}/prazo/v1/nacional/${codigoServico}?cepOrigem=${cepOrigem}&cepDestino=${cepDestino}`;

    // URL do endpoint de PREÇO via GET
    const urlPreco = `${process.env.CORREIOS_API_URL}/preco/v1/nacional/${codigoServico}?cepDestino=${cepDestino}&cepOrigem=${cepOrigem}&psObjeto=${peso}&tpObjeto=2&comprimento=${comprimento}&largura=${largura}&altura=${altura}`;

    try {
      // --- Fazer as requisições para PREÇO e PRAZO (de forma paralela) ---
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // Timeout de 5s

      const [resPrazo, resPreco] = await Promise.all([
        fetch(urlPrazo, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${process.env.CORREIOS_TOKEN}`,
            'Accept': 'application/json'
          },
          signal: controller.signal
        }),
        fetch(urlPreco, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${process.env.CORREIOS_TOKEN}`,
            'Accept': 'application/json'
          },
          signal: controller.signal
        })
      ]);

      clearTimeout(timeoutId);

      if (!resPrazo.ok || !resPreco.ok) {
        console.error('Erro na API dos Correios:', await resPrazo.text(), await resPreco.text());
        throw new Error('Falha na consulta à API dos Correios');
      }

      const dataPrazo = await resPrazo.json();
      const dataPreco = await resPreco.json();

      // A estrutura da resposta pode ser algo como { prazoEntrega: 3 } e { pcFinal: "19,92" }
      // **IMPORTANTE:** Você precisa verificar o JSON real retornado para mapear os campos corretamente.
      // Use console.log(dataPrazo, dataPreco) para ver a estrutura.
      const prazo = dataPrazo.prazoEntrega; // Nome do campo pode variar
      const valor = dataPreco.pcFinal; // Nome do campo pode variar

      if (prazo && valor) {
        // Converte o valor (que pode vir como string com vírgula) para número
        const valorNumerico = parseFloat(valor.toString().replace(',', '.'));
        return res.json({ valor: valorNumerico, prazo, origem: 'correios' });
      } else {
        throw new Error('Resposta da API não contém os dados esperados');
      }

    } catch (apiError) {
      console.warn('Falha na API dos Correios, usando fallback:', apiError.message);
      // --- Fallback (igual ao que você já tem) ---
      const shippingPrice = cepDestino.startsWith('0') || cepDestino.startsWith('1') ? 25 : 45;
      const prazo = '15';
      return res.json({ valor: shippingPrice, prazo, origem: 'fallback' });
    }

  } catch (err) {
    next(err);
  }
}