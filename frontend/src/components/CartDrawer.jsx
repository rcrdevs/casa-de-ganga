import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '../hooks/useToast';

export const CartDrawer = ({
  isOpen,
  onClose,
  cart,
  addToCart,
  removeFromCart,
  shippingData,
  setShippingData,
  shippingPrice,
  setShippingPrice,
  subtotal,
  handleCheckout,
  isDark,
  showToast: externalShowToast, // opcional
}) => {
  const { showToast } = useToast();
  const toast = externalShowToast || showToast;

  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const [shippingPrazo, setShippingPrazo] = useState(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCouponCode('');
      setCouponDiscount(0);
      setCouponApplied(false);
      setCouponError('');
    }
  }, [isOpen]);

  const fetchAddressByCep = async (cep) => {
    if (cep.length !== 8) return;
    setAddressLoading(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      if (!data.erro) {
        setShippingData((prev) => ({
          ...prev,
          endereco: data.logradouro || '',
          cidade_estado: data.localidade ? `${data.localidade}/${data.uf}` : '',
        }));
      } else {
        toast('CEP nÃ£o encontrado. Verifique o nÃºmero.', 'error');
        setShippingData((prev) => ({ ...prev, endereco: '', cidade_estado: '' }));
      }
    } catch (error) {
      console.error('Erro ao consultar ViaCEP:', error);
      toast('Erro ao consultar CEP. Tente novamente.', 'error');
    } finally {
      setAddressLoading(false);
    }
  };

  const fetchShippingPrice = async (cep) => {
    if (cep.length !== 8) return;
    setShippingLoading(true);
    setShippingPrazo(null);
    try {
      const produtosParaFrete = cart.map(item => ({
        id: item.id,
        quantity: item.quantity,
        weight: item.peso || 0.5,
        width: item.largura || 20,
        height: item.altura || 20,
        length: item.comprimento || 20,
        insurance_value: item.preco * item.quantity
      }));

      const response = await fetch(`${import.meta.env.VITE_API_URL}/shipping/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cepDestino: cep, produtos: produtosParaFrete }),
      });
      const data = await response.json();
      if (response.ok && data.valor) {
        setShippingPrice(Number(data.valor));
        setShippingPrazo(data.prazo);
        if (data.origem === 'melhorenvio') toast(`Frete via ${data.transportadora}`, 'info');
      } else {
        setShippingPrice(0);
        setShippingPrazo(null);
        toast('NÃ£o foi possÃ­vel calcular o frete para este CEP', 'error');
      }
    } catch (error) {
      console.error('Erro ao calcular frete:', error);
      setShippingPrice(0);
      setShippingPrazo(null);
      toast('Erro ao calcular frete', 'error');
    } finally {
      setShippingLoading(false);
    }
  };

  const handleCepChange = (e) => {
    const rawCep = e.target.value.replace(/\D/g, '');
    setShippingData({ ...shippingData, cep: rawCep });

    if (rawCep.length === 8) {
      fetchAddressByCep(rawCep);
      fetchShippingPrice(rawCep);
    } else {
      setShippingData((prev) => ({ ...prev, endereco: '', cidade_estado: '' }));
      setShippingPrice(0);
      setShippingPrazo(null);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Digite um cÃ³digo');
      return;
    }
    setApplyingCoupon(true);
    setCouponError('');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim() }),
      });
      const data = await response.json();
      if (response.ok && data.valid) {
        setCouponDiscount(data.discount_percent);
        setCouponApplied(true);
        toast(`Cupom aplicado: ${data.discount_percent}% de desconto`, 'success');
      } else {
        setCouponError(data.message || 'Cupom invÃ¡lido');
      }
    } catch (err) {
      setCouponError('Erro ao validar cupom');
      console.error(err);
    } finally {
      setApplyingCoupon(false);
    }
  };

  const discount = couponApplied ? (subtotal * couponDiscount) / 100 : 0;
  const total = subtotal + shippingPrice - discount;

  const handleCheckoutWithCoupon = () => {
    handleCheckout(couponApplied ? couponCode : null);
  };

  if (!isOpen) return null;

  return (
    <>
      <motion.div
        className="fixed inset-0 bg-red-500/40 z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className={`fixed top-0 right-0 h-full w-[380px] border-l border-red-900/40 p-6 z-50 flex flex-col ${
          isDark ? 'bg-black text-white' : 'bg-white text-black'
        }`}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 260, damping: 25 }}
      >
        <h3 className="text-2xl mb-6" style={{ color: 'var(--kripta-red-main)' }}>
          Seu Carrinho
        </h3>

        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <p className="text-gray-400 font-space uppercase tracking-widest text-sm">
              Seu carrinho estÃ¡ vazio.
            </p>
            <button
              onClick={() => {
                onClose();
                document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-red-500 hover:text-red-400 font-bold tracking-widest text-xs border-b border-red-900 pb-1 hover:border-red-500 transition-all"
            >
              VEJA NOSSO CATÃLOGO
            </button>
          </div>
        ) : (
          <>
            {/* Lista de itens */}
            <ul className="space-y-4 flex-grow overflow-y-auto">
              {cart.map((item) => (
                <li key={item.id} className="flex items-center gap-4 border-b border-gray-800 pb-3">
                  <img
                    src={item.imagens?.[0] || 'https://via.placeholder.com/150'}
                    alt={item.nome || 'Produto'}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-grow">
                    <p className="text-sm">{item.nome}</p>
                    <p className="text-xs text-gray-400">R$ {(Number(item.preco) || 0).toFixed(2)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="px-2 text-red-500 border border-red-900/40 rounded hover:bg-red-900/20"
                      >
                        -
                      </button>
                      <span className="text-sm">{item.quantity || 1}</span>
                      <button
                        onClick={() => addToCart(item)}
                        className="px-2 text-green-500 border border-green-900/40 rounded hover:bg-green-900/20"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="text-sm font-semibold">
                    R$ {((Number(item.preco) || 0) * (Number(item.quantity) || 1)).toFixed(2)}
                  </div>
                </li>
              ))}
            </ul>

            {/* SeÃ§Ã£o de endereÃ§o */}
            <div className="mt-4 pt-4 border-t border-red-900/30 space-y-3 bg-black/20 p-2 rounded">
              <h4 className="text-red-500 font-space text-[10px] uppercase tracking-widest mb-2">
                Dados de Entrega
              </h4>
              <input
                type="text"
                placeholder="CEP (Somente nÃºmeros)"
                maxLength="8"
                value={shippingData.cep}
                onChange={handleCepChange}
                className="w-full bg-zinc-900 border border-zinc-800 p-2 text-xs text-white focus:border-red-600 outline-none transition-all"
              />
              <input
                type="text"
                placeholder="Rua / Logradouro"
                value={shippingData.endereco}
                onChange={(e) => setShippingData({ ...shippingData, endereco: e.target.value })}
                disabled={addressLoading}
                className={`w-full bg-zinc-900 border border-zinc-800 p-2 text-xs text-white outline-none ${addressLoading ? 'opacity-50' : ''}`}
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="NÂº"
                  value={shippingData.numero}
                  onChange={(e) => setShippingData({ ...shippingData, numero: e.target.value })}
                  className="w-16 bg-zinc-900 border border-zinc-800 p-2 text-xs text-white outline-none"
                />
                <input
                  type="text"
                  placeholder="Cidade/Estado"
                  value={shippingData.cidade_estado}
                  onChange={(e) => setShippingData({ ...shippingData, cidade_estado: e.target.value })}
                  disabled={addressLoading}
                  className={`flex-1 bg-zinc-900 border border-zinc-800 p-2 text-xs text-white outline-none ${addressLoading ? 'opacity-50' : ''}`}
                />
              </div>
              <p className="text-[9px] text-zinc-500 font-space uppercase italic">
                * Estimativa de envio: {shippingPrazo ? `${shippingPrazo} dias Ãºteis` : 'apÃ³s confirmaÃ§Ã£o de pagamento'}
              </p>
            </div>

            {/* SeÃ§Ã£o de cupom */}
            <div className="mt-4 pt-4 border-t border-red-900/30 space-y-3">
              <h4 className="text-red-500 font-space text-[10px] uppercase tracking-widest mb-2">
                Cupom de desconto
              </h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Digite o cÃ³digo"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  disabled={couponApplied}
                  className="flex-1 bg-zinc-900 border border-zinc-800 p-2 text-xs text-white outline-none focus:border-red-600 transition-all disabled:opacity-50"
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={couponApplied || applyingCoupon}
                  className="px-3 py-2 text-xs border border-red-900/40 rounded hover:bg-red-900/20 disabled:opacity-50"
                >
                  {applyingCoupon ? '...' : 'Aplicar'}
                </button>
              </div>
              {couponError && <p className="text-red-500 text-xs">{couponError}</p>}
              {couponApplied && (
                <p className="text-green-500 text-xs">Desconto de {couponDiscount}% aplicado!</p>
              )}
            </div>

            {/* Resumo de valores */}
            <div className="mt-4 py-4 border-t border-red-900/30 space-y-1">
              <div className="flex justify-between text-zinc-400 text-xs font-space">
                <span>Subtotal:</span>
                <span>R$ {subtotal.toFixed(2)}</span>
              </div>
              {couponApplied && (
                <div className="flex justify-between text-zinc-400 text-xs font-space">
                  <span>Desconto ({couponDiscount}%):</span>
                  <span className="text-green-500">- R$ {discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-zinc-400 text-xs font-space">
                <span>Frete:</span>
                <span className={shippingPrice > 0 ? 'text-white' : 'text-red-900'}>
                  {shippingLoading ? (
                    'Calculando...'
                  ) : shippingPrice > 0 ? (
                    `R$ ${shippingPrice.toFixed(2)}`
                  ) : (
                    'Informe o CEP'
                  )}
                </span>
              </div>
              <div className="flex justify-between text-white font-bold text-lg pt-2">
                <span>Total:</span>
                <span className="text-red-500 font-cinzel">R$ {total.toFixed(2)}</span>
              </div>
            </div>

            {/* BotÃ£o finalizar */}
            <div className="mt-6">
              <button
                onClick={handleCheckoutWithCoupon}
                disabled={shippingLoading}
                className="glitch-button w-full"
                data-text="Finalizar Compra"
              >
                Finalizar Compra
              </button>
            </div>
          </>
        )}
      </motion.div>
    </>
  );
};