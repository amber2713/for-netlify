import React, { useState } from 'react';
import HomePage from './components/HomePage';
import CharacterCreator from './components/CharacterCreator';

function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'creator'>('home');

  const navigateToCreator = () => {
    setCurrentPage('creator');
  };

  const navigateToHome = () => {
    setCurrentPage('home');
  };

  return (
    <div className="font-cambria">
      {currentPage === 'home' ? (
        <HomePage onNavigate={navigateToCreator} />
      ) : (
        <CharacterCreator onBack={navigateToHome} />
      )}
    </div>
  );
}

export default App;