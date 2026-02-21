export const PaymentStatusModal = ({ status, onClose }) => {
  const isPaid = status === 'paid';
  const isProcessing = status === 'processing';
  const isPending = status === 'pending';

  const title = isPaid
    ? 'Pagamento Confirmado'
    : isProcessing
    ? 'Processando Pagamento'
    : 'Aguardando Pagamento';

  const message = isPaid
    ? 'Seu pedido foi confirmado e está sendo separado no abismo.'
    : isProcessing
    ? 'O Mercado Pago está processando seu pagamento. Isso pode levar alguns minutos.'
    : 'Finalize o pagamento na aba do Mercado Pago e aguarde a confirmação.';

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[300] p-4">
      <div className="bg-zinc-900 border border-red-900/50 p-8 rounded-xl max-w-md w-full text-center shadow-[0_0_50px_rgba(220,38,38,0.2)]">
        <h2 className="font-unifraktur text-3xl text-red-500 mb-6 border-b border-red-900/30 pb-4">
          {title}
        </h2>

        <div className="flex flex-col items-center py-6 space-y-6">
          {isPaid && (
            <div className="w-20 h-20 bg-green-900/20 rounded-full flex items-center justify-center border-2 border-green-500 text-4xl">
              ??
            </div>
          )}

          {isProcessing && (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-yellow-600/30 border-t-yellow-500 rounded-full animate-spin"></div>
              <span className="text-yellow-500 font-space text-xs mt-2">
                O pagamento está sendo validado...
              </span>
            </div>
          )}

          {isPending && (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-red-900/30 border-t-red-600 rounded-full animate-spin"></div>
              <span className="text-red-600 font-space text-xs mt-2">
                Aguardando o pagamento ser concluído...
              </span>
            </div>
          )}

          <p className="text-gray-300 font-space text-lg">{message}</p>
        </div>

        {isPaid && (
          <button
            onClick={onClose}
            className="w-full bg-red-700 hover:bg-red-600 text-white font-bold py-3 rounded font-space transition-colors"
          >
            VOLTAR PARA A LOJA
          </button>
        )}
      </div>
    </div>
  );
};