import { useState } from 'react';

export const useToast = () => {
  const [toast, setToast] = useState(null);

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  return { toast, showToast };
};