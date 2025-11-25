export type MoonPhase = 
  | 'New Moon'
  | 'Waxing Crescent'
  | 'First Quarter'
  | 'Waxing Gibbous'
  | 'Full Moon'
  | 'Waning Gibbous'
  | 'Last Quarter'
  | 'Waning Crescent';

export interface MoonPhaseInfo {
  phase: MoonPhase;
  illumination: number; // 0 to 1
}

/**
 * Calculate the current moon phase based on the date
 * @param date - The date to calculate the moon phase for (defaults to now)
 * @returns Moon phase information
 */
export function getMoonPhase(date: Date = new Date()): MoonPhaseInfo {
  // Known new moon date (January 11, 2024)
  const knownNewMoon = new Date('2024-01-11T00:00:00Z');
  
  // Lunar cycle is approximately 29.53 days
  const lunarCycle = 29.53058867;
  
  // Calculate days since known new moon
  const daysSinceNewMoon = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
  
  // Get the current cycle position (0 to 1)
  const cyclePosition = ((daysSinceNewMoon % lunarCycle) + lunarCycle) % lunarCycle;
  
  // Calculate illumination (0 = new moon, 1 = full moon)
  // Using a simplified sine wave approximation
  const illumination = (1 - Math.cos(cyclePosition * 2 * Math.PI / lunarCycle)) / 2;
  
  // Determine phase based on cycle position
  let phase: MoonPhase;
  const phaseRatio = cyclePosition / lunarCycle;
  
  if (phaseRatio < 0.0625) {
    phase = 'New Moon';
  } else if (phaseRatio < 0.1875) {
    phase = 'Waxing Crescent';
  } else if (phaseRatio < 0.3125) {
    phase = 'First Quarter';
  } else if (phaseRatio < 0.4375) {
    phase = 'Waxing Gibbous';
  } else if (phaseRatio < 0.5625) {
    phase = 'Full Moon';
  } else if (phaseRatio < 0.6875) {
    phase = 'Waning Gibbous';
  } else if (phaseRatio < 0.8125) {
    phase = 'Last Quarter';
  } else {
    phase = 'Waning Crescent';
  }
  
  return { phase, illumination };
}

