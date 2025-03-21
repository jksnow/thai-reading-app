/**
 * Utility functions for device and browser detection
 */

/**
 * Checks if the current device is a mobile device
 * Uses a combination of screen size and user agent detection
 */
export const isMobileDevice = (): boolean => {
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobileUA =
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
      userAgent
    );
  const isMobileWidth = window.innerWidth <= 768;
  return isMobileUA || isMobileWidth;
};

/**
 * Checks if the current browser is Safari on iOS
 */
export const isIOSSafari = (): boolean => {
  const userAgent = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isSafari = /safari/.test(userAgent);
  return isIOS && isSafari;
};

/**
 * Checks if the current browser supports popups
 * Note: This is a best-effort check, as some browsers may still block popups
 */
export const supportsPopups = (): boolean => {
  // iOS Safari and some mobile browsers don't reliably support popups
  if (isIOSSafari()) return false;

  // Check if window.open is available and not blocked
  try {
    const popup = window.open("about:blank", "_blank");
    if (!popup) return false;
    popup.close();
    return true;
  } catch (e) {
    return false;
  }
};
