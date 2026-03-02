// src/components/Header.jsx
import { motion } from 'framer-motion';
import { NavItem } from './NavItem';
// Importação da logo (certifique-se de que o caminho está correto)
import logoKripta from '../assets/casa-de-ganga.png';

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
    // Fundo preto (ganga-black) com borda cinza escura
    className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-ganga-gray bg-ganga-black/95 shadow-md"
    initial={{ y: -80, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
  >
    <div className="container mx-auto px-6 md:px-8 py-4 flex justify-between items-center">
      
      {/* Logo no lugar do texto */}
      <a
        href="#hero"
        className="flex items-center transition-transform hover:scale-105"
      >
        <img 
          src={logoKripta} 
          alt="Logo Casa de Ganga" 
          className="h-10 md:h-12 w-auto object-contain" 
        />
      </a>

      <div className="hidden md:flex gap-8 text-sm uppercase tracking-widest text-ganga-silver">
        <NavItem targetId="catalogo">Catálogo</NavItem>
        <NavItem targetId="sobre">Sobre</NavItem>
        <NavItem targetId="footer">Contato</NavItem>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={openCart}
          // Estilização atualizada para o hover vermelho escuro
          className="text-xs border border-ganga-gray px-4 py-2 rounded text-ganga-white hover:bg-ganga-red hover:border-ganga-red-light transition-all duration-300 relative overflow-hidden group"
        >
          <span className="relative z-10">Carrinho ({cartTotalItems})</span>
          <span className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md"></span>
        </button>

        {token ? (
          <button
            onClick={handleLogout}
            className="text-xs border border-ganga-gray px-4 py-2 rounded text-ganga-white hover:bg-ganga-red hover:border-ganga-red-light transition-all duration-300 relative overflow-hidden group"
          >
            <span className="relative z-10">Logout</span>
            <span className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md"></span>
          </button>
        ) : (
          <button
            onClick={() => setShowLogin(true)}
            className="text-xs border border-ganga-gray px-4 py-2 rounded text-ganga-white hover:bg-ganga-red hover:border-ganga-red-light transition-all duration-300 relative overflow-hidden group"
          >
            <span className="relative z-10">Login</span>
            <span className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md"></span>
          </button>
        )}

        {token && (
          <button
            onClick={onOrdersClick}
            className="text-xs border border-ganga-gray px-4 py-2 rounded text-ganga-white hover:bg-ganga-red hover:border-ganga-red-light transition-all duration-300 relative overflow-hidden group"
          >
            <span className="relative z-10">Meus Pedidos</span>
            <span className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md"></span>
          </button>
        )}
      </div>
    </div>
  </motion.header>
);