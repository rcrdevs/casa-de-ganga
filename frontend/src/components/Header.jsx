// src/components/Header.jsx
import { motion } from 'framer-motion';
import { NavItem } from './NavItem';

export const Header = ({
  token,
  setShowLogin,
  openCart,
  onOrdersClick,
  cart,
  handleLogout,
  cartTotalItems
}) => (
  <motion.header
    className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-gray-800 bg-casa-black/90"
    initial={{ y: -80, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
  >
    <div className="container mx-auto px-8 py-4 flex justify-between items-center">
      <a
        href="#hero"
        className="text-2xl font-serif font-bold text-casa-red hover:text-casa-red/80 transition-colors"
      >
        Casa de Ganga
      </a>

      <div className="hidden md:flex gap-8 text-sm uppercase tracking-widest">
        <NavItem targetId="catalogo">Catálogo</NavItem>
        <NavItem targetId="sobre">Sobre</NavItem>
        <NavItem targetId="footer">Contato</NavItem>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={openCart}
          className="text-xs border border-gray-700 px-3 py-1 rounded text-gray-300 hover:bg-casa-red/20 hover:border-casa-red transition-all duration-300 relative overflow-hidden group"
        >
          <span className="relative z-10">Carrinho ({cartTotalItems})</span>
          <span className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md"></span>
        </button>

        {token ? (
          <button
            onClick={handleLogout}
            className="text-xs border border-gray-700 px-3 py-1 rounded text-gray-300 hover:bg-casa-red/20 hover:border-casa-red transition-all duration-300 relative overflow-hidden group"
          >
            <span className="relative z-10">Logout</span>
            <span className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md"></span>
          </button>
        ) : (
          <button
            onClick={() => setShowLogin(true)}
            className="text-xs border border-gray-700 px-3 py-1 rounded text-gray-300 hover:bg-casa-red/20 hover:border-casa-red transition-all duration-300 relative overflow-hidden group"
          >
            <span className="relative z-10">Login</span>
            <span className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md"></span>
          </button>
        )}

        {token && (
          <button
            onClick={onOrdersClick}
            className="text-xs border border-gray-700 px-3 py-1 rounded text-gray-300 hover:bg-casa-red/20 hover:border-casa-red transition-all duration-300 relative overflow-hidden group"
          >
            <span className="relative z-10">Meus Pedidos</span>
            <span className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md"></span>
          </button>
        )}
      </div>
    </div>
  </motion.header>
);