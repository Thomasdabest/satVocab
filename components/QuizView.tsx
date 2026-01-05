
import React, { useState, useMemo } from 'react';
import { VOCABULARY } from '../constants';
import { WordItem } from '../types';

interface QuizViewProps {
  onBack: () => void;
}

const QuizView: React.FC<QuizViewProps> = ({ onBack }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // Randomly select 10 questions for the quiz session
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
      setShowResult(true);
    }
  };

  if (showResult) {
    const percentage = (score / questions.length) * 100;
    return (
      <div className="max-w-xl mx-auto text-center py-12 px-4 bg-white rounded-3xl shadow-xl border border-slate-100">
        <div className="mb-6 inline-block p-4 bg-emerald-100 rounded-full text-emerald-600">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <h2 className="text-4xl font-bold mb-2">Quiz Complete!</h2>
        <p className="text-slate-500 mb-8 text-lg">You scored {score} out of {questions.length}</p>
        
        <div className="relative w-48 h-48 mx-auto mb-12">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
            <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" 
              strokeDasharray={502.6}
              strokeDashoffset={502.6 - (502.6 * percentage) / 100}
              className="text-emerald-500 transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-bold">{Math.round(percentage)}%</span>
          </div>
        </div>

        <button 
          onClick={onBack}
          className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg active:scale-95"
        >
          Back to Menu
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4">
      <div className="mb-8">
        <div className="flex justify-between items-end mb-4">
          <div>
            <span className="text-indigo-600 font-bold uppercase tracking-widest text-xs">Question {currentStep + 1}</span>
            <h2 className="text-3xl font-bold text-slate-800">Identify the Word</h2>
          </div>
          <span className="text-slate-400 font-medium">Score: {score}</span>
        </div>
        <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-500 transition-all duration-500" 
            style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 mb-8">
        <p className="text-xl font-medium text-slate-700 mb-8 italic">
          "{currentQuestion.meaning}"
        </p>

        <div className="grid grid-cols-1 gap-4">
          {options.map((opt, idx) => {
            let style = "border-slate-200 hover:border-indigo-300 hover:bg-indigo-50";
            if (isAnswered) {
              if (opt.word === currentQuestion.word) {
                style = "bg-emerald-100 border-emerald-500 text-emerald-700";
              } else if (selectedOption === idx) {
                style = "bg-rose-100 border-rose-500 text-rose-700";
              } else {
                style = "opacity-50 border-slate-100";
              }
            } else if (selectedOption === idx) {
              style = "border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600 ring-offset-2";
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={isAnswered}
                className={`w-full p-5 text-left rounded-2xl border-2 font-semibold transition-all flex items-center justify-between ${style}`}
              >
                <span>{opt.word}</span>
                {isAnswered && opt.word === currentQuestion.word && (
                  <svg className="w-6 h-6 text-emerald-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end">
        {isAnswered && (
          <button 
            onClick={handleNext}
            className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg"
          >
            {currentStep === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l7 7m-7 7h18" /></svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizView;
