import { useState } from 'react';

export const ForgotPasswordModal = ({ isOpen, onClose, showToast }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSent(true);
        showToast('Email enviado com sucesso!', 'success');
      } else {
        showToast(data.message || 'Erro ao enviar', 'error');
      }
    } catch (error) {
      showToast('Erro ao conectar ao servidor', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[150]">
      <div className="bg-zinc-900 border border-red-900/40 p-8 rounded-2xl w-96 text-white relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          ?
        </button>

        <h2 className="text-2xl text-center font-bold mb-6" style={{ color: 'var(--kripta-red-main)' }}>
          Recuperar senha
        </h2>

        {sent ? (
          <div className="text-center space-y-4">
            <p className="text-green-500">Email enviado!</p>
            <p className="text-sm text-gray-300">
              Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
            </p>
            <button
              onClick={onClose}
              className="glitch-button w-full mt-4"
              data-text="Fechar"
            >
              Fechar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-gray-400">
              Digite seu email e enviaremos um link para redefinir sua senha.
            </p>

            <input
              type="email"
              placeholder="Seu email"
              className="w-full p-2 rounded border border-gray-600 bg-transparent text-white focus:border-red-600 outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button
              type="submit"
              className="glitch-button w-full"
              data-text="Enviar"
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Enviar'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};