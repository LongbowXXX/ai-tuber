import * as THREE from 'three';

// カメラアニメーションのデフォルト所要時間（秒）
export const DEFAULT_DURATION = 1.0;

// 定位置
export const DEFAULT_POS = new THREE.Vector3(0, 1.2, 3);
export const DEFAULT_LOOKAT = new THREE.Vector3(0, 1, 0);
export const DEFAULT_FOV = 50;

// Intro (Crane shot start position)
// スタート: ステージ斜め後方の上空 (Spiral Start)
export const INTRO_START_POS = new THREE.Vector3(5, 4, 8);
// ベジェ曲線の制御点 (大きく回り込むための点)
export const INTRO_CONTROL_POINT = new THREE.Vector3(-4, 6, 6);

// FullBody (全身)
export const FULLBODY_POS = new THREE.Vector3(0, 1.0, 4.5);
export const FULLBODY_FOV = 50;

// Low Angle (ローアングル/煽り)
export const LOW_ANGLE_POS = new THREE.Vector3(0, 0.5, 2.5);
export const LOW_ANGLE_LOOKAT = new THREE.Vector3(0, 1.3, 0);

// High Angle (ハイアングル/俯瞰)
export const HIGH_ANGLE_POS = new THREE.Vector3(0, 2.5, 3.5);
export const HIGH_ANGLE_LOOKAT = new THREE.Vector3(0, 1.0, 0);

// Side (斜め)
export const SIDE_RIGHT_POS = new THREE.Vector3(1.5, 1.2, 2.5);
export const SIDE_LEFT_POS = new THREE.Vector3(-1.5, 1.2, 2.5);

// Target Height Calculation Constants
export const FACE_HEIGHT_OFFSET = 0.2; // Height from top of head to face center
export const DEFAULT_FACE_HEIGHT = 1.25; // Default face height when no target height provided
export const CENTER_HEIGHT_RATIO = 0.5; // Ratio of height for center body (full body)
export const SIDE_HEIGHT_RATIO = 0.6; // Ratio of height for center body (side view)
export const DEFAULT_CENTER_HEIGHT = 0.8; // Default center height
export const SIDE_CENTER_HEIGHT_DEFAULT = 1.0; // Default center height for side view

// Camera Offsets (Z-axis distance from target, etc)
export const CLOSEUP_OFFSET_Z = 1.5;
export const FULLBODY_OFFSET_Z = 3.5;
export const LOW_ANGLE_OFFSET_Z = 2.5;
export const HIGH_ANGLE_OFFSET_Z = 2.5;
export const SIDE_ANGLE_OFFSET_X = 1.2;
export const SIDE_ANGLE_OFFSET_Z = 2.0;

// CloseUp 設定
export const CLOSEUP_FOV = 35; // 少し望遠気味にして背景圧縮効果を狙う

export type CameraMode =
  | 'default'
  | 'intro'
  | 'closeUp'
  | 'fullBody'
  | 'lowAngle'
  | 'highAngle'
  | 'sideRight'
  | 'sideLeft';

export interface CameraState {
  mode: string;
  targetId?: string;
  targetPosition?: [number, number, number]; // ターゲットアバターの位置
  targetHeight?: number; // ターゲットアバターの身長（または高さ）
  duration?: number;
  timestamp: number; // 更新検知用
}
