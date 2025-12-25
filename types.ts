import { Color } from 'three';

export enum TreeState {
  SCATTERED = 'SCATTERED',
  TREE_SHAPE = 'TREE_SHAPE'
}

export interface ParticleData {
  scatterPos: [number, number, number];
  treePos: [number, number, number];
  color: Color;
  size: number;
  speed: number;
  phase: number;
}

export interface OrnamentData {
  id: string;
  scatterPos: [number, number, number];
  treePos: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  type: 'box' | 'sphere' | 'bauble' | 'star' | 'bell' | 'sock' | 'leaf';
  color: string;
}

export interface TreeConfig {
  themeColor: string;
  showRibbon: boolean;
  showOrnaments: boolean;
  showFoliage: boolean;
  showBells: boolean;
  showSocks: boolean;
  showLeaves: boolean;
  treeScale: number;
}
