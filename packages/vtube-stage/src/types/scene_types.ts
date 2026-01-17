export interface StageState {
  currentMarkdownText: string | null;
  camera: {
    mode: string;
    targetId?: string;
    duration?: number;
    timestamp: number;
  } | null;
}
