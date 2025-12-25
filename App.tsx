import React, { useState, useCallback } from 'react';
import Experience from './components/Experience';
import UIOverlay from './components/UIOverlay';
import { TreeState, TreeConfig } from './types';

const App: React.FC = () => {
  const [treeState, setTreeState] = useState<TreeState>(TreeState.SCATTERED);
  
  // Default Configuration
  const [config] = useState<TreeConfig>({
    themeColor: '#FFD700',
    showRibbon: true,
    showOrnaments: true,
    showFoliage: true,
    showBells: true,
    showSocks: true,
    showLeaves: true,
    treeScale: 1.0,
  });

  const toggleState = useCallback(() => {
    setTreeState((prev) => 
      prev === TreeState.SCATTERED ? TreeState.TREE_SHAPE : TreeState.SCATTERED
    );
  }, []);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* 3D Canvas Layer */}
      <div className="absolute inset-0 z-0">
        <Experience treeState={treeState} onToggle={toggleState} config={config} />
      </div>

      {/* UI Overlay Layer */}
      <UIOverlay currentState={treeState} onToggle={toggleState} />
    </div>
  );
};

export default App;