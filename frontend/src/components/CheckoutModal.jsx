import { useState, memo, useMemo, useEffect } from 'react';
import { CardPayment, Payment } from '@mercadopago/sdk-react';
import { motion } from 'framer-motion';

export const CheckoutModal = memo(({ isOpen, onClose, orderId, total, onPaymentSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [processing, setProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  const [brickReady, setBrickReady] = useState(false);
  const [brickError, setBrickError] = useState(null);

  // 1. ESTABILIZAÇÃO DO OBJETO: Evita o reload infinito. 
  // O useMemo garante que o objeto só mude se o 'total' mudar.
  const initialization = useMemo(() => ({
    amount: total,
  }), [total]);

  // Resetar estados ao fechar ou trocar de método para evitar lixo visual
  useEffect(() => {
    if (!isOpen) {
      setBrickReady(false);
      setBrickError(null);
      setProcessing(false);
    }
  }, [isOpen, paymentMethod]);

  const handlePayment = async (paymentData) => {
    setProcessing(true);
    setBrickError(null);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/payments/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId,
          paymentMethod,
          paymentData,
        }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setPaymentResult(result);
        if (result.status === 'approved') {
          onPaymentSuccess();
        }
      } else {
        alert(result.message || 'Erro no pagamento');
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao processar pagamento');
    } finally {
      setProcessing(false);
    }
  };

  const handleBrickError = (error) => {
    console.error('Erro no brick:', error);
    // Se o erro for de bloqueio (AdBlock), avisamos o usuário
    setBrickError('Erro ao carregar checkout. Desative bloqueadores de anúncio ou tente outro navegador.');
    setBrickReady(true); 
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[300] p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-zinc-900 border border-red-900/50 p-8 rounded-xl max-w-md w-full"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-unifraktur text-3xl text-red-500 mb-6 text-center">
          Finalizar pagamento
        </h2>
        <p className="text-gray-300 mb-4 text-center font-bold">Total: R$ {total.toFixed(2)}</p>

        {/* Seleção do método */}
        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => {
              setPaymentMethod('credit_card');
              setBrickReady(false);
            }}
            className={`flex-1 py-2 px-3 rounded text-sm transition-colors ${
              paymentMethod === 'credit_card' ? 'bg-red-600 text-white' : 'bg-zinc-800 text-gray-400'
            }`}
          >
            Cartão
          </button>
          <button
            type="button"
            onClick={() => {
              setPaymentMethod('other');
              setBrickReady(false);
            }}
            className={`flex-1 py-2 px-3 rounded text-sm transition-colors ${
              paymentMethod === 'other' ? 'bg-red-600 text-white' : 'bg-zinc-800 text-gray-400'
            }`}
          >
            Pix / Boleto
          </button>
        </div>

        {/* Mensagem de erro do brick */}
        {brickError && (
          <div className="bg-red-900/20 border border-red-500 text-red-300 p-3 rounded mb-4 text-sm">
            {brickError}
          </div>
        )}

        {/* Loader enquanto o brick não está pronto */}
        {!brickReady && !brickError && (
          <div className="flex flex-col justify-center items-center py-8">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-300 mt-4 text-xs uppercase tracking-widest">Invocando Checkout...</span>
          </div>
        )}

        {/* Renderização com KEY única para evitar conflito de instâncias */}
        <div className={brickReady ? 'block' : 'hidden'}>
          {paymentMethod === 'credit_card' ? (
            <CardPayment
              key="mp-card-brick" 
              initialization={initialization}
              locale="pt-BR"
              onReady={() => setBrickReady(true)}
              onSubmit={handlePayment}
              onError={handleBrickError}
            />
          ) : (
            <Payment
              key="mp-other-brick"
              initialization={initialization}
              locale="pt-BR"
              onReady={() => setBrickReady(true)}
              onSubmit={handlePayment}
              onError={handleBrickError}
            />
          )}
        </div>

        {processing && (
          <div className="text-center mt-4 text-red-400 animate-pulse">
            Processando transação...
          </div>
        )}
        
        {paymentResult?.status === 'approved' && (
          <div className="text-center mt-4 text-green-500 font-bold">
            Pagamento aprovado! Redirecionando...
          </div>
        )}
      </motion.div>
    </motion.div>
  );
});