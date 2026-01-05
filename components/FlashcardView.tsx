
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { VOCABULARY } from '../constants';
import { WordItem } from '../types';
import { generateImage, generateSpeech } from '../services/geminiService';

interface FlashcardViewProps {
  onBack: () => void;
  onToggleSave: (word: string) => void;
  savedWords: string[];
}

const FlashcardView: React.FC<FlashcardViewProps> = ({ onBack, onToggleSave, savedWords }) => {
  const [viewMode, setViewMode] = useState<'overview' | 'study'>('overview');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [studyIndex, setStudyIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageData, setImageData] = useState<string | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);

  const filteredVocabulary = useMemo(() => {
    let list = [...VOCABULARY];
    if (selectedLetter) {
      list = list.filter(item => item.word.toLowerCase().startsWith(selectedLetter.toLowerCase()));
    }
    return list.sort((a, b) => a.word.localeCompare(b.word));
  }, [selectedLetter]);

  const currentItem = filteredVocabulary[studyIndex];

  const availableLetters = useMemo(() => {
    const letters = new Set<string>();
    VOCABULARY.forEach(item => {
      if (item.word.length > 0) {
        letters.add(item.word[0].toUpperCase());
      }
    });
    return Array.from(letters).sort();
  }, []);

  const fetchResources = useCallback(async (word: string, meaning: string) => {
    setLoading(true);
    setImageData(null);
    setAudioBuffer(null);
    
    // Pass both word and meaning to generateSpeech for full auditory reinforcement
    const [img, audio] = await Promise.all([
      generateImage(word, meaning),
      generateSpeech(word, meaning)
    ]);
    
    setImageData(img || null);
    setAudioBuffer(audio || null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (viewMode === 'study' && currentItem) {
      fetchResources(currentItem.word, currentItem.meaning);
      setIsFlipped(false);
    }
  }, [studyIndex, currentItem, viewMode, fetchResources]);

  const playAudio = () => {
    if (audioBuffer) {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);
      source.start();
    }
  };

  const openStudy = (index: number) => {
    setStudyIndex(index);
    setViewMode('study');
  };

  const nextCard = () => {
    setStudyIndex((prev) => (prev + 1) % filteredVocabulary.length);
  };

  const prevCard = () => {
    setStudyIndex((prev) => (prev - 1 + filteredVocabulary.length) % filteredVocabulary.length);
  };

  if (viewMode === 'overview') {
    return (
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <button onClick={onBack} className="text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors mb-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Back to Menu
            </button>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight">Full Dataset</h1>
            <p className="text-slate-500">{VOCABULARY.length} words available</p>
          </div>
          
          <div className="flex flex-wrap gap-2 bg-white p-2 rounded-2xl shadow-sm border border-slate-100 max-w-full overflow-x-auto">
            <button 
              onClick={() => setSelectedLetter(null)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${!selectedLetter ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              ALL
            </button>
            {availableLetters.map(letter => (
              <button
                key={letter}
                onClick={() => setSelectedLetter(letter)}
                className={`w-8 h-8 min-w-[32px] flex items-center justify-center rounded-xl text-xs font-bold transition-all ${selectedLetter === letter ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-12">
          {filteredVocabulary.map((item, idx) => (
            <div 
              key={item.word} 
              onClick={() => openStudy(idx)}
              className="group bg-white p-6 rounded-3xl shadow-sm border border-slate-200 hover:border-indigo-400 hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">
                    {item.word}
                  </h3>
                  {savedWords.includes(item.word) && (
                    <div className="text-rose-500">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
                    </div>
                  )}
                </div>
                <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                  {item.meaning}
                </p>
              </div>
              <div className="mt-6 flex justify-end">
                <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">
                  Study Card
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 pb-12">
      <div className="flex justify-between items-center mb-8">
        <button 
          onClick={() => setViewMode('overview')} 
          className="text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 17l-5-5m0 0l5-5m-5 5h12" /></svg>
          List Overview
        </button>
        <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold">
          {studyIndex + 1} / {filteredVocabulary.length}
        </span>
      </div>

      <div 
        className={`card-flip h-[580px] w-full cursor-pointer ${isFlipped ? 'card-flipped' : ''}`}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className="card-inner w-full h-full shadow-2xl rounded-[3rem] overflow-hidden relative">
          {/* Front Side */}
          <div className="card-front bg-white flex flex-col p-10 items-center justify-between text-center border-2 border-slate-100 relative">
            {/* Top Bar for Front */}
            <div className="absolute top-6 left-0 right-0 px-10 flex justify-between items-center w-full z-10">
               <button 
                  onClick={(e) => { e.stopPropagation(); onToggleSave(currentItem.word); }}
                  className={`p-3 rounded-2xl transition-all ${savedWords.includes(currentItem.word) ? 'bg-rose-50 text-rose-500 shadow-inner' : 'bg-slate-50 text-slate-300 hover:text-rose-400'}`}
                  title={savedWords.includes(currentItem.word) ? "Remove from My Words" : "Add to My Words"}
                >
                  <svg className="w-6 h-6" fill={savedWords.includes(currentItem.word) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                </button>
                <div className="text-[10px] font-bold text-slate-300 tracking-[0.2em] uppercase">Flashcard</div>
            </div>

            <div className="w-full mt-8">
              <h2 className="text-4xl font-black text-indigo-600 mb-2 uppercase tracking-tight">
                {currentItem.word}
              </h2>
              <p className="text-xl font-medium text-slate-600 leading-snug">
                {currentItem.meaning}
              </p>
            </div>
            
            <div className="flex-1 w-full flex items-center justify-center bg-slate-50 rounded-[2rem] overflow-hidden relative my-6 border border-slate-100 shadow-inner">
              {loading ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-100 border-t-indigo-600"></div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Imagining...</p>
                </div>
              ) : imageData ? (
                <img src={imageData} alt="Visual mnemonic" className="w-full h-full object-cover" />
              ) : (
                <div className="text-slate-300 italic text-sm">No image available</div>
              )}
            </div>

            <div className="flex flex-col items-center">
              <button 
                onClick={(e) => { e.stopPropagation(); playAudio(); }}
                disabled={!audioBuffer}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all ${audioBuffer ? 'bg-indigo-600 text-white hover:scale-110 active:scale-95' : 'bg-slate-100 text-slate-300'}`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
              </button>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Listen</span>
            </div>
          </div>

          {/* Back Side */}
          <div className="card-back bg-indigo-700 flex flex-col items-center justify-center p-12 text-center text-white">
            <h1 className="text-7xl font-black tracking-tighter drop-shadow-2xl select-none uppercase">
              {currentItem.word}
            </h1>
            <div className="absolute bottom-10 opacity-30 text-[10px] uppercase tracking-[0.3em] font-bold">
              Recall Mode
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center items-center gap-10 mt-12">
        <button 
          onClick={prevCard}
          className="group p-5 bg-white rounded-full shadow-md border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all active:scale-90"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button 
          onClick={nextCard}
          className="group p-5 bg-indigo-600 rounded-full shadow-xl text-white hover:bg-indigo-700 hover:scale-105 transition-all active:scale-90"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  );
};

export default FlashcardView;
