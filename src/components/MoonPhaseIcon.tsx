import React from 'react';
import { getMoonPhase, type MoonPhase } from '../utils/moonPhase';

interface MoonPhaseIconProps {
  size?: number;
  className?: string;
}

export const MoonPhaseIcon: React.FC<MoonPhaseIconProps> = ({ size = 14, className = '' }) => {
  const { phase, illumination } = getMoonPhase();
  
  // Create SVG paths for different moon phases
  const getMoonSVG = () => {
    const viewBox = 24;
    const center = viewBox / 2;
    const radius = 9;
    
    // Create unique ID for clip paths to avoid conflicts
    const clipId = `moon-clip-${phase.replace(/\s+/g, '-').toLowerCase()}`;
    
    switch (phase) {
      case 'New Moon':
        return (
          <circle cx={center} cy={center} r={radius} fill="currentColor" opacity="0.15" />
        );
      
      case 'Waxing Crescent':
        // Right crescent visible
        return (
          <>
            <defs>
              <clipPath id={clipId}>
                <path d={`M ${center} ${center - radius} A ${radius} ${radius} 0 0 1 ${center} ${center + radius} Z`} />
              </clipPath>
            </defs>
            <circle cx={center} cy={center} r={radius} fill="currentColor" opacity="0.3" />
            <circle cx={center} cy={center} r={radius} fill="currentColor" opacity="0.7" clipPath={`url(#${clipId})`} />
          </>
        );
      
      case 'First Quarter':
        // Right half visible
        return (
          <>
            <defs>
              <clipPath id={clipId}>
                <rect x={center} y={0} width={viewBox} height={viewBox} />
              </clipPath>
            </defs>
            <circle cx={center} cy={center} r={radius} fill="currentColor" opacity="0.3" />
            <circle cx={center} cy={center} r={radius} fill="currentColor" opacity="0.9" clipPath={`url(#${clipId})`} />
          </>
        );
      
      case 'Waxing Gibbous':
        // Mostly full, small dark area on left
        return (
          <>
            <circle cx={center} cy={center} r={radius} fill="currentColor" opacity="0.95" />
            <ellipse cx={center - 2} cy={center} rx={3} ry={radius} fill="currentColor" opacity="0.2" />
          </>
        );
      
      case 'Full Moon':
        return (
          <circle cx={center} cy={center} r={radius} fill="currentColor" opacity="1" />
        );
      
      case 'Waning Gibbous':
        // Mostly full, small dark area on right
        return (
          <>
            <circle cx={center} cy={center} r={radius} fill="currentColor" opacity="0.95" />
            <ellipse cx={center + 2} cy={center} rx={3} ry={radius} fill="currentColor" opacity="0.2" />
          </>
        );
      
      case 'Last Quarter':
        // Left half visible
        return (
          <>
            <defs>
              <clipPath id={clipId}>
                <rect x={0} y={0} width={center} height={viewBox} />
              </clipPath>
            </defs>
            <circle cx={center} cy={center} r={radius} fill="currentColor" opacity="0.3" />
            <circle cx={center} cy={center} r={radius} fill="currentColor" opacity="0.9" clipPath={`url(#${clipId})`} />
          </>
        );
      
      case 'Waning Crescent':
        // Left crescent visible
        return (
          <>
            <defs>
              <clipPath id={clipId}>
                <path d={`M ${center} ${center - radius} A ${radius} ${radius} 0 0 0 ${center} ${center + radius} Z`} />
              </clipPath>
            </defs>
            <circle cx={center} cy={center} r={radius} fill="currentColor" opacity="0.3" />
            <circle cx={center} cy={center} r={radius} fill="currentColor" opacity="0.7" clipPath={`url(#${clipId})`} />
          </>
        );
      
      default:
        return <circle cx={center} cy={center} r={radius} fill="currentColor" opacity="0.5" />;
    }
  };
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      style={{ display: 'inline-block' }}
    >
      {getMoonSVG()}
    </svg>
  );
};

// Export the getMoonPhase function for use in other components
export { getMoonPhase };
export type { MoonPhase };

