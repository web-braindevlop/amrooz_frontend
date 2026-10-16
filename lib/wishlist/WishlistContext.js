'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('wishlist');
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to parse wishlist:', error);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('wishlist', JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const addItem = (product) => {
    setItems((prev) => {
      // Avoid duplicates
      if (prev.some((item) => item.id === product.id)) {
        return prev;
      }
      return [...prev, product];
    });
  };

  const removeItem = (productId) => {
    setItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const isInWishlist = (productId) => {
    return items.some((item) => item.id === productId);
  };

  const clearWishlist = () => {
    setItems([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        isInWishlist,
        clearWishlist,
        count: items.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
}
