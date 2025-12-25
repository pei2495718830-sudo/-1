import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Fireworks = () => {
  const count = 100;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  // Data for each explosion particle
  // We simulate "clumps" of particles exploding
  const particles = useMemo(() => {
    const data = [];
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    
    // 5 different explosions, each with 20 particles
    for(let e=0; e<5; e++) {
        const cx = (Math.random() - 0.5) * 60;
        const cy = Math.random() * 30; // High in sky
        const cz = (Math.random() - 0.5) * 40 - 20; // Behind tree mostly
        const color = new THREE.Color(colors[Math.floor(Math.random() * colors.length)]);
        const startTime = Math.random() * 10;

        for(let p=0; p<20; p++) {
            data.push({
                center: new THREE.Vector3(cx, cy, cz),
                velocity: new THREE.Vector3((Math.random()-0.5)*10, (Math.random()-0.5)*10, (Math.random()-0.5)*10),
                color: color,
                startTime: startTime, // Offset start time
                scaleBase: Math.random() * 0.5 + 0.2
            });
        }
    }
    return data;
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;
    const dummy = new THREE.Object3D();

    particles.forEach((p, i) => {
        // Local time for this explosion loop (repeat every 4 seconds)
        const age = (time + p.startTime) % 4;
        
        if (age < 2) {
            // Exploding
            const expansion = 1 - Math.exp(-age * 2); // Fast out, slow end
            
            // Gravity effect
            const gravity = -0.5 * 9.8 * age * age * 0.1;
            
            dummy.position.copy(p.center).addScaledVector(p.velocity, expansion).y += gravity;
            
            // Fade out scale
            const fade = 1 - (age / 2);
            dummy.scale.setScalar(p.scaleBase * fade);
        } else {
            // Hidden/Resetting
            dummy.scale.setScalar(0);
        }

        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.matrix);
        meshRef.current!.setColorAt(i, p.color);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    meshRef.current.instanceColor!.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} frustumCulled={false}>
      <sphereGeometry args={[0.2, 8, 8]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
};

export default Fireworks;
