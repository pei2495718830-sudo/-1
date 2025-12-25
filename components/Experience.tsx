import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { TreeState, TreeConfig } from '../types';
import Foliage from './Foliage';
import Ornaments from './Ornaments';
import Fireworks from './Fireworks';
import Ribbon from './Ribbon';

interface ExperienceProps {
  treeState: TreeState;
  onToggle: () => void;
  config: TreeConfig;
}

const Experience: React.FC<ExperienceProps> = ({ treeState, onToggle, config }) => {
  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: false }}>
      <PerspectiveCamera makeDefault position={[0, 2, 25]} fov={35} />
      
      <color attach="background" args={['#000502']} />
      
      <Suspense fallback={null}>
        {/* Main Tree Group with Scale Control */}
        <group position={[0, -5, 0]} scale={[config.treeScale, config.treeScale, config.treeScale]}>
            {/* Click Hitbox for the Tree - Invisible Cone */}
            <mesh 
                onClick={(e) => { e.stopPropagation(); onToggle(); }} 
                position={[0, 7, 0]}
                visible={false}
            >
                <coneGeometry args={[6, 16, 16]} />
                <meshBasicMaterial color="red" wireframe />
            </mesh>
            
            {/* The Fluorescent Ribbon */}
            <Ribbon state={treeState} visible={config.showRibbon} />

            {/* Core Tree Foliage */}
            {config.showFoliage && <Foliage state={treeState} count={12000} />}
            
            {/* Surrounding "Branches" / Forest feel */}
            <group scale={[1.5, 0.8, 1.5]} position={[0, -1, 0]}>
               {config.showFoliage && <Foliage state={treeState} count={7000} />}
            </group>
            
            {/* The Star - Always visible if tree is there */}
            <Ornaments 
                count={1} 
                type="star" 
                state={treeState} 
                colorTheme={['#FFD700']} 
            />

            {/* Configurable Standard Ornaments (Spheres) */}
            {config.showOrnaments && (
              <>
                {/* Variable Size Spheres (Big & Small) */}
                <Ornaments 
                    count={450} 
                    type="sphere" 
                    state={treeState} 
                    colorTheme={[config.themeColor]} 
                />

                {/* Baubles (Spiral) - Emerald/Silver */}
                <Ornaments 
                    count={80} 
                    type="bauble" 
                    state={treeState} 
                    colorTheme={['#2ecc71', '#bdc3c7', '#ffffff']} 
                />
              </>
            )}

            {/* --- Special Decorations --- */}
            
            {/* Bells */}
            <Ornaments 
                count={80} 
                type="bell" 
                state={treeState} 
                colorTheme={['#FFD700']} 
                visible={config.showBells}
            />

            {/* Socks */}
            <Ornaments 
                count={60} 
                type="sock" 
                state={treeState} 
                colorTheme={['#D42426', '#FFFFFF', '#165B33']} // Red, White, Green mix
                visible={config.showSocks}
            />

            {/* Leaves */}
            <Ornaments 
                count={150} 
                type="leaf" 
                state={treeState} 
                colorTheme={['#C0C0C0', '#D4AF37']} // Silver and Gold leaves
                visible={config.showLeaves}
            />
            
            {/* Gifts: Boxes at the bottom */}
            <Ornaments 
                count={120} 
                type="box" 
                state={treeState} 
                colorTheme={['#1a5276', '#922b21', '#117a65', '#d4ac0d', '#5b2c6f', '#e67e22']} 
                visible={config.showOrnaments} 
            />
        </group>

        {/* Fireworks in background */}
        <Fireworks />

        {/* Floor Reflections */}
        <ContactShadows 
            position={[0, -6, 0]} 
            opacity={0.6} 
            scale={40} 
            blur={2} 
            far={4.5} 
            color="#000000"
        />

        {/* Environment & Lighting */}
        <ambientLight intensity={0.2} color="#002211" />
        <spotLight 
            position={[10, 20, 10]} 
            angle={0.15} 
            penumbra={1} 
            intensity={2} 
            castShadow 
            shadow-mapSize={[2048, 2048]} 
            color="#ffeebb"
        />
        <pointLight position={[-10, 5, -10]} intensity={2} color="#00ff88" distance={20} />
        <pointLight position={[10, -5, 10]} intensity={2} color="#ffaa00" distance={20} />

        {/* Background Atmosphere */}
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <Environment preset="city" />
        
        {/* Post Processing for Cinematic Look */}
        <EffectComposer disableNormalPass>
            <Bloom 
                luminanceThreshold={2.0} 
                mipmapBlur 
                intensity={4.0} 
                radius={0.6}
            />
            <Noise opacity={0.05} />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
        
        <OrbitControls 
            enablePan={false} 
            maxPolarAngle={Math.PI / 2} 
            minDistance={10} 
            maxDistance={50}
            autoRotate={treeState === TreeState.TREE_SHAPE}
            autoRotateSpeed={0.5}
        />
      </Suspense>
    </Canvas>
  );
};

export default Experience;
