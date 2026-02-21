import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaWhatsapp,
  FaInstagram,
  FaEnvelope,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

// Componentes
import { Header } from '../components/Header';
import { LoginModal } from '../components/LoginModal';
import { CartDrawer } from '../components/CartDrawer';
import { OrdersModal } from '../components/OrdersModal';
import { HeroBannerSlider } from '../components/HeroBannerSlider';
import { ProductCarousel } from '../components/ProductCarousel';
import { CustomCheckoutModal } from '../components/CustomCheckoutModal';
import ErrorBoundary from '../components/ErrorBoundary';

// Hooks
import { useCart } from '../hooks/useCart';
import { useToast } from '../hooks/useToast';
import { useInactivityDetector } from '../hooks/useInactivityDetector';
import { api } from '../services/api';

// Dados
import { produtos } from '../data/products';

// Fontes
import "@fontsource/cinzel-decorative/700.css";
import "@fontsource/unifrakturmaguntia";
import "@fontsource/space-grotesk/400.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/700.css";

export function Home() {
  const navigate = useNavigate();

  // State do carrinho e UI
  const [cartOpen, setCartOpen] = useState(false);
  const isMouseInactive = useInactivityDetector(2000);
  const { toast, showToast } = useToast();
  const { cart, addToCart, removeFromCart, clearCart } = useCart();

  const handleAddToCart = (product) => {
    addToCart(product);
    showToast('Item adicionado ao carrinho', 'success');
  };

  const totalItems = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);

  // Autenticação
  const [token, setToken] = useState(localStorage.getItem('accessToken'));
  const [showLogin, setShowLogin] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [userOrders, setUserOrders] = useState([]);

  // Checkout e frete
  const [shippingData, setShippingData] = useState({
    cep: '',
    endereco: '',
    numero: '',
    complemento: '',
    cidade_estado: '',
  });
  const [shippingPrice, setShippingPrice] = useState(0);
  const [shippingPrazo, setShippingPrazo] = useState(null);
  const [shippingLoading, setShippingLoading] = useState(false);

  // Modal de trocas/devoluções
  const [showReturnModal, setShowReturnModal] = useState(false);

  // Tema e produto selecionado
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Checkout modal
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const currentOrder = useRef({ id: null, total: 0, initPoint: null });

  // Função para esqueci senha
  const handleForgotPassword = () => {
    setShowLogin(false);
    navigate('/forgot-password');
  };

  // Logout
  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
      } catch (e) {
        console.error('Erro ao deslogar no servidor');
      }
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setToken(null);
    showToast('Sessão encerrada', 'info');
  };

  // Buscar pedidos
  const fetchOrders = async () => {
    if (!token) return;
    try {
      const data = await api.get('/orders/meus-pedidos');
      setUserOrders(data);
      setShowOrders(true);
    } catch (err) {
      showToast('Erro ao carregar pedidos: Sessão expirada, faça o login novamente.', 'error');
    }
  };

  // Checkout
  const handleCheckout = async (couponCode = null) => {
    if (!token) {
      showToast('?? Faça login para finalizar!', 'error');
      setShowLogin(true);
      return;
    }

    if (!shippingData.cep || !shippingData.endereco || !shippingData.numero) {
      showToast('?? Preencha os dados de entrega!', 'error');
      return;
    }

    try {
      const data = await api.post('/orders', {
        items: cart,
        address: shippingData,
        couponCode,
      });

      currentOrder.current = {
        id: data.orderId,
        total: subtotal + shippingPrice,
        initPoint: data.init_point,
      };
      setShowCheckoutModal(true);
    } catch (err) {
      console.error('Erro no checkout:', err);
      showToast('Erro ao criar pedido. Verifique o console.', 'error');
    }
  };

  const handlePaymentSuccess = () => {
    setShowCheckoutModal(false);
    showToast('Pagamento aprovado! Seu pedido será processado.', 'success');
    clearCart();
  };

  // Cálculo do subtotal
  const subtotal = cart.reduce(
    (total, item) => total + (Number(item.preco) || 0) * (Number(item.quantity) || 1),
    0
  );

  return (
    <div className="min-h-screen relative overflow-hidden font-['Space Grotesk'] bg-gray-950 text-gray-300">
      {/* Elementos decorativos de fundo (sutis) */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-20 left-10 w-96 h-96 bg-red-900/30 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-900/30 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gray-800/30 rounded-full mix-blend-multiply filter blur-3xl"></div>
      </div>

      <Header
        token={token}
        setShowLogin={setShowLogin}
        openCart={() => setCartOpen(true)}
        cart={cart}
        onOrdersClick={fetchOrders}
        handleLogout={handleLogout}
        cartTotalItems={totalItems}
      />

      {toast && (
        <div
          className={`fixed top-6 right-6 z-[500] px-5 py-3 rounded-lg shadow-xl border ${
            toast.type === 'error' 
              ? 'bg-red-900/80 border-red-700 text-white' 
              : 'bg-green-900/80 border-green-700 text-white'
          }`}
        >
          {toast.text}
        </div>
      )}

      <AnimatePresence>
        {cartOpen && (
          <CartDrawer
            isOpen={cartOpen}
            onClose={() => setCartOpen(false)}
            cart={cart}
            addToCart={handleAddToCart}
            removeFromCart={removeFromCart}
            shippingData={shippingData}
            setShippingData={setShippingData}
            shippingPrice={shippingPrice}
            setShippingPrice={setShippingPrice}
            shippingPrazo={shippingPrazo}
            setShippingPrazo={setShippingPrazo}
            shippingLoading={shippingLoading}
            setShippingLoading={setShippingLoading}
            subtotal={subtotal}
            handleCheckout={handleCheckout}
            isDark={true}
            showToast={showToast}
          />
        )}
      </AnimatePresence>

      <ErrorBoundary>
        <CustomCheckoutModal
          isOpen={showCheckoutModal}
          onClose={() => setShowCheckoutModal(false)}
          orderId={currentOrder.current.id}
          total={currentOrder.current.total}
          initPoint={currentOrder.current.initPoint}
          onPaymentSuccess={handlePaymentSuccess}
        />
      </ErrorBoundary>

      {/* Hero com banner rotativo (tamanho original) */}
      <section id="hero" className="relative z-10 pt-24">
        <div className="h-[80vh] md:h-[90vh] relative">
          <HeroBannerSlider />
        </div>
      </section>

      {/* Catálogo */}
      <section id="catalogo" className="py-20 px-8 md:px-16 lg:px-32 relative z-10 bg-gray-900/80 backdrop-blur-sm">
        <h2 className="text-4xl md:text-5xl mb-12 text-center font-['Cinzel Decorative'] font-bold text-red-600">
          Nossos Produtos
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {produtos.map((produto) => (
            <motion.div
              key={produto.id}
              className="rounded-xl overflow-hidden shadow-lg bg-gray-800 border border-gray-700 hover:shadow-2xl transition-shadow"
              whileHover={{ scale: 1.02 }}
            >
              <div
                className="h-64 cursor-pointer overflow-hidden relative"
                onClick={() => setSelectedProduct(produto)}
              >
                <img
                  src={produto.imagens[0]}
                  alt={produto.nome}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-2">{produto.nome}</h3>
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">{produto.descricao}</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-green-600">
                    R$ {produto.preco.toFixed(2)}
                  </span>
                  <button
                    onClick={() => handleAddToCart(produto)}
                    className="px-4 py-2 bg-red-900 hover:bg-red-800 text-white rounded-lg text-sm font-semibold transition-all duration-300 relative overflow-hidden group"
                  >
                    <span className="relative z-10">Adicionar</span>
                    <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md"></span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Sobre nós */}
      <section id="sobre" className="py-24 px-8 bg-gray-950 relative">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 text-white font-['Cinzel Decorative']">
            <span className="text-red-600">Sobre</span> a Casa de Ganga
          </h2>
          <p className="text-lg text-gray-400 mb-8 leading-relaxed">
            A Casa de Ganga é um espaço dedicado às tradições de matriz africana, especialmente Umbanda e Quimbanda. 
            Oferecemos artigos sagrados como velas, imagens, ferramentas de orixás, guias, defumações e muito mais, 
            sempre com respeito e axé. Cada produto é escolhido com cuidado para auxiliar em seus rituais e fortalecer 
            sua fé.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="p-6 bg-gray-800 rounded-lg shadow-md border-t-4 border-red-700">
              <h3 className="text-xl font-semibold text-white mb-2">Axé</h3>
              <p className="text-gray-400">Produtos energizados e vindos de fornecedores de confiança.</p>
            </div>
            <div className="p-6 bg-gray-800 rounded-lg shadow-md border-t-4 border-green-700">
              <h3 className="text-xl font-semibold text-white mb-2">Tradição</h3>
              <p className="text-gray-400">Conhecimento passado de geração em geração.</p>
            </div>
            <div className="p-6 bg-gray-800 rounded-lg shadow-md border-t-4 border-red-700">
              <h3 className="text-xl font-semibold text-white mb-2">Respeito</h3>
              <p className="text-gray-400">Atendimento humanizado e sigilo em suas compras.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="footer" className="py-16 bg-black text-gray-500 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8 text-white font-['Cinzel Decorative']">Contato</h2>
          <div className="flex justify-center space-x-8 mb-8 text-3xl">
            <a
              href="https://www.instagram.com/casadeganga/"
              target="_blank"
              rel="noreferrer"
              className="text-gray-500 hover:text-red-500 transition-colors"
            >
              <FaInstagram />
            </a>
            <a
              href="https://wa.me/5511999999999"
              target="_blank"
              rel="noreferrer"
              className="text-gray-500 hover:text-green-500 transition-colors"
            >
              <FaWhatsapp />
            </a>
            <a
              href="mailto:contato@casadeganga.com"
              className="text-gray-500 hover:text-red-500 transition-colors"
            >
              <FaEnvelope />
            </a>
          </div>
          <div className="flex flex-col items-center gap-4 mb-8">
            <button
              onClick={() => setShowReturnModal(true)}
              className="text-sm text-gray-600 hover:text-white transition-colors underline underline-offset-4"
            >
              Trocas e Devoluções
            </button>
          </div>
          <div className="text-sm">
            <p>&copy; {new Date().getFullYear()} Casa de Ganga - Todos os direitos reservados.</p>
            <p className="mt-2 text-xs text-gray-700">Axé para todos</p>
          </div>
        </div>
      </footer>

      {/* Modal de Trocas/Devoluções */}
      <AnimatePresence>
        {showReturnModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-[999] flex items-center justify-center p-6"
            onClick={() => setShowReturnModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gray-900 p-8 max-w-lg w-full relative rounded-xl shadow-2xl border border-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowReturnModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
              >
                ?
              </button>
              <h2 className="text-3xl font-bold text-red-600 mb-6 text-center">Trocas e Devoluções</h2>
              <div className="text-gray-400 space-y-4 text-sm">
                <p>? O prazo para manifestação de troca ou arrependimento é de 7 dias após a entrega.</p>
                <p>? O produto deve retornar em sua embalagem original, sem sinais de uso.</p>
                <p>? Entre em contato via WhatsApp ou e-mail para iniciar o processo.</p>
              </div>
              <form action="https://formsubmit.co/contato@casadeganga.com" method="POST" className="mt-6 space-y-4">
                <input type="hidden" name="_captcha" value="false" />
                <input
                  type="text"
                  name="pedido"
                  placeholder="Número do pedido"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                  required
                />
                <textarea
                  name="mensagem"
                  placeholder="Descreva o motivo"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-white h-32 focus:outline-none focus:ring-2 focus:ring-red-600"
                  required
                ></textarea>
                <button
                  type="submit"
                  className="w-full bg-red-900 hover:bg-red-800 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Enviar solicitação
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de login */}
      <AnimatePresence>
        {showLogin && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLogin(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <LoginModal
                onLogin={(newToken) => {
                  setToken(newToken);
                  setShowLogin(false);
                }}
                isDark={true}
                showToast={showToast}
                onClose={() => setShowLogin(false)}
                onForgotPassword={handleForgotPassword}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de produto selecionado */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[200] p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div
              className="bg-gray-900 rounded-xl max-w-4xl w-full relative border border-gray-800"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ProductCarousel product={selectedProduct} addToCart={handleAddToCart} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de pedidos */}
      <OrdersModal isOpen={showOrders} onClose={() => setShowOrders(false)} orders={userOrders} />
    </div>
  );
}