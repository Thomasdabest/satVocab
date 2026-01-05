
import React, { useMemo } from 'react';
import { VOCABULARY } from '../constants';

interface MyWordsViewProps {
  onBack: () => void;
  savedWords: string[];
  onToggleSave: (word: string) => void;
}

const MyWordsView: React.FC<MyWordsViewProps> = ({ onBack, savedWords, onToggleSave }) => {
  const filteredWords = useMemo(() => {
    return VOCABULARY.filter(item => savedWords.includes(item.word))
      .sort((a, b) => a.word.localeCompare(b.word));
  }, [savedWords]);

  return (
    <div className="max-w-4xl mx-auto px-4 pb-12">
      <div className="mb-10">
        <button onClick={onBack} className="text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors mb-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Menu
        </button>
        <h1 className="text-4xl font-black text-slate-800 tracking-tight">My Own Words</h1>
        <p className="text-slate-500">You have {savedWords.length} words saved for focused study.</p>
      </div>

      {filteredWords.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-16 text-center shadow-sm border border-dashed border-slate-200">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Your list is empty</h2>
          <p className="text-slate-500 max-w-sm mx-auto">Add words from the Flashcards section that you find difficult to keep track of them here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredWords.map(item => (
            <div key={item.word} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-start justify-between group">
              <div>
                <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tight mb-2 group-hover:text-indigo-600 transition-colors">
                  {item.word}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {item.meaning}
                </p>
              </div>
              <button 
                onClick={() => onToggleSave(item.word)}
                className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                title="Remove from My Words"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyWordsView;
