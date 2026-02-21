import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary capturou um erro:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-zinc-900 border border-red-900/50 p-8 rounded-xl max-w-md w-full text-center">
          <h2 className="text-red-500 text-xl mb-4">Ops! Algo deu errado.</h2>
          <p className="text-gray-300 mb-4">Não foi possível carregar o pagamento. Tente novamente mais tarde.</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="glitch-button"
          >
            Tentar novamente
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;