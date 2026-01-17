import * as THREE from 'three';

// カメラアニメーションのデフォルト所要時間（秒）
export const DEFAULT_DURATION = 1.0;

// 定位置
export const DEFAULT_POS = new THREE.Vector3(0, 1.2, 3);
export const DEFAULT_LOOKAT = new THREE.Vector3(0, 1, 0);
export const DEFAULT_FOV = 50;

// Intro (Crane shot start position)
// スタート位置をより高く、遠く設定して、クレーンショットのように降りてくる演出にする
export const INTRO_START_POS = new THREE.Vector3(0, 6, 8);

// FullBody (全身)
export const FULLBODY_POS = new THREE.Vector3(0, 1.0, 4.5);
export const FULLBODY_FOV = 50;

// Low Angle (ローアングル/煽り)
export const LOW_ANGLE_POS = new THREE.Vector3(0, 0.5, 2.5);
export const LOW_ANGLE_LOOKAT = new THREE.Vector3(0, 1.3, 0);

// High Angle (ハイアングル/俯瞰)
export const HIGH_ANGLE_POS = new THREE.Vector3(0, 1.8, 2.0);
export const HIGH_ANGLE_LOOKAT = new THREE.Vector3(0, 1.0, 0);

// Side (斜め)
export const SIDE_RIGHT_POS = new THREE.Vector3(1.5, 1.2, 2.5);
export const SIDE_LEFT_POS = new THREE.Vector3(-1.5, 1.2, 2.5);

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
