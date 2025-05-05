import React from 'react';
import { Html } from '@react-three/drei';
import './SpeechBubble.css'; // CSS for styling

interface SpeechBubbleProps {
  text: string;
  position?: [number, number, number]; // Position relative to the parent object
}

export const SpeechBubble: React.FC<SpeechBubbleProps> = ({ text, position = [0, 1.8, 0] }) => {
  if (!text) {
    return null; // Don't render if there's no text
  }

  return (
    <Html position={position} center distanceFactor={10} zIndexRange={[100, 0]}>
      <div className="speech-bubble-container">
        <div className="speech-bubble">{text}</div>
      </div>
    </Html>
  );
};
