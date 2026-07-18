export interface DisplayRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export function mapToEmulatorCoords(
  clientX: number,
  clientY: number,
  displayRect: DisplayRect,
  screenWidth: number,
  screenHeight: number,
): { x: number; y: number } {
  const relX = clientX - displayRect.left;
  const relY = clientY - displayRect.top;

  const x = Math.round((relX / displayRect.width) * screenWidth);
  const y = Math.round((relY / displayRect.height) * screenHeight);

  return {
    x: Math.min(screenWidth, Math.max(0, x)),
    y: Math.min(screenHeight, Math.max(0, y)),
  };
}

export const TAP_MOVEMENT_THRESHOLD_PX = 12;

export const ANDROID_KEYCODES = {
  BACK: 4,
  HOME: 3,
  APP_SWITCH: 187,
} as const;
