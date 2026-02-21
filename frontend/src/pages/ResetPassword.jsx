import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }
    if (newPassword.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres');
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('Senha redefinida com sucesso! Redirecionando...');
        setTimeout(() => navigate('/'), 3000);
      } else {
        setError(data.message || 'Erro ao redefinir senha');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="bg-zinc-900 p-8 rounded-2xl w-96 border border-red-900/40 text-center">
          <p className="text-red-500">Token inválido ou ausente.</p>
          <Link to="/forgot-password" className="text-red-500 hover:underline mt-4 block">
            Solicitar novo link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="bg-zinc-900 p-8 rounded-2xl w-96 border border-red-900/40">
        <h2 className="text-2xl text-center font-bold mb-6" style={{ color: 'var(--kripta-red-main)' }}>
          Redefinir senha
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="Nova senha"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full p-2 rounded border bg-transparent border-gray-600 text-white focus:border-red-600 outline-none"
          />
          <input
            type="password"
            placeholder="Confirmar nova senha"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full p-2 rounded border bg-transparent border-gray-600 text-white focus:border-red-600 outline-none"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {message && <p className="text-green-500 text-sm">{message}</p>}
          <button
            type="submit"
            disabled={loading}
            className="glitch-button w-full"
            data-text="Redefinir"
          >
            {loading ? 'Redefinindo...' : 'Redefinir'}
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