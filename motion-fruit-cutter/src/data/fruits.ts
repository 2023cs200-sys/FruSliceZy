import { FruitConfig, FruitType, HighScoreEntry } from '../types';

export const FRUIT_CONFIGS: Record<FruitType, FruitConfig> = {
  APPLE: {
    type: 'APPLE',
    name: 'Red Apple',
    points: 10,
    color: '#ff3e3e',
    accentColor: '#dc2626',
    juiceColor: '#ff6b6b',
    radius: 38,
    isBomb: false,
  },
  WATERMELON: {
    type: 'WATERMELON',
    name: 'Watermelon',
    points: 15,
    color: '#22c55e',
    accentColor: '#15803d',
    juiceColor: '#ff3e3e',
    radius: 50,
    isBomb: false,
  },
  ORANGE: {
    type: 'ORANGE',
    name: 'Citrus Orange',
    points: 10,
    color: '#ff8800',
    accentColor: '#ea580c',
    juiceColor: '#ffaa33',
    radius: 40,
    isBomb: false,
  },
  BANANA: {
    type: 'BANANA',
    name: 'Ripe Banana',
    points: 15,
    color: '#ffcc00',
    accentColor: '#ca8a04',
    juiceColor: '#fef08a',
    radius: 42,
    isBomb: false,
  },
  PINEAPPLE: {
    type: 'PINEAPPLE',
    name: 'Golden Pineapple',
    points: 25,
    color: '#f59e0b',
    accentColor: '#d97706',
    juiceColor: '#ffea79',
    radius: 48,
    isBomb: false,
  },
  BOMB: {
    type: 'BOMB',
    name: 'Bomb',
    points: 0,
    color: '#11131a',
    accentColor: '#ff3e3e',
    juiceColor: '#ff3e3e',
    radius: 36,
    isBomb: true,
  },
};

export const INITIAL_HIGH_SCORES: HighScoreEntry[] = [
  { rank: 1, playerName: 'NINJA_ACE', score: 12840, fruitsCut: 94, combo: 12, date: 'TODAY' },
  { rank: 2, playerName: 'BLADE_VIPER', score: 9980, fruitsCut: 78, combo: 9, date: 'YESTERDAY' },
  { rank: 3, playerName: 'MOTION_DEV', score: 7870, fruitsCut: 71, combo: 8, date: '3 DAYS AGO' },
  { rank: 4, playerName: 'SAMURAI_X', score: 5620, fruitsCut: 63, combo: 7, date: 'THIS WEEK' },
  { rank: 5, playerName: 'FRUIT_SLICER', score: 3400, fruitsCut: 55, combo: 6, date: 'LAST WEEK' },
];

export const BLADE_COLORS = {
  CYBER_AZURE: {
    name: 'Cyber Azure',
    outer: 'rgba(100, 200, 255, 0.65)',
    inner: '#ffffff',
    glow: '#38bdf8',
    spark: '#ffffff',
  },
  CRIMSON: {
    name: 'Crimson Blaze',
    outer: 'rgba(255, 62, 62, 0.8)',
    inner: '#ffffff',
    glow: '#ff3e3e',
    spark: '#ffcc00',
  },
  EMERALD: {
    name: 'Jade Blade',
    outer: 'rgba(74, 222, 128, 0.8)',
    inner: '#ffffff',
    glow: '#4ade80',
    spark: '#bbf7d0',
  },
  GOLDEN: {
    name: 'Dragon Katana',
    outer: 'rgba(255, 204, 0, 0.85)',
    inner: '#ffffff',
    glow: '#ffcc00',
    spark: '#fef08a',
  },
};
