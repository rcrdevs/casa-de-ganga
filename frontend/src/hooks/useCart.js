import { useState, useEffect } from 'react';

export const useCart = () => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cart');
      if (saved) setCart(JSON.parse(saved));
    } catch {
      setCart([]);
    }
  }, []);

  const addToCart = (product) => {
    if (!product || !product.id) return;

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      let updatedCart;

      if (existingItem) {
        updatedCart = prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: (item.quantity || 1) + 1 } : item
        );
      } else {
        updatedCart = [...prevCart, { ...product, quantity: 1 }];
      }

      localStorage.setItem('cart', JSON.stringify(updatedCart));
      return updatedCart;
    });
  };

  const removeFromCart = (id) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === id);
      if (!existingItem) return prevCart;

      let updatedCart;
      if (existingItem.quantity > 1) {
        updatedCart = prevCart.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        );
      } else {
        updatedCart = prevCart.filter((item) => item.id !== id);
      }

      localStorage.setItem('cart', JSON.stringify(updatedCart));
      return updatedCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  return { cart, addToCart, removeFromCart, clearCart };
};