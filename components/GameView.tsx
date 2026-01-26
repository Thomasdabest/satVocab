import React, { useState, useEffect } from 'react';
import { SAT_UNITS } from '../sat_questions';
import { SATUnit, SATQuestion, User } from '../types';

interface GameViewProps {
  onBack: () => void;
}

const GameView: React.FC<GameViewProps> = ({ onBack }) => {
  const [selectedUnit, setSelectedUnit] = useState<SATUnit | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [userProgress, setUserProgress] = useState<Record<number, number>>({});
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; selected: string } | null>(null);

  useEffect(() => {
    const session = localStorage.getItem('vocab_app_session');
    if (session) {
      const user: User = JSON.parse(session);
      setUserProgress(user.unitProgress || {});
    }
  }, []);

  const handleUnitSelect = (unit: SATUnit) => {
    setSelectedUnit(unit);
    setCurrentStep(0);
    setScore(0);
    setShowResults(false);
    setFeedback(null);
  };

  const handleAnswer = (label: string) => {
    if (feedback || !selectedUnit) return;

    const question = selectedUnit.questions[currentStep];
    const isCorrect = label === question.answer;
    
    if (isCorrect) setScore(s => s + 1);
    
    setFeedback({ isCorrect, selected: label });

    setTimeout(() => {
      if (currentStep + 1 < selectedUnit.questions.length) {
        setCurrentStep(prev => prev + 1);
        setFeedback(null);
      } else {
        finishUnit();
      }
    }, 1000);
  };

  const finishUnit = () => {
    setShowResults(true);
    if (!selectedUnit) return;

    // Save progress to database
    const session = localStorage.getItem('vocab_app_session');
    if (session) {
      const user: User = JSON.parse(session);
      const newProgress = { ...(user.unitProgress || {}), [selectedUnit.id]: Math.max((user.unitProgress?.[selectedUnit.id] || 0), score) };
      user.unitProgress = newProgress;
      
      // Update global user database too
      const usersJson = localStorage.getItem('vocab_app_users');
      if (usersJson) {
        const users: User[] = JSON.parse(usersJson);
        const uIdx = users.findIndex(u => u.email === user.email);
        if (uIdx !== -1) {
          users[uIdx].unitProgress = newProgress;
          localStorage.setItem('vocab_app_users', JSON.stringify(users));
        }
      }
      
      localStorage.setItem('vocab_app_session', JSON.stringify(user));
      setUserProgress(newProgress);
    }
  };

  if (showResults && selectedUnit) {
    const total = selectedUnit.questions.length;
    const percentage = Math.round((score / total) * 100);
    
    return (
      <div className="max-w-xl mx-auto px-4 view-enter">
        <div className="bg-white rounded-[3.5rem] p-12 shadow-2xl border border-slate-100 text-center">
          <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h2 className="text-4xl font-black text-slate-800 mb-2">{selectedUnit.title} Complete</h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-10">Module Assessment Results</p>
          
          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="bg-slate-50 p-6 rounded-3xl">
              <span className="block text-[10px] font-black text-slate-400 uppercase mb-1">Score</span>
              <span className="text-3xl font-black text-indigo-600">{score} / {total}</span>
            </div>
            <div className="bg-slate-50 p-6 rounded-3xl">
              <span className="block text-[10px] font-black text-slate-400 uppercase mb-1">Accuracy</span>
              <span className="text-3xl font-black text-emerald-500">{percentage}%</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={() => setSelectedUnit(null)}
              className="bg-indigo-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-indigo-700 transition-all shadow-xl active:scale-95"
            >
              Back to Units
            </button>
            <button 
              onClick={() => handleUnitSelect(selectedUnit)}
              className="text-slate-400 hover:text-slate-600 font-bold uppercase tracking-widest text-xs mt-4"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (selectedUnit) {
    const question = selectedUnit.questions[currentStep];
    return (
      <div className="max-w-3xl mx-auto px-4 view-enter">
        <div className="flex justify-between items-center mb-8">
          <button onClick={() => setSelectedUnit(null)} className="text-slate-400 hover:text-indigo-600 font-bold flex items-center gap-2 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Abort Test
          </button>
          <div className="bg-white px-6 py-2 rounded-2xl shadow-sm border border-slate-100 font-black text-slate-800">
            {selectedUnit.title} • {currentStep + 1} / {selectedUnit.questions.length}
          </div>
        </div>

        <div className="bg-white rounded-[4rem] shadow-2xl overflow-hidden border border-slate-100 p-12 md:p-16 relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
          
          <div className="mb-12">
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] block mb-4">Reading & Writing</span>
            <p className="text-2xl md:text-3xl font-bold text-slate-800 leading-relaxed italic">
              "{question.text}"
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {question.options.map((opt) => {
              const isSelected = feedback?.selected === opt.label;
              const isCorrect = opt.label === question.answer;
              
              let styles = "border-slate-100 bg-slate-50 text-slate-600 hover:border-indigo-400 hover:bg-white";
              if (feedback) {
                if (isCorrect) styles = "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-lg shadow-emerald-100";
                else if (isSelected) styles = "border-rose-500 bg-rose-50 text-rose-700 animate-shake";
                else styles = "border-slate-50 opacity-40 grayscale";
              }

              return (
                <button
                  key={opt.label}
                  disabled={!!feedback}
                  onClick={() => handleAnswer(opt.label)}
                  className={`w-full p-6 md:p-8 rounded-3xl border-2 transition-all flex items-center text-left group ${styles}`}
                >
                  <span className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl mr-6 shrink-0 transition-colors ${
                    feedback ? (isCorrect ? 'bg-emerald-500 text-white' : (isSelected ? 'bg-rose-500 text-white' : 'bg-slate-200 text-slate-400')) : 'bg-white border border-slate-200 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600'
                  }`}>
                    {opt.label}
                  </span>
                  <span className="text-xl font-black uppercase tracking-tight">{opt.text}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 view-enter pb-20">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter">SAT Vocabulary Units</h1>
        <p className="text-lg text-slate-500 font-medium max-w-xl mx-auto">Complete all 38 modules to master 456 critical fill-in-the-blank questions from actual practice tests.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {SAT_UNITS.map((unit) => {
          const highscore = userProgress[unit.id];
          const isStarted = highscore !== undefined;
          const isMastered = highscore === unit.questions.length;

          return (
            <button
              key={unit.id}
              onClick={() => handleUnitSelect(unit)}
              className={`group relative p-8 rounded-[2.5rem] border-2 transition-all hover:-translate-y-1 active:scale-95 text-center flex flex-col items-center justify-center min-h-[180px] ${
                isMastered ? 'bg-emerald-50 border-emerald-200' : 
                isStarted ? 'bg-indigo-50 border-indigo-200' :
                'bg-white border-slate-100 hover:border-indigo-400 shadow-sm hover:shadow-2xl'
              }`}
            >
              {isMastered && (
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                </div>
              )}
              
              <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1 group-hover:text-indigo-600 transition-colors">Module</span>
              <span className={`text-4xl font-black mb-3 ${isMastered ? 'text-emerald-600' : 'text-slate-800'}`}>{unit.id}</span>
              
              {isStarted ? (
                <div className="text-[10px] font-black uppercase tracking-tighter bg-white/60 px-3 py-1 rounded-lg text-slate-500">
                  Best: {highscore}/{unit.questions.length}
                </div>
              ) : (
                <div className="text-[10px] font-black uppercase tracking-tighter text-slate-300">
                  Not Started
                </div>
              )}
            </button>
          );
        })}
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

export default GameView;