export const ThemeToggle = ({ theme, onToggleTheme }) => {
  const isDark = theme === 'dark';

  return (
    <button
      onClick={onToggleTheme}
      className="relative w-10 h-10 flex items-center justify-center group transition-all duration-300"
    >
      {isDark ? (
        <span className="text-red-600 text-2xl transition-all duration-500 group-hover:scale-125 group-hover:drop-shadow-[0_0_15px_red]">
          &#x26E7;
        </span>
      ) : (
        <span className="text-yellow-400 text-2xl transition-all duration-500 group-hover:scale-125 group-hover:drop-shadow-[0_0_15px_gold]">
          &#x2600;
        </span>
      )}
    </button>
  );
};