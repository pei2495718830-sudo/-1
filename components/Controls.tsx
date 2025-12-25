import React from 'react';
import { TreeConfig } from '../types';

interface ControlsProps {
  config: TreeConfig;
  setConfig: React.Dispatch<React.SetStateAction<TreeConfig>>;
}

const Controls: React.FC<ControlsProps> = ({ config, setConfig }) => {
  const handleChange = (key: keyof TreeConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const renderToggle = (label: string, key: keyof TreeConfig) => (
    <label className="flex items-center space-x-3 cursor-pointer group">
        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${config[key] ? 'bg-[#ffd700] border-[#ffd700]' : 'border-white/30'}`}>
            {config[key] && <div className="w-2 h-2 bg-black rounded-sm" />}
        </div>
        <input 
            type="checkbox" 
            checked={!!config[key]} 
            onChange={(e) => handleChange(key, e.target.checked)}
            className="hidden"
        />
        <span className="text-xs text-white/80 group-hover:text-white transition-colors">{label}</span>
    </label>
  );

  return (
    <div className="absolute right-0 top-1/2 -translate-y-1/2 p-6 z-20 w-64 mr-4 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl text-gold-500 font-sans shadow-2xl animate-fade-in pointer-events-auto">
      <h3 className="text-[#ffd700] uppercase tracking-widest text-xs font-bold mb-6 border-b border-white/10 pb-2">
        Work Board
      </h3>

      {/* Color */}
      <div className="mb-6">
        <label className="block text-xs uppercase tracking-wide text-white/60 mb-2">Theme Color</label>
        <div className="flex items-center space-x-2">
            <input 
                type="color" 
                value={config.themeColor} 
                onChange={(e) => handleChange('themeColor', e.target.value)}
                className="w-full h-8 bg-transparent cursor-pointer border-none outline-none"
            />
            <span className="text-xs font-mono text-white/50">{config.themeColor}</span>
        </div>
      </div>

      {/* Elements */}
      <div className="mb-6 space-y-3">
        <label className="block text-xs uppercase tracking-wide text-white/60 mb-2">Decorations</label>
        
        {renderToggle("Neon Ribbon", "showRibbon")}
        {renderToggle("Baubles (Spheres)", "showOrnaments")}
        {renderToggle("Foliage", "showFoliage")}
        
        <div className="h-2" /> {/* Spacer */}
        <label className="block text-xs uppercase tracking-wide text-white/60 mb-2">Special Ornaments</label>
        
        {renderToggle("Golden Bells", "showBells")}
        {renderToggle("Holiday Socks", "showSocks")}
        {renderToggle("Silver Leaves", "showLeaves")}
      </div>

      {/* Size */}
      <div>
        <label className="block text-xs uppercase tracking-wide text-white/60 mb-2">
            Tree Scale: {config.treeScale.toFixed(1)}x
        </label>
        <input 
            type="range" 
            min="0.5" 
            max="1.5" 
            step="0.1"
            value={config.treeScale}
            onChange={(e) => handleChange('treeScale', parseFloat(e.target.value))}
            className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-[#ffd700] [&::-webkit-slider-thumb]:rounded-full"
        />
      </div>
    </div>
  );
};

export default Controls;
