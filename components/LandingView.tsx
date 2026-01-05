
import React from 'react';

interface LandingViewProps {
  onGetStarted: () => void;
  isLoggedIn: boolean;
}

const LandingView: React.FC<LandingViewProps> = ({ onGetStarted, isLoggedIn }) => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-20 text-center">
        <h1 className="text-7xl font-black text-slate-900 leading-tight mb-6 tracking-tighter">
          Master Your <span className="text-indigo-600">SAT Vocab</span><br />
          The Fun Way.
        </h1>
        <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          AI-powered visual mnemonics, native pronunciation, and interactive games designed to make learning stick. Join thousands of students boosting their scores.
        </p>
        <div className="flex justify-center gap-4">
          <button 
            onClick={onGetStarted}
            className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-xl hover:bg-indigo-700 shadow-2xl hover:scale-105 transition-all active:scale-95"
          >
            {isLoggedIn ? 'Go to Dashboard' : 'Start Learning Free'}
          </button>
        </div>
      </section>

      {/* Feature Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 py-20 px-4">
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          <h3 className="text-2xl font-bold mb-4">AI Visual Mnemonics</h3>
          <p className="text-slate-500">Every word is paired with a custom-generated AI image to help you visualize complex meanings instantly.</p>
        </div>
        
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
          <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
          </div>
          <h3 className="text-2xl font-bold mb-4">Crystal Clear Audio</h3>
          <p className="text-slate-500">Listen to high-quality text-to-speech for correct pronunciation. Hear the words while you study.</p>
        </div>

        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
          <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-6">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <h3 className="text-2xl font-bold mb-4">Personal Word List</h3>
          <p className="text-slate-500">Easily save difficult words to your own personal list and review them whenever you need extra focus.</p>
        </div>
      </section>
    </div>
  );
};

export default LandingView;
