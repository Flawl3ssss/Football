export const applyMobileViewportGuards = (): (() => void) => {
  const preventDefault = (event: Event): void => event.preventDefault();
  const preventGesture = (event: Event): void => event.preventDefault();

  document.addEventListener('contextmenu', preventDefault);
  document.addEventListener('selectstart', preventDefault);
  document.addEventListener('gesturestart', preventGesture);
  document.addEventListener('gesturechange', preventGesture);
  document.addEventListener('gestureend', preventGesture);

  return () => {
    document.removeEventListener('contextmenu', preventDefault);
    document.removeEventListener('selectstart', preventDefault);
    document.removeEventListener('gesturestart', preventGesture);
    document.removeEventListener('gesturechange', preventGesture);
    document.removeEventListener('gestureend', preventGesture);
  };
};

export const isPortraitViewport = (width: number, height: number): boolean => height >= width;
