
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { VOCABULARY } from '../constants';
import { WordItem } from '../types';

interface GameViewProps {
  onBack: () => void;
}

const GAME_DURATION = 30;

const GameView: React.FC<GameViewProps> = ({ onBack }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [score, setScore] = useState(0);
  const [currentWord, setCurrentWord] = useState<WordItem | null>(null);
  const [options, setOptions] = useState<WordItem[]>([]);
  const [showGameOver, setShowGameOver] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const spawnRound = useCallback(() => {
    const target = VOCABULARY[Math.floor(Math.random() * VOCABULARY.length)];
    const others = VOCABULARY.filter(v => v.word !== target.word)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    
    setCurrentWord(target);
    setOptions([...others, target].sort(() => 0.5 - Math.random()));
    setFeedback(null);
  }, []);

  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setShowGameOver(false);
    spawnRound();
  };

  const handleGuess = (word: string) => {
    if (!currentWord || !isPlaying) return;

    if (word === currentWord.word) {
      setScore(s => s + 10);
      setFeedback('correct');
      setTimeout(spawnRound, 300);
    } else {
      setScore(s => Math.max(0, s - 5));
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 500);
    }
  };

  useEffect(() => {
    let timer: number;
    if (isPlaying && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsPlaying(false);
      setShowGameOver(true);
    }
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft]);

  if (showGameOver) {
    return (
      <div className="max-w-xl mx-auto text-center py-16 px-4 bg-white rounded-3xl shadow-xl border border-slate-100">
        <h2 className="text-5xl font-black text-amber-500 mb-4">Time's Up!</h2>
        <div className="text-2xl font-bold text-slate-600 mb-8">
          Final Score: <span className="text-slate-900 text-4xl">{score}</span>
        </div>
        <div className="flex flex-col gap-4">
          <button 
            onClick={startGame}
            className="bg-amber-500 text-white px-8 py-4 rounded-2xl font-bold hover:bg-amber-600 transition-all text-xl shadow-lg active:scale-95"
          >
            Play Again
          </button>
          <button 
            onClick={onBack}
            className="text-slate-400 hover:text-slate-600 font-medium"
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  if (!isPlaying) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 bg-amber-50 rounded-3xl border-2 border-dashed border-amber-200">
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 bg-amber-500 rounded-full flex items-center justify-center text-white shadow-xl">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
        </div>
        <h1 className="text-4xl font-bold text-slate-800 mb-4">Vocabulary Sprint</h1>
        <p className="text-slate-600 mb-12 max-w-md mx-auto">
          You have {GAME_DURATION} seconds to match as many words as possible to their definitions. 
          +10 for correct, -5 for wrong!
        </p>
        <button 
          onClick={startGame}
          className="bg-amber-500 text-white px-12 py-4 rounded-2xl font-bold text-xl hover:bg-amber-600 transition-all shadow-lg active:scale-95"
        >
          START SPRINT
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4">
      <div className="flex justify-between items-center mb-12">
        <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="text-slate-400 font-bold uppercase text-xs tracking-widest">Time</div>
          <div className={`text-3xl font-black tabular-nums ${timeLeft <= 5 ? 'text-rose-500 animate-pulse' : 'text-slate-800'}`}>
            {timeLeft}s
          </div>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="text-slate-400 font-bold uppercase text-xs tracking-widest">Score</div>
          <div className="text-3xl font-black text-amber-500 tabular-nums">
            {score}
          </div>
        </div>
      </div>

      <div className={`bg-white p-10 rounded-[3rem] shadow-2xl border-4 transition-colors duration-300 relative overflow-hidden ${
        feedback === 'correct' ? 'border-emerald-500' : 
        feedback === 'wrong' ? 'border-rose-500 animate-shake' : 
        'border-slate-100'
      }`}>
        <div className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mb-4">Definition</div>
        <p className="text-2xl md:text-3xl font-bold text-slate-700 leading-tight mb-12 min-h-[100px] flex items-center">
          "{currentWord?.meaning}"
        </p>

        <div className="grid grid-cols-2 gap-4">
          {options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleGuess(opt.word)}
              className="bg-slate-50 border-2 border-slate-200 p-6 rounded-3xl font-black text-xl text-slate-700 hover:border-amber-400 hover:bg-amber-50 transition-all active:scale-95"
            >
              {opt.word}
            </button>
          ))}
        </div>

        {feedback && (
          <div className={`absolute top-4 right-8 text-2xl font-black ${feedback === 'correct' ? 'text-emerald-500' : 'text-rose-500'}`}>
            {feedback === 'correct' ? '+10' : '-5'}
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }
      `}</style>
    </div>
  );
};

export default GameView;
