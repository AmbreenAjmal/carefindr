import React from 'react';
import Svg, { Rect, Circle, Path } from 'react-native-svg';

// onDark=true: white body, teal cross, navy details (for teal background box)
// onDark=false: teal body, white cross, white details (for dark/navy background)
export default function LogoIcon({ size = 24, onDark = true }) {
  if (onDark) {
    return (
      <Svg width={size} height={size} viewBox="0 0 32 32">
        <Rect x="6" y="10" width="20" height="14" rx="4" fill="white" />
        <Rect x="13" y="6" width="6" height="8" rx="2" fill="#14B8A6" />
        <Circle cx="11" cy="17" r="2" fill="#0A2540" />
        <Circle cx="21" cy="17" r="2" fill="#0A2540" />
        <Path d="M11 17 Q16 22 21 17" stroke="#0A2540" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Rect x="6" y="10" width="20" height="14" rx="4" fill="#14B8A6" />
      <Rect x="13" y="6" width="6" height="8" rx="2" fill="white" opacity="0.9" />
      <Circle cx="11" cy="17" r="2" fill="white" />
      <Circle cx="21" cy="17" r="2" fill="white" />
      <Path d="M11 17 Q16 22 21 17" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </Svg>
  );
}
