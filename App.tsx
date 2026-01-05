import React, { useState, useEffect } from 'react';
import { View, WordItem } from './types';
import FlashcardView from './components/FlashcardView';
import QuizView from './components/QuizView';
import GameView from './components/GameView';
import LandingView from './components/LandingView';
import LoginView from './components/LoginView';
import MyWordsView from './components/MyWordsView';
import { VOCABULARY } from './constants';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.Landing);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [savedWords, setSavedWords] = useState<string[]>(() => {
    const local = localStorage.getItem('my_words_list');
    return local ? JSON.parse(local) : [];
  });

  useEffect(() => {
    localStorage.setItem('my_words_list', JSON.stringify(savedWords));
  }, [savedWords]);

  const toggleSaveWord = (word: string) => {
    setSavedWords(prev => 
      prev.includes(word) ? prev.filter(w => w !== word) : [...prev, word]
    );
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    setCurrentView(View.Home);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentView(View.Landing);
  };

  const renderView = () => {
    const viewContent = (() => {
      switch (currentView) {
        case View.Landing:
          return <LandingView 
                    onGetStarted={() => setCurrentView(isLoggedIn ? View.Home : View.Login)} 
                    isLoggedIn={isLoggedIn}
                  />;
        case View.Login:
          return <LoginView onLogin={handleLogin} />;
        case View.Flashcards:
          return <FlashcardView 
                    onBack={() => setCurrentView(View.Home)} 
                    onToggleSave={toggleSaveWord}
                    savedWords={savedWords}
                  />;
        case View.Quiz:
          return <QuizView onBack={() => setCurrentView(View.Home)} />;
        case View.Game:
          return <GameView onBack={() => setCurrentView(View.Home)} />;
        case View.MyWords:
          return <MyWordsView 
                    onBack={() => setCurrentView(View.Home)} 
                    savedWords={savedWords}
                    onToggleSave={toggleSaveWord}
                  />;
        case View.Home:
        default:
          return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
              <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tight">
                Hello, <span className="text-indigo-600 font-black">Future Scholar</span>
              </h1>
              <p className="text-xl text-slate-500 mb-12 max-w-2xl font-medium">
                Your SAT journey is waiting. Which path will you master today?
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
                <button
                  onClick={() => setCurrentView(View.Flashcards)}
                  className="group p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:border-indigo-400 hover:-translate-y-1 transition-all text-left"
                >
                  <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  </div>
                  <h2 className="text-2xl font-black mb-2 text-slate-800">Visual Cards</h2>
                  <p className="text-slate-500 font-medium">Browse the full 2200+ word library with AI visuals.</p>
                </button>

                <button
                  onClick={() => setCurrentView(View.Quiz)}
                  className="group p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:border-emerald-400 hover:-translate-y-1 transition-all text-left"
                >
                  <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                  </div>
                  <h2 className="text-2xl font-black mb-2 text-slate-800">Word Quiz</h2>
                  <p className="text-slate-500 font-medium">Challenge yourself with randomized timed questions.</p>
                </button>

                <button
                  onClick={() => setCurrentView(View.Game)}
                  className="group p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:border-amber-400 hover:-translate-y-1 transition-all text-left"
                >
                  <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-6 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <h2 className="text-2xl font-black mb-2 text-slate-800">Word Sprint</h2>
                  <p className="text-slate-500 font-medium">Beat the clock in a high-speed matching game.</p>
                </button>

                <button
                  onClick={() => setCurrentView(View.MyWords)}
                  className="group p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:border-rose-400 hover:-translate-y-1 transition-all text-left"
                >
                  <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center mb-6 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-all duration-300">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                  </div>
                  <h2 className="text-2xl font-black mb-2 text-slate-800">My Words</h2>
                  <p className="text-slate-500 font-medium">Focus on the {savedWords.length} words that matter most to you.</p>
                </button>
              </div>
            </div>
          );
      }
    })();

    return <div className="view-enter">{viewContent}</div>;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 py-4 px-6 flex justify-between items-center sticky top-0 z-50">
        <div 
          className="flex items-center gap-2 cursor-pointer group" 
          onClick={() => setCurrentView(isLoggedIn ? View.Home : View.Landing)}
        >
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-200">F</div>
          <span className="text-xl font-black text-slate-800 tracking-tight">Fun 2 Learn</span>
        </div>
        
        <div className="flex gap-3 items-center">
          {isLoggedIn ? (
            <>
              <button 
                onClick={() => setCurrentView(View.Home)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${currentView === View.Home ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => setCurrentView(View.MyWords)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${currentView === View.MyWords ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
              >
                Saved ({savedWords.length})
              </button>
              <button 
                onClick={handleLogout}
                className="ml-2 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                title="Logout"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => setCurrentView(View.Login)}
                className="px-5 py-2 text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors"
              >
                Login
              </button>
              <button 
                onClick={() => setCurrentView(View.Login)}
                className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-black hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95"
              >
                Join Free
              </button>
            </>
          )}
        </div>
      </nav>

      <main className="flex-1 container mx-auto py-8">
        {renderView()}
      </main>

      <footer className="py-12 text-center border-t border-slate-100 bg-white mt-20">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center text-white font-bold text-xs">F</div>
            <span className="font-bold text-slate-800">Fun 2 Learn SAT Vocab</span>
          </div>
          <p className="text-slate-400 text-sm font-medium">
            © 2025 fun2learnsatvocab.com • Helping students succeed through visual learning.
          </p>
          <div className="flex gap-6 text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">
             <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
             <a href="#" className="hover:text-indigo-600 transition-colors">Terms</a>
             <a href="#" className="hover:text-indigo-600 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;