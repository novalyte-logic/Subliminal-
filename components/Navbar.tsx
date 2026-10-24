'use client';

import React from 'react';
import { Waves, Sparkles, Radio, BookOpen, BookmarkCheck, Volume2, VolumeX, Layers } from 'lucide-react';

interface NavbarProps {
  activeTab: 'studio' | 'deck' | 'library' | 'frequencies' | 'science';
  setActiveTab: (tab: 'studio' | 'deck' | 'library' | 'frequencies' | 'science') => void;
  carrierActive: boolean;
  toggleCarrier: () => void;
  activeHz: number;
  libraryCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  carrierActive,
  toggleCarrier,
  activeHz,
  libraryCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF]/90 backdrop-blur-md border-b border-[#E5E9E7] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Subtitle */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('studio')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#009B87] to-[#005F58] flex items-center justify-center text-white shadow-sm ring-1 ring-[#2DD4BF]/30">
              <Waves className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[17px] font-bold text-[#171D27] tracking-tight">Novalyte AI</span>
                <span className="text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-[#EAFBF5] text-[#009B87] border border-[#2DD4BF]/40 hidden sm:inline-flex">
                  Quantum Leap
                </span>
              </div>
              <p className="text-[11px] text-[#626B78] font-medium hidden md:block">
                Subconscious Transmutation & High-Frequency Spoken Audio
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab('studio')}
              className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'studio'
                  ? 'bg-[#EAFBF5] text-[#009B87] border border-[#2DD4BF]/40 font-semibold shadow-xs'
                  : 'text-[#626B78] hover:text-[#171D27] hover:bg-[#F7FAF8]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Transmuter</span>
            </button>

            <button
              onClick={() => setActiveTab('deck')}
              className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'deck'
                  ? 'bg-[#EAFBF5] text-[#009B87] border border-[#2DD4BF]/40 font-semibold shadow-xs'
                  : 'text-[#626B78] hover:text-[#171D27] hover:bg-[#F7FAF8]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Quantum Deck</span>
            </button>

            <button
              onClick={() => setActiveTab('library')}
              className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'library'
                  ? 'bg-[#EAFBF5] text-[#009B87] border border-[#2DD4BF]/40 font-semibold shadow-xs'
                  : 'text-[#626B78] hover:text-[#171D27] hover:bg-[#F7FAF8]'
              }`}
            >
              <BookmarkCheck className="w-3.5 h-3.5" />
              <span>Library</span>
              {libraryCount > 0 && (
                <span className="ml-1 text-[10px] bg-[#009B87] text-white px-1.5 py-0.2 rounded-full font-bold">
                  {libraryCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('frequencies')}
              className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'frequencies'
                  ? 'bg-[#EAFBF5] text-[#009B87] border border-[#2DD4BF]/40 font-semibold shadow-xs'
                  : 'text-[#626B78] hover:text-[#171D27] hover:bg-[#F7FAF8]'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Solfeggio Matrix</span>
              <span className="md:hidden">Matrix</span>
            </button>

            <button
              onClick={() => setActiveTab('science')}
              className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'science'
                  ? 'bg-[#EAFBF5] text-[#009B87] border border-[#2DD4BF]/40 font-semibold shadow-xs'
                  : 'text-[#626B78] hover:text-[#171D27] hover:bg-[#F7FAF8]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Linguistic Science</span>
              <span className="md:hidden">Science</span>
            </button>
          </nav>

          {/* Quick Carrier Wave Switch */}
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleCarrier}
              aria-label="Toggle Solfeggio Carrier Tone"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 border transition-all ${
                carrierActive
                  ? 'bg-[#009B87] text-white border-[#009B87] shadow-sm'
                  : 'bg-[#FAF9F6] text-[#626B78] border-[#E5E9E7] hover:bg-[#F3FCF8] hover:text-[#009B87]'
              }`}
              title={carrierActive ? `Carrier ${activeHz}Hz Active` : 'Turn on Solfeggio carrier tone'}
            >
              {carrierActive ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 animate-pulse text-[#2DD4BF]" />
                  <span className="font-mono">{activeHz}Hz Active</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-[#89919B]" />
                  <span className="hidden sm:inline">Carrier Tone</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
