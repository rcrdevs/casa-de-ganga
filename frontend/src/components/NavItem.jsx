export const NavItem = ({ children, targetId }) => (
  <a
    href={`#${targetId}`}
    className="text-gray-400 hover:text-red-500 text-sm md:text-base font-['Cinzel Decorative'] tracking-widest uppercase transition-all duration-300 relative overflow-hidden group"
    onClick={(e) => {
      e.preventDefault();
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
    }}
  >
    <span className="relative z-10">{children}</span>
    {/* Efeito esfumaçado no hover */}
    <span className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md"></span>
  </a>
);