import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeState } from '../types';
import { getScatterPosition } from '../utils/geometry';

interface RibbonProps {
  state: TreeState;
  visible: boolean;
}

const Ribbon: React.FC<RibbonProps> = ({ state, visible }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 400; // Number of particles in the ribbon

  // Generate Ribbon Data
  const { particles, geometry } = useMemo(() => {
    const temp = [];
    
    // Ribbon parameters
    const height = 13;
    const turns = 4;
    const baseRadius = 5.5;

    for (let i = 0; i < count; i++) {
        const t = i / count; // 0 to 1 (top to bottom)
        
        // Tree Position (Spiral)
        const angle = t * Math.PI * 2 * turns;
        // Start high (near star at y=8) and go down
        const y = 8 - (t * height); 
        // Radius increases as we go down (cone shape)
        const radius = (t * baseRadius * 0.9) + 0.2; // Start very close to center (star)
        
        const tx = Math.cos(angle) * radius;
        const tz = Math.sin(angle) * radius;

        // Scatter Position
        const [sx, sy, sz] = getScatterPosition(25);

        // Scale (flicker size)
        const s = Math.random() * 0.15 + 0.05;

        temp.push({
            treePos: new THREE.Vector3(tx, y, tz),
            scatterPos: new THREE.Vector3(sx, sy, sz),
            phase: Math.random() * Math.PI * 2,
            scale: s
        });
    }

    return { particles: temp, geometry: new THREE.PlaneGeometry(0.3, 0.3) };
  }, []);

  useFrame((stateThree, delta) => {
    if (!meshRef.current) return;
    
    // Visibility fade could be handled here, but prop control is easier for now
    if (!visible) {
        meshRef.current.visible = false;
        return;
    }
    meshRef.current.visible = true;

    if (meshRef.current.userData.progress === undefined) meshRef.current.userData.progress = 0;
    
    const targetProgress = state === TreeState.TREE_SHAPE ? 1 : 0;
    
    // Smooth transition
    meshRef.current.userData.progress = THREE.MathUtils.lerp(
      meshRef.current.userData.progress,
      targetProgress,
      delta * 1.5
    );
    
    const t = meshRef.current.userData.progress;
    // Ease
    const easedT = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const dummy = new THREE.Object3D();
    const color = new THREE.Color('#00ff44'); // Fluorescent Green

    particles.forEach((p, i) => {
        // Position
        dummy.position.lerpVectors(p.scatterPos, p.treePos, easedT);
        
        // Add "Alive" motion
        const time = stateThree.clock.elapsedTime;
        dummy.position.y += Math.sin(time * 2 + p.phase) * 0.05;
        dummy.position.x += Math.cos(time * 1.5 + p.phase) * 0.02;

        // Always face camera (Billboard)
        dummy.lookAt(stateThree.camera.position);

        // Scale pulse
        const pulse = 1 + Math.sin(time * 5 + p.phase) * 0.2;
        dummy.scale.setScalar(p.scale * pulse);

        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.matrix);
        meshRef.current!.setColorAt(i, color);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    meshRef.current.instanceColor!.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[geometry, undefined, count]} frustumCulled={false}>
      {/* Glowy Green Material */}
      <meshBasicMaterial 
        color="#00ff44" 
        toneMapped={false} 
        transparent 
        opacity={0.8}
        side={THREE.DoubleSide}
      />
    </instancedMesh>
  );
};

export default Ribbon;
