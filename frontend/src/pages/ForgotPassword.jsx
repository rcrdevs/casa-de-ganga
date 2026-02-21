import { useState } from 'react';
import { Link } from 'react-router-dom';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('Se o email existir, enviaremos instruções para redefinir sua senha.');
      } else {
        setError(data.message || 'Erro ao solicitar recuperação');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="bg-zinc-900 p-8 rounded-2xl w-96 border border-red-900/40">
        <h2 className="text-2xl text-center font-bold mb-6" style={{ color: 'var(--kripta-red-main)' }}>
          Recuperar senha
        </h2>
        <p className="text-gray-400 text-sm mb-4 text-center">
          Digite seu email e enviaremos um link para redefinir sua senha.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-2 rounded border bg-transparent border-gray-600 text-white focus:border-red-600 outline-none"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {message && <p className="text-green-500 text-sm">{message}</p>}
          <button
            type="submit"
            disabled={loading}
            className="glitch-button w-full"
            data-text="Enviar"
          >
            {loading ? 'Enviando...' : 'Enviar'}
          </button>
          <div className="text-center text-sm">
            <Link to="/" className="text-red-500 hover:underline">
              Voltar para a loja
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}