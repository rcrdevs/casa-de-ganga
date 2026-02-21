const API_URL = import.meta.env.VITE_API_URL;

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!response.ok) {
      // Se falhou, remove tokens e retorna null
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      return null;
    }
    const data = await response.json();
    localStorage.setItem('accessToken', data.accessToken);
    return data.accessToken;
  } catch {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return null;
  }
}

export const api = {
  async request(endpoint, options = {}) {
    let token = localStorage.getItem('accessToken');

    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    try {
      let response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });

      // Se o token expirou (403), tenta renovar
      if (response.status === 403) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          // Refaz a requisição com o novo token
          headers.Authorization = `Bearer ${newToken}`;
          response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
          });
        } else {
          // Não conseguiu renovar: lança erro específico, sem redirecionar
          throw new Error('Sessão expirada. Faça login novamente.');
        }
      }

      const data = await response.json();

      if (!response.ok) {
        // Se o status ainda não for OK, lança erro com a mensagem da API
        throw new Error(data.message || 'Erro na requisição');
      }

      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error; // Repassa o erro para quem chamou
    }
  },

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },

  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
};