// src/components/ProductCarousel.jsx
import { useState } from 'react';
// Importando os ícones de seta que você já tem instalados no projeto
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

export const ProductCarousel = ({ product, addToCart }) => {
  const [index, setIndex] = useState(0);

  const next = () => setIndex((prev) => (prev + 1) % product.imagens.length);
  const prev = () =>
    setIndex((prev) => (prev === 0 ? product.imagens.length - 1 : prev - 1));

  return (
    // Fundo do card em preto (ganga-black) com borda cinza para destacar no fundo cinza claro do site
    <div className="text-center bg-ganga-black border border-ganga-gray rounded-xl p-4 md:p-6 shadow-2xl max-w-sm mx-auto">
      
      {/* Container da imagem com fundo levemente mais escuro para contraste da foto */}
      <div className="relative h-[60vh] md:h-[70vh] mb-6 rounded-lg overflow-hidden bg-[#0a0a0a]">
        <img
          src={product.imagens[index]}
          alt={product.nome}
          className="w-full h-full object-contain"
        />
        {product.imagens.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 text-white hover:bg-ganga-red transition-all border border-transparent hover:border-ganga-red-light"
            >
              <FaChevronLeft size={14} />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 text-white hover:bg-ganga-red transition-all border border-transparent hover:border-ganga-red-light"
            >
              <FaChevronRight size={14} />
            </button>
          </>
        )}
      </div>
      
      {/* Nome do Produto */}
      <h3 className="text-2xl md:text-3xl mb-2 text-ganga-white font-title tracking-wide">
        {product.nome}
      </h3>
      
      {/* Preço estritamente em BRANCO */}
      <p className="text-xl font-bold mb-6 text-white tracking-wider">
        R$ {product.preco.toFixed(2)}
      </p>
      
      {/* Botão de Adicionar ao Carrinho - Vermelho Escuro */}
      <button
        onClick={() => addToCart(product)}
        className="w-full py-3.5 bg-ganga-red hover:bg-ganga-red-light text-white font-bold uppercase tracking-widest rounded transition-all duration-300 border border-ganga-red-light shadow-[0_0_10px_rgba(0,0,0,0.8)] hover:shadow-[0_0_15px_rgba(94,10,10,0.6)] relative overflow-hidden group"
      >
        <span className="relative z-10">Adicionar ao carrinho</span>
        <span className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></span>
      </button>
    </div>
  );
};