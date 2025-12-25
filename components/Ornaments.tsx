import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeState } from '../types';
import { getScatterPosition, getTreePosition, getSpiralPosition } from '../utils/geometry';

interface OrnamentsProps {
  count: number;
  type: 'box' | 'sphere' | 'bauble' | 'star' | 'bell' | 'sock' | 'leaf';
  state: TreeState;
  colorTheme: string[];
  visible?: boolean;
}

const Ornaments: React.FC<OrnamentsProps> = ({ count, type, state, colorTheme, visible = true }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  // --- Geometries ---

  // 1. Star
  const starGeometry = useMemo(() => {
    if (type !== 'star') return null;
    const shape = new THREE.Shape();
    const points = 5;
    const outerRadius = 0.5;
    const innerRadius = 0.25;
    for (let i = 0; i < points * 2; i++) {
        const r = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i / (points * 2)) * Math.PI * 2 + Math.PI / 2;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        if (i === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
    }
    shape.closePath();
    return new THREE.ExtrudeGeometry(shape, { depth: 0.2, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 2 });
  }, [type]);

  // 2. Bell (Lathe)
  const bellGeometry = useMemo(() => {
    if (type !== 'bell') return null;
    const points = [];
    // Profile of a bell
    points.push(new THREE.Vector2(0.4, -0.3)); // flare
    points.push(new THREE.Vector2(0.3, -0.2));
    points.push(new THREE.Vector2(0.25, 0.2));
    points.push(new THREE.Vector2(0.15, 0.4)); // top curve
    points.push(new THREE.Vector2(0.0, 0.5));  // cap
    return new THREE.LatheGeometry(points, 16);
  }, [type]);

  // 3. Sock (Extruded Shape)
  const sockGeometry = useMemo(() => {
    if (type !== 'sock') return null;
    const shape = new THREE.Shape();
    // A simple "J" or "L" shape
    shape.moveTo(0, 0.5);
    shape.lineTo(0.3, 0.5);
    shape.lineTo(0.35, -0.2); // Ankle
    shape.quadraticCurveTo(0.4, -0.5, 0.6, -0.5); // Toe out
    shape.lineTo(0.6, -0.7); // Sole toe
    shape.lineTo(0.1, -0.7); // Sole heel
    shape.quadraticCurveTo(-0.1, -0.6, -0.1, -0.2); // Heel back
    shape.lineTo(0, 0.5); // Back up
    return new THREE.ExtrudeGeometry(shape, { depth: 0.15, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 1 });
  }, [type]);

  // 4. Leaf (Extruded Shape)
  const leafGeometry = useMemo(() => {
    if (type !== 'leaf') return null;
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.quadraticCurveTo(0.2, 0.2, 0, 0.6); // Right side curve
    shape.quadraticCurveTo(-0.2, 0.2, 0, 0);  // Left side curve
    return new THREE.ExtrudeGeometry(shape, { depth: 0.05, bevelEnabled: false });
  }, [type]);


  // --- Data Generation ---
  const instances = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      let scale = new THREE.Vector3(1, 1, 1);
      
      // Scale logic based on type
      if (type === 'box') {
        const s = Math.random() * 0.5 + 0.3; 
        scale.set(s, s, s);
      } else if (type === 'star') {
        scale.set(1, 1, 1);
      } else if (type === 'sphere') {
        // Variable Sphere Sizes: Mix of Big, Medium, Small
        const r = Math.random();
        let s;
        if (r > 0.92) s = 0.8 + Math.random() * 0.3; // Very Big Statement Piece
        else if (r > 0.7) s = 0.4 + Math.random() * 0.2; // Medium
        else s = 0.15 + Math.random() * 0.15; // Small filler
        scale.set(s, s, s);
      } else if (type === 'bell') {
        const s = 0.6 + Math.random() * 0.2;
        scale.set(s, s, s);
      } else if (type === 'sock') {
        const s = 0.5 + Math.random() * 0.2;
        scale.set(s, s, s);
      } else if (type === 'leaf') {
        const s = 0.4 + Math.random() * 0.3;
        scale.set(s, s, s);
      } else {
        const s = Math.random() * 0.3 + 0.15;
        scale.set(s, s, s);
      }

      // Scatter pos
      const [sx, sy, sz] = getScatterPosition(25);
      
      // Tree pos & Rotation logic
      let tx, ty, tz;
      let rotTree = new THREE.Euler();

      if (type === 'box') {
        [tx, ty, tz] = getTreePosition(4, 9, 0.3); 
        ty -= 6; 
        rotTree.set(0, Math.random() * Math.PI * 2, 0);
      } else if (type === 'star') {
        tx = 0; ty = 8; tz = 0;
        rotTree.set(0, 0, 0);
      } else if (type === 'bauble') {
         [tx, ty, tz] = getSpiralPosition(Math.random(), 14, 5, 5);
         rotTree.set(Math.random() * 0.5, Math.random() * Math.PI * 2, 0);
      } else {
        // Standard random tree distribution
        [tx, ty, tz] = getTreePosition(14, 5, 1);
        rotTree.set(Math.random() * Math.PI, Math.random() * Math.PI * 2, Math.random() * 0.5);
        
        // Specific orientation tweaks
        if (type === 'bell') {
             // Bells should hang somewhat downwards
             rotTree.x = 0; 
             rotTree.z = 0;
        }
        if (type === 'leaf') {
            // Leaves point out
            rotTree.x = -Math.PI / 4; 
        }
      }

      const color = new THREE.Color(colorTheme[0]); 
      
      temp.push({
        scatterPos: new THREE.Vector3(sx, sy, sz),
        treePos: new THREE.Vector3(tx, ty, tz),
        rotationScatter: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0),
        rotationTree: rotTree,
        scale,
        baseColor: new THREE.Color(colorTheme[Math.floor(Math.random() * colorTheme.length)]),
        phase: Math.random() * Math.PI * 2,
      });
    }
    return temp;
  }, [count, type]); 

  // Update Colors
  useLayoutEffect(() => {
    if (!meshRef.current) return;
    instances.forEach((data, i) => {
      let c = data.baseColor;
      
      if (type === 'sphere') {
         c = new THREE.Color(colorTheme[0]);
         // Add some variation for depth
         if (i % 3 === 0) c = c.clone().multiplyScalar(0.7); // Darker
         if (i % 5 === 0) c = c.clone().offsetHSL(0, 0, 0.2); // Lighter
      }
      
      meshRef.current!.setColorAt(i, c);
    });
    meshRef.current.instanceColor!.needsUpdate = true;
  }, [instances, colorTheme, type]);

  // Animation Loop
  useFrame((stateThree, delta) => {
    if (!meshRef.current) return;
    if (!visible) {
        meshRef.current.visible = false;
        return;
    }
    meshRef.current.visible = true;
    
    const dummy = new THREE.Object3D();
    
    if (meshRef.current.userData.progress === undefined) meshRef.current.userData.progress = 0;
    
    const targetProgress = state === TreeState.TREE_SHAPE ? 1 : 0;
    
    const speed = type === 'star' ? 2.5 : type === 'box' ? 0.8 : 1.0;
    
    meshRef.current.userData.progress = THREE.MathUtils.lerp(
      meshRef.current.userData.progress,
      targetProgress,
      delta * speed
    );
    
    const t = meshRef.current.userData.progress;
    const easedT = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    instances.forEach((data, i) => {
      // Position Lerp
      dummy.position.lerpVectors(data.scatterPos, data.treePos, easedT);
      
      // Floating animation
      if (t < 0.95) {
        const floatFactor = (1 - t);
        dummy.position.y += Math.sin(stateThree.clock.elapsedTime + data.phase) * 0.05 * floatFactor;
        
        dummy.rotation.x = THREE.MathUtils.lerp(data.rotationScatter.x, data.rotationTree.x, easedT) + Math.sin(stateThree.clock.elapsedTime) * 0.5 * floatFactor;
        dummy.rotation.y = THREE.MathUtils.lerp(data.rotationScatter.y, data.rotationTree.y, easedT) + stateThree.clock.elapsedTime * 0.2 * floatFactor;
        dummy.rotation.z = THREE.MathUtils.lerp(data.rotationScatter.z, data.rotationTree.z, easedT);
      } else {
        // Locked in tree formation
        dummy.rotation.set(data.rotationTree.x, data.rotationTree.y, data.rotationTree.z);
        
        // Gentle Sway for hanging items
        if (type === 'bell' || type === 'sock' || type === 'bauble') {
            dummy.rotation.x += Math.sin(stateThree.clock.elapsedTime * 2 + data.phase) * 0.05;
            dummy.rotation.z += Math.cos(stateThree.clock.elapsedTime * 1.5 + data.phase) * 0.05;
        }

        if (type === 'star') {
            dummy.rotation.y += stateThree.clock.elapsedTime * 0.5;
        }
      }
      
      dummy.scale.copy(data.scale);
      
      if (type === 'star' && t > 0.9) {
          const scalePulse = 1 + Math.sin(stateThree.clock.elapsedTime * 3) * 0.1;
          dummy.scale.multiplyScalar(scalePulse);
      }

      // Pop effect on arrival
      if (t > 0.8 && t < 1.0 && type !== 'star') {
         const pop = Math.sin(stateThree.clock.elapsedTime * 10 + data.phase) * 0.02 * (1-t)*5;
         dummy.scale.addScalar(pop);
      }

      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  // Geometry and Material Selection
  const getGeometry = () => {
    switch (type) {
      case 'box': return <boxGeometry />;
      case 'bauble': return <sphereGeometry args={[0.6, 32, 32]} />;
      case 'bell': return <primitive object={bellGeometry!} />;
      case 'sock': return <primitive object={sockGeometry!} />;
      case 'leaf': return <primitive object={leafGeometry!} />;
      case 'star': return <primitive object={starGeometry!} />;
      case 'sphere': 
      default: return <sphereGeometry args={[0.5, 32, 32]} />;
    }
  };

  const getMaterialProps = () => {
    switch (type) {
        case 'box': 
            return { roughness: 0.3, metalness: 0.1, emissive: new THREE.Color('#000000') };
        case 'bauble':
            return { roughness: 0.05, metalness: 0.8, emissive: new THREE.Color('#221100'), emissiveIntensity: 0.2 };
        case 'bell':
            return { roughness: 0.15, metalness: 1.0, color: new THREE.Color('#ffd700') }; // Gold bells
        case 'sock':
            return { roughness: 0.9, metalness: 0.0 }; // Fabric
        case 'leaf':
             return { roughness: 0.2, metalness: 0.8 }; // Metallic leaf
        case 'star':
            return { 
                roughness: 0, 
                metalness: 0.5, 
                emissive: new THREE.Color('#FFDD55'), 
                emissiveIntensity: 10, 
                toneMapped: false 
            };
        default:
            return { roughness: 0.2, metalness: 0.6 };
    }
  };

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, count]}
      castShadow
      receiveShadow
    >
      {getGeometry()}
      <meshPhysicalMaterial
        {...getMaterialProps()}
        envMapIntensity={2}
      />
    </instancedMesh>
  );
};

export default Ornaments;
