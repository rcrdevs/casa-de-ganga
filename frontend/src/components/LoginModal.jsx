import { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../firebase';

const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
  return re.test(email);
};

const isValidFullName = (name) => {
  if (!name) return false;
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2;
};

export const LoginModal = ({ onLogin, isDark, showToast, onClose, onForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [name, setName] = useState('');
  const [errors, setErrors] = useState({});
  const [liveErrors, setLiveErrors] = useState({});

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!isValidEmail(email)) {
      showToast('E-mail inválido', 'error');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        showToast(data.message || 'Erro no login', 'error');
        return;
      }

      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      onLogin(data.accessToken);
    } catch {
      showToast('Servidor indisponível', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    if (Object.values(liveErrors).some((err) => err)) {
      showToast('Corrija os erros antes de continuar.', 'error');
      return;
    }

    e.preventDefault();

    const newErrors = {};

    if (!isValidFullName(name)) {
      newErrors.name = 'Digite seu nome completo (mínimo 2 nomes).';
    }
    if (!isValidEmail(email)) {
      newErrors.email = 'E-mail inválido.';
    }
    if (password.length < 8) {
      newErrors.password = 'A senha deve ter no mínimo 8 caracteres.';
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        showToast(data.message || 'Erro no cadastro', 'error');
        return;
      }

      setMessage('Cadastro realizado com sucesso!');
      setTimeout(() => setMessage(null), 3000);

      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      onLogin(data.accessToken);

      setPassword('');
      setConfirmPassword('');
    } catch {
      showToast('Erro ao conectar ao servidor', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        onLogin(data.accessToken);
        showToast('Bem-vindo à Kripta!', 'success');
      } else {
        showToast(data.message || 'Erro no login', 'error');
      }
    } catch (error) {
      console.error('Erro Google Login:', error);
      if (error.code !== 'auth/cancelled-popup-request') {
        showToast('Erro ao conectar com Google', 'error');
      }
    }
  };

  const handleForgotPasswordClick = () => {
    onClose();           // fecha o modal
    onForgotPassword();  // função passada pelo App que faz navigate('/forgot-password')
  };

  return (
    <div className="flex items-center justify-center">
      {message && (
        <div className="fixed top-5 right-5 bg-zinc-900 text-white px-4 py-3 rounded-lg shadow-xl border border-red-600 animate-fade-in">
          {message}
        </div>
      )}

      <form
        onSubmit={isRegister ? handleRegister : handleEmailLogin}
        className={`p-8 rounded-2xl shadow-2xl w-96 space-y-4 border border-red-900/40 ${
          isDark ? 'bg-zinc-900 text-white' : 'bg-white text-black'
        }`}
      >
        <h2
          className="text-2xl text-center font-bold"
          style={{ color: 'var(--kripta-red-main)' }}
        >
          {isRegister ? 'Criar Conta' : 'Login'}
        </h2>

        {isRegister && (
          <>
            <input
              type="text"
              placeholder="Nome e Sobrenome"
              className={`w-full p-2 rounded border bg-transparent ${
                liveErrors.name ? 'border-red-500' : 'border-gray-600'
              }`}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setLiveErrors((prev) => ({
                  ...prev,
                  name: isValidFullName(e.target.value) ? null : 'Digite nome e sobrenome.',
                }));
              }}
            />
            {liveErrors.name && <p className="text-xs text-red-500">{liveErrors.name}</p>}
            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
          </>
        )}

        <input
          type="email"
          placeholder="Email"
          className={`w-full p-2 rounded border bg-transparent ${
            liveErrors.email ? 'border-red-500' : 'border-gray-600'
          }`}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setLiveErrors((prev) => ({
              ...prev,
              email: isValidEmail(e.target.value) ? null : 'Digite um e-mail válido.',
            }));
          }}
        />
        {liveErrors.email && <p className="text-xs text-red-500">{liveErrors.email}</p>}
        {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}

        <input
          type="password"
          placeholder="Senha"
          className={`w-full p-2 rounded border bg-transparent ${
            liveErrors.password ? 'border-red-500' : 'border-gray-600'
          }`}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setLiveErrors((prev) => ({
              ...prev,
              password:
                e.target.value.length >= 8 ? null : 'A senha deve ter pelo menos 8 caracteres.',
            }));
          }}
        />
        {liveErrors.password && <p className="text-xs text-red-500">{liveErrors.password}</p>}
        {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}

        {isRegister && (
          <>
            <input
              type="password"
              placeholder="Confirmar senha"
              className={`w-full p-2 rounded border bg-transparent ${
                liveErrors.confirmPassword ? 'border-red-500' : 'border-gray-600'
              }`}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setLiveErrors((prev) => ({
                  ...prev,
                  confirmPassword:
                    e.target.value === password ? null : 'As senhas não coincidem.',
                }));
              }}
            />
            {liveErrors.confirmPassword && (
              <p className="text-xs text-red-500">{liveErrors.confirmPassword}</p>
            )}
          </>
        )}
        {errors.confirmPassword && (
          <p className="text-xs text-red-500">{errors.confirmPassword}</p>
        )}

        {/* Link "Esqueci minha senha" (visível apenas no modo login) */}
        {!isRegister && (
          <div className="text-right text-sm">
            <button
              type="button"
              onClick={handleForgotPasswordClick}
              className="text-red-500 hover:underline"
            >
              Esqueci minha senha
            </button>
          </div>
        )}

        <button
          type="submit"
          className="glitch-button w-full"
          data-text={isRegister ? 'OK' : 'Entrar'}
          disabled={loading}
        >
          {loading
            ? isRegister
              ? 'Criando...'
              : 'Entrando...'
            : isRegister
            ? 'OK'
            : 'Entrar'}
        </button>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 border border-gray-700 rounded py-2 hover:bg-zinc-800 transition"
        >
          <FcGoogle size={20} />
          <span>Entrar com Google</span>
        </button>

        <div className="text-center text-sm mt-4">
          {isRegister ? (
            <button
              type="button"
              onClick={() => setIsRegister(false)}
              className="text-red-500 hover:underline"
            >
              Já tem conta? Fazer login
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsRegister(true)}
              className="text-red-500 hover:underline"
            >
              Não tem conta? Criar cadastro
            </button>
          )}
        </div>
      </form>
    </div>
  );
};