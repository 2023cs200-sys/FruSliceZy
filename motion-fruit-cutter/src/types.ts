/**
 * Core types for Motion Fruit Cutter - Arcade Game UI
 */

export type ScreenState = 
  | 'MAIN_MENU'
  | 'GAMEPLAY'
  | 'CONNECT'
  | 'CALIBRATE'
  | 'HOW_TO_PLAY'
  | 'HIGH_SCORES'
  | 'SETTINGS'
  | 'GAME_OVER';

export type FruitType = 'APPLE' | 'WATERMELON' | 'ORANGE' | 'BANANA' | 'PINEAPPLE' | 'BOMB';

export interface FruitConfig {
  type: FruitType;
  name: string;
  points: number;
  color: string;
  accentColor: string;
  juiceColor: string;
  radius: number;
  isBomb: boolean;
}

export interface ActiveFruit {
  id: number;
  type: FruitType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  rotation: number;
  vRot: number;
  isSliced: boolean;
  sliceAngle: number;
  splitDistance: number;
  isBomb: boolean;
  color: string;
  juiceColor: string;
  half1Vx?: number;
  half1Vy?: number;
  half2Vx?: number;
  half2Vy?: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  isJuiceSplash?: boolean;
}

export interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  alpha: number;
  scale: number;
  life: number;
  maxLife: number;
}

export interface BladeTrailPoint {
  x: number;
  y: number;
  time: number;
  width: number;
}

export interface GameStats {
  score: number;
  bestScore: number;
  fruitsCut: number;
  maxCombo: number;
  currentCombo: number;
  bombsHit: number;
  timeRemaining: number;
  initialTime: number;
  difficulty: 'NORMAL' | 'SPEED x1.5' | 'FRENZY';
  isPaused: boolean;
}

export type ConnectionStatus = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED';

export interface ControllerConfig {
  ipAddress: string;
  port: string;
  status: ConnectionStatus;
  gyro: {
    pitch: number;
    roll: number;
    yaw: number;
  };
  lastMotionTime: number;
}

export interface GameSettings {
  soundEffects: boolean;
  music: boolean;
  controllerSensitivity: number; // 1 to 10
  motionSmoothing: number; // 1 to 10
  vibration: boolean;
  graphicsQuality: 'LOW' | 'MEDIUM' | 'ULTRA';
  bladeStyle: 'CRIMSON' | 'CYBER_AZURE' | 'EMERALD' | 'GOLDEN';
}

export interface HighScoreEntry {
  rank: number;
  playerName: string;
  score: number;
  fruitsCut: number;
  combo: number;
  date: string;
}
