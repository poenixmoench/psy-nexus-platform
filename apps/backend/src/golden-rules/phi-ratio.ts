export const PHI_RATIO = 1.618033988749895;

export const GoldenRules = {
  getSectionWidth: (baseWidth: number): number => baseWidth * PHI_RATIO,
  getHarmonicSpacing: (baseSpacing: number): number => baseSpacing * PHI_RATIO,
  isHarmonic: (ratio: number, tolerance: number = 0.05): boolean => {
    return Math.abs(ratio - PHI_RATIO) < tolerance;
  },
};

export default GoldenRules;
