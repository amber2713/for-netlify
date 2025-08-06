import React, { useState, useEffect } from 'react';
import { ArrowLeft, Mail, Coffee, X } from 'lucide-react';

type DialogState = 'initial' | 'options' | 'introduction' | 'other-input' | 'hidden';
type LibrarianState = 'visible' | 'hidden' | 'making-coffee';

function App() {
  const [dialogState, setDialogState] = useState<DialogState>('initial');
  const [librarianState, setLibrarianState] = useState<LibrarianState>('visible');
  const [showAssignment, setShowAssignment] = useState(false);
  const [otherInput, setOtherInput] = useState('');
  const [librarianMessage, setLibrarianMessage] = useState("What can I do for you?");
  const [showIntroduction, setShowIntroduction] = useState(false);

  const handleBackClick = () => {
    window.location.href = 'https://chat.qwen.ai';
  };

  const handleMailClick = () => {
    if (librarianState === 'hidden') {
      setLibrarianMessage("This email contains assignments submitted by students, and you are not allowed to look at them.");
      setLibrarianState('visible');
      setDialogState('initial');
    } else if (librarianState === 'making-coffee') {
      setShowAssignment(true);
    }
  };

  const handleOptionClick = (option: string) => {
    switch (option) {
      case 'Nothing':
        setLibrarianState('hidden');
        setDialogState('hidden');
        break;
      case 'Introduction':
        setShowIntroduction(true);
        setDialogState('introduction');
        break;
      case 'Other':
        setDialogState('other-input');
        setOtherInput('');
        break;
    }
  };

  const handleOtherSubmit = () => {
    if (otherInput.toLowerCase().includes('coffee')) {
      setLibrarianState('making-coffee');
      setLibrarianMessage("Making coffee for you...");
      setDialogState('initial');
      setTimeout(() => {
        setLibrarianMessage("Here's your coffee. In fact, it's been so many years since anyone has been here that I can't even remember how long it's been. My database has suffered severe damage, and this is the only three things I can still do.");
      }, 2000);
    } else {
      setLibrarianMessage("Sorry, I can't do it.");
      setDialogState('initial');
      setTimeout(() => {
        setLibrarianMessage("What can I do for you?");
      }, 2000);
    }
  };

  const handleIntroductionComplete = () => {
    setShowIntroduction(false);
    setLibrarianMessage("What can I do for you?");
    setDialogState('initial');
  };

  const closeAssignment = () => {
    setShowAssignment(false);
  };

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: 'url(/src/assets/English_center.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        fontFamily: 'Cambria, serif'
      }}
    >
      {/* Back Button */}
      <button
        onClick={handleBackClick}
        className="absolute top-6 left-6 z-20 text-white hover:scale-125 transition-transform duration-300 bg-black bg-opacity-30 rounded-full p-3"
      >
        <ArrowLeft size={24} />
      </button>

      {/* Coffee Icon */}
      <div className="absolute top-6 right-32 z-20">
        <Coffee size={32} className="text-amber-600 drop-shadow-lg" />
      </div>

      {/* Mail Icon */}
      <button
        onClick={handleMailClick}
        className="absolute left-6 top-1/2 transform -translate-y-1/2 z-20 text-blue-600 hover:scale-110 transition-transform duration-300 bg-white bg-opacity-80 rounded-full p-3 shadow-lg"
      >
        <Mail size={28} />
      </button>

      {/* Librarian */}
      {librarianState !== 'hidden' && (
        <div className="absolute right-8 bottom-0 z-10">
          <img
            src="/src/assets/tushuguanliyuan.png"
            alt="Librarian"
            className="h-96 object-contain drop-shadow-2xl"
          />
        </div>
      )}

      {/* Dialog Box */}
      {dialogState !== 'hidden' && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-30">
          <div className="bg-white bg-opacity-95 rounded-2xl shadow-2xl p-6 max-w-md mx-4 border-2 border-blue-200">
            {dialogState === 'initial' && (
              <div className="text-center">
                <p className="text-lg text-gray-800 mb-4 font-medium">
                  {librarianMessage}
                </p>
                {librarianMessage === "What can I do for you?" && (
                  <div className="space-y-2">
                    <button
                      onClick={() => handleOptionClick('Nothing')}
                      className="block w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 text-gray-700"
                    >
                      Nothing
                    </button>
                    <button
                      onClick={() => handleOptionClick('Introduction')}
                      className="block w-full py-2 px-4 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors duration-200 text-blue-700"
                    >
                      Introduction
                    </button>
                    <button
                      onClick={() => handleOptionClick('Other')}
                      className="block w-full py-2 px-4 bg-green-100 hover:bg-green-200 rounded-lg transition-colors duration-200 text-green-700"
                    >
                      Other
                    </button>
                  </div>
                )}
              </div>
            )}

            {dialogState === 'introduction' && (
              <div className="text-center">
                {showIntroduction ? (
                  <div>
                    <p className="text-base text-gray-800 mb-4 leading-relaxed">
                      Welcome to our historic library! This magnificent institution was established in 1892 and has served as a beacon of knowledge for over a century. Our collection houses over 500,000 volumes, including rare manuscripts and first editions. The building itself is a masterpiece of Victorian architecture, featuring beautiful stained glass windows and ornate reading rooms that have inspired countless scholars and students throughout the years.
                    </p>
                    <button
                      onClick={handleIntroductionComplete}
                      className="py-2 px-6 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
                    >
                      Continue
                    </button>
                  </div>
                ) : (
                  <p className="text-lg text-gray-800">Loading introduction...</p>
                )}
              </div>
            )}

            {dialogState === 'other-input' && (
              <div className="text-center">
                <p className="text-lg text-gray-800 mb-4">
                  What would you like me to help you with?
                </p>
                <input
                  type="text"
                  value={otherInput}
                  onChange={(e) => setOtherInput(e.target.value)}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg mb-4 focus:border-blue-500 focus:outline-none"
                  placeholder="Type your request here..."
                  autoFocus
                />
                <button
                  onClick={handleOtherSubmit}
                  className="py-2 px-6 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200"
                >
                  Submit
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      {showAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden">
            <button
              onClick={closeAssignment}
              className="absolute top-4 right-4 z-10 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-colors duration-200"
            >
              <X size={20} />
            </button>
            <img
              src="/src/assets/zuoye.jpg"
              alt="Assignment"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;