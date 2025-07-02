import { useEffect, useState } from 'react';

const STORAGE_KEY = 'cascade-game-visited';

export const useFirstVisit = () => {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const hasVisited = localStorage.getItem(STORAGE_KEY);
    if (!hasVisited) {
      setShowModal(true);
    }
  }, []);

  const closeModal = () => {
    setShowModal(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  return {
    showModal,
    closeModal,
  };
}; 