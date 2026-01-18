// 発話内容とIDをセットで扱うデータ型
export interface SpeakMessage {
  id: string;
  text: string;
  caption: string;
  style?: string; // VoiceVoxのスタイル名（例: "あまあま", "ツンツン"）
}

// AvatarState インターフェースの定義
export interface AvatarState {
  id: string;
  name?: string; // Display name
  voiceVoxSpeaker?: string; // VoiceVox matching name
  vrmUrl: string;
  animationUrls: { [key: string]: string };
  currentEmotion: string;
  speechText: SpeakMessage | null;
  currentAnimationName: string | null;
  position: [number, number, number];
  onTTSComplete?: (speakId: string) => void;
  onAnimationEnd?: (animationName: string) => void;
  height?: number;
  lookAtConfig?: {
    yawLimitDeg: number;
    pitchLimitDeg: number;
    headWeight: number;
    neckWeight: number;
  };
  blinkConfig?: {
    disabledEmotions: string[];
  };
  autoReturnToIdleTimeout?: number;
}
