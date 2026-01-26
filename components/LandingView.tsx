import React from 'react';

interface LandingViewProps {
  onGetStarted: () => void;
  isLoggedIn: boolean;
}

const LandingView: React.FC<LandingViewProps> = ({ onGetStarted, isLoggedIn }) => {
  return (
    <div className="flex flex-col view-enter">
      {/* Hero Section */}
      <section className="py-24 text-center relative px-4">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full opacity-10 pointer-events-none">
          <div className="absolute top-20 left-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-0 w-48 h-48 bg-emerald-500 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>
        
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-xs font-black uppercase tracking-widest mb-8 border border-indigo-100 shadow-sm">
          <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-ping"></span>
          New: AI-Generated Mnemonics Live
        </div>

        <h1 className="text-7xl md:text-8xl font-black text-slate-900 leading-tight mb-8 tracking-tighter drop-shadow-sm">
          Master the <span className="text-indigo-600 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-indigo-400">Digital SAT</span><br />
          Vocab Effortlessly.
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-500 mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
          The only platform combining 456 official practice questions with AI visual anchors and immersive audio guides. Stop memorizing, start seeing.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
          <button 
            onClick={onGetStarted}
            className="w-full sm:w-auto bg-indigo-600 text-white px-12 py-5 rounded-2xl font-black text-xl hover:bg-indigo-700 shadow-2xl hover:scale-105 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            {isLoggedIn ? 'Return to Dashboard' : 'Get Started for Free'}
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </button>
          
          <div className="flex items-center gap-4 text-left">
            <div className="flex -space-x-3">
              {[1,2,3,4].map(i => (
                <div key={i} className={`w-10 h-10 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-black overflow-hidden shadow-sm`}>
                  <img src={`https://i.pravatar.cc/100?u=user${i}`} alt="user" />
                </div>
              ))}
            </div>
            <div>
              <p className="text-sm font-black text-slate-800 leading-none">22,000+ Students</p>
              <p className="text-xs font-bold text-slate-400">Trust Fun 2 Learn Daily</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Bento Grid */}
      <section className="container mx-auto py-20 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="group bg-white p-12 rounded-[3.5rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-blue-600 group-hover:text-white transition-all">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <h3 className="text-3xl font-black mb-4 text-slate-800">Visual Anchors</h3>
            <p className="text-slate-500 text-lg leading-relaxed font-medium">Every word generates a unique AI illustration based on its specific context, creating neural hooks that make forgetting impossible.</p>
          </div>
          
          <div className="group bg-white p-12 rounded-[3.5rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
            <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-purple-600 group-hover:text-white transition-all">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
            </div>
            <h3 className="text-3xl font-black mb-4 text-slate-800">Auditory Immersive</h3>
            <p className="text-slate-500 text-lg leading-relaxed font-medium">Native-level pronunciation coupled with musical associations. Hear definitions and usage examples while you focus with lo-fi beats.</p>
          </div>

          <div className="group bg-white p-12 rounded-[3.5rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
            <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-amber-600 group-hover:text-white transition-all">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
            </div>
            <h3 className="text-3xl font-black mb-4 text-slate-800">Real SAT Logic</h3>
            <p className="text-slate-500 text-lg leading-relaxed font-medium">Practice with 38 full units derived from official Digital SAT patterns. Master the fill-in-the-blank style with instant scoring and tracking.</p>
          </div>
        </div>
      </section>

      {/* Proof Section */}
      <section className="py-20 bg-white border-y border-slate-100">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-black text-slate-900 mb-12 tracking-tight">The Fun 2 Learn Advantage</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <span className="block text-5xl font-black text-indigo-600 mb-2">+120</span>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Avg. Verbal Boost</p>
            </div>
            <div>
              <span className="block text-5xl font-black text-indigo-600 mb-2">2200+</span>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Key Words Mapped</p>
            </div>
            <div>
              <span className="block text-5xl font-black text-indigo-600 mb-2">456</span>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Practice Modules</p>
            </div>
            <div>
              <span className="block text-5xl font-black text-indigo-600 mb-2">100%</span>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">AI Visualization</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingView;