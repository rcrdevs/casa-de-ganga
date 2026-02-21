import { useState } from 'react';

export const ProductCarousel = ({ product, addToCart }) => {
  const [index, setIndex] = useState(0);

  const next = () => setIndex((prev) => (prev + 1) % product.imagens.length);
  const prev = () =>
    setIndex((prev) => (prev === 0 ? product.imagens.length - 1 : prev - 1));

  return (
    <div className="text-center">
      <div className="relative h-[70vh] mb-6">
        <img
          src={product.imagens[index]}
          alt={product.nome}
          className="w-full h-full object-contain"
        />
        {product.imagens.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white"
            >
              ?
            </button>
            <button
              onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white"
            >
              ?
            </button>
          </>
        )}
      </div>
      <h3 className="text-3xl mb-2 text-white">{product.nome}</h3>
      <p
        className="text-xl font-semibold mb-4"
        style={{ color: 'var(--kripta-red-main)' }}
      >
        R$ {product.preco.toFixed(2)}
      </p>
      <button
        onClick={() => addToCart(product)}
        className="glitch-button"
        data-text="Adicionar ao carrinho"
      >
        Adicionar ao carrinho
      </button>
    </div>
  );
};