import React from 'react';
import { TreeState } from '../types';

interface UIOverlayProps {
  currentState: TreeState;
  onToggle: () => void;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ currentState, onToggle }) => {
  const isTree = currentState === TreeState.TREE_SHAPE;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 md:p-16 z-10">
      {/* Header */}
      <div className="flex flex-col items-center md:items-start space-y-2 animate-fade-in-down">
        <h3 className="text-gold-500 tracking-[0.3em] text-xs uppercase font-bold">Merry Christmas!</h3>
        <h1 className="text-4xl md:text-6xl text-[#ffd700] font-serif drop-shadow-[0_0_15px_rgba(255,215,0,0.5)] text-center md:text-left">
          ARIX <br />
          <span className="italic font-light text-white opacity-90">Signature 2025</span>
        </h1>
      </div>

      {/* Main Control - Just a hint now */}
      <div className="flex flex-col items-center justify-center space-y-6 pointer-events-auto">
        <p className="text-[#ffd700]/60 text-xs tracking-widest uppercase animate-pulse">
            {isTree ? "Tap the tree to scatter" : "Tap the particles to assemble"}
        </p>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-end text-[#ffd700]/40 text-xs tracking-widest uppercase font-sans">
        <div className="hidden md:block">
            High Fidelity<br/>3D Experience
        </div>
        <div className="text-right">
            Interactive<br/>Holiday Series
        </div>
      </div>
    </div>
  );
};

export default UIOverlay;
