export function errorHandler(err, req, res, next) {
  console.error(`[${new Date().toISOString()}] Erro:`, err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ message: 'Token inválido' });
  }

  // Erro genérico (não vazar detalhes em produção)
  const message = process.env.NODE_ENV === 'production'
    ? 'Erro interno no servidor'
    : err.message;

  res.status(500).json({ message });
}