'use client';

import React from 'react';
import {
  BookmarkCheck,
  Play,
  Trash2,
  Download,
  Copy,
  Sparkles,
  Repeat,
  Radio,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { QuantumAffirmationResult } from '@/lib/quantum-engine';
import { ExportWavModal } from './ExportWavModal';

interface ResonanceLibraryProps {
  library: QuantumAffirmationResult[];
  onPlayAffirmation: (affirmation: QuantumAffirmationResult) => void;
  onDeleteAffirmation: (id: string) => void;
  onPlayContinuous: () => void;
  isPlayingContinuous: boolean;
  activeId?: string;
}

export const ResonanceLibrary: React.FC<ResonanceLibraryProps> = ({
  library,
  onPlayAffirmation,
  onDeleteAffirmation,
  onPlayContinuous,
  isPlayingContinuous,
  activeId,
}) => {
  const [exportingAffirmation, setExportingAffirmation] = React.useState<QuantumAffirmationResult | null>(null);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const playSelected = () => {
    const toPlay = library.filter((item) => selectedIds.has(item.id));
    // Implementation of simultaneous playback would go here, 
    // requiring AudioPlayerBar to support an array of affirmations.
    // For now, we simulate simultaneous by playing them in quick succession.
    toPlay.forEach((item, index) => {
      setTimeout(() => onPlayAffirmation(item), index * 100);
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#EAFBF5] border border-[#2DD4BF]/40 text-[#009B87] text-xs font-semibold mb-2">
            <BookmarkCheck className="w-3.5 h-3.5" />
            <span>Quantum Resonance Vault</span>
          </div>
          <h1 className="text-[30px] font-bold text-[#171D27] tracking-tight">
            Saved Affirmations & Master Sequences
          </h1>
          <p className="text-[14px] text-[#626B78] mt-1">
            Re-wire your neural biology during morning meditation or deep delta sleep routines.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {selectedIds.size > 0 && (
            <button
              onClick={playSelected}
              className="px-5 py-3 rounded-xl font-semibold text-[13px] bg-[#005F58] hover:bg-[#007F73] text-white shadow-xs transition-all flex items-center space-x-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Play {selectedIds.size} Simultaneously</span>
            </button>
          )}

          {library.length > 1 && (
            <button
              onClick={onPlayContinuous}
              className={`px-5 py-3 rounded-xl font-semibold text-[13px] flex items-center space-x-2 shadow-xs transition-all ${
                isPlayingContinuous
                  ? 'bg-[#005F58] text-white ring-2 ring-[#2DD4BF]'
                  : 'bg-[#009B87] hover:bg-[#007F73] text-white'
              }`}
            >
              <Repeat className="w-4 h-4" />
              <span>
                {isPlayingContinuous
                  ? 'Continuous Sequence Active'
                  : 'Play Continuous Quantum Sequence'}
              </span>
            </button>
          )}
        </div>
      </div>

      {library.length === 0 ? (
        <div className="bg-[#FFFFFF] p-12 rounded-2xl border border-dashed border-[#E5E9E7] text-center max-w-lg mx-auto">
          <BookmarkCheck className="w-12 h-12 text-[#89919B] mx-auto mb-3" />
          <h3 className="text-[16px] font-bold text-[#171D27]">
            Your Quantum Library is Empty
          </h3>
          <p className="text-[13px] text-[#626B78] mt-2 mb-6">
            Transmute any raw desire in the Studio and save it here to build your personalized
            subconscious programming protocol.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {library.map((item, index) => {
            const isActive = activeId === item.id;
            const isSelected = selectedIds.has(item.id);
            return (
              <div
                key={item.id}
                className={`bg-[#FFFFFF] p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isActive
                    ? 'border-[#009B87] shadow-[0_4px_16px_rgba(0,155,135,0.12)] ring-2 ring-[#2DD4BF]/40'
                    : isSelected 
                      ? 'border-[#2DD4BF] shadow-[0_4px_16px_rgba(45,212,191,0.1)]'
                      : 'border-[#E5E9E7] hover:border-[#2DD4BF]/50 shadow-[0_1px_3px_rgba(16,24,40,0.04)]'
                }`}
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between mb-3 text-[11px]">
                    <div className="flex items-center space-x-1.5 font-mono font-bold text-[#009B87] bg-[#EAFBF5] px-2 py-0.5 rounded">
                      <Radio className="w-3 h-3 text-[#2DD4BF]" />
                      <span>{item.frequencyHz} Hz</span>
                    </div>
                    <input 
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(item.id)}
                      className="w-4 h-4 accent-[#009B87]"
                    />
                  </div>

                  {/* Transmuted Affirmation */}
                  <p className="text-[14px] font-semibold text-[#171D27] leading-relaxed mb-3">
                    &ldquo;{item.quantumText}&rdquo;
                  </p>

                  {/* Somatic Anchor */}
                  <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#EEF1EF] text-[12px] text-[#626B78] mb-4">
                    <span className="font-bold text-[#171D27] block mb-1">
                      Somatic Anchor:
                    </span>
                    {item.somaticAnchor}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-[#EEF1EF] flex items-center justify-between">
                  <span className="text-[11px] text-[#89919B] font-mono">
                    ~{item.estimatedDurationSeconds}s cycle
                  </span>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => setExportingAffirmation(item)}
                      className="p-1.5 rounded-lg text-[#89919B] hover:text-[#009B87] hover:bg-[#EAFBF5] transition-colors"
                      title="Export Master WAV (Voice + Carrier Bed)"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onDeleteAffirmation(item.id)}
                      className="p-1.5 rounded-lg text-[#89919B] hover:text-[#DC2626] hover:bg-red-50 transition-colors"
                      title="Delete from Library"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onPlayAffirmation(item)}
                      className={`px-3 py-1.5 rounded-xl text-[12px] font-semibold flex items-center space-x-1.5 transition-all ${
                        isActive
                          ? 'bg-[#009B87] text-white shadow-xs'
                          : 'bg-[#EAFBF5] hover:bg-[#009B87] text-[#009B87] hover:text-white'
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{isActive ? 'Playing' : 'Play Spoken'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Master WAV Export Modal */}
      <ExportWavModal
        isOpen={!!exportingAffirmation}
        onClose={() => setExportingAffirmation(null)}
        affirmation={exportingAffirmation}
        defaultCarrierEnabled={true}
      />
    </div>
  );
};
