export const strings = {
  ru: {
    rotateDevice: 'Поверните устройство',
    swipeHint: 'Проведите пальцем для паса или удара',
  },
  en: {
    rotateDevice: 'Rotate your device',
    swipeHint: 'Swipe to pass or shoot',
  },
} as const;

export type Locale = keyof typeof strings;
