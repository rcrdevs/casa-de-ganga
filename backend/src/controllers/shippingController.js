import { calcularFrete } from '../services/melhorEnvio.js';

export async function calculateShipping(req, res, next) {
  try {
    const { cepDestino, produtos } = req.body; // produtos vêm do frontend
    const cepOrigem = '01001000'; // Substitua pelo CEP da sua loja (pode ser variável de ambiente)

    if (!produtos || produtos.length === 0) {
      // fallback caso não tenha produtos (não deve ocorrer)
      const fallbackPrice = cepDestino.startsWith('0') || cepDestino.startsWith('1') ? 25 : 45;
      return res.json({ valor: fallbackPrice, prazo: 15, origem: 'fallback' });
    }

    try {
      const opcoesFrete = await calcularFrete(cepOrigem, cepDestino, produtos);

      if (opcoesFrete && opcoesFrete.length > 0) {
        // Exemplo: seleciona a opção mais barata
        const maisBarata = opcoesFrete.reduce((prev, curr) => 
          prev.price < curr.price ? prev : curr
        );
        return res.json({
          valor: maisBarata.price,
          prazo: maisBarata.delivery_time,
          transportadora: maisBarata.company.name,
          origem: 'melhorenvio'
        });
      } else {
        throw new Error('Nenhuma opção de frete retornada');
      }
    } catch (apiError) {
      console.warn('Erro no Melhor Envio, usando fallback:', apiError.message);
      // Fallback por faixa de CEP
      const fallbackPrice = cepDestino.startsWith('0') || cepDestino.startsWith('1') ? 25 : 45;
      return res.json({ valor: fallbackPrice, prazo: 15, origem: 'fallback' });
    }
  } catch (err) {
    next(err);
  }
}