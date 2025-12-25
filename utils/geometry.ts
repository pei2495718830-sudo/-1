import { Vector3, MathUtils } from 'three';

/**
 * Generates a random point inside a sphere of given radius.
 */
export const getScatterPosition = (radius: number): [number, number, number] => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random()) * radius;
  
  const x = r * Math.sin(phi) * Math.cos(theta);
  const y = r * Math.sin(phi) * Math.sin(theta);
  const z = r * Math.cos(phi);
  
  return [x, y, z];
};

/**
 * Generates a point on a cone surface (the tree).
 * @param height Total height of the tree
 * @param radius Base radius of the tree
 * @param yBias Bias for distribution (power) to put more items at bottom
 */
export const getTreePosition = (
  height: number, 
  baseRadius: number,
  yBias: number = 1
): [number, number, number] => {
  // Normalize height 0 to 1
  const h = Math.pow(Math.random(), yBias); 
  const y = h * height - (height / 2); // Center vertically
  
  // Radius at this height (linear taper)
  // At bottom (h=0), r = baseRadius. At top (h=1), r = 0.
  const rAtHeight = baseRadius * (1 - h);
  
  const theta = Math.random() * Math.PI * 2;
  const jitter = 0.5; // Slight internal jitter for volume
  
  const x = (rAtHeight - (Math.random() * jitter)) * Math.cos(theta);
  const z = (rAtHeight - (Math.random() * jitter)) * Math.sin(theta);
  
  return [x, y, z];
};

/**
 * Generates a spiral position for the "garland" effect or ordered ornaments
 */
export const getSpiralPosition = (
  t: number, // 0 to 1
  height: number,
  baseRadius: number,
  loops: number
): [number, number, number] => {
  const y = t * height - (height / 2);
  const radius = baseRadius * (1 - t);
  const angle = t * Math.PI * 2 * loops;
  
  const x = radius * Math.cos(angle);
  const z = radius * Math.sin(angle);
  
  return [x, y, z];
};
