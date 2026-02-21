import { FaWhatsapp, FaInstagram, FaEnvelope } from 'react-icons/fa';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const Footer = () => {
  const [showReturnModal, setShowReturnModal] = useState(false);

  return (
    <footer id="footer" className="bg-gray-950 text-gray-400 py-16 border-t border-gray-800">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-8 text-white font-['Cinzel Decorative']">Contato</h2>
        <div className="flex justify-center space-x-8 mb-8 text-3xl">
          <a
            href="https://www.instagram.com/casadeganga/"
            target="_blank"
            rel="noreferrer"
            className="text-gray-400 hover:text-pink-600 transition-colors"
          >
            <FaInstagram />
          </a>
          <a
            href="https://wa.me/5511999999999"
            target="_blank"
            rel="noreferrer"
            className="text-gray-400 hover:text-green-500 transition-colors"
          >
            <FaWhatsapp />
          </a>
          <a
            href="mailto:contato@casadeganga.com"
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <FaEnvelope />
          </a>
        </div>
        <div className="flex flex-col items-center gap-4 mb-8">
          <button
            onClick={() => setShowReturnModal(true)}
            className="text-sm text-gray-500 hover:text-amber-500 transition-colors underline underline-offset-4"
          >
            Trocas e Devoluções
          </button>
        </div>
        <div className="text-sm">
          <p>&copy; {new Date().getFullYear()} Casa de Ganga - Todos os direitos reservados.</p>
          <p className="mt-2 text-xs text-gray-600">Sagrado aos Orixás</p>
        </div>
      </div>

      {/* Modal (igual ao do Home, pode ser removido se já estiver lá) */}
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
              className="bg-gray-800 p-8 max-w-lg w-full relative rounded-xl shadow-2xl border border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowReturnModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-amber-500"
              >
                ?
              </button>
              <h2 className="text-3xl font-bold text-amber-600 mb-6 text-center">Trocas e Devoluções</h2>
              <div className="text-gray-300 space-y-4 text-sm">
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
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-600"
                  required
                />
                <textarea
                  name="mensagem"
                  placeholder="Descreva o motivo"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-sm text-white h-32 focus:outline-none focus:ring-2 focus:ring-amber-600"
                  required
                ></textarea>
                <button
                  type="submit"
                  className="w-full bg-red-800 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Enviar solicitação
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </footer>
  );
};