// src/components/VRMController.tsx
import React from "react";
import "./VRMController.css"; // スタイル用CSS

interface VRMControllerProps {
  // 表情のウェイトを更新するコールバック
  onExpressionChange: (name: string, weight: number) => void;
  // 頭の回転を更新するコールバック
  onHeadYawChange: (angle: number) => void;
}

// 制御する表情のリスト（モデルに合わせて変更）
const expressionNames = [
  "neutral",
  "happy",
  "sad",
  "angry",
  "relaxed",
  "Surprised",
  "aa",
  "ih",
  "ou",
  "ee",
  "oh",
  "blink",
  "blinkLeft",
  "blinkRight",
];

export const VRMController: React.FC<VRMControllerProps> = ({
  onExpressionChange,
  onHeadYawChange,
}) => {
  const handleExpressionSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onExpressionChange(name, parseFloat(value));
  };

  const handleHeadSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    onHeadYawChange(parseFloat(e.target.value));
  };

  return (
    <div className="vrm-controller">
      <h4>Expressions</h4>
      {expressionNames.map((name) => (
        <div key={name} className="control-row">
          <label htmlFor={name}>{name}</label>
          <input
            type="range"
            id={name}
            name={name}
            min="0"
            max="1"
            step="0.01"
            defaultValue="0" // 初期値
            onChange={handleExpressionSlider}
          />
        </div>
      ))}

      <h4>Head Yaw</h4>
      <div className="control-row">
        <label htmlFor="headYaw">Yaw (-45° to 45°)</label>
        <input
          type="range"
          id="headYaw"
          name="headYaw"
          min="-45"
          max="45"
          step="1"
          defaultValue="0"
          onChange={handleHeadSlider}
        />
      </div>
    </div>
  );
};
