import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeState } from '../types';
import { getScatterPosition, getTreePosition } from '../utils/geometry';

// Custom Shader Material for performant morphing
const FoliageMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uProgress: { value: 0 }, // 0 = Scatter, 1 = Tree
    uColorBase: { value: new THREE.Color('#003318') }, // Deep Emerald
    uColorTip: { value: new THREE.Color('#2e8b57') }, // Lighter Green
    uColorGold: { value: new THREE.Color('#ffd700') }, // Gold
  },
  vertexShader: `
    uniform float uTime;
    uniform float uProgress;
    attribute vec3 aTargetPos;
    attribute float aPhase;
    attribute float aSize;
    
    varying float vAlpha;
    varying vec3 vColor;
    
    // Cubic bezier ease-in-out approximation for smoother transition
    float easeInOutCubic(float x) {
      return x < 0.5 ? 4.0 * x * x * x : 1.0 - pow(-2.0 * x + 2.0, 3.0) / 2.0;
    }

    void main() {
      float t = easeInOutCubic(uProgress);
      
      // Mix positions
      vec3 finalPos = mix(position, aTargetPos, t);
      
      // Add "Breathing" / "Floating" animation
      // When scattered (t=0), float more. When tree (t=1), shimmer tightly.
      float floatAmp = mix(2.0, 0.1, t);
      float floatFreq = mix(0.5, 2.0, t);
      
      finalPos.y += sin(uTime * floatFreq + aPhase) * floatAmp * 0.1;
      finalPos.x += cos(uTime * floatFreq * 0.7 + aPhase) * floatAmp * 0.05;
      
      vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      
      // Size attenuation
      gl_PointSize = aSize * (300.0 / -mvPosition.z);
      
      // Pass varying to fragment
      vAlpha = 0.6 + 0.4 * sin(uTime * 2.0 + aPhase); // Twinkle
    }
  `,
  fragmentShader: `
    uniform vec3 uColorBase;
    uniform vec3 uColorTip;
    uniform vec3 uColorGold;
    
    varying float vAlpha;
    varying vec3 vColor;

    void main() {
      // Circular particle
      vec2 center = gl_PointCoord - 0.5;
      float dist = length(center);
      if (dist > 0.5) discard;
      
      // Soft edge
      float glow = 1.0 - (dist * 2.0);
      glow = pow(glow, 1.5);
      
      // Mix colors based on glow (center is brighter/gold)
      vec3 finalColor = mix(uColorBase, uColorTip, glow);
      
      // Add gold sparkles randomly or at center
      if (vAlpha > 0.9) {
         finalColor = mix(finalColor, uColorGold, 0.5);
      }
      
      gl_FragColor = vec4(finalColor, glow * vAlpha);
    }
  `
};

interface FoliageProps {
  count?: number;
  state: TreeState;
}

const Foliage: React.FC<FoliageProps> = ({ count = 6000, state }) => {
  const shaderRef = useRef<THREE.ShaderMaterial>(null);
  
  // Memoize attributes
  const { positions, targets, phases, sizes } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const tar = new Float32Array(count * 3);
    const pha = new Float32Array(count);
    const siz = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      // Initial Scatter
      const [sx, sy, sz] = getScatterPosition(25);
      pos[i * 3] = sx;
      pos[i * 3 + 1] = sy;
      pos[i * 3 + 2] = sz;
      
      // Target Tree
      const [tx, ty, tz] = getTreePosition(14, 5, 1.2);
      tar[i * 3] = tx;
      tar[i * 3 + 1] = ty;
      tar[i * 3 + 2] = tz;
      
      pha[i] = Math.random() * Math.PI * 2;
      siz[i] = Math.random() * 0.15 + 0.05;
    }
    
    return { positions: pos, targets: tar, phases: pha, sizes: siz };
  }, [count]);

  useFrame((stateThree, delta) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value += delta;
      
      // Smooth morphing logic
      const targetProgress = state === TreeState.TREE_SHAPE ? 1.0 : 0.0;
      const currentProgress = shaderRef.current.uniforms.uProgress.value;
      
      // Standard lerp
      const speed = 1.5;
      shaderRef.current.uniforms.uProgress.value = THREE.MathUtils.lerp(
        currentProgress,
        targetProgress,
        delta * speed
      );
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aTargetPos"
          count={targets.length / 3}
          array={targets}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aPhase"
          count={phases.length}
          array={phases}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aSize"
          count={sizes.length}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={shaderRef}
        attach="material"
        args={[FoliageMaterial]}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default Foliage;
