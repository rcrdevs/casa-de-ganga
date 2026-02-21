export const OrdersModal = ({ isOpen, onClose, orders }) => {
  if (!isOpen) return null;

  const getStep = (status) => {
    if (status === 'pending') return 1;
    if (status === 'paid' || status === 'approved') return 2;
    if (status === 'shipped') return 3;
    if (status === 'delivered') return 4;
    return 1;
  };

  const statusText = {
    pending: 'Aguardando Pagamento',
    paid: 'Em Separação - Média de 15 dias',
    approved: 'Em Separação - Média de 15 dias',
    shipped: 'Enviado',
    delivered: 'Recebido',
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[250] p-4">
      <div className="bg-zinc-900 border border-red-900/30 w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-xl p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-8 border-b border-red-900/20 pb-4">
          <h2 className="font-unifraktur text-3xl text-red-600">Meus Pedidos</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-2xl">
            &times;
          </button>
        </div>

        {orders.length === 0 ? (
          <p className="text-gray-500 text-center py-10 font-space">
            Você ainda não possui pedidos.
          </p>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => (
              <div key={order.id} className="bg-black/40 border border-zinc-800 p-5 rounded-lg">
                <div className="flex justify-between mb-4">
                  <span className="text-xs text-gray-500 font-space uppercase tracking-widest">
                    Pedido #{order.id}
                  </span>
                  <span className="text-red-500 font-bold font-space">
                    R$ {Number(order.total_price).toFixed(2)}
                  </span>
                </div>

                {/* Barra de progresso */}
                <div className="relative flex justify-between mt-6">
                  {[1, 2, 3, 4].map((step) => (
                    <div key={step} className="flex flex-col items-center z-10">
                      <div
                        className={`w-4 h-4 rounded-full border-2 ${
                          getStep(order.status) >= step
                            ? 'bg-red-600 border-red-600'
                            : 'bg-zinc-900 border-zinc-700'
                        }`}
                      />
                    </div>
                  ))}
                  <div className="absolute top-2 left-0 w-full h-[2px] bg-zinc-800 -z-0" />
                  <div
                    className="absolute top-2 left-0 h-[2px] bg-red-600 transition-all duration-500 -z-0"
                    style={{ width: `${((getStep(order.status) - 1) / 3) * 100}%` }}
                  />
                </div>

                <div className="flex justify-between mt-2 text-[10px] text-gray-400 font-space uppercase">
                  <span>Pagamento</span>
                  <span>Separação</span>
                  <span>Enviado</span>
                  <span>Recebido</span>
                </div>

                {/* Status com bolinha piscante */}
                <div className="mt-6 flex flex-col items-center gap-3">
                  <div className="flex items-center gap-2 px-4 py-2 bg-black/50 rounded-full border border-zinc-800">
                    <span className="relative flex h-2 w-2">
                      {order.status !== 'delivered' && (
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                      )}
                      <span
                        className={`relative inline-flex rounded-full h-2 w-2 ${
                          order.status === 'delivered' ? 'bg-green-500' : 'bg-red-600'
                        }`}
                      ></span>
                    </span>
                    <p className="text-xs font-space uppercase tracking-tighter text-zinc-300">
                      Status: <span className="text-white">{statusText[order.status] || order.status}</span>
                    </p>
                  </div>

                  {order.status === 'pending' && order.checkout_url && (
                    <a
                      href={order.checkout_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-red-500 font-bold underline underline-offset-4 hover:text-red-400 transition-colors animate-pulse"
                    >
                       CLIQUE AQUI PARA CONCLUIR O PAGAMENTO
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};