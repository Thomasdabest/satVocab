import React, { useState, useMemo, useEffect } from 'react';
import { VOCABULARY } from '../constants';
import { WordItem, LeaderboardEntry } from '../types';

interface QuizViewProps {
  onBack: () => void;
  userName: string;
}

const QuizView: React.FC<QuizViewProps> = ({ onBack, userName }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Daily Reset Logic
  const getDayID = () => {
    const now = new Date();
    return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  };

  useEffect(() => {
    const savedDay = localStorage.getItem('quiz_leaderboard_day');
    const today = getDayID();
    
    if (savedDay !== today) {
      localStorage.setItem('quiz_leaderboard_day', today);
      localStorage.setItem('quiz_leaderboard', JSON.stringify([]));
    }
    
    const savedBoard = localStorage.getItem('quiz_leaderboard');
    if (savedBoard) setLeaderboard(JSON.parse(savedBoard));
  }, []);

  const saveScore = (finalScore: number) => {
    const newEntry: LeaderboardEntry = {
      name: userName,
      score: finalScore,
      date: Date.now()
    };
    
    const updated = [...leaderboard, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    
    setLeaderboard(updated);
    localStorage.setItem('quiz_leaderboard', JSON.stringify(updated));
  };

  const getNextResetTime = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    return `${hours}h ${minutes}m left`;
  };

  const questions = useMemo(() => {
    return [...VOCABULARY].sort(() => 0.5 - Math.random()).slice(0, 10);
  }, []);

  const currentQuestion = questions[currentStep];

  const options = useMemo(() => {
    if (!currentQuestion) return [];
    const others = VOCABULARY.filter(v => v.word !== currentQuestion.word)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    return [...others, currentQuestion].sort(() => 0.5 - Math.random());
  }, [currentQuestion]);

  const handleSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);
    if (options[index].word === currentQuestion.word) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      saveScore(score);
      setShowResult(true);
    }
  };

  if (showResult) {
    const percentage = (score / questions.length) * 100;
    return (
      <div className="max-w-4xl mx-auto px-4 view-enter">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-[3rem] p-10 shadow-xl border border-slate-100 text-center flex flex-col justify-center">
            <div className="mb-6 inline-block p-4 bg-emerald-100 rounded-full text-emerald-600 mx-auto">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h2 className="text-4xl font-black mb-2 text-slate-800 tracking-tight">Quiz Complete!</h2>
            <p className="text-slate-500 mb-8 text-lg font-medium">You scored {score} out of {questions.length}</p>
            
            <div className="relative w-40 h-40 mx-auto mb-10">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-50" />
                <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" 
                  strokeDasharray={439.8}
                  strokeDashoffset={439.8 - (439.8 * percentage) / 100}
                  className="text-emerald-500 transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-black text-slate-800">{Math.round(percentage)}%</span>
              </div>
            </div>

            <button 
              onClick={onBack}
              className="bg-indigo-600 text-white w-full py-4 rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-xl active:scale-95"
            >
              Back to Dashboard
            </button>
          </div>

          <div className="bg-white rounded-[3rem] p-10 shadow-xl border border-slate-100 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Daily Top Scores</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Resets at midnight</p>
              </div>
              <div className="bg-slate-50 px-4 py-2 rounded-xl text-right">
                <span className="block text-[10px] font-black text-slate-300 uppercase tracking-tighter">Next Reset</span>
                <span className="text-xs font-black text-indigo-600">{getNextResetTime()}</span>
              </div>
            </div>

            <div className="flex-1 space-y-3">
              {leaderboard.map((entry, idx) => (
                <div key={idx} className={`flex justify-between items-center p-4 rounded-2xl border transition-all ${idx === 0 ? 'bg-indigo-50 border-indigo-100' : 'bg-white border-slate-50'}`}>
                  <div className="flex items-center gap-4">
                    <span className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-black ${
                      idx === 0 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 
                      idx === 1 ? 'bg-slate-200 text-slate-600' :
                      idx === 2 ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-50 text-slate-400'
                    }`}>
                      {idx + 1}
                    </span>
                    <span className="font-bold text-slate-700 truncate max-w-[120px]">{entry.name}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-black text-slate-800">{entry.score}/10</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4">
      <div className="mb-8">
        <div className="flex justify-between items-end mb-4">
          <div>
            <span className="text-indigo-600 font-bold uppercase tracking-widest text-xs">Question {currentStep + 1}</span>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Identify the Word</h2>
          </div>
          <div className="text-right">
            <span className="block text-[10px] font-black text-slate-300 uppercase tracking-widest">Current Score</span>
            <span className="text-xl font-black text-emerald-500 tabular-nums">{score}</span>
          </div>
        </div>
        <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner">
          <div 
            className="h-full bg-indigo-500 transition-all duration-500 ease-out" 
            style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 mb-8 relative overflow-hidden">
        <p className="text-2xl font-bold text-slate-700 mb-10 italic leading-relaxed z-10 relative">
          "{currentQuestion.meaning}"
        </p>

        <div className="grid grid-cols-1 gap-4 z-10 relative">
          {options.map((opt, idx) => {
            let style = "border-slate-100 hover:border-indigo-400 hover:bg-indigo-50 hover:shadow-lg translate-y-0";
            if (isAnswered) {
              if (opt.word === currentQuestion.word) {
                style = "bg-emerald-500 border-emerald-500 text-white shadow-xl shadow-emerald-100 -translate-y-1";
              } else if (selectedOption === idx) {
                style = "bg-rose-500 border-rose-500 text-white shadow-xl shadow-rose-100 animate-shake";
              } else {
                style = "opacity-30 border-slate-50 grayscale";
              }
            } else if (selectedOption === idx) {
              style = "border-indigo-600 bg-indigo-50 ring-4 ring-indigo-50 -translate-y-1";
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={isAnswered}
                className={`w-full p-6 text-left rounded-3xl border-2 font-black text-xl transition-all duration-300 flex items-center justify-between ${style}`}
              >
                <span className="uppercase tracking-tight">{opt.word}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end">
        {isAnswered && (
          <button 
            onClick={handleNext}
            className="bg-indigo-600 text-white px-10 py-5 rounded-[2rem] font-black text-xl hover:bg-indigo-700 transition-all flex items-center gap-3 shadow-2xl hover:scale-105 active:scale-95"
          >
            {currentStep === questions.length - 1 ? 'See Results' : 'Next Word'}
          </button>
        )}
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }
      `}</style>
    </div>
  );
};

export default QuizView;