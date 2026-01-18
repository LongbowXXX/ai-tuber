export interface VisualEffectsConfig {
  bloom: {
    enabled: boolean;
    luminanceThreshold: number;
    mipmapBlur: boolean;
    intensity: number;
    radius: number;
  };
  vignette: {
    enabled: boolean;
    eskil: boolean;
    offset: number;
    darkness: number;
  };
  chromaticAberration: {
    enabled: boolean;
    offset: [number, number];
    radialModulation: boolean;
    modulationOffset: number;
  };
  glitch: {
    enabled: boolean;
    delay: [number, number];
    duration: [number, number];
    strength: [number, number];
    mode: 'SPORADIC' | 'CONSTANT_MILD';
    active: boolean;
    ratio: number;
  };
  scanline: {
    enabled: boolean;
    density: number;
    opacity: number;
  };
  noise: {
    enabled: boolean;
    opacity: number;
  };
}

export interface StageState {
  currentMarkdownText: string | null;
  camera: {
    mode: string;
    targetId?: string;
    duration?: number;
    timestamp: number;
  } | null;
}
