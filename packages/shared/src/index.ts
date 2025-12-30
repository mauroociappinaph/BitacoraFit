// Shared types and utilities for BitácoraFit

export interface DailyLog {
  id: string;
  userId: string;
  date: string;
  weight?: number;
  waterIntake?: number;
  steps?: number;
  sleepHours?: number;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DailyEvent {
  id: string;
  userId: string;
  logId: string;
  type: 'water' | 'food' | 'exercise' | 'sleep' | 'weight' | 'steps';
  value: number;
  description: string;
  createdAt: string;
}

export interface AiOutput {
  id: string;
  userId: string;
  logId: string;
  type: 'analyst' | 'coach' | 'nutritionist';
  content: string;
  createdAt: string;
}

export const APP_CONSTANTS = {
  MAX_WATER_INTAKE: 5000,
  MAX_WEIGHT: 200,
  MAX_STEPS: 50000,
  MAX_CALORIES: 5000,
  MAX_PROTEIN: 300,
  MAX_CARBS: 500,
  MAX_FAT: 100,
  MAX_SLEEP_HOURS: 24
} as const;

// Test export for validation
export const TEST_EXPORT = 'Shared package is working correctly';
