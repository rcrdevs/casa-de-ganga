import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaLock, FaShieldAlt } from 'react-icons/fa';

let mpInstance = null;

export const CustomCheckoutModal = ({ isOpen, onClose, orderId, total, onPaymentSuccess, initPoint }) => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [formData, setFormData] = useState({
    cardholderName: '',
    identificationType: 'CPF',
    identificationNumber: '',
    installments: '1',
    paymentMethodId: '',
    email: '',
  });
  const [installmentOptions, setInstallmentOptions] = useState([]);
  const [mpReady, setMpReady] = useState(false);
  const [fieldsMounted, setFieldsMounted] = useState(false);
  const [bin, setBin] = useState('');
  const [loadingBin, setLoadingBin] = useState(false);

  const mpFieldsRef = useRef(null);
  const binTimeoutRef = useRef(null);

  // Carrega o script do Mercado Pago
  useEffect(() => {
    if (!isOpen) return;

    const loadMercadoPagoScript = () => {
      return new Promise((resolve, reject) => {
        if (window.MercadoPago) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://sdk.mercadopago.com/js/v2';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    loadMercadoPagoScript()
      .then(() => {
        mpInstance = new window.MercadoPago(import.meta.env.VITE_MP_PUBLIC_KEY);
        setMpReady(true);
      })
      .catch(() => setError('Erro ao carregar o Mercado Pago. Tente novamente.'));
  }, [isOpen]);

  // Inicializa os Secure Fields
  useEffect(() => {
    if (!mpReady || !isOpen || paymentMethod !== 'credit_card') return;

    const style = {
      height: '48px',
      color: '#F9FAFB',
      fontSize: '16px',
      fontWeight: '400',
      fontFamily: "'Space Grotesk', sans-serif",
      padding: '0 12px',
    };

    mpFieldsRef.current = {
      cardNumber: mpInstance.fields.create('cardNumber', {
        placeholder: 'Número do cartão',
        style,
      }),
      expirationDate: mpInstance.fields.create('expirationDate', {
        placeholder: 'MM/AA',
        style,
      }),
      securityCode: mpInstance.fields.create('securityCode', {
        placeholder: 'CVV',
        style,
      }),
    };

    // Listener para capturar o BIN (CORRIGIDO)
    mpFieldsRef.current.cardNumber.on('binChange', (data) => {
      const binValue = data?.bin;
      if (binValue && binValue.length >= 6) {
        setLoadingBin(true);
        if (binTimeoutRef.current) clearTimeout(binTimeoutRef.current);
        binTimeoutRef.current = setTimeout(() => {
          setBin(binValue);
          fetchPaymentMethodInfo(binValue);
        }, 500);
      }
    });

    mpFieldsRef.current.cardNumber.mount('cardNumberContainer');
    mpFieldsRef.current.expirationDate.mount('expirationDateContainer');
    mpFieldsRef.current.securityCode.mount('securityCodeContainer');

    setFieldsMounted(true);

    return () => {
      if (mpFieldsRef.current) {
        Object.values(mpFieldsRef.current).forEach(field => field?.unmount());
        mpFieldsRef.current = null;
      }
      setFieldsMounted(false);
      if (binTimeoutRef.current) clearTimeout(binTimeoutRef.current);
    };
  }, [mpReady, isOpen, paymentMethod]);

    // Busca informações do cartão pelo BIN
    const fetchPaymentMethodInfo = async (bin) => {
    try {
        const response = await fetch(
        `https://api.mercadopago.com/v1/payment_methods/search?public_key=${import.meta.env.VITE_MP_PUBLIC_KEY}&bin=${bin}`
        );
        const data = await response.json();
        if (data.results && data.results.length > 0) {
        // Filtra apenas métodos de cartão de crédito/débito
        const cardMethods = data.results.filter(method => 
            method.payment_type_id === 'credit_card' || method.payment_type_id === 'debit_card'
        );
        
        if (cardMethods.length > 0) {
            const method = cardMethods[0];
            setFormData(prev => ({ ...prev, paymentMethodId: method.id }));

            // Buscar parcelas
            const installmentsRes = await fetch(
            `https://api.mercadopago.com/v1/payment_methods/installments?public_key=${import.meta.env.VITE_MP_PUBLIC_KEY}&amount=${total}&bin=${bin}`
            );
            const installmentsData = await installmentsRes.json();
            if (installmentsData[0]?.payer_costs) {
            setInstallmentOptions(installmentsData[0].payer_costs);
            }
            setError(null);
        } else {
            setFormData(prev => ({ ...prev, paymentMethodId: '' }));
            setInstallmentOptions([]);
            setError('Bandeira não reconhecida. Digite os primeiros 6 dígitos.');
        }
        } else {
        setFormData(prev => ({ ...prev, paymentMethodId: '' }));
        setInstallmentOptions([]);
        setError('Bandeira não reconhecida. Digite os primeiros 6 dígitos.');
        }
    } catch (err) {
        console.error('Erro ao buscar informações do cartão:', err);
        setError('Erro ao identificar a bandeira. Tente novamente.');
    } finally {
        setLoadingBin(false);
    }
    };

  // Fallback manual para seleção de bandeira
  const handleManualBrandSelect = (brand) => {
    const brandMap = {
      visa: 'visa',
      master: 'master',
      amex: 'amex',
      elo: 'elo',
      hipercard: 'hipercard',
      diners: 'diners' // opcional, se quiser suportar
    };
    setFormData(prev => ({ ...prev, paymentMethodId: brandMap[brand] }));
    setError(null);
  };

  // No JSX do fallback (substitua a seção existente)
  {!formData.paymentMethodId && bin && bin.length >= 6 && !loadingBin && (
    <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-3 text-yellow-400 text-sm">
      <p className="mb-2">Bandeira não identificada automaticamente. Selecione:</p>
      <div className="flex gap-2 flex-wrap">
        {['visa', 'master', 'amex', 'elo', 'hipercard'].map(brand => (
          <button
            key={brand}
            type="button"
            onClick={() => handleManualBrandSelect(brand)}
            className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded text-xs uppercase"
          >
            {brand}
          </button>
        ))}
      </div>
    </div>
  )}

  // Envio do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);

    // 1. Verifica mpInstance
    if (!mpInstance) {
      setError('Mercado Pago não inicializado. Recarregue a página.');
      setProcessing(false);
      return;
    }

    const amount = Number(total);
    if (isNaN(amount) || amount <= 0) {
      setError('Valor inválido.');
      setProcessing(false);
      return;
    }

    if (paymentMethod === 'pix_boleto') {
      if (initPoint) {
        window.location.href = initPoint;
      } else {
        setError('Link de pagamento não disponível.');
        setProcessing(false);
      }
      return;
    }

    // 2. Verifica campos seguros
    if (!mpFieldsRef.current || 
        !mpFieldsRef.current.cardNumber || 
        !mpFieldsRef.current.expirationDate || 
        !mpFieldsRef.current.securityCode) {
      setError('Campos de pagamento não carregados. Tente novamente.');
      setProcessing(false);
      return;
    }

    if (!formData.paymentMethodId) {
      setError('Não foi possível identificar a bandeira do cartão. Digite os primeiros dígitos.');
      setProcessing(false);
      return;
    }

    try {
      // 3. Log dos dados
      console.log('Dados para token:', {
        cardholderName: formData.cardholderName,
        identificationType: formData.identificationType,
        identificationNumber: formData.identificationNumber.replace(/\D/g, ''),
      });

      // 4. Pequena pausa para garantir
      await new Promise(resolve => setTimeout(resolve, 200));

      // 5. Cria o token
      const cardToken = await mpInstance.fields.createCardToken({
        cardholderName: formData.cardholderName,
        identificationType: formData.identificationType,
        identificationNumber: formData.identificationNumber.replace(/\D/g, ''),
      });

      console.log('Token recebido:', cardToken);

      if (!cardToken?.id) {
        throw new Error('Falha ao gerar token do cartão');
      }

      // 6. Envia para o backend
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/payments/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId,
          paymentMethod: 'credit_card',
          paymentData: {
            token: cardToken.id,
            installments: parseInt(formData.installments),
            paymentMethodId: formData.paymentMethodId,
            payer: {
              email: formData.email || 'cliente@email.com',
              identification: {
                type: formData.identificationType,
                number: formData.identificationNumber.replace(/\D/g, ''),
              },
            },
          },
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Erro no pagamento');
      }

      if (result.status === 'approved') {
        onPaymentSuccess();
      } else {
        setError('Pagamento não aprovado. Tente novamente.');
      }
    } catch (err) {
      console.error('Erro detalhado:', err);
      setError(err.message || 'Erro ao processar pagamento');
    } finally {
      setProcessing(false);
    }
  };

  const handleMethodChange = (method) => {
    setPaymentMethod(method);
    setError(null);
    setInstallmentOptions([]);
    setFormData(prev => ({ ...prev, paymentMethodId: '' }));
    setBin('');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-zinc-900 border border-red-900/50 rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-unifraktur text-3xl text-red-500">Pagamento</h2>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <FaLock className="text-green-500" />
              <span>Pagamento 100% seguro</span>
            </div>
          </div>

          <p className="text-gray-300 mb-6 text-center border-b border-zinc-800 pb-4">
            Total: <span className="text-red-500 font-bold text-xl">R$ {Number(total).toFixed(2)}</span>
          </p>

          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => handleMethodChange('credit_card')}
              className={`flex-1 py-2 px-3 rounded text-sm ${
                paymentMethod === 'credit_card' ? 'bg-red-600 text-white' : 'bg-zinc-800 text-gray-400'
              }`}
            >
              Cartão
            </button>
            <button
              type="button"
              onClick={() => handleMethodChange('pix_boleto')}
              className={`flex-1 py-2 px-3 rounded text-sm ${
                paymentMethod === 'pix_boleto' ? 'bg-red-600 text-white' : 'bg-zinc-800 text-gray-400'
              }`}
            >
              Pix / Boleto
            </button>
          </div>

          {paymentMethod === 'credit_card' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nome no cartão</label>
                <input
                  type="text"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition"
                  placeholder="Como está no cartão"
                  value={formData.cardholderName}
                  onChange={(e) => setFormData({ ...formData, cardholderName: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">CPF do titular</label>
                <input
                  type="text"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition"
                  placeholder="000.000.000-00"
                  value={formData.identificationNumber}
                  onChange={(e) => setFormData({ ...formData, identificationNumber: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Número do cartão</label>
                  <div
                    id="cardNumberContainer"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden"
                    style={{ height: '48px' }}
                  />
                  {loadingBin && (
                    <p className="text-xs text-yellow-500 mt-1">Identificando bandeira...</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Validade</label>
                    <div
                      id="expirationDateContainer"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden"
                      style={{ height: '48px' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">CVV</label>
                    <div
                      id="securityCodeContainer"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden"
                      style={{ height: '48px' }}
                    />
                  </div>
                </div>
              </div>

              {/* Fallback manual para bandeira */}
              {!formData.paymentMethodId && bin && bin.length >= 6 && !loadingBin && (
                <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-3 text-yellow-400 text-sm">
                  <p className="mb-2">Bandeira não identificada automaticamente. Selecione:</p>
                  <div className="flex gap-2 flex-wrap">
                    {['visa', 'master', 'amex', 'elo', 'hipercard'].map(brand => (
                      <button
                        key={brand}
                        type="button"
                        onClick={() => handleManualBrandSelect(brand)}
                        className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded text-xs uppercase"
                      >
                        {brand}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {installmentOptions.length > 0 && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Parcelas</label>
                  <select
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                    value={formData.installments}
                    onChange={(e) => setFormData({ ...formData, installments: e.target.value })}
                  >
                    {installmentOptions.map((opt) => (
                      <option key={opt.installments} value={opt.installments}>
                        {opt.installments}x de R$ {(opt.installment_amount).toFixed(2)}{' '}
                        {opt.installment_rate === 0 ? 'sem juros' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {error && (
                <div className="bg-red-900/20 border border-red-500 rounded-lg p-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={processing || !fieldsMounted || !formData.paymentMethodId || loadingBin}
                className="glitch-button w-full mt-4"
                data-text="Pagar"
              >
                {processing ? 'Processando...' : 'Pagar'}
              </button>
            </form>
          ) : (
            <div className="text-center py-6 space-y-4">
              <p className="text-gray-300">
                Você será redirecionado para o ambiente do Mercado Pago para pagar com <span className="text-red-400 font-semibold">Pix</span> ou <span className="text-red-400 font-semibold">Boleto</span>.
              </p>
              <p className="text-sm text-gray-500">
                Após a confirmação, você voltará automaticamente à loja.
              </p>
              {error && (
                <div className="bg-red-900/20 border border-red-500 rounded-lg p-3 text-red-400 text-sm">
                  {error}
                </div>
              )}
              <button
                onClick={handleSubmit}
                disabled={processing}
                className="glitch-button w-full"
                data-text="Continuar"
              >
                {processing ? 'Redirecionando...' : 'Continuar'}
              </button>
            </div>
          )}

          <div className="flex items-center justify-center gap-2 mt-6 text-xs text-gray-500 border-t border-zinc-800 pt-4">
            <FaShieldAlt className="text-red-600" />
            <span>Seus dados estão protegidos com criptografia SSL</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};