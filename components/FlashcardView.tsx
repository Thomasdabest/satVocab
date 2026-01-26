import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { VOCABULARY } from '../constants';
import { WordItem } from '../types';
import { generateImage, generateSpeech, fetchEnhancedWordData } from '../services/geminiService';

interface FlashcardViewProps {
  onBack: () => void;
  onToggleSave: (word: string) => void;
  savedWords: string[];
}

const MUSIC_TRACKS = [
  { name: 'Lo-fi Study', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { name: 'Deep Focus', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { name: 'Arena energy', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3' }
];

const FlashcardView: React.FC<FlashcardViewProps> = ({ onBack, onToggleSave, savedWords }) => {
  const [viewMode, setViewMode] = useState<'overview' | 'study'>('overview');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [studyIndex, setStudyIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [cardData, setCardData] = useState<{
    img: string | null;
    sentence: string;
    sports: string;
    song?: { title: string; artist: string; reason: string };
  }>({ img: null, sentence: '', sports: '' });
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const openStudy = (index: number) => {
    setStudyIndex(index);
    setViewMode('study');
  };

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
      if (item.word.length > 0) letters.add(item.word[0].toUpperCase());
    });
    return Array.from(letters).sort();
  }, []);

  const fetchResources = useCallback(async (word: string, meaning: string) => {
    setLoading(true);
    setAudioBuffer(null);
    
    try {
      const [img, enhanced] = await Promise.all([
        generateImage(word, meaning),
        fetchEnhancedWordData(word, meaning)
      ]);
      
      // Pass the full context to TTS for an immersive auditory experience
      const audio = await generateSpeech(
        word, 
        meaning, 
        enhanced.sportsExample, 
        `${enhanced.songAssociation.title} by ${enhanced.songAssociation.artist}. ${enhanced.songAssociation.reason}`
      );
      
      setCardData({
        img: img || null,
        sentence: enhanced.sentence,
        sports: enhanced.sportsExample,
        song: enhanced.songAssociation
      });
      setAudioBuffer(audio || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (viewMode === 'study' && currentItem) {
      fetchResources(currentItem.word, currentItem.meaning);
    }
  }, [studyIndex, currentItem, viewMode, fetchResources]);

  useEffect(() => {
    if (isPlayingMusic) {
      if (!audioRef.current) {
        audioRef.current = new Audio(MUSIC_TRACKS[currentTrackIdx].url);
        audioRef.current.loop = true;
        audioRef.current.volume = 0.15;
      } else {
        audioRef.current.src = MUSIC_TRACKS[currentTrackIdx].url;
      }
      audioRef.current.play().catch(e => console.log("Music play blocked"));
    } else {
      audioRef.current?.pause();
    }
    return () => audioRef.current?.pause();
  }, [isPlayingMusic, currentTrackIdx]);

  const playTTS = () => {
    if (audioBuffer) {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);
      source.start();
    }
  };

  const handleListenToSong = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (cardData.song) {
      const query = encodeURIComponent(`${cardData.song.artist} ${cardData.song.title} official audio`);
      window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
    }
  };

  if (viewMode === 'overview') {
    return (
      <div className="max-w-6xl mx-auto px-4 view-enter">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <button onClick={onBack} className="text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors mb-2 font-bold">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Main Menu
            </button>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight">Vocabulary Bank</h1>
            <p className="text-slate-500 font-medium">{VOCABULARY.length} Master words</p>
          </div>
          
          <div className="flex flex-wrap gap-2 bg-white p-2 rounded-2xl shadow-sm border border-slate-100 max-w-full overflow-x-auto no-scrollbar">
            <button 
              onClick={() => setSelectedLetter(null)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${!selectedLetter ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              ALL
            </button>
            {availableLetters.map(letter => (
              <button
                key={letter}
                onClick={() => setSelectedLetter(letter)}
                className={`w-10 h-10 flex items-center justify-center rounded-xl text-xs font-black transition-all ${selectedLetter === letter ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
          {filteredVocabulary.map((item, idx) => (
            <div 
              key={item.word} 
              onClick={() => openStudy(idx)}
              className="group bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:border-indigo-400 hover:shadow-2xl transition-all cursor-pointer flex flex-col justify-between active:scale-95"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">
                    {item.word}
                  </h3>
                  {savedWords.includes(item.word) && <div className="text-rose-500"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" /></svg></div>}
                </div>
                <p className="text-slate-500 font-medium line-clamp-3 leading-relaxed text-sm">
                  {item.meaning}
                </p>
              </div>
              <div className="mt-8">
                <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all uppercase tracking-widest">
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
    <div className="max-w-3xl mx-auto px-4 pb-20 view-enter">
      {/* Navigation Header */}
      <div className="flex justify-between items-center mb-8">
        <button 
          onClick={() => setViewMode('overview')} 
          className="text-slate-500 hover:text-indigo-600 flex items-center gap-2 transition-colors font-bold"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 17l-5-5m0 0l5-5m-5 5h12" /></svg>
          Bank Overview
        </button>
        
        <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
           <button 
            onClick={() => setIsPlayingMusic(!isPlayingMusic)}
            className={`p-2 rounded-xl transition-all ${isPlayingMusic ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}
            title="Focus Ambient Music"
           >
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
           </button>
           {isPlayingMusic && (
             <button 
              onClick={() => setCurrentTrackIdx((prev) => (prev + 1) % MUSIC_TRACKS.length)}
              className="px-3 py-1.5 text-[10px] font-black bg-slate-50 text-slate-500 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-all uppercase tracking-widest"
             >
               {MUSIC_TRACKS[currentTrackIdx].name}
             </button>
           )}
        </div>
      </div>

      {/* Master Vocab Card Container */}
      <div className="bg-white rounded-[4rem] shadow-2xl overflow-hidden border-8 border-white ring-1 ring-slate-100 relative">
        {/* Top Info Bar */}
        <div className="p-10 pb-4 flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-5xl font-black text-indigo-600 uppercase tracking-tighter drop-shadow-sm">
                {currentItem.word}
              </h2>
              <button 
                onClick={() => onToggleSave(currentItem.word)}
                className={`p-2.5 rounded-xl transition-all ${savedWords.includes(currentItem.word) ? 'text-rose-500' : 'text-slate-200 hover:text-rose-400'}`}
              >
                <svg className="w-7 h-7" fill={savedWords.includes(currentItem.word) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              </button>
            </div>
            <p className="text-xl font-bold text-slate-500 leading-tight">
              {currentItem.meaning}
            </p>
          </div>
          <div className="px-5 py-2 bg-slate-50 text-slate-400 rounded-2xl text-xs font-black tracking-widest uppercase border border-slate-100">
            {studyIndex + 1} / {filteredVocabulary.length}
          </div>
        </div>

        {/* Visual Content Section */}
        <div className="px-10 space-y-8 pb-10">
          {/* Mnemonic Image */}
          <div className="w-full aspect-[16/9] bg-slate-50 rounded-[3rem] overflow-hidden relative border border-slate-100 shadow-inner flex items-center justify-center">
            {loading ? (
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-100 border-t-indigo-600"></div>
                <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.2em] animate-pulse">Generating Mnemonic...</p>
              </div>
            ) : cardData.img ? (
              <img src={cardData.img} alt="Visual mnemonic" className="w-full h-full object-cover" />
            ) : (
              <div className="text-slate-300 italic font-bold">Visualizing...</div>
            )}
            
            {/* Absolute Overlay Play Button */}
            {!loading && audioBuffer && (
              <button 
                onClick={playTTS}
                className="absolute bottom-6 right-6 w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all ring-8 ring-white/20 backdrop-blur-sm"
                title="Hear Pronunciation & Study Guide"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
              </button>
            )}
          </div>

          {/* Context and Sentence */}
          {!loading && cardData.sentence && (
            <div className="bg-indigo-50/50 p-6 rounded-[2rem] border border-indigo-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H16.017C14.9124 8 14.017 7.10457 14.017 6V3L22.017 3V15C22.017 18.3137 19.3307 21 16.017 21H14.017ZM2.01697 21L2.01697 18C2.01697 16.8954 2.9124 16 4.01697 16H7.01697C7.56925 16 8.01697 15.5523 8.01697 15V9C8.01697 8.44772 7.56925 8 7.01697 8H4.01697C2.9124 8 2.01697 7.10457 2.01697 6V3L10.017 3V15C10.017 18.3137 7.33067 21 4.01697 21H2.01697Z" /></svg>
              </div>
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-2">Usage in Context</span>
              <p className="text-lg text-slate-700 font-semibold italic leading-relaxed">
                "{cardData.sentence}"
              </p>
            </div>
          )}

          {/* Feature Grid: Sports & Music */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sports Module */}
            {!loading && cardData.sports && (
              <div className="bg-emerald-50/40 p-6 rounded-[2.5rem] border border-emerald-100 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1.5 mb-3">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" /></svg>
                    Sports Insight
                  </span>
                  <p className="text-sm text-slate-800 font-bold leading-relaxed">{cardData.sports}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-emerald-100/50">
                  <span className="text-[9px] font-black text-emerald-500/60 uppercase tracking-tighter">Memory Hook: Action</span>
                </div>
              </div>
            )}

            {/* Music Module */}
            {!loading && cardData.song && (
              <div className="bg-purple-600 text-white p-6 rounded-[2.5rem] shadow-xl shadow-purple-100 relative overflow-hidden group/music transition-transform hover:scale-[1.02]">
                {/* Waveform Decoration */}
                <div className="absolute top-0 right-0 p-4 flex gap-1 items-end h-14 opacity-20">
                  <div className="w-1.5 bg-white animate-[bounce_0.6s_ease-in-out_infinite]" style={{height: '40%'}}></div>
                  <div className="w-1.5 bg-white animate-[bounce_0.8s_ease-in-out_infinite]" style={{height: '70%'}}></div>
                  <div className="w-1.5 bg-white animate-[bounce_0.5s_ease-in-out_infinite]" style={{height: '50%'}}></div>
                  <div className="w-1.5 bg-white animate-[bounce_1.1s_ease-in-out_infinite]" style={{height: '90%'}}></div>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-black text-purple-200 uppercase tracking-widest flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                    Musical Anchor
                  </span>
                  <button 
                    onClick={handleListenToSong}
                    className="bg-white text-purple-600 px-5 py-2.5 rounded-full font-black text-[11px] uppercase tracking-widest shadow-lg hover:bg-purple-50 transition-all active:scale-95 flex items-center gap-2"
                  >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    Play Song
                  </button>
                </div>

                <div className="pr-12">
                  <h4 className="text-xl font-black tracking-tight leading-none uppercase truncate mb-1">{cardData.song.title}</h4>
                  <p className="text-xs font-bold text-purple-100 opacity-90 mb-3">{cardData.song.artist}</p>
                  <p className="text-xs font-medium leading-tight line-clamp-3 text-purple-50 italic border-l-2 border-purple-400 pl-3">
                    "{cardData.song.reason}"
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Primary Navigation Controls */}
      <div className="flex justify-center items-center gap-12 mt-12">
        <button 
          onClick={() => setStudyIndex((prev) => (prev - 1 + filteredVocabulary.length) % filteredVocabulary.length)}
          className="group p-7 bg-white rounded-[2.5rem] shadow-md border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all active:scale-90"
          title="Previous Word"
        >
          <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" d="M15 19l-7-7 7-7" /></svg>
        </button>
        
        <button 
          onClick={() => setStudyIndex((prev) => (prev + 1) % filteredVocabulary.length)}
          className="group p-7 bg-indigo-600 rounded-[2.5rem] shadow-2xl text-white hover:bg-indigo-700 hover:scale-105 transition-all active:scale-90 ring-8 ring-indigo-50"
          title="Next Word"
        >
          <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
      
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
};

export default FlashcardView;