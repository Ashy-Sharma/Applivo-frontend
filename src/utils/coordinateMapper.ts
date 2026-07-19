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

export function getContainedImageRect(img: HTMLImageElement): DisplayRect {
  const elRect = img.getBoundingClientRect();
  const naturalW = img.naturalWidth;
  const naturalH = img.naturalHeight;

  if (!naturalW || !naturalH) {
    return {
      left: elRect.left,
      top: elRect.top,
      width: elRect.width,
      height: elRect.height,
    };
  }

  const elRatio = elRect.width / elRect.height;
  const imgRatio = naturalW / naturalH;

  let renderedWidth: number;
  let renderedHeight: number;

  if (imgRatio > elRatio) {
    renderedWidth = elRect.width;
    renderedHeight = elRect.width / imgRatio;
  } else {
    renderedHeight = elRect.height;
    renderedWidth = elRect.height * imgRatio;
  }

  const offsetX = (elRect.width - renderedWidth) / 2;
  const offsetY = (elRect.height - renderedHeight) / 2;

  return {
    left: elRect.left + offsetX,
    top: elRect.top + offsetY,
    width: renderedWidth,
    height: renderedHeight,
  };
}

export const TAP_MOVEMENT_THRESHOLD_PX = 12;

export const ANDROID_KEYCODES = {
  BACK: 4,
  HOME: 3,
  APP_SWITCH: 187,
} as const;
